'use client';

import { useState } from 'react';
import Link from 'next/link';

const PLANS      = ['basic', 'premium', 'deluxe'] as const;
const CATEGORIES = ['wedding', 'baptism', 'baby-shower', 'birthday'] as const;
const STATUSES   = ['paid', 'draft', 'published'] as const;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUuid(value: string): boolean {
  return UUID_RE.test(value);
}

interface CreatedResult {
  invitationId: string;
  slug: string;
  orderId: string | null;
  ownerUserId: string | null;
  publicLink: string;
  editorLink: string;
  clientDashboardLink: string;
}

type LookupStatus =
  | { state: 'idle' }
  | { state: 'loading' }
  | { state: 'found';    userId: string; email: string }
  | { state: 'notfound'; message: string }
  | { state: 'error';    message: string };

export default function AdminNewInvitationPage() {
  const [form, setForm] = useState({
    customer_name:  '',
    customer_email: '',
    plan_id:        'premium' as typeof PLANS[number],
    category:       'wedding' as typeof CATEGORIES[number],
    status:         'paid' as typeof STATUSES[number],
    owner_user_id:  '',
    slug:           '',
    create_order:   true,
  });

  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');
  const [result,       setResult]       = useState<CreatedResult | null>(null);
  const [copied,       setCopied]       = useState('');
  const [lookupStatus, setLookupStatus] = useState<LookupStatus>({ state: 'idle' });

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 1500);
  };

  async function handleLookupByEmail() {
    const email = form.customer_email.trim();
    if (!email) {
      setLookupStatus({ state: 'error', message: 'Ingresa primero el email del cliente.' });
      return;
    }
    setLookupStatus({ state: 'loading' });

    const res = await fetch(`/api/admin/users/lookup-by-email?email=${encodeURIComponent(email)}`);
    const data = await res.json();

    if (!res.ok) {
      setLookupStatus({ state: 'error', message: data.error ?? 'Error al buscar usuario.' });
      return;
    }

    if (data.found) {
      setForm(p => ({ ...p, owner_user_id: data.userId }));
      setLookupStatus({ state: 'found', userId: data.userId, email: data.email });
    } else {
      setLookupStatus({ state: 'notfound', message: data.message });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setResult(null);

    const trimmedUuid = form.owner_user_id.trim();
    if (trimmedUuid && !isValidUuid(trimmedUuid)) {
      setError('Owner User ID debe ser un UUID válido (ej. 4f3a1b2c-…) o dejarse vacío.');
      return;
    }

    setLoading(true);

    const res = await fetch('/api/admin/invitations', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? 'Error desconocido');
      return;
    }
    setResult(data);
  }

  return (
    <div style={{ maxWidth: 680 }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/admin/invitations" style={{ fontSize: '.8rem', color: '#7A6A5B', textDecoration: 'none' }}>← Invitaciones</Link>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#241A14', margin: '.5rem 0 .25rem' }}>Crear invitación</h1>
        <p style={{ fontSize: '.8125rem', color: '#7A6A5B', margin: 0 }}>Crear una invitación manualmente sin pasar por Stripe.</p>
      </div>

      {result ? (
        <div style={{ background: '#E7F5EC', border: '1px solid #B8DFC4', borderRadius: 12, padding: '1.5rem' }}>
          <p style={{ fontSize: '1rem', fontWeight: 700, color: '#247A45', margin: '0 0 .5rem' }}>✓ Invitación creada</p>
          {result.ownerUserId ? (
            <p style={{ fontSize: '.8rem', color: '#247A45', margin: '0 0 1rem' }}>
              Owner asignado: <code style={{ fontFamily: 'monospace', fontSize: '.75rem' }}>{result.ownerUserId}</code>
            </p>
          ) : (
            <p style={{ fontSize: '.8rem', color: '#7A6A5B', margin: '0 0 1rem' }}>
              Sin owner (user_id = null). customer_email guardado.
            </p>
          )}

          {form.status === 'draft' && (
            <div style={{ marginBottom: '1rem', padding: '.75rem 1rem', background: '#FBF5E3', border: '1px solid #E8D8AD', borderRadius: 8, fontSize: '.8rem', color: '#7A6A5B' }}>
              ⚠ Se creó con status <strong>draft</strong>: el link público mostrará 404 hasta que cambies el status a paid o published desde el detalle de la invitación.
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
            {[
              { label: 'Link público (invitados)', url: result.publicLink,          key: 'pub'  },
              { label: 'Editor',                   url: result.editorLink,           key: 'edit' },
              { label: 'Panel cliente',             url: result.clientDashboardLink, key: 'dash' },
            ].map(({ label, url, key }) => (
              <div key={key} style={{ background: '#FFFBF4', border: '1px solid #E5D2A8', borderRadius: 8, padding: '.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '.7rem', color: '#7A6A5B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em' }}>{label}</p>
                  <a href={url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '.8rem', color: '#2563EB', wordBreak: 'break-all' }}>{url}</a>
                </div>
                <button onClick={() => copy(url, key)} style={{ padding: '.375rem .875rem', background: copied === key ? '#247A45' : '#1C1713', color: '#FFF7EA', border: 'none', borderRadius: 8, fontSize: '.75rem', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: 600 }}>
                  {copied === key ? '✓ Copiado' : 'Copiar'}
                </button>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
            <Link href={`/admin/invitations/${result.invitationId}`} style={{ padding: '.625rem 1.25rem', background: '#1C1713', color: '#FFF7EA', borderRadius: 8, fontSize: '.875rem', fontWeight: 700, textDecoration: 'none' }}>
              Ver detalle
            </Link>
            <a href={result.editorLink} target="_blank" rel="noopener noreferrer" style={{ padding: '.625rem 1.25rem', background: '#FAF3E6', color: '#7A6A5B', border: '1px solid #E5D2A8', borderRadius: 8, fontSize: '.875rem', fontWeight: 700, textDecoration: 'none' }}>
              Abrir editor
            </a>
            <button onClick={() => { setResult(null); setLookupStatus({ state: 'idle' }); }} style={{ padding: '.625rem 1.25rem', background: '#FAF3E6', color: '#7A6A5B', border: '1px solid #E5D2A8', borderRadius: 8, fontSize: '.875rem', cursor: 'pointer', fontWeight: 600 }}>
              Crear otra
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ background: '#FFFBF4', border: '1px solid #E5D2A8', borderRadius: 12, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Field label="Nombre del cliente">
              <input
                value={form.customer_name}
                onChange={e => setForm(p => ({ ...p, customer_name: e.target.value }))}
                placeholder="Ej. Sofía García"
                style={inputStyle}
              />
            </Field>
            <Field label="Email del cliente *" required>
              <input
                type="email"
                value={form.customer_email}
                onChange={e => {
                  setForm(p => ({ ...p, customer_email: e.target.value }));
                  setLookupStatus({ state: 'idle' });
                }}
                placeholder="cliente@email.com"
                required
                style={inputStyle}
              />
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <Field label="Plan *">
              <select value={form.plan_id} onChange={e => setForm(p => ({ ...p, plan_id: e.target.value as typeof PLANS[number] }))} style={inputStyle} required>
                {PLANS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Categoría *">
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value as typeof CATEGORIES[number] }))} style={inputStyle} required>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Status inicial" hint={form.status === 'draft' ? 'Con "draft" el link público mostrará 404. Usa "paid" para que los invitados puedan verla.' : undefined}>
              <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as typeof STATUSES[number] }))} style={inputStyle}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </div>

          {/* Owner User ID */}
          <Field
            label="Owner User ID (opcional)"
            hint='Déjalo vacío para asignar automáticamente por email si el usuario existe. Si deseas asignarlo manualmente, usa el User UID real de Supabase Auth.'
          >
            <div style={{ display: 'flex', gap: '.5rem', alignItems: 'stretch' }}>
              <input
                value={form.owner_user_id}
                onChange={e => {
                  setForm(p => ({ ...p, owner_user_id: e.target.value }));
                  if (lookupStatus.state === 'found') setLookupStatus({ state: 'idle' });
                }}
                placeholder="UUID de auth.users"
                style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '.8rem', flex: 1 }}
              />
              <button
                type="button"
                onClick={handleLookupByEmail}
                disabled={lookupStatus.state === 'loading'}
                style={{
                  padding: '.625rem .875rem',
                  background: lookupStatus.state === 'loading' ? '#E5D2A8' : '#FAF3E6',
                  color: '#7A6A5B',
                  border: '1px solid #E5D2A8',
                  borderRadius: 8,
                  fontSize: '.75rem',
                  cursor: lookupStatus.state === 'loading' ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                {lookupStatus.state === 'loading' ? 'Buscando…' : 'Buscar por email'}
              </button>
            </div>

            {/* Lookup feedback */}
            {lookupStatus.state === 'found' && (
              <div style={{ marginTop: '.375rem', padding: '.5rem .75rem', background: '#E7F5EC', border: '1px solid #B8DFC4', borderRadius: 6, fontSize: '.75rem', color: '#247A45' }}>
                ✓ Usuario encontrado — UUID llenado automáticamente.
              </div>
            )}
            {lookupStatus.state === 'notfound' && (
              <div style={{ marginTop: '.375rem', padding: '.5rem .75rem', background: '#FBF5E3', border: '1px solid #E8D8AD', borderRadius: 6, fontSize: '.75rem', color: '#7A6A5B' }}>
                {lookupStatus.message}
              </div>
            )}
            {lookupStatus.state === 'error' && (
              <div style={{ marginTop: '.375rem', padding: '.5rem .75rem', background: '#FBEAEA', border: '1px solid #F5C0C0', borderRadius: 6, fontSize: '.75rem', color: '#B43232' }}>
                {lookupStatus.message}
              </div>
            )}
          </Field>

          <Field label="Slug personalizado (opcional)" hint="Se generará automáticamente si lo dejas vacío. No incluir /. No usar palabras reservadas.">
            <input
              value={form.slug}
              onChange={e => setForm(p => ({ ...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))}
              placeholder="mi-slug-personalizado"
              style={{ ...inputStyle, fontFamily: 'monospace' }}
            />
          </Field>

          <label style={{ display: 'flex', alignItems: 'center', gap: '.75rem', fontSize: '.875rem', color: '#241A14', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.create_order} onChange={e => setForm(p => ({ ...p, create_order: e.target.checked }))} />
            <div>
              <span style={{ fontWeight: 600 }}>Crear orden manual</span>
              <p style={{ margin: '2px 0 0', fontSize: '.75rem', color: '#7A6A5B' }}>
                Registra una orden con source: admin_manual_creation. No genera ningún cobro en Stripe.
              </p>
            </div>
          </label>

          {error && (
            <div style={{ padding: '.75rem 1rem', background: '#FBEAEA', border: '1px solid #F5C0C0', borderRadius: 8, fontSize: '.875rem', color: '#B43232' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ padding: '.875rem 2rem', background: loading ? '#7A6A5B' : '#1C1713', color: '#FFF7EA', border: 'none', borderRadius: 10, fontSize: '.9375rem', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 700 }}
          >
            {loading ? 'Creando…' : 'Crear invitación'}
          </button>
        </form>
      )}
    </div>
  );
}

function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '.375rem' }}>
      <label style={{ fontSize: '.75rem', fontWeight: 700, color: '#241A14', textTransform: 'uppercase', letterSpacing: '.08em' }}>
        {label}{required && <span style={{ color: '#B43232' }}>*</span>}
      </label>
      {children}
      {hint && <p style={{ margin: 0, fontSize: '.7rem', color: '#7A6A5B', lineHeight: 1.4 }}>{hint}</p>}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '.625rem .875rem',
  border: '1px solid #E5D2A8',
  borderRadius: 8,
  fontSize: '.875rem',
  color: '#241A14',
  background: '#FAF3E6',
  width: '100%',
  boxSizing: 'border-box',
};
