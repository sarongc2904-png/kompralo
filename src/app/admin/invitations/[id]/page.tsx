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
    <tr style={{ borderBottom: '1px solid #f0ede8' }}>
      <td style={{ padding: '.5rem .875rem', fontSize: '.7rem', color: '#8a8580', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', whiteSpace: 'nowrap', width: 160 }}>{label}</td>
      <td style={{ padding: '.5rem .875rem', fontSize: '.8125rem', color: '#1a1610', wordBreak: 'break-all' }}>{value}</td>
    </tr>
  );
}

function CopyBtn({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      style={{ padding: '.375rem .75rem', background: copied ? '#16a34a' : '#f0ede8', color: copied ? '#fff' : '#4a4742', border: 'none', borderRadius: 8, fontSize: '.75rem', cursor: 'pointer', fontWeight: 600 }}
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

  if (loading) return <div style={{ padding: '2rem', color: '#8a8580' }}>Cargando...</div>;
  if (!inv)    return <div style={{ padding: '2rem', color: '#dc2626' }}>Invitación no encontrada</div>;

  const slug     = inv.slug as string | null;
  const isActive = inv.status === 'paid' || inv.status === 'published';
  const isDeleted = !!inv.deleted_at;

  const pubLink = slug ? publicUrl(slug) : null;
  const editLink = editorUrl(id);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Link href="/admin/invitations" style={{ fontSize: '.8rem', color: '#8a8580', textDecoration: 'none' }}>← Invitaciones</Link>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1a1610', margin: '.5rem 0 .125rem' }}>{(inv.title as string) || 'Sin título'}</h1>
          <p style={{ fontFamily: 'monospace', fontSize: '.8rem', color: '#8a8580', margin: 0 }}>/{slug}</p>
        </div>
        {msg && (
          <div style={{ padding: '.5rem 1rem', borderRadius: 8, background: msg.startsWith('Error') ? '#fef2f2' : '#f0fdf4', color: msg.startsWith('Error') ? '#dc2626' : '#16a34a', fontSize: '.8125rem', fontWeight: 600 }}>
            {msg}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 280px', gap: '1.5rem', alignItems: 'start' }}>

        {/* Left: data */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Basic data */}
          <div style={{ background: '#fff', border: '1px solid #e5e2dc', borderRadius: 12, overflow: 'hidden' }}>
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
                {!!(inv.deleted_at) && <Row label="Desactivado" value={<span style={{ color: '#dc2626' }}>{fmtDate(inv.deleted_at as string)}</span>} />}
              </tbody>
            </table>
          </div>

          {/* Cambiar plan */}
          <div style={{ background: '#fff', border: '1px solid #e5e2dc', borderRadius: 12, padding: '1.25rem' }}>
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
          <div style={{ background: '#fff', border: '1px solid #e5e2dc', borderRadius: 12, padding: '1.25rem' }}>
            <p style={sectionTitle}>Cambiar status</p>
            <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <select value={newStatus} onChange={e => setNewStatus(e.target.value)} style={selectStyle}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={() => handlePatch({ status: newStatus })} style={btnPrimary}>
                Actualizar status
              </button>
            </div>
            {!isActive && <p style={{ fontSize: '.75rem', color: '#d97706', margin: '.5rem 0 0' }}>⚠ Status {newStatus} — la invitación NO será pública.</p>}
          </div>

          {/* Reasignar owner */}
          <div style={{ background: '#fff', border: '1px solid #e5e2dc', borderRadius: 12, padding: '1.25rem' }}>
            <p style={sectionTitle}>Reasignar ownership</p>
            <p style={{ fontSize: '.8rem', color: '#8a8580', margin: '0 0 .75rem' }}>User ID actual: <code style={{ fontSize: '.75rem' }}>{(inv.user_id as string) ?? '(ninguno)'}</code></p>
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
            <div style={{ background: '#fff', border: '1px solid #e5e2dc', borderRadius: 12, overflow: 'hidden' }}>
              <p style={{ ...sectionTitle, padding: '1rem 1.25rem 0' }}>Órdenes vinculadas</p>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {orders.map((o: Record<string, unknown>) => (
                    <tr key={o.id as string} style={{ borderTop: '1px solid #f0ede8' }}>
                      <td style={{ padding: '.5rem 1.25rem', fontSize: '.8rem' }}>{o.plan_id as string} — {o.status as string}</td>
                      <td style={{ padding: '.5rem 1.25rem', fontSize: '.75rem', color: '#8a8580' }}>{o.customer_email as string}</td>
                      <td style={{ padding: '.5rem 1.25rem' }}>
                        <Link href={`/admin/orders/${o.id}`} style={{ fontSize: '.75rem', color: '#2563eb', textDecoration: 'none' }}>Ver orden</Link>
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
          <div style={{ background: '#fff', border: '1px solid #e5e2dc', borderRadius: 12, padding: '1.25rem' }}>
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
          <div style={{ background: '#fff', border: '1px solid #e5e2dc', borderRadius: 12, padding: '1.25rem' }}>
            <p style={sectionTitle}>Email de acceso</p>
            <p style={{ fontSize: '.75rem', color: '#8a8580', margin: '0 0 .75rem' }}>Envía el link de editor al email del cliente.</p>
            <button onClick={sendAccessEmail} disabled={emailSending} style={{ ...btnPrimary, width: '100%' }}>
              {emailSending ? 'Enviando...' : '📧 Enviar email acceso'}
            </button>
          </div>

          {/* Desactivar / Restaurar */}
          <div style={{ background: '#fff', border: '1px solid #e5e2dc', borderRadius: 12, padding: '1.25rem' }}>
            <p style={sectionTitle}>Desactivar / Restaurar</p>
            {!isDeleted ? (
              <button onClick={handleSoftDelete} style={{ ...btnPrimary, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', width: '100%' }}>
                🗑 Desactivar invitación
              </button>
            ) : (
              <button onClick={handleRestore} style={{ ...btnPrimary, background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', width: '100%' }}>
                ✅ Restaurar invitación
              </button>
            )}
          </div>

          {/* Slug */}
          <div style={{ background: '#fff', border: '1px solid #e5e2dc', borderRadius: 12, padding: '1.25rem' }}>
            <p style={sectionTitle}>Slug</p>
            <p style={{ fontFamily: 'monospace', fontSize: '.75rem', color: '#4a4742', margin: '0 0 .75rem', wordBreak: 'break-all' }}>/{slug}</p>
            <button onClick={handleRegenSlug} style={{ ...btnPrimary, background: '#fffbeb', color: '#92400e', border: '1px solid #fde68a', width: '100%' }}>
              🔄 Regenerar slug
            </button>
            <p style={{ fontSize: '.7rem', color: '#d97706', margin: '.5rem 0 0' }}>⚠ El link público cambiará.</p>
          </div>

          <Link href={`/admin/invitations/${id}/edit`} style={{ ...linkBtnPrimary, textAlign: 'center', padding: '.75rem', display: 'block' }}>
            ✏️ Editar contenido
          </Link>
        </div>
      </div>
    </div>
  );
}

const sectionTitle: React.CSSProperties = { fontSize: '.7rem', textTransform: 'uppercase', letterSpacing: '.1em', color: '#8a8580', fontWeight: 700, margin: '0 0 .75rem' };
const selectStyle: React.CSSProperties = { padding: '.5rem .75rem', border: '1px solid #e5e2dc', borderRadius: 8, fontSize: '.8125rem', color: '#1a1610', background: '#fafaf8' };
const btnPrimary: React.CSSProperties = { padding: '.5rem 1.25rem', background: '#1a1610', color: '#f1e3c8', border: 'none', borderRadius: 8, fontSize: '.8125rem', cursor: 'pointer', fontWeight: 600 };
const linkBtnPrimary: React.CSSProperties = { padding: '.5rem .875rem', background: '#1a1610', color: '#f1e3c8', borderRadius: 8, fontSize: '.8rem', fontWeight: 600, textDecoration: 'none', display: 'block', textAlign: 'center' };
const linkBtnSec: React.CSSProperties = { ...linkBtnPrimary, background: '#f0ede8', color: '#4a4742' };
