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
  dark:   '#1C1713',
  mid:    '#1C1713',
  light:  '#7A6A5B',
  gold:   '#C8A95B',
  cream:  '#FFFBF4',
  white:  '#FFFBF4',
  border: '#E5D2A8',
  ivory:  '#FAF3E6',
} as const;

const statusColors: Record<string, string> = {
  pending:   '#7A6A5B',
  confirmed: '#247A45',
  declined:  '#B43232',
  used:      '#6A6A6A',
};
const statusBg: Record<string, string> = {
  pending:   '#FBF5E3',
  confirmed: '#E7F5EC',
  declined:  '#FBEAEA',
  used:      '#F2F2F2',
};
const statusLabels: Record<string, string> = {
  pending:   'Sin confirmar',
  confirmed: 'Confirmado',
  declined:  'Declinado',
  used:      'Usado',
};

type FilterKey = 'all' | 'pending' | 'confirmed' | 'no-phone';

const filterLabels: Record<FilterKey, string> = {
  all:      'Todos',
  pending:  'Pendientes',
  confirmed: 'Confirmados',
  'no-phone': 'Sin WhatsApp',
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
  publicUrl?: string | null;
}

export default function GuestPassSection({ invitationId, appUrl, publicUrl }: Props) {
  const [passes,     setPasses]     = useState<GuestPass[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');

  // Search + filter
  const [searchQuery,  setSearchQuery]  = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');

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

  // Scroll lock when modals open
  useEffect(() => {
    document.body.style.overflow = (showForm || qrPass) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showForm, qrPass]);

  // ── Computed stats ──────────────────────────────────────────────────────────
  const totalFamilies  = passes.length;
  const totalPersonas  = passes.reduce((acc, p) => acc + p.allowedGuests, 0);
  const totalConfirmed = passes.filter(p => p.status === 'confirmed' || p.status === 'used').length;
  const totalPending   = passes.filter(p => p.status === 'pending').length;

  // ── Filtered list ───────────────────────────────────────────────────────────
  const q = searchQuery.toLowerCase().trim();
  const filteredPasses = passes.filter(p => {
    const matchesSearch = !q || p.guestName.toLowerCase().includes(q) || (p.phone ?? '').includes(q);
    const matchesFilter =
      activeFilter === 'all'       ? true :
      activeFilter === 'pending'   ? p.status === 'pending' :
      activeFilter === 'confirmed' ? (p.status === 'confirmed' || p.status === 'used') :
      activeFilter === 'no-phone'  ? !p.phone :
      true;
    return matchesSearch && matchesFilter;
  });

  // ── Actions ─────────────────────────────────────────────────────────────────
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
    if (!raw) return null;
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
    if (!window.confirm('¿Eliminar este invitado? Esta acción no se puede deshacer.')) return;
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

  function buildWaMsg(pass: GuestPass): string {
    const passUrl = `${appUrl}/pass/${pass.passToken}`;
    const lines = [
      `Hola ${pass.guestName} 💛`,
      '',
      'Les compartimos nuestra invitación:',
      publicUrl ?? '',
      '',
      'Este es su pase personalizado para confirmar asistencia y entrar al evento:',
      passUrl,
      '',
      `Pase para: ${pass.allowedGuests} persona${pass.allowedGuests !== 1 ? 's' : ''}.`,
      '',
      'Por favor confirmen desde su pase.',
      'Nos encantará contar con ustedes.',
    ];
    return lines.filter((l, i) => !(l === '' && i === 3 && !publicUrl)).join('\n');
  }

  function buildWaUrl(msg: string, phone?: string): string {
    const encoded = encodeURIComponent(msg);
    if (!phone) return `https://wa.me/?text=${encoded}`;
    const clean = phone.replace(/\D/g, '');
    const normalized = clean.length === 10 ? `52${clean}` : clean;
    return `https://wa.me/${normalized}?text=${encoded}`;
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <section style={{ marginTop: '2rem' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.75rem', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ margin: '0 0 .2rem', fontSize: '1.0625rem', fontWeight: 700, color: T.dark, fontFamily: 'var(--font-playfair, Georgia, serif)' }}>
            Mis invitados
          </h2>
          <p style={{ margin: 0, fontSize: '.8rem', color: T.light }}>
            Administra todas las personas invitadas desde un solo lugar.
          </p>
        </div>
        {passes.length > 0 && (
          <button
            onClick={openCreate}
            style={{
              padding: '.5rem 1.125rem', background: T.dark, color: T.cream,
              border: 'none', borderRadius: '.75rem', fontSize: '.875rem', fontWeight: 700,
              cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            + Crear invitado
          </button>
        )}
      </div>

      {/* ── Summary stats (only when there are passes) ── */}
      {passes.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '.625rem', marginBottom: '1.25rem' }}>
          <StatCard label="Familias invitadas" value={totalFamilies} />
          <StatCard label="Personas invitadas" value={totalPersonas} accent={T.gold} />
          <StatCard label="Confirmados"         value={totalConfirmed} accent="#238636" />
          <StatCard label="Pendientes"          value={totalPending}   accent="#8A6D3B" />
        </div>
      )}

      {/* ── Error banner ── */}
      {deleteErr && (
        <div style={{ margin: '0 0 .75rem', padding: '.75rem 1rem', background: '#FBEAEA', border: '1px solid #F5C6C6', borderRadius: '.75rem', fontSize: '.8125rem', color: '#B43232', fontWeight: 600 }}>
          {deleteErr}
          <button onClick={() => setDeleteErr('')} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', color: '#B43232', fontSize: '.875rem' }}>×</button>
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <p style={{ color: T.light, fontSize: '.875rem', textAlign: 'center', padding: '1.5rem 0' }}>Cargando invitados…</p>
      )}
      {!loading && error && (
        <p style={{ color: '#B43232', fontSize: '.875rem', textAlign: 'center' }}>{error}</p>
      )}

      {/* ── Empty state ── */}
      {!loading && !error && passes.length === 0 && (
        <div style={{
          background: T.white, border: `1px solid ${T.border}`, borderRadius: '1.25rem',
          padding: '2.5rem 1.5rem', textAlign: 'center',
        }}>
          <div style={{ fontSize: '2.25rem', marginBottom: '.75rem' }}>👥</div>
          <p style={{ margin: '0 0 .5rem', fontWeight: 700, color: T.dark, fontSize: '1rem' }}>
            Todavía no has agregado invitados
          </p>
          <p style={{ margin: '0 0 1.5rem', fontSize: '.875rem', color: T.light, lineHeight: 1.6, maxWidth: '340px', marginLeft: 'auto', marginRight: 'auto' }}>
            Crea tu primer pase para comenzar a organizar tu lista de invitados.
          </p>
          <button
            onClick={openCreate}
            style={{
              padding: '.625rem 1.5rem', background: T.dark, color: T.cream,
              border: 'none', borderRadius: '.875rem', fontSize: '.875rem', fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Crear primer invitado
          </button>
        </div>
      )}

      {/* ── Search + filters ── */}
      {!loading && passes.length > 0 && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.625rem', marginBottom: '1rem' }}>
            {/* Search */}
            <input
              type="text"
              placeholder="Buscar por nombre o teléfono…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '.625rem .875rem',
                background: T.white, border: `1px solid ${T.border}`,
                borderRadius: '.75rem', fontSize: '.875rem', color: T.dark,
                outline: 'none', boxSizing: 'border-box',
              }}
            />
            {/* Filter chips */}
            <div style={{ display: 'flex', gap: '.375rem', flexWrap: 'wrap' }}>
              {(Object.keys(filterLabels) as FilterKey[]).map(key => (
                <button
                  key={key}
                  onClick={() => setActiveFilter(key)}
                  style={{
                    padding: '.3rem .75rem', borderRadius: '2rem',
                    fontSize: '.75rem', fontWeight: 700, cursor: 'pointer',
                    border: `1px solid ${activeFilter === key ? T.dark : T.border}`,
                    background: activeFilter === key ? T.dark : T.white,
                    color: activeFilter === key ? T.cream : T.light,
                    transition: 'all .15s',
                  }}
                >
                  {filterLabels[key]}
                  {key === 'pending'   && totalPending   > 0 && <span style={{ marginLeft: '.35rem', background: '#8A6D3B', color: '#fff', borderRadius: '1rem', padding: '0 .35rem', fontSize: '.65rem' }}>{totalPending}</span>}
                  {key === 'confirmed' && totalConfirmed > 0 && <span style={{ marginLeft: '.35rem', background: '#247A45', color: '#fff', borderRadius: '1rem', padding: '0 .35rem', fontSize: '.65rem' }}>{totalConfirmed}</span>}
                </button>
              ))}
            </div>
          </div>

          {/* No results for current search/filter */}
          {filteredPasses.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: T.light, fontSize: '.875rem' }}>
              No se encontraron invitados con ese filtro.
            </div>
          )}

          {/* ── Desktop table ── */}
          {filteredPasses.length > 0 && (
            <div className="rsvp-table-wrap" style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: '1.25rem', overflowX: 'auto' }}>
              <table className="rsvp-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>WhatsApp</th>
                    <th style={{ textAlign: 'center' }}>Personas</th>
                    <th>Estado</th>
                    <th>Creado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPasses.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600, color: T.dark }}>{p.guestName}</td>
                      <td>
                        {p.phone
                          ? <span style={{ fontSize: '.75rem', color: T.light }}>WhatsApp listo: {p.phone}</span>
                          : <span style={{ fontSize: '.75rem', color: T.light }}>Sin número de WhatsApp</span>
                        }
                      </td>
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
                            style={tableBtn}
                          >
                            🎫 QR
                          </button>
                          <a
                            href={`${appUrl}/pass/${p.passToken}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ ...tableBtn, textDecoration: 'none' }}
                          >
                            Ver pase
                          </a>
                          <a
                            href={buildWaUrl(buildWaMsg(p), p.phone)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ ...tableBtn, textDecoration: 'none', background: '#E8F9EE', color: '#247A45', borderColor: '#B8DFC4' }}
                          >
                            Enviar invitación
                          </a>
                          <button onClick={() => openEdit(p)} style={tableBtn}>✏️</button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            disabled={deleting === p.id}
                            style={{ ...tableBtn, background: '#FBEAEA', borderColor: '#F0C4C4', color: '#B43232', opacity: deleting === p.id ? 0.5 : 1 }}
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
          )}

          {/* ── Mobile cards ── */}
          {filteredPasses.length > 0 && (
            <div className="rsvp-cards-wrap">
              {filteredPasses.map((p) => (
                <div key={p.id} style={{
                  background: T.white, border: `1px solid ${T.border}`,
                  borderRadius: '1.125rem', padding: '1.125rem 1.25rem',
                  marginBottom: '.75rem',
                  borderLeft: `3px solid ${statusColors[p.status] ?? T.border}`,
                }}>
                  {/* Name + badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '.5rem', marginBottom: '.25rem' }}>
                    <p style={{ margin: 0, fontWeight: 700, color: T.dark, fontSize: '1rem' }}>{p.guestName}</p>
                    <span style={{
                      padding: '.2rem .625rem', borderRadius: '2rem', flexShrink: 0,
                      fontSize: '.6875rem', fontWeight: 700, whiteSpace: 'nowrap',
                      color: statusColors[p.status] ?? T.mid,
                      background: statusBg[p.status] ?? T.cream,
                    }}>
                      {statusLabels[p.status] ?? p.status}
                    </span>
                  </div>
                  {/* Sub info */}
                  <p style={{ margin: '0 0 .125rem', fontSize: '.8125rem', color: T.light }}>
                    {p.allowedGuests} {p.allowedGuests === 1 ? 'invitado' : 'invitados'}
                  </p>
                  <p style={{ margin: '0 0 1rem', fontSize: '.75rem', color: T.light }}>
                    {p.phone ? `WhatsApp listo: ${p.phone}` : 'Sin número de WhatsApp'}
                  </p>
                  {/* Primary actions */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.5rem', marginBottom: '.5rem' }}>
                    <a
                      href={`${appUrl}/pass/${p.passToken}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ ...mobileBtn(T.dark, T.cream), textDecoration: 'none' }}
                    >
                      Ver pase
                    </a>
                    <button
                      onClick={() => { setQrPass(p); setQrCopied(false); }}
                      style={mobileBtn(T.cream, T.dark, T.border)}
                    >
                      🎫 Ver QR
                    </button>
                  </div>
                  {/* WhatsApp */}
                  <a
                    href={buildWaUrl(buildWaMsg(p), p.phone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ ...mobileBtn('#25D366', '#fff'), textDecoration: 'none', display: 'flex', marginBottom: '.5rem' }}
                  >
                    📲 Enviar invitación
                  </a>
                  {/* Secondary actions */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.375rem' }}>
                    <button onClick={() => openEdit(p)} style={{ ...mobileBtn(T.cream, T.dark, T.border), fontSize: '.8rem' }}>
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      disabled={deleting === p.id}
                      style={{ ...mobileBtn('#FBEAEA', '#B43232', '#F0C4C4'), fontSize: '.8rem', opacity: deleting === p.id ? 0.5 : 1 }}
                    >
                      {deleting === p.id ? 'Eliminando…' : '🗑 Eliminar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
                {editing ? 'Editar invitado' : 'Nuevo invitado'}
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
              <span style={{ display: 'block', fontSize: '.8125rem', fontWeight: 700, color: T.mid, marginBottom: '.25rem' }}>Número de personas *</span>
              <span style={{ display: 'block', fontSize: '.75rem', color: T.light, marginBottom: '.375rem' }}>Máximo de personas que pueden confirmar con este pase.</span>
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
              <span style={{ display: 'block', fontSize: '.75rem', color: T.light, marginBottom: '.375rem' }}>Si agregas WhatsApp, podrás enviarle el pase directamente.</span>
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
              <p style={{ margin: '0 0 .875rem', fontSize: '.8125rem', color: '#B43232', fontWeight: 600 }}>{formError}</p>
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
                {saving ? 'Guardando…' : (editing ? 'Guardar cambios' : 'Crear invitado')}
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
                <div style={{ marginTop: '.75rem', padding: '.35rem .75rem', background: '#247A45', borderRadius: '2rem', display: 'inline-block' }}>
                  <span style={{ fontSize: '.75rem', color: '#fff', fontWeight: 700 }}>✓ Pase utilizado</span>
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.5rem' }}>
              <button
                onClick={handleDownloadQr}
                style={{ padding: '.625rem', background: T.dark, color: T.cream, border: 'none', borderRadius: '.75rem', fontSize: '.8125rem', fontWeight: 700, cursor: 'pointer' }}
              >
                ⬇ Descargar
              </button>
              <button
                onClick={handleCopyQr}
                style={{ padding: '.625rem', background: qrCopied ? '#E7F5EC' : T.cream, color: qrCopied ? '#247A45' : T.dark, border: `1px solid ${qrCopied ? '#B8DFC4' : T.border}`, borderRadius: '.75rem', fontSize: '.8125rem', fontWeight: 700, cursor: 'pointer' }}
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

// ── Stat card ──────────────────────────────────────────────────────────────────
function StatCard({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div style={{
      background: '#FFFAF3', border: `1px solid #EAD7A3`,
      borderRadius: '1rem', padding: '.875rem 1rem',
      borderTop: accent ? `3px solid ${accent}` : '3px solid #EAD7A3',
    }}>
      <p style={{ margin: '0 0 .125rem', fontSize: '1.5rem', fontWeight: 800, color: accent ?? '#0D0A07', lineHeight: 1 }}>{value}</p>
      <p style={{ margin: 0, fontSize: '.75rem', fontWeight: 600, color: '#6B4A35' }}>{label}</p>
    </div>
  );
}

// ── Style helpers ──────────────────────────────────────────────────────────────
const tableBtn: React.CSSProperties = {
  padding: '.3rem .625rem', background: '#F1E3C8', border: '1px solid #EAD7A3',
  borderRadius: '.5rem', fontSize: '.75rem', fontWeight: 700,
  cursor: 'pointer', color: '#0D0A07', whiteSpace: 'nowrap',
  textDecoration: 'none', display: 'inline-flex', alignItems: 'center',
};

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
