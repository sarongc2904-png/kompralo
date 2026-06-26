'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { publicUrl, previewUrl, editorUrl, clientDashboardUrl, whatsappClientMessage, whatsappGuestsMessage } from '@/lib/admin/urls';

const PLAN_OPTIONS = ['basic', 'premium', 'deluxe'] as const;
const STATUS_OPTIONS = ['draft', 'pending_payment', 'paid', 'published', 'paused', 'cancelled', 'archived'] as const;

function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('es-MX', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <tr style={{ borderBottom: '1px solid #E5D2A8' }}>
      <td style={{ padding: '.5rem .875rem', fontSize: '.7rem', color: '#7A6A5B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', whiteSpace: 'nowrap', width: 160 }}>{label}</td>
      <td style={{ padding: '.5rem .875rem', fontSize: '.8125rem', color: '#241A14', wordBreak: 'break-all' }}>{value}</td>
    </tr>
  );
}

function CopyBtn({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      style={{ padding: '.375rem .75rem', background: copied ? '#E7F5EC' : '#FAF3E6', color: copied ? '#247A45' : '#7A6A5B', border: `1px solid ${copied ? '#B8DFC4' : '#E5D2A8'}`, borderRadius: 8, fontSize: '.75rem', cursor: 'pointer', fontWeight: 600 }}
    >
      {copied ? '✓ Copiado' : label}
    </button>
  );
}

export default function AdminInvitationDetailPage() {
  const params = useParams();
  const id     = params.id as string;

  const [inv, setInv] = useState<Record<string, unknown> | null>(null);
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const [newPlan,    setNewPlan]    = useState('');
  const [newStatus,  setNewStatus]  = useState('');
  const [newOwnerId, setNewOwnerId] = useState('');
  const [emailSending, setEmailSending] = useState(false);

  async function load() {
    setLoading(true);
    const [invRes, ordRes] = await Promise.all([
      fetch(`/api/admin/invitations/${id}`),
      fetch(`/api/admin/invitations/${id}/orders`),
    ]);
    if (invRes.ok) {
      const data = await invRes.json() as Record<string, unknown>;
      setInv(data);
      setNewPlan((data.plan_id as string) ?? '');
      setNewStatus((data.status as string) ?? '');
      setNewOwnerId((data.user_id as string) ?? '');
    }
    if (ordRes.ok) {
      const data = await ordRes.json() as Record<string, unknown>[];
      setOrders(Array.isArray(data) ? data : []);
    }
    setLoading(false);
  }

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      setLoading(true);
      const [invRes, ordRes] = await Promise.all([
        fetch(`/api/admin/invitations/${id}`),
        fetch(`/api/admin/invitations/${id}/orders`),
      ]);
      if (!cancelled) {
        if (invRes.ok) {
          const data = await invRes.json() as Record<string, unknown>;
          setInv(data);
          setNewPlan((data.plan_id as string) ?? '');
          setNewStatus((data.status as string) ?? '');
          setNewOwnerId((data.user_id as string) ?? '');
        }
        if (ordRes.ok) {
          const data = await ordRes.json() as Record<string, unknown>[];
          setOrders(Array.isArray(data) ? data : []);
        }
        setLoading(false);
      }
    }
    void fetchData();
    return () => { cancelled = true; };
  }, [id]);

  async function handlePatch(body: Record<string, unknown>) {
    setMsg('');
    const res = await fetch(`/api/admin/invitations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) { setMsg(`Error: ${data.error}`); return; }
    setMsg('✓ Guardado');
    load();
  }

  async function sendAccessEmail() {
    setEmailSending(true);
    const res = await fetch(`/api/admin/invitations/${id}/send-access-email`, { method: 'POST' });
    const data = await res.json();
    setMsg(res.ok ? `✓ Email enviado a ${data.sentTo}` : `Error: ${data.error}`);
    setEmailSending(false);
    load();
  }

  async function handleSoftDelete() {
    if (!confirm('¿Desactivar esta invitación? La invitación dejará de ser pública.')) return;
    await handlePatch({ soft_delete: true });
  }

  async function handleRestore() {
    await handlePatch({ restore: true });
  }

  async function handleRegenSlug() {
    if (!confirm('¿Regenerar el slug? El link público cambiará.')) return;
    const res = await fetch(`/api/admin/invitations/${id}/regenerate-slug`, { method: 'POST' });
    const data = await res.json();
    setMsg(res.ok ? `✓ Nuevo slug: ${data.slug}` : `Error: ${data.error}`);
    load();
  }

  async function handleReassign() {
    if (!newOwnerId.trim()) { setMsg('Ingresa el nuevo User ID'); return; }
    if (!confirm(`¿Reasignar esta invitación al usuario ${newOwnerId.trim()}?`)) return;
    await handlePatch({ reassign_to_user_id: newOwnerId.trim() });
  }

  if (loading) return <div style={{ padding: '2rem', color: '#7A6A5B' }}>Cargando...</div>;
  if (!inv)    return <div style={{ padding: '2rem', color: '#B43232' }}>Invitación no encontrada</div>;

  const slug     = inv.slug as string | null;
  const isActive = inv.status === 'paid' || inv.status === 'published';
  const isDeleted = !!inv.deleted_at;

  const pubLink = slug ? publicUrl(slug) : null;
  const editLink = editorUrl(id);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Link href="/admin/invitations" style={{ fontSize: '.8rem', color: '#7A6A5B', textDecoration: 'none' }}>← Invitaciones</Link>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#241A14', margin: '.5rem 0 .125rem' }}>{(inv.title as string) || 'Sin título'}</h1>
          <p style={{ fontFamily: 'monospace', fontSize: '.8rem', color: '#7A6A5B', margin: 0 }}>/{slug}</p>
        </div>
        {msg && (
          <div style={{ padding: '.5rem 1rem', borderRadius: 8, background: msg.startsWith('Error') ? '#FBEAEA' : '#E7F5EC', color: msg.startsWith('Error') ? '#B43232' : '#247A45', fontSize: '.8125rem', fontWeight: 600 }}>
            {msg}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 280px', gap: '1.5rem', alignItems: 'start' }}>

        {/* Left: data */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Basic data */}
          <div style={{ background: '#FFFBF4', border: '1px solid #E5D2A8', borderRadius: 12, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <Row label="ID"           value={<span style={{ fontFamily: 'monospace', fontSize: '.75rem' }}>{inv.id as string}</span>} />
                <Row label="Slug"         value={<span style={{ fontFamily: 'monospace' }}>{slug}</span>} />
                <Row label="Plan"         value={<b style={{ textTransform: 'uppercase' }}>{inv.plan_id as string}</b>} />
                <Row label="Status"       value={<b>{inv.status as string}</b>} />
                <Row label="Categoría"    value={inv.category as string} />
                <Row label="Email"        value={inv.customer_email as string ?? '—'} />
                <Row label="User ID"      value={<span style={{ fontFamily: 'monospace', fontSize: '.75rem' }}>{(inv.user_id as string) ?? '—'}</span>} />
                <Row label="Creado"       value={fmtDate(inv.created_at as string)} />
                <Row label="Actualizado"  value={fmtDate(inv.updated_at as string)} />
                {!!(inv.deleted_at) && <Row label="Desactivado" value={<span style={{ color: '#B43232' }}>{fmtDate(inv.deleted_at as string)}</span>} />}
              </tbody>
            </table>
          </div>

          {/* Cambiar plan */}
          <div style={{ background: '#FFFBF4', border: '1px solid #E5D2A8', borderRadius: 12, padding: '1.25rem' }}>
            <p style={sectionTitle}>Cambiar plan</p>
            <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <select value={newPlan} onChange={e => setNewPlan(e.target.value)} style={selectStyle}>
                {PLAN_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <button onClick={() => handlePatch({ plan_id: newPlan })} style={btnPrimary}>
                Actualizar plan
              </button>
            </div>
          </div>

          {/* Cambiar status */}
          <div style={{ background: '#FFFBF4', border: '1px solid #E5D2A8', borderRadius: 12, padding: '1.25rem' }}>
            <p style={sectionTitle}>Cambiar status</p>
            <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <select value={newStatus} onChange={e => setNewStatus(e.target.value)} style={selectStyle}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={() => handlePatch({ status: newStatus })} style={btnPrimary}>
                Actualizar status
              </button>
            </div>
            {!isActive && <p style={{ fontSize: '.75rem', color: '#7A6A5B', margin: '.5rem 0 0' }}>⚠ Status {newStatus} — la invitación NO será pública.</p>}
          </div>

          {/* Reasignar owner */}
          <div style={{ background: '#FFFBF4', border: '1px solid #E5D2A8', borderRadius: 12, padding: '1.25rem' }}>
            <p style={sectionTitle}>Reasignar ownership</p>
            <p style={{ fontSize: '.8rem', color: '#7A6A5B', margin: '0 0 .75rem' }}>User ID actual: <code style={{ fontSize: '.75rem' }}>{(inv.user_id as string) ?? '(ninguno)'}</code></p>
            <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
              <input
                value={newOwnerId}
                onChange={e => setNewOwnerId(e.target.value)}
                placeholder="Nuevo user_id (UUID)"
                style={{ ...selectStyle, minWidth: 280, fontFamily: 'monospace', fontSize: '.75rem' }}
              />
              <button onClick={handleReassign} style={btnPrimary}>Reasignar</button>
            </div>
          </div>

          {/* Órdenes vinculadas */}
          {orders.length > 0 && (
            <div style={{ background: '#FFFBF4', border: '1px solid #E5D2A8', borderRadius: 12, overflow: 'hidden' }}>
              <p style={{ ...sectionTitle, padding: '1rem 1.25rem 0' }}>Órdenes vinculadas</p>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {orders.map((o: Record<string, unknown>) => (
                    <tr key={o.id as string} style={{ borderTop: '1px solid #E5D2A8' }}>
                      <td style={{ padding: '.5rem 1.25rem', fontSize: '.8rem', color: '#241A14' }}>{o.plan_id as string} — {o.status as string}</td>
                      <td style={{ padding: '.5rem 1.25rem', fontSize: '.75rem', color: '#7A6A5B' }}>{o.customer_email as string}</td>
                      <td style={{ padding: '.5rem 1.25rem' }}>
                        <Link href={`/admin/orders/${o.id}`} style={{ fontSize: '.75rem', color: '#2563EB', textDecoration: 'none' }}>Ver orden</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right: links and actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Quick links */}
          <div style={{ background: '#FFFBF4', border: '1px solid #E5D2A8', borderRadius: 12, padding: '1.25rem' }}>
            <p style={sectionTitle}>Links de acceso</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
              {pubLink && <a href={pubLink} target="_blank" rel="noopener noreferrer" style={linkBtnPrimary}>🔗 Link público (invitados)</a>}
              {slug && <CopyBtn text={pubLink ?? ''} label="📋 Copiar link público" />}
              <a href={previewUrl(id)} target="_blank" rel="noopener noreferrer" style={linkBtnSec}>👁 Preview interno</a>
              <a href={editLink} target="_blank" rel="noopener noreferrer" style={linkBtnSec}>✏️ Abrir editor</a>
              <a href={clientDashboardUrl(id)} target="_blank" rel="noopener noreferrer" style={linkBtnSec}>📊 Panel cliente</a>
              {pubLink && <CopyBtn text={whatsappClientMessage(editLink, pubLink)} label="📱 Msg cliente (WA)" />}
              {pubLink && <CopyBtn text={whatsappGuestsMessage(pubLink)} label="📱 Msg invitados (WA)" />}
            </div>
          </div>

          {/* Email */}
          <div style={{ background: '#FFFBF4', border: '1px solid #E5D2A8', borderRadius: 12, padding: '1.25rem' }}>
            <p style={sectionTitle}>Email de acceso</p>
            <p style={{ fontSize: '.75rem', color: '#7A6A5B', margin: '0 0 .75rem' }}>Envía el link de editor al email del cliente.</p>
            <button onClick={sendAccessEmail} disabled={emailSending} style={{ ...btnPrimary, width: '100%' }}>
              {emailSending ? 'Enviando...' : '📧 Enviar email acceso'}
            </button>
          </div>

          {/* Desactivar / Restaurar */}
          <div style={{ background: '#FFFBF4', border: '1px solid #E5D2A8', borderRadius: 12, padding: '1.25rem' }}>
            <p style={sectionTitle}>Desactivar / Restaurar</p>
            {!isDeleted ? (
              <button onClick={handleSoftDelete} style={{ ...btnPrimary, background: '#FBEAEA', color: '#B43232', border: '1px solid #F5C0C0', width: '100%' }}>
                🗑 Desactivar invitación
              </button>
            ) : (
              <button onClick={handleRestore} style={{ ...btnPrimary, background: '#E7F5EC', color: '#247A45', border: '1px solid #B8DFC4', width: '100%' }}>
                ✅ Restaurar invitación
              </button>
            )}
          </div>

          {/* Slug */}
          <div style={{ background: '#FFFBF4', border: '1px solid #E5D2A8', borderRadius: 12, padding: '1.25rem' }}>
            <p style={sectionTitle}>Slug</p>
            <p style={{ fontFamily: 'monospace', fontSize: '.75rem', color: '#241A14', margin: '0 0 .75rem', wordBreak: 'break-all' }}>/{slug}</p>
            <button onClick={handleRegenSlug} style={{ ...btnPrimary, background: '#FBF5E3', color: '#A07C2E', border: '1px solid #E8D8AD', width: '100%' }}>
              🔄 Regenerar slug
            </button>
            <p style={{ fontSize: '.7rem', color: '#7A6A5B', margin: '.5rem 0 0' }}>⚠ El link público cambiará.</p>
          </div>

          <Link href={`/admin/invitations/${id}/edit`} style={{ ...linkBtnPrimary, textAlign: 'center', padding: '.75rem', display: 'block' }}>
            ✏️ Editar contenido
          </Link>
        </div>
      </div>
    </div>
  );
}

const sectionTitle: React.CSSProperties = { fontSize: '.7rem', textTransform: 'uppercase', letterSpacing: '.1em', color: '#7A6A5B', fontWeight: 700, margin: '0 0 .75rem' };
const selectStyle: React.CSSProperties = { padding: '.5rem .75rem', border: '1px solid #E5D2A8', borderRadius: 8, fontSize: '.8125rem', color: '#241A14', background: '#FAF3E6' };
const btnPrimary: React.CSSProperties = { padding: '.5rem 1.25rem', background: '#1C1713', color: '#FFF7EA', border: 'none', borderRadius: 8, fontSize: '.8125rem', cursor: 'pointer', fontWeight: 600 };
const linkBtnPrimary: React.CSSProperties = { padding: '.5rem .875rem', background: '#1C1713', color: '#FFF7EA', borderRadius: 8, fontSize: '.8rem', fontWeight: 600, textDecoration: 'none', display: 'block', textAlign: 'center' };
const linkBtnSec: React.CSSProperties = { ...linkBtnPrimary, background: '#FAF3E6', color: '#7A6A5B', border: '1px solid #E5D2A8' };
