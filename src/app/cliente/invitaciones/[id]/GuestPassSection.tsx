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
  dark:   '#1A1208',
  mid:    '#1A1208',
  light:  '#7A6A5B',
  gold:   '#C9A84C',
  cream:  '#FAF6EB',
  white:  '#ffffff',
  border: '#E5D2A8',
  ivory:  '#FAF6EB',
} as const;

const statusColors: Record<string, string> = {
  pending:   '#B99752',
  confirmed: '#1A7A45',
  declined:  '#B43232',
  used:      '#1A7A45',
};
const statusBg: Record<string, string> = {
  pending:   '#FAF6EB',
  confirmed: '#E7F5EC',
  declined:  '#FBEAEA',
  used:      '#E7F5EC',
};
const statusBorder: Record<string, string> = {
  pending:   '#EAD7A3',
  confirmed: '#B8DFC4',
  declined:  '#F0C4C4',
  used:      '#B8DFC4',
};
const statusLabels: Record<string, string> = {
  pending:   'Pendiente',
  confirmed: 'Confirmado',
  declined:  'Declinado',
  used:      'Usado',
};

type FilterKey = 'all' | 'pending' | 'confirmed' | 'no-phone';

const filterLabels: Record<FilterKey, string> = {
  all:      'Todas',
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
  const [guestsInputValue, setGuestsInputValue] = useState(String(emptyForm.allowedGuests));

  useEffect(() => {
    setGuestsInputValue(String(form.allowedGuests));
  }, [form.allowedGuests]);

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.75rem', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#C9A84C' }}>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: T.dark, fontFamily: 'var(--font-playfair, Georgia, serif)' }}>
              Mis invitados
            </h2>
          </div>
          <p style={{ margin: '.25rem 0 0', fontSize: '.8rem', color: T.light }}>
            Administra todas las personas invitadas desde un solo lugar.
          </p>
        </div>
      </div>

      {/* ── Summary stats (only when there are passes) ── */}
      {passes.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '.75rem', marginBottom: '1.5rem' }} className="sm:grid-cols-4">
          <StatCard
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>}
            label="Familias invitadas"
            value={totalFamilies}
            iconBg="#E7F5EC"
            iconColor="#1A7A45"
          />
          <StatCard
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
            label="Confirmados"
            value={totalConfirmed}
            iconBg="#E7F5EC"
            iconColor="#1A7A45"
          />
          <StatCard
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>}
            label="Personas invitadas"
            value={totalPersonas}
            iconBg="#FAF6EB"
            iconColor="#C9A84C"
          />
          <StatCard
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>}
            label="Pendientes"
            value={totalPending}
            iconBg="#FBEAEA"
            iconColor="#B43232"
          />
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
              padding: '.625rem 1.5rem', background: '#1A1208', color: '#FFFFFF',
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
          <h3 style={{ fontFamily: 'serif', fontSize: '1.25rem', fontWeight: 600, color: '#1a1a1a', marginBottom: '0.75rem', margin: '0 0 0.75rem' }}>
            Administrador de Invitados
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem', marginBottom: '1.25rem' }} className="sm:flex-row sm:items-center sm:justify-between">
            {/* Search */}
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                placeholder="Buscar por nombre o teléfono..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', padding: '.625rem .875rem .625rem 2.25rem',
                  background: '#FFFFFF', border: '1px solid #E5D2A8',
                  borderRadius: '0.5rem', fontSize: '.875rem', color: T.dark,
                  outline: 'none', boxSizing: 'border-box', boxShadow: '0 2px 6px rgba(26,18,8,0.01)'
                }}
              />
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#7A6A5B' }}>
                <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            {/* Filter chips + Crear invitado */}
            <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {(Object.keys(filterLabels) as FilterKey[]).map(key => {
                const isActive = activeFilter === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveFilter(key)}
                    style={{
                      padding: '.45rem 1rem', borderRadius: '2rem',
                      fontSize: '.75rem', fontWeight: 700, cursor: 'pointer',
                      border: `1px solid ${isActive ? '#1A1208' : '#E5D2A8'}`,
                      background: isActive ? '#1A1208' : '#FFFFFF',
                      color: isActive ? '#FFFFFF' : '#7A6A5B',
                      transition: 'all .15s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    {filterLabels[key]}
                    {key === 'confirmed' && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 14, height: 14, borderRadius: '50%', background: '#1A7A45', color: '#FFFFFF', fontSize: '8px' }}>✓</span>
                    )}
                  </button>
                );
              })}
              <button
                onClick={openCreate}
                style={{
                  marginLeft: 'auto', padding: '.45rem 1rem', background: '#1A1208', color: '#FFFFFF',
                  border: 'none', borderRadius: '2rem', fontSize: '.75rem', fontWeight: 700,
                  cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s'
                }}
                className="db-btn"
              >
                + Crear invitado
              </button>
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
            <div className="rsvp-table-wrap cc-card" style={{ overflowX: 'auto', marginBottom: '1.5rem', border: '1px solid #E5D2A8' }}>
              <table className="rsvp-table">
                <thead>
                  <tr>
                    <th>NOMBRE</th>
                    <th>WHATSAPP</th>
                    <th style={{ textAlign: 'center' }}>PERSONAS</th>
                    <th>ESTADO</th>
                    <th>CREADO</th>
                    <th>ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPasses.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600, color: T.dark }}>{p.guestName}</td>
                      <td>
                        {p.phone ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="#1A7A45" style={{ flexShrink: 0 }}>
                              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.003 5.37 5.378 0 12.03 0a12.03 12.03 0 0 1 11.97 12.037c-.003 6.634-5.378 12.003-12.03 12.003-.193 0-.387-.002-.58-.008L0 24zm6.09-19.113c-.168 0-.34.02-.495.093-.243.11-.475.295-.615.54-.424.743-.655 2.128-.158 3.65.418 1.285 1.556 2.825 2.87 3.993 1.348 1.198 3.1 2.378 4.7 3.018.665.265 1.488.468 2.213.435.637-.03 1.265-.308 1.637-.843.34-.488.44-1.033.408-1.455-.03-.393-.16-.628-.42-.765-.325-.17-1.51-.745-1.745-.83-.235-.083-.408-.125-.58.125-.17.252-.66.83-.81 1-.15.172-.3.193-.565.067-.265-.13-1.12-.413-2.133-1.32-.787-.703-1.32-1.57-1.474-1.838-.155-.268-.017-.413.12-.55.122-.122.268-.323.402-.482.133-.16.18-.27.27-.45.09-.18.046-.338-.022-.475-.067-.138-.58-1.4-.795-1.92-.21-.505-.44-.438-.6-.445-.164-.007-.353-.01-.54-.01z"/>
                            </svg>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontSize: '0.65rem', color: '#7A6A5B', fontWeight: 600 }}>WhatsApp:</span>
                              <span style={{ fontSize: '0.8rem', color: '#1A1208', fontWeight: 500 }}>{p.phone}</span>
                            </div>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#7A6A5B', opacity: 0.5 }}>—</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 600, color: T.dark }}>{p.allowedGuests}</td>
                      <td>
                        <span style={{
                          padding: '0.35rem 0.75rem', borderRadius: '2rem',
                          fontSize: '0.75rem', fontWeight: 700,
                          color: statusColors[p.status] ?? '#7A6A5B',
                          background: statusBg[p.status] ?? '#FAF6EB',
                          border: `1px solid ${statusBorder[p.status] ?? '#E5D2A8'}`,
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
                            style={{ ...tableBtn, background: '#FAF6EB', color: '#B99752', borderColor: '#EAD7A3' }}
                            className="db-btn"
                          >
                            QR <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '0.25rem' }}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><rect x="7" y="7" width="3" height="3"></rect><rect x="14" y="7" width="3" height="3"></rect><rect x="7" y="14" width="3" height="3"></rect></svg>
                          </button>
                          <a
                            href={`${appUrl}/pass/${p.passToken}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ ...tableBtn, background: 'transparent', color: '#1A1208', borderColor: '#E5D2A8', textDecoration: 'none' }}
                            className="db-btn"
                          >
                            Ver pase <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '0.25rem' }}><path d="M8 18h8M8 12h8M8 6h8"/></svg>
                          </a>
                          <a
                            href={buildWaUrl(buildWaMsg(p), p.phone)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ ...tableBtn, background: '#E7F5EC', color: '#1A7A45', borderColor: '#B8DFC4', textDecoration: 'none' }}
                            className="db-btn"
                          >
                            Enviar invitación <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '0.25rem' }}><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                          </a>
                          <button
                            onClick={() => openEdit(p)}
                            style={{ ...tableBtn, background: 'transparent', color: '#7A6A5B', borderColor: '#E5D2A8', padding: '0.375rem 0.5rem' }}
                            className="db-btn"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            disabled={deleting === p.id}
                            style={{ ...tableBtn, background: '#FBEAEA', borderColor: '#F0C4C4', color: '#B43232', opacity: deleting === p.id ? 0.5 : 1, padding: '0.375rem 0.5rem' }}
                            className="db-btn"
                          >
                            {deleting === p.id ? '…' : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Visual Pagination bar */}
          {filteredPasses.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.25rem', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem', fontSize: '0.8125rem', color: '#7A6A5B' }}>
              <div>
                Mostrando 1 a {filteredPasses.length} de {filteredPasses.length} invitados
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <button disabled style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid #E5D2A8', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'not-allowed', color: '#7A6A5B', opacity: 0.5 }}>
                  &lt;
                </button>
                <button style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: '#1A1208', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  1
                </button>
                <button disabled style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid #E5D2A8', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'not-allowed', color: '#7A6A5B', opacity: 0.5 }}>
                  &gt;
                </button>
              </div>

              <div style={{ position: 'relative' }}>
                <select defaultValue="10" style={{ padding: '0.375rem 1.75rem 0.375rem 0.75rem', border: '1px solid #E5D2A8', borderRadius: '0.5rem', background: '#FFFFFF', color: '#1A1208', outline: 'none', cursor: 'pointer', appearance: 'none' }}>
                  <option value="10">10 por página</option>
                  <option value="20">20 por página</option>
                  <option value="50">50 por página</option>
                </select>
                <div style={{ position: 'absolute', right: '0.625rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#7A6A5B', fontSize: '0.5rem' }}>
                  ▼
                </div>
              </div>
            </div>
          )}

          {/* ── Mobile cards ── */}
          {filteredPasses.length > 0 && (
            <div className="rsvp-cards-wrap" style={{ marginBottom: '1.5rem' }}>
              {filteredPasses.map((p) => (
                <div key={p.id} style={{
                  background: T.white, border: `1px solid ${T.border}`,
                  borderRadius: '1.125rem', padding: '1.125rem 1.25rem',
                  marginBottom: '.75rem',
                  borderLeft: `3px solid ${statusColors[p.status] ?? T.border}`,
                  boxShadow: '0 2px 8px rgba(26,18,8,0.02)'
                }}>
                  {/* Name + badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '.5rem', marginBottom: '.25rem' }}>
                    <p style={{ margin: 0, fontWeight: 700, color: T.dark, fontSize: '1rem' }}>{p.guestName}</p>
                    <span style={{
                      padding: '0.25rem 0.625rem', borderRadius: '2rem', flexShrink: 0,
                      fontSize: '.6875rem', fontWeight: 700, whiteSpace: 'nowrap',
                      color: statusColors[p.status] ?? T.mid,
                      background: statusBg[p.status] ?? T.cream,
                      border: `1px solid ${statusBorder[p.status] ?? T.border}`
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
                      style={{ ...mobileBtn(T.dark, '#FFFFFF'), textDecoration: 'none' }}
                    >
                      Ver pase
                    </a>
                    <button
                      onClick={() => { setQrPass(p); setQrCopied(false); }}
                      style={mobileBtn('#FAF6EB', '#B99752', '#EAD7A3')}
                    >
                      🎫 Ver QR
                    </button>
                  </div>
                  {/* WhatsApp */}
                  <a
                    href={buildWaUrl(buildWaMsg(p), p.phone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ ...mobileBtn('#E7F5EC', '#1A7A45', '#B8DFC4'), textDecoration: 'none', display: 'flex', marginBottom: '.5rem' }}
                  >
                    📲 Enviar invitación
                  </a>
                  {/* Secondary actions */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.375rem' }}>
                    <button onClick={() => openEdit(p)} style={{ ...mobileBtn('#FFFFFF', T.dark, '#E5D2A8'), fontSize: '.8rem' }}>
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
                max={20}
                value={guestsInputValue}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === '' || /^\d+$/.test(raw)) {
                    setGuestsInputValue(raw);
                    const num = parseInt(raw, 10);
                    if (!isNaN(num)) {
                      setForm(f => ({ ...f, allowedGuests: num }));
                    }
                  }
                }}
                onBlur={() => {
                  const num = parseInt(guestsInputValue, 10);
                  const clamped = isNaN(num) ? 1 : Math.max(1, Math.min(20, num));
                  setGuestsInputValue(String(clamped));
                  setForm(f => ({ ...f, allowedGuests: clamped }));
                }}
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
function StatCard({ icon, label, value, iconBg, iconColor }: { icon: React.ReactNode; label: string; value: number; iconBg: string; iconColor: string }) {
  return (
    <div style={{
      background: '#FFFFFF', border: '1px solid #E5D2A8',
      borderRadius: '1rem', padding: '1rem',
      display: 'flex', alignItems: 'center', gap: '0.75rem',
      boxShadow: '0 2px 8px rgba(26,18,8,0.01)',
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: '0.5rem',
        background: iconBg, color: iconColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.1rem', flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#1A1208', lineHeight: 1 }}>{value}</p>
        <p style={{ margin: '.125rem 0 0', fontSize: '.75rem', fontWeight: 600, color: '#7A6A5B', lineHeight: 1.1 }}>{label}</p>
      </div>
    </div>
  );
}

// ── Style helpers ──────────────────────────────────────────────────────────────
const tableBtn: React.CSSProperties = {
  padding: '0.375rem 0.75rem',
  borderRadius: '0.5rem',
  fontSize: '.75rem',
  fontWeight: 700,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  display: 'inline-flex',
  alignItems: 'center',
  border: '1px solid transparent',
  transition: 'all 0.15s ease',
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
