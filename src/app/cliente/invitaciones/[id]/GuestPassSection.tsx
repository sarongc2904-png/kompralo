'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import QRCode from 'react-qr-code';

interface GuestPass {
  id: string;
  invitationId: string;
  guestName: string;
  phone?: string;
  allowedGuests: number;
  passToken: string;
  status: string;
  rsvpResponseId?: string;
  checkedInAt?: string;
  createdAt: string;
  updatedAt: string;
}

const T = {
  dark:   '#0D0A07',
  mid:    '#1A1612',
  light:  '#6B4A35',
  gold:   '#C4A962',
  cream:  '#F1E3C8',
  white:  '#FFFAF3',
  border: '#EAD7A3',
  ivory:  '#E8D7B8',
} as const;

const statusColors: Record<string, string> = {
  pending:   '#8A6D3B',
  confirmed: '#238636',
  declined:  '#D32F2F',
  used:      '#555',
};
const statusBg: Record<string, string> = {
  pending:   '#FCF8E3',
  confirmed: '#E6F4EA',
  declined:  '#FCE8E6',
  used:      '#F0F0F0',
};
const statusLabels: Record<string, string> = {
  pending:   'Pendiente',
  confirmed: 'Confirmado',
  declined:  'Declinado',
  used:      'Usado',
};

function formatDt(iso: string): string {
  try {
    return new Intl.DateTimeFormat('es-MX', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(iso));
  } catch { return iso; }
}

interface FormState { guestName: string; phone: string; allowedGuests: number; }
const emptyForm: FormState = { guestName: '', phone: '', allowedGuests: 1 };

interface Props {
  invitationId: string;
  appUrl: string;
  eventTitle?: string;
}

export default function GuestPassSection({ invitationId, appUrl, eventTitle = 'Nuestro evento' }: Props) {
  const [passes,     setPasses]     = useState<GuestPass[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');

  // Form modal state
  const [showForm,   setShowForm]   = useState(false);
  const [editing,    setEditing]    = useState<GuestPass | null>(null);
  const [form,       setForm]       = useState<FormState>(emptyForm);
  const [saving,     setSaving]     = useState(false);
  const [formError,  setFormError]  = useState('');

  // QR modal state
  const [qrPass,    setQrPass]    = useState<GuestPass | null>(null);
  const qrCardRef                  = useRef<HTMLDivElement>(null);
  const [qrCopied,  setQrCopied]  = useState(false);

  // Delete state
  const [deleting,   setDeleting]  = useState<string | null>(null);
  const [deleteErr,  setDeleteErr] = useState('');

  const fetchPasses = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/invitations/${invitationId}/guest-passes`);
      if (!res.ok) throw new Error('Error al cargar pases');
      const json = await res.json();
      setPasses(json.passes ?? []);
    } catch {
      setError('No se pudieron cargar los pases.');
    } finally {
      setLoading(false);
    }
  }, [invitationId]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/invitations/${invitationId}/guest-passes`);
        if (!res.ok) throw new Error('Error al cargar pases');
        const json = await res.json() as { passes?: GuestPass[] };
        if (!cancelled) setPasses(json.passes ?? []);
      } catch {
        if (!cancelled) setError('No se pudieron cargar los pases.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [invitationId]);

  // ESC to close modals
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { setShowForm(false); setQrPass(null); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormError('');
    setShowForm(true);
  }

  function openEdit(p: GuestPass) {
    setEditing(p);
    setForm({ guestName: p.guestName, phone: p.phone ?? '', allowedGuests: p.allowedGuests });
    setFormError('');
    setShowForm(true);
  }

  function validatePhone(raw: string): string | null {
    if (!raw) return null; // optional
    const digits = raw.replace(/\D/g, '');
    if (digits.length === 10) return null;
    if (digits.length === 12 && digits.startsWith('52')) return null;
    return 'Teléfono inválido. Usa 10 dígitos o +52 seguido de 10 dígitos.';
  }

  async function handleSave() {
    const name = form.guestName.trim();
    if (!name || name.length < 2) { setFormError('El nombre debe tener al menos 2 caracteres.'); return; }
    if (form.allowedGuests < 1 || form.allowedGuests > 20) { setFormError('Personas permitidas: entre 1 y 20.'); return; }
    const phoneErr = validatePhone(form.phone.trim());
    if (phoneErr) { setFormError(phoneErr); return; }
    setSaving(true);
    setFormError('');
    try {
      const url = editing
        ? `/api/invitations/${invitationId}/guest-passes/${editing.id}`
        : `/api/invitations/${invitationId}/guest-passes`;
      const res = await fetch(url, {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestName: name, phone: form.phone.trim() || undefined, allowedGuests: form.allowedGuests }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? 'Error al guardar');
      }
      setForm(emptyForm);
      setShowForm(false);
      await fetchPasses();
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(passId: string) {
    setDeleting(passId);
    setDeleteErr('');
    try {
      const res = await fetch(`/api/invitations/${invitationId}/guest-passes/${passId}`, { method: 'DELETE' });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setDeleteErr(j.error ?? 'No se pudo eliminar el pase.');
        return;
      }
      setPasses(prev => prev.filter(p => p.id !== passId));
    } catch {
      setDeleteErr('Error de red al eliminar.');
    } finally {
      setDeleting(null);
    }
  }

  async function handleDownloadQr() {
    if (!qrCardRef.current) return;
    try {
      const { toPng } = await import('html-to-image');
      const url = await toPng(qrCardRef.current, { pixelRatio: 2 });
      const a = document.createElement('a');
      a.href = url;
      a.download = `pase-${qrPass?.guestName.replace(/\s+/g, '-').toLowerCase() ?? 'invitado'}.png`;
      a.click();
    } catch { /* silent */ }
  }

  function handleCopyQr() {
    if (!qrPass) return;
    const url = `${appUrl}/pass/${qrPass.passToken}`;
    navigator.clipboard.writeText(url).then(() => {
      setQrCopied(true);
      setTimeout(() => setQrCopied(false), 2000);
    }).catch(() => {
      prompt('Copia este enlace:', url);
    });
  }

  // Scroll lock when modals open
  useEffect(() => {
    document.body.style.overflow = (showForm || qrPass) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showForm, qrPass]);

  function buildWaMsg(pass: GuestPass): string {
    const passUrl = `${appUrl}/pass/${pass.passToken}`;
    return `Hola, te compartimos tu pase para nuestro evento.\n\nInvitado: ${pass.guestName}\nPase para: ${pass.allowedGuests} persona${pass.allowedGuests !== 1 ? 's' : ''}\n\nEvento: ${eventTitle}\n\nAbre tu pase aquí:\n${passUrl}\n\nPor favor confirma tu asistencia.`;
  }

  function buildWaUrl(msg: string, phone?: string): string {
    const encoded = encodeURIComponent(msg);
    if (!phone) return `https://wa.me/?text=${encoded}`;
    const clean = phone.replace(/\D/g, '');
    const normalized = clean.length === 10 ? `52${clean}` : clean;
    return `https://wa.me/${normalized}?text=${encoded}`;
  }

  return (
    <section style={{ marginTop: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.5rem', marginBottom: '1rem' }}>
        <div>
          <h2 style={{ margin: '0 0 .2rem', fontSize: '1.0625rem', fontWeight: 700, color: T.dark, fontFamily: 'var(--font-playfair, Georgia, serif)' }}>
            Pases de entrada
          </h2>
          <p style={{ margin: 0, fontSize: '.8rem', color: T.light }}>
            Crea un pase único para cada invitado o familia y define cuántas personas pueden asistir.
          </p>
        </div>
        <button
          onClick={openCreate}
          style={{
            padding: '.5rem 1.125rem', background: T.dark, color: T.cream,
            border: 'none', borderRadius: '.75rem', fontSize: '.875rem', fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          + Agregar pase
        </button>
      </div>

      {deleteErr && (
        <div style={{ margin: '0 0 .75rem', padding: '.75rem 1rem', background: '#FCE8E6', border: '1px solid #F5C6C6', borderRadius: '.75rem', fontSize: '.8125rem', color: '#D32F2F', fontWeight: 600 }}>
          {deleteErr}
          <button onClick={() => setDeleteErr('')} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', color: '#D32F2F', fontSize: '.875rem' }}>×</button>
        </div>
      )}

      {loading && (
        <p style={{ color: T.light, fontSize: '.875rem', textAlign: 'center', padding: '1.5rem 0' }}>Cargando pases…</p>
      )}

      {!loading && error && (
        <p style={{ color: '#D32F2F', fontSize: '.875rem', textAlign: 'center' }}>{error}</p>
      )}

      {!loading && !error && passes.length === 0 && (
        <div style={{
          background: T.white, border: `1px solid ${T.border}`, borderRadius: '1.25rem',
          padding: '2rem 1.5rem', textAlign: 'center',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '.5rem' }}>🎟</div>
          <p style={{ margin: '0 0 .5rem', fontWeight: 700, color: T.dark, fontSize: '1rem' }}>
            Crea pases de entrada para tus invitados
          </p>
          <p style={{ margin: '0 0 1.25rem', fontSize: '.875rem', color: T.light, lineHeight: 1.6 }}>
            Los pases te ayudan a controlar la entrada de tus invitados el día del evento.
          </p>
          <button
            onClick={openCreate}
            style={{
              padding: '.625rem 1.5rem', background: T.dark, color: T.cream,
              border: 'none', borderRadius: '.875rem', fontSize: '.875rem', fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Crear primer pase
          </button>
        </div>
      )}

      {!loading && passes.length > 0 && (
        <>
          {/* Desktop table */}
          <div className="rsvp-table-wrap" style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: '1.25rem', overflowX: 'auto' }}>
            <table className="rsvp-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Teléfono</th>
                  <th style={{ textAlign: 'center' }}>Personas</th>
                  <th>Estado</th>
                  <th>Creado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {passes.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600, color: T.dark }}>{p.guestName}</td>
                    <td>{p.phone ?? '—'}</td>
                    <td style={{ textAlign: 'center' }}>{p.allowedGuests}</td>
                    <td>
                      <span style={{
                        padding: '.2rem .625rem', borderRadius: '2rem',
                        fontSize: '.75rem', fontWeight: 700,
                        color: statusColors[p.status] ?? T.mid,
                        background: statusBg[p.status] ?? T.cream,
                        whiteSpace: 'nowrap',
                      }}>
                        {statusLabels[p.status] ?? p.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '.75rem', color: T.light, whiteSpace: 'nowrap' }}>{formatDt(p.createdAt)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '.375rem', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => { setQrPass(p); setQrCopied(false); }}
                          style={{ padding: '.3rem .625rem', background: T.cream, border: `1px solid ${T.border}`, borderRadius: '.5rem', fontSize: '.75rem', fontWeight: 700, cursor: 'pointer', color: T.dark, whiteSpace: 'nowrap' }}
                        >
                          🎫 QR
                        </button>
                        <a
                          href={`${appUrl}/pass/${p.passToken}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ padding: '.3rem .625rem', background: T.cream, border: `1px solid ${T.border}`, borderRadius: '.5rem', fontSize: '.75rem', fontWeight: 700, cursor: 'pointer', color: T.dark, textDecoration: 'none', whiteSpace: 'nowrap' }}
                        >
                          🔗 Ver pase
                        </a>
                        <button
                          onClick={() => openEdit(p)}
                          style={{ padding: '.3rem .625rem', background: T.cream, border: `1px solid ${T.border}`, borderRadius: '.5rem', fontSize: '.75rem', fontWeight: 700, cursor: 'pointer', color: T.dark }}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          disabled={deleting === p.id}
                          style={{ padding: '.3rem .625rem', background: '#FCE8E6', border: '1px solid #F5C6C6', borderRadius: '.5rem', fontSize: '.75rem', fontWeight: 700, cursor: 'pointer', color: '#D32F2F', opacity: deleting === p.id ? 0.5 : 1 }}
                        >
                          {deleting === p.id ? '…' : '🗑'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="rsvp-cards-wrap">
            {passes.map((p) => (
              <div key={p.id} style={{
                background: T.white, border: `1px solid ${T.border}`,
                borderRadius: '1rem', padding: '1rem 1.125rem',
                marginBottom: '.75rem',
                borderLeft: `3px solid ${statusColors[p.status] ?? T.border}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '.5rem', marginBottom: '.5rem' }}>
                  <p style={{ margin: 0, fontWeight: 700, color: T.dark }}>{p.guestName}</p>
                  <span style={{
                    padding: '.2rem .625rem', borderRadius: '2rem',
                    fontSize: '.6875rem', fontWeight: 700, whiteSpace: 'nowrap',
                    color: statusColors[p.status] ?? T.mid,
                    background: statusBg[p.status] ?? T.cream,
                  }}>
                    {statusLabels[p.status] ?? p.status}
                  </span>
                </div>
                <p style={{ margin: '0 0 .625rem', fontSize: '.8125rem', color: T.light }}>
                  {p.allowedGuests} {p.allowedGuests === 1 ? 'persona' : 'personas'}{p.phone ? ` · ${p.phone}` : ''}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.375rem' }}>
                  <button
                    onClick={() => { setQrPass(p); setQrCopied(false); }}
                    style={mobileBtn(T.dark, T.cream)}
                  >
                    🎫 Ver QR
                  </button>
                  <a
                    href={`${appUrl}/pass/${p.passToken}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ ...mobileBtn(T.cream, T.dark, T.border), textDecoration: 'none' }}
                  >
                    🔗 Ver pase
                  </a>
                  <a
                    href={buildWaUrl(buildWaMsg(p), p.phone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ ...mobileBtn('#25D366', '#fff'), textDecoration: 'none', gridColumn: '1 / -1' }}
                  >
                    📲 Enviar por WhatsApp
                  </a>
                  <button
                    onClick={() => openEdit(p)}
                    style={mobileBtn(T.cream, T.dark, T.border)}
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    disabled={deleting === p.id}
                    style={{ ...mobileBtn('#FCE8E6', '#D32F2F', '#F5C6C6'), opacity: deleting === p.id ? 0.5 : 1 }}
                  >
                    {deleting === p.id ? 'Eliminando…' : '🗑 Eliminar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Form modal ── */}
      {showForm && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(13,10,7,0.72)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div style={{
            background: T.white, borderRadius: '1.25rem',
            padding: '1.75rem', width: '100%', maxWidth: '420px',
            boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: T.dark, fontFamily: 'var(--font-playfair,Georgia,serif)' }}>
                {editing ? 'Editar pase' : 'Nuevo pase de invitado'}
              </h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: T.light, lineHeight: 1 }}>×</button>
            </div>

            <label style={{ display: 'block', marginBottom: '1rem' }}>
              <span style={{ display: 'block', fontSize: '.8125rem', fontWeight: 700, color: T.mid, marginBottom: '.25rem' }}>Nombre del invitado o familia *</span>
              <input
                type="text"
                value={form.guestName}
                onChange={(e) => setForm(f => ({ ...f, guestName: e.target.value }))}
                placeholder="Ej. Familia Trujillo"
                style={{
                  width: '100%', padding: '.625rem .875rem',
                  background: T.cream, border: `1px solid ${T.border}`,
                  borderRadius: '.75rem', fontSize: '.9375rem', color: T.dark,
                  outline: 'none', boxSizing: 'border-box',
                }}
              />
            </label>

            <label style={{ display: 'block', marginBottom: '1rem' }}>
              <span style={{ display: 'block', fontSize: '.8125rem', fontWeight: 700, color: T.mid, marginBottom: '.25rem' }}>Número de personas permitidas *</span>
              <span style={{ display: 'block', fontSize: '.75rem', color: T.light, marginBottom: '.375rem' }}>Este será el máximo de personas que podrán confirmar con este pase.</span>
              <input
                type="number"
                min={1} max={20}
                value={form.allowedGuests}
                onChange={(e) => setForm(f => ({ ...f, allowedGuests: Math.max(1, Math.min(20, Number(e.target.value) || 1)) }))}
                style={{
                  width: '100%', padding: '.625rem .875rem',
                  background: T.cream, border: `1px solid ${T.border}`,
                  borderRadius: '.75rem', fontSize: '.9375rem', color: T.dark,
                  outline: 'none', boxSizing: 'border-box',
                }}
              />
            </label>

            <label style={{ display: 'block', marginBottom: '1.25rem' }}>
              <span style={{ display: 'block', fontSize: '.8125rem', fontWeight: 700, color: T.mid, marginBottom: '.25rem' }}>WhatsApp (opcional)</span>
              <span style={{ display: 'block', fontSize: '.75rem', color: T.light, marginBottom: '.375rem' }}>Si agregas WhatsApp, podrás enviar el pase directamente.</span>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+52 55 0000 0000"
                style={{
                  width: '100%', padding: '.625rem .875rem',
                  background: T.cream, border: `1px solid ${T.border}`,
                  borderRadius: '.75rem', fontSize: '.9375rem', color: T.dark,
                  outline: 'none', boxSizing: 'border-box',
                }}
              />
            </label>

            {formError && (
              <p style={{ margin: '0 0 .875rem', fontSize: '.8125rem', color: '#D32F2F', fontWeight: 600 }}>{formError}</p>
            )}

            <div style={{ display: 'flex', gap: '.625rem' }}>
              <button
                onClick={() => setShowForm(false)}
                style={{ flex: 1, padding: '.625rem', background: T.cream, border: `1px solid ${T.border}`, borderRadius: '.75rem', fontSize: '.875rem', fontWeight: 700, cursor: 'pointer', color: T.dark }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{ flex: 1, padding: '.625rem', background: T.dark, border: 'none', borderRadius: '.75rem', fontSize: '.875rem', fontWeight: 700, cursor: 'pointer', color: T.cream, opacity: saving ? 0.7 : 1 }}
              >
                {saving ? 'Guardando…' : (editing ? 'Guardar cambios' : 'Crear pase')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── QR modal ── */}
      {qrPass && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setQrPass(null); }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(13,10,7,0.72)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div style={{
            background: T.white, borderRadius: '1.5rem',
            padding: '1.5rem', width: '100%', maxWidth: '360px',
            boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '.9375rem', fontWeight: 700, color: T.dark, fontFamily: 'var(--font-playfair,Georgia,serif)' }}>
                Pase de entrada
              </h3>
              <button onClick={() => setQrPass(null)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: T.light, lineHeight: 1 }}>×</button>
            </div>

            {/* Capturable card */}
            <div ref={qrCardRef} style={{
              background: T.dark, borderRadius: '1.25rem', padding: '1.5rem',
              textAlign: 'center', marginBottom: '1rem',
            }}>
              <p style={{ margin: '0 0 .2rem', fontSize: '.625rem', letterSpacing: '.2em', textTransform: 'uppercase', color: T.gold, fontWeight: 700 }}>KOMPRALO</p>
              <p style={{ margin: '0 0 1rem', fontSize: '.75rem', letterSpacing: '.15em', textTransform: 'uppercase', color: T.cream, opacity: 0.7 }}>Pase de entrada</p>

              <div style={{ background: T.white, borderRadius: '.875rem', padding: '1rem', display: 'inline-block', marginBottom: '1rem' }}>
                <QRCode value={`${appUrl}/pass/${qrPass.passToken}`} size={160} />
              </div>

              <p style={{ margin: '0 0 .25rem', fontSize: '1.125rem', fontWeight: 800, color: T.cream, fontFamily: 'var(--font-playfair,Georgia,serif)' }}>
                {qrPass.guestName}
              </p>
              <p style={{ margin: 0, fontSize: '.8125rem', color: T.gold }}>
                {qrPass.allowedGuests} {qrPass.allowedGuests === 1 ? 'persona' : 'personas'}
              </p>

              {qrPass.checkedInAt && (
                <div style={{ marginTop: '.75rem', padding: '.35rem .75rem', background: '#238636', borderRadius: '2rem', display: 'inline-block' }}>
                  <span style={{ fontSize: '.75rem', color: '#fff', fontWeight: 700 }}>✓ Pase utilizado</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.5rem' }}>
              <button
                onClick={handleDownloadQr}
                style={{ padding: '.625rem', background: T.dark, color: T.cream, border: 'none', borderRadius: '.75rem', fontSize: '.8125rem', fontWeight: 700, cursor: 'pointer' }}
              >
                ⬇ Descargar
              </button>
              <button
                onClick={handleCopyQr}
                style={{ padding: '.625rem', background: qrCopied ? '#E6F4EA' : T.cream, color: qrCopied ? '#238636' : T.dark, border: `1px solid ${qrCopied ? '#A7D7B0' : T.border}`, borderRadius: '.75rem', fontSize: '.8125rem', fontWeight: 700, cursor: 'pointer' }}
              >
                {qrCopied ? '✓ Copiado' : '🔗 Copiar enlace'}
              </button>
            </div>

            <a
              href={buildWaUrl(buildWaMsg(qrPass), qrPass.phone)}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block', marginTop: '.5rem', padding: '.625rem',
                background: '#25D366', color: '#fff', border: 'none', borderRadius: '.75rem',
                fontSize: '.8125rem', fontWeight: 700, textAlign: 'center', textDecoration: 'none',
              }}
            >
              📲 Enviar por WhatsApp
            </a>

            <button
              onClick={() => setQrPass(null)}
              style={{ display: 'block', width: '100%', marginTop: '.5rem', padding: '.5rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '.8125rem', color: T.light, fontWeight: 600 }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

// ── Mobile button style helper ─────────────────────────────────────────────────
function mobileBtn(bg: string, color: string, borderColor?: string): React.CSSProperties {
  return {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.375rem',
    padding: '.75rem 1rem', minHeight: '46px',
    background: bg, color,
    border: borderColor ? `1px solid ${borderColor}` : 'none',
    borderRadius: '.75rem', fontSize: '.8125rem', fontWeight: 700,
    cursor: 'pointer', textAlign: 'center' as const,
    lineHeight: 1.3, whiteSpace: 'normal' as const, wordBreak: 'break-word' as const,
  };
}
