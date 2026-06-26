'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface GuestPassResult {
  id: string;
  guestName: string;
  allowedGuests: number;
  status: string;
  checkedInAt?: string;
}

const T = {
  dark:   '#1C1713',
  light:  '#7A6A5B',
  gold:   '#C8A95B',
  cream:  '#FFFBF4',
  white:  '#FFFBF4',
  border: '#E5D2A8',
} as const;

const statusLabels: Record<string, string> = {
  pending:   'Sin confirmar',
  confirmed: 'Confirmado',
  declined:  'Declinado',
  used:      'Usado',
};
const statusColors: Record<string, string> = {
  pending:   '#7A6A5B',
  confirmed: '#247A45',
  declined:  '#B43232',
  used:      '#555',
};
const statusBg: Record<string, string> = {
  pending:   '#FBF5E3',
  confirmed: '#E7F5EC',
  declined:  '#FBEAEA',
  used:      '#F0F0F0',
};

type UIState =
  | 'camera'        // scanning with camera (default on mobile)
  | 'camera-denied' // user denied camera permission
  | 'manual'        // fallback: paste token/URL
  | 'searching'     // fetching pass from API
  | 'found'         // pass found, ready to check in
  | 'checking-in'   // POSTing to /checkin
  | 'done'          // successfully checked in
  | 'already-in'    // pass already used
  | 'not-found'     // token not found
  | 'error';        // network error

function formatDateTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat('es-MX', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }).format(new Date(iso));
  } catch { return iso; }
}

function extractToken(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.includes('/pass/')) {
    return trimmed.split('/pass/').pop()?.split('?')[0].trim() ?? trimmed;
  }
  return trimmed;
}

interface Props {
  invitationId: string;
}

export default function ScannerView({ invitationId }: Props) {
  const [uiState,     setUiState]     = useState<UIState>('camera');
  const [pass,        setPass]        = useState<GuestPassResult | null>(null);
  const [checkedInAt, setCheckedInAt] = useState<string | null>(null);
  const [errorMsg,    setErrorMsg]    = useState('');
  const [manualInput, setManualInput] = useState('');

  // Camera refs
  const videoRef   = useRef<HTMLVideoElement>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const streamRef  = useRef<MediaStream | null>(null);
  const rafRef     = useRef<number | null>(null);
  const scanningRef = useRef(false); // prevent duplicate scans

  // ── Camera lifecycle ────────────────────────────────────────────────────────

  const stopCamera = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    scanningRef.current = false;
  }, []);

  // Returns true if camera started, false if denied — does NOT set state
  const startCamera = useCallback(async (): Promise<boolean> => {
    stopCamera();
    scanningRef.current = false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      return true;
    } catch {
      return false;
    }
  }, [stopCamera]);

  // Start camera when entering 'camera' state
  useEffect(() => {
    if (uiState !== 'camera') { stopCamera(); return stopCamera; }

    let active = true;
    const init = async () => {
      const ok = await startCamera();
      if (active && !ok) setUiState('camera-denied');
    };
    void init();

    return () => { active = false; stopCamera(); };
  }, [uiState, startCamera, stopCamera]);

  // ── QR scan loop ────────────────────────────────────────────────────────────

  const handleDetectedToken = useCallback(async (raw: string) => {
    if (scanningRef.current) return; // already handling a scan
    scanningRef.current = true;
    stopCamera();

    const token = extractToken(raw);
    setUiState('searching');
    setPass(null);
    setErrorMsg('');

    try {
      const res = await fetch(
        `/api/invitations/${invitationId}/guest-passes/by-token?token=${encodeURIComponent(token)}`,
      );
      const json = await res.json() as { pass?: GuestPassResult; error?: string };
      if (!res.ok || !json.pass) {
        setErrorMsg(res.status === 404
          ? 'No se encontró ningún pase con ese código.'
          : (json.error ?? 'Error al buscar el pase.'));
        setUiState('not-found');
        return;
      }
      setPass(json.pass);
      if (json.pass.checkedInAt) {
        setCheckedInAt(json.pass.checkedInAt);
        setUiState('already-in');
      } else {
        setUiState('found');
      }
    } catch {
      setErrorMsg('Error de red. Verifica tu conexión.');
      setUiState('error');
    }
  }, [invitationId, stopCamera]);

  // Indirect ref so tick can schedule itself without a self-reference that ESLint flags
  const tickRef = useRef<(() => void) | null>(null);

  const tick = useCallback(() => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    const next   = () => { rafRef.current = requestAnimationFrame(() => tickRef.current?.()); };

    if (!video || !canvas || video.readyState < 2) { next(); return; }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) { next(); return; }

    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Dynamic import so jsqr is only loaded client-side
    import('jsqr').then(({ default: jsQR }) => {
      const result = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });
      if (result?.data && !scanningRef.current) {
        void handleDetectedToken(result.data);
      } else if (!scanningRef.current) {
        next();
      }
    }).catch(next);
  }, [handleDetectedToken]);

  // Keep tickRef in sync with latest tick closure
  useEffect(() => { tickRef.current = tick; }, [tick]);

  // Attach tick loop after video starts playing
  function onVideoPlay() {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => tickRef.current?.());
  }

  // ── Manual search ───────────────────────────────────────────────────────────

  async function handleManualSearch() {
    const token = extractToken(manualInput);
    if (!token) return;
    await handleDetectedToken(token);
  }

  // ── Check-in ────────────────────────────────────────────────────────────────

  async function handleCheckIn() {
    if (!pass) return;
    setUiState('checking-in');
    try {
      const res = await fetch(
        `/api/invitations/${invitationId}/guest-passes/${pass.id}/checkin`,
        { method: 'POST' },
      );
      const json = await res.json() as { pass?: GuestPassResult; alreadyCheckedIn?: boolean; error?: string };
      if (!res.ok) {
        setErrorMsg(json.error ?? 'Error al registrar la entrada.');
        setUiState('error');
        return;
      }
      if (json.alreadyCheckedIn) {
        setCheckedInAt(json.pass?.checkedInAt ?? new Date().toISOString());
        setUiState('already-in');
        return;
      }
      setCheckedInAt(json.pass?.checkedInAt ?? new Date().toISOString());
      setUiState('done');
    } catch {
      setErrorMsg('Error de red. Verifica tu conexión.');
      setUiState('error');
    }
  }

  // ── Reset ───────────────────────────────────────────────────────────────────

  function resetToCamera() {
    setPass(null);
    setCheckedInAt(null);
    setErrorMsg('');
    setManualInput('');
    scanningRef.current = false;
    setUiState('camera');
  }

  function resetToManual() {
    setPass(null);
    setCheckedInAt(null);
    setErrorMsg('');
    setManualInput('');
    scanningRef.current = false;
    setUiState('manual');
  }

  const searching  = uiState === 'searching';
  const checkingIn = uiState === 'checking-in';

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '1rem 1rem 3rem' }}>

      {/* ── CAMERA STATE ── */}
      {uiState === 'camera' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ margin: 0, fontSize: '.875rem', color: T.light, textAlign: 'center', padding: '.75rem 0 0' }}>
            Escanea el QR del pase para registrar la entrada.
          </p>

          {/* Video viewport */}
          <div style={{
            position: 'relative', borderRadius: '1.25rem', overflow: 'hidden',
            background: '#000', aspectRatio: '4/3', maxHeight: '340px',
            border: `2px solid ${T.border}`,
          }}>
            <video
              ref={videoRef}
              onPlay={onVideoPlay}
              playsInline
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            {/* Targeting overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              pointerEvents: 'none',
            }}>
              <div style={{
                width: '56%', aspectRatio: '1',
                border: `2px solid ${T.gold}`,
                borderRadius: '.75rem',
                boxShadow: '0 0 0 9999px rgba(0,0,0,0.45)',
              }} />
            </div>
            {/* Animated scan line */}
            <ScanLine />
          </div>

          {/* Hidden canvas for frame processing */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          <button
            onClick={resetToManual}
            style={{ ...secondaryBtn, width: '100%' }}
          >
            Usar búsqueda manual
          </button>
        </div>
      )}

      {/* ── CAMERA DENIED ── */}
      {uiState === 'camera-denied' && (
        <div style={{
          background: '#FBF5E3', border: `1px solid ${T.border}`,
          borderRadius: '1.25rem', padding: '1.5rem', textAlign: 'center',
          marginTop: '1rem',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '.625rem' }}>📷</div>
          <p style={{ margin: '0 0 .375rem', fontWeight: 700, color: T.dark }}>Sin acceso a la cámara</p>
          <p style={{ margin: '0 0 1.25rem', fontSize: '.875rem', color: T.light, lineHeight: 1.55 }}>
            No pudimos acceder a la cámara. Puedes pegar el código manualmente.
          </p>
          <button onClick={resetToManual} style={primaryBtn}>
            Buscar manualmente
          </button>
        </div>
      )}

      {/* ── MANUAL INPUT ── */}
      {uiState === 'manual' && (
        <div style={{
          background: T.white, border: `1px solid ${T.border}`,
          borderRadius: '1.25rem', padding: '1.25rem', marginTop: '1rem',
        }}>
          <p style={{ margin: '0 0 .75rem', fontSize: '.75rem', fontWeight: 800, letterSpacing: '.15em', textTransform: 'uppercase', color: T.gold }}>
            Búsqueda manual
          </p>
          <p style={{ margin: '0 0 .875rem', fontSize: '.875rem', color: T.light, lineHeight: 1.55 }}>
            Pega la URL o el código del pase del invitado.
          </p>
          <textarea
            value={manualInput}
            onChange={e => setManualInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void handleManualSearch(); } }}
            placeholder="https://kompralo.vercel.app/pass/abc123… o solo el token"
            rows={3}
            style={{
              width: '100%', padding: '.75rem .875rem',
              background: T.cream, border: `1px solid ${T.border}`,
              borderRadius: '.75rem', fontSize: '.875rem', color: T.dark,
              outline: 'none', resize: 'none', boxSizing: 'border-box',
              lineHeight: 1.5, fontFamily: 'inherit',
            }}
          />
          <button
            onClick={() => void handleManualSearch()}
            disabled={!manualInput.trim()}
            style={{
              marginTop: '.75rem', width: '100%', padding: '.75rem',
              background: !manualInput.trim() ? T.border : T.dark,
              color: T.cream, border: 'none', borderRadius: '.75rem',
              fontSize: '.9375rem', fontWeight: 700,
              cursor: !manualInput.trim() ? 'not-allowed' : 'pointer',
            }}
          >
            Buscar pase
          </button>
          <button onClick={resetToCamera} style={{ ...secondaryBtn, marginTop: '.5rem', width: '100%' }}>
            ← Volver a la cámara
          </button>
        </div>
      )}

      {/* ── SEARCHING ── */}
      {searching && (
        <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: T.light, fontSize: '.875rem' }}>
          Buscando pase…
        </div>
      )}

      {/* ── NOT FOUND / ERROR ── */}
      {(uiState === 'not-found' || uiState === 'error') && (
        <div style={{
          background: '#FBEAEA', border: '1px solid #F5C0C0',
          borderRadius: '1.25rem', padding: '1.5rem', textAlign: 'center',
          marginTop: '1rem',
        }}>
          <div style={{ fontSize: '1.75rem', marginBottom: '.5rem' }}>❌</div>
          <p style={{ margin: '0 0 .25rem', fontWeight: 700, color: '#B43232', fontSize: '.9375rem' }}>
            {uiState === 'not-found' ? 'Pase no encontrado' : 'Error'}
          </p>
          <p style={{ margin: '0 0 1.25rem', fontSize: '.8125rem', color: '#8C2222', lineHeight: 1.5 }}>{errorMsg}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
            <button onClick={resetToCamera} style={primaryBtn}>Escanear de nuevo</button>
            <button onClick={resetToManual} style={secondaryBtn}>Buscar manualmente</button>
          </div>
        </div>
      )}

      {/* ── FOUND ── */}
      {(uiState === 'found' || checkingIn) && pass && (
        <div style={{
          background: T.white, border: `1px solid ${T.border}`,
          borderRadius: '1.25rem', padding: '1.25rem', marginTop: '1rem',
        }}>
          <p style={{ margin: '0 0 1rem', fontSize: '.75rem', fontWeight: 800, letterSpacing: '.15em', textTransform: 'uppercase', color: T.gold }}>
            Pase encontrado
          </p>
          <PassInfo pass={pass} />
          <button
            onClick={() => void handleCheckIn()}
            disabled={checkingIn}
            style={{
              marginTop: '1.25rem', width: '100%', padding: '.875rem',
              background: checkingIn ? T.border : '#247A45',
              color: '#fff', border: 'none', borderRadius: '.75rem',
              fontSize: '1rem', fontWeight: 800,
              cursor: checkingIn ? 'not-allowed' : 'pointer',
            }}
          >
            {checkingIn ? 'Registrando…' : '✓ Marcar entrada'}
          </button>
          <button onClick={resetToCamera} style={{ ...secondaryBtn, marginTop: '.5rem', width: '100%' }}>
            Cancelar
          </button>
        </div>
      )}

      {/* ── SUCCESS ── */}
      {uiState === 'done' && pass && (
        <div style={{
          background: '#E7F5EC', border: '1px solid #B8DFC4',
          borderRadius: '1.25rem', padding: '1.5rem', textAlign: 'center',
          marginTop: '1rem',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '.625rem' }}>✅</div>
          <p style={{ margin: '0 0 .25rem', fontWeight: 800, color: '#247A45', fontSize: '1.0625rem' }}>
            Entrada registrada
          </p>
          <p style={{ margin: '0 0 .125rem', fontSize: '1rem', fontWeight: 700, color: T.dark }}>{pass.guestName}</p>
          <p style={{ margin: '0 0 .125rem', fontSize: '.875rem', color: T.light }}>
            {pass.allowedGuests} {pass.allowedGuests === 1 ? 'persona' : 'personas'}
          </p>
          {checkedInAt && (
            <p style={{ margin: '0 0 1.25rem', fontSize: '.75rem', color: '#247A45', fontWeight: 600 }}>
              {formatDateTime(checkedInAt)}
            </p>
          )}
          <button onClick={resetToCamera} style={primaryBtn}>Escanear otro pase</button>
        </div>
      )}

      {/* ── ALREADY CHECKED IN ── */}
      {uiState === 'already-in' && pass && (
        <div style={{
          background: '#FBF5E3', border: `1px solid ${T.border}`,
          borderRadius: '1.25rem', padding: '1.5rem', textAlign: 'center',
          marginTop: '1rem',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '.625rem' }}>⚠️</div>
          <p style={{ margin: '0 0 .25rem', fontWeight: 800, color: '#7A6A5B', fontSize: '1.0625rem' }}>
            Este pase ya fue usado
          </p>
          <p style={{ margin: '0 0 .125rem', fontSize: '1rem', fontWeight: 700, color: T.dark }}>{pass.guestName}</p>
          <p style={{ margin: '0 0 .125rem', fontSize: '.875rem', color: T.light }}>
            {pass.allowedGuests} {pass.allowedGuests === 1 ? 'persona' : 'personas'}
          </p>
          {checkedInAt && (
            <p style={{ margin: '0 0 1.25rem', fontSize: '.75rem', color: '#7A6A5B', fontWeight: 600 }}>
              Ingresó el {formatDateTime(checkedInAt)}
            </p>
          )}
          <button onClick={resetToCamera} style={primaryBtn}>Escanear otro pase</button>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function PassInfo({ pass }: { pass: GuestPassResult }) {
  return (
    <div style={{
      background: '#FFFBF4', border: `1px solid #E5D2A8`,
      borderRadius: '1rem', padding: '1rem',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '.5rem', marginBottom: '.375rem' }}>
        <p style={{ margin: 0, fontWeight: 700, color: '#1C1713', fontSize: '1.0625rem' }}>{pass.guestName}</p>
        <span style={{
          padding: '.2rem .625rem', borderRadius: '2rem', flexShrink: 0,
          fontSize: '.6875rem', fontWeight: 700, whiteSpace: 'nowrap',
          color: statusColors[pass.status] ?? '#7A6A5B',
          background: statusBg[pass.status] ?? '#FFFBF4',
        }}>
          {statusLabels[pass.status] ?? pass.status}
        </span>
      </div>
      <p style={{ margin: 0, fontSize: '.875rem', color: '#7A6A5B' }}>
        {pass.allowedGuests} {pass.allowedGuests === 1 ? 'persona permitida' : 'personas permitidas'}
      </p>
    </div>
  );
}

// Animated scan line inside camera viewport
function ScanLine() {
  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      pointerEvents: 'none', borderRadius: '1.25rem',
    }}>
      <style>{`
        @keyframes scanline {
          0%   { top: 22%; }
          50%  { top: 74%; }
          100% { top: 22%; }
        }
      `}</style>
      <div style={{
        position: 'absolute', left: '22%', right: '22%',
        height: '2px',
        background: `linear-gradient(90deg, transparent, #C8A95B, transparent)`,
        animation: 'scanline 2s ease-in-out infinite',
        borderRadius: '1px',
      }} />
    </div>
  );
}

// ── Style constants ────────────────────────────────────────────────────────────

const primaryBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  padding: '.75rem 1.5rem', width: '100%',
  background: '#1C1713', color: '#FFFBF4',
  border: 'none', borderRadius: '.75rem',
  fontSize: '.9375rem', fontWeight: 700, cursor: 'pointer',
};

const secondaryBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  padding: '.625rem 1.25rem',
  background: '#FFFBF4', border: '1px solid #E5D2A8',
  borderRadius: '.75rem', fontSize: '.875rem', fontWeight: 700,
  cursor: 'pointer', color: '#1C1713',
};
