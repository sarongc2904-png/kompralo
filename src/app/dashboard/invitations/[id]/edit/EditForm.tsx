'use client';

import { useActionState, useRef, useState } from 'react';
import type { InvitationContent } from '@/domain/invitations';
import { updateInvitationBasicInfo } from './actions';
import type { UpdateInvitationResult } from './actions';
import { notifyPreviewRefresh } from './previewRefresh';
import { getAppUrl } from '@/lib/admin/urls';
import Link from 'next/link';

// ─── Initial state ────────────────────────────────────────────────────────────

const INITIAL_STATE: UpdateInvitationResult | null = null;

function normalizeDateForInput(value?: string | null): string {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  if (value.includes('T')) return value.split('T')[0];
  return '';
}

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({
  label,
  name,
  value,
  onChange,
  type = 'text',
  hint,
  required,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  hint?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-xs uppercase tracking-widest mb-1.5"
        style={{ color: '#6B5B4E' }}
      >
        {label}
        {required && <span className="ml-1" style={{ color: '#C5A880' }}>*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-3 py-2 rounded-lg text-sm transition-colors"
        style={{
          background: '#FAFAF8',
          border: '1px solid #E8E2DA',
          color: '#1A1410',
          outline: 'none',
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = '#C5A880'; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = '#E8E2DA'; }}
      />
      {hint && (
        <p className="text-[10px] mt-1" style={{ color: '#B0A090' }}>{hint}</p>
      )}
    </div>
  );
}

// ─── Slug field ───────────────────────────────────────────────────────────────

type SlugStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

const SLUG_RE = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;

function SlugField({
  value,
  onChange,
  invitationId,
}: {
  value: string;
  onChange: (v: string) => void;
  invitationId: string;
}) {
  const [status,  setStatus]  = useState<SlugStatus>('idle');
  const [copied,  setCopied]  = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const baseUrl     = getAppUrl();
  const displayHost = baseUrl.replace(/^https?:\/\//, '');
  const fullLink    = `${baseUrl}/i/${value}`;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    onChange(raw);
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!raw || raw.length < 3 || !SLUG_RE.test(raw)) {
      setStatus(raw.length > 0 ? 'invalid' : 'idle');
      return;
    }
    setStatus('checking');
    timerRef.current = setTimeout(async () => {
      try {
        const res  = await fetch(
          `/api/invitations/check-slug?slug=${encodeURIComponent(raw)}&excludeId=${encodeURIComponent(invitationId)}`,
        );
        const body = await res.json() as { available: boolean };
        setStatus(body.available ? 'available' : 'taken');
      } catch {
        setStatus('idle');
      }
    }, 700);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(fullLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard not available */ }
  }

  const borderColor =
    status === 'taken' || status === 'invalid'
      ? '#C62828'
      : status === 'available'
        ? '#388E3C'
        : '#E8E2DA';

  return (
    <div>
      <label
        htmlFor="slug"
        className="block text-xs uppercase tracking-widest mb-1.5"
        style={{ color: '#6B5B4E' }}
      >
        Link de tu invitación <span style={{ color: '#C5A880' }}>*</span>
      </label>

      <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
        <input
          id="slug"
          name="slug"
          type="text"
          value={value}
          onChange={handleChange}
          required
          className="flex-1 px-3 py-2 rounded-lg text-sm transition-colors"
          style={{
            background: '#FAFAF8',
            border:     `1px solid ${borderColor}`,
            color:      '#1A1410',
            outline:    'none',
          }}
          onFocus={(e)  => { e.currentTarget.style.borderColor = '#C5A880'; }}
          onBlur={(e)   => { e.currentTarget.style.borderColor = borderColor; }}
        />
        <button
          type="button"
          onClick={handleCopy}
          title="Copiar link completo"
          style={{
            padding:       '0 12px',
            borderRadius:  8,
            fontSize:      '0.75rem',
            fontWeight:    500,
            border:        '1px solid #E8E2DA',
            background:    copied ? '#E8F5E9' : '#FAFAF8',
            color:         copied ? '#388E3C' : '#9B8878',
            cursor:        'pointer',
            whiteSpace:    'nowrap',
            flexShrink:    0,
            transition:    'background 0.15s',
          }}
        >
          {copied ? '✓ Copiado' : '⎘ Copiar'}
        </button>
      </div>

      {/* Real-time link preview */}
      {value && (
        <p style={{ fontSize: '0.68rem', marginTop: 4, color: '#9B8878', fontFamily: 'monospace', wordBreak: 'break-all' }}>
          {displayHost}/i/<strong style={{ color: '#1A1410' }}>{value}</strong>
        </p>
      )}

      {/* Validation / availability messages */}
      {status === 'invalid' && (
        <p style={{ fontSize: '0.68rem', marginTop: 3, color: '#C62828' }}>
          Solo letras minúsculas, números y guiones. Mínimo 3 caracteres.
        </p>
      )}
      {status === 'taken' && (
        <p style={{ fontSize: '0.68rem', marginTop: 3, color: '#C62828' }}>
          Este link ya está en uso, elige otro.
        </p>
      )}
      {status === 'available' && (
        <p style={{ fontSize: '0.68rem', marginTop: 3, color: '#388E3C' }}>
          ✓ Link disponible.
        </p>
      )}
      {status === 'checking' && (
        <p style={{ fontSize: '0.68rem', marginTop: 3, color: '#9B8878' }}>
          Verificando disponibilidad…
        </p>
      )}

      <p style={{ fontSize: '0.65rem', marginTop: 5, color: '#B0A090' }}>
        Este es el link que compartirás con tus invitados. Puedes personalizarlo.
      </p>
    </div>
  );
}

// ─── Form ─────────────────────────────────────────────────────────────────────

interface EditFormProps {
  invitation: InvitationContent;
}

interface FormValues {
  title: string;
  subtitle: string;
  slug: string;
  eventDate: string;
  eventTime: string;
  venueName: string;
  address: string;
  rsvpWhatsAppNumber: string;
  finalMessageQuote: string;
}

export default function EditForm({ invitation }: EditFormProps) {
  const [values, setValues] = useState<FormValues>({
    title:               invitation.title,
    subtitle:            invitation.subtitle,
    slug:                invitation.slug,
    eventDate:           normalizeDateForInput(invitation.eventDate),
    eventTime:           invitation.eventTime ?? '',
    venueName:           invitation.location?.venueName ?? '',
    address:             invitation.location?.address ?? '',
    rsvpWhatsAppNumber:  invitation.rsvpWhatsAppNumber ?? '',
    finalMessageQuote:   invitation.finalMessage?.quote ?? '',
  });

  const set =
    (key: keyof FormValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setValues((v) => ({ ...v, [key]: e.target.value }));

  const setSlug = (v: string) => setValues((prev) => ({ ...prev, slug: v }));

  const [result, formAction, isPending] = useActionState(
    async (_prev: UpdateInvitationResult | null, formData: FormData) => {
      const res = await updateInvitationBasicInfo({
        id:                  invitation.id,
        title:               formData.get('title')              as string ?? '',
        subtitle:            formData.get('subtitle')           as string ?? '',
        slug:                formData.get('slug')               as string ?? '',
        eventDate:           formData.get('eventDate')          as string ?? '',
        eventTime:           formData.get('eventTime')          as string ?? '',
        venueName:           formData.get('venueName')          as string ?? '',
        address:             formData.get('address')            as string ?? '',
        rsvpWhatsAppNumber:  formData.get('rsvpWhatsAppNumber') as string ?? '',
        finalMessageQuote:   formData.get('finalMessageQuote')  as string ?? '',
      });
      if (res.success) notifyPreviewRefresh();
      return res;
    },
    INITIAL_STATE,
  );

  return (
    <form action={formAction}>
      {/* Feedback banner */}
      {result && (
        <div
          className="mb-6 px-4 py-3 rounded-lg text-sm"
          style={{
            background: result.success ? '#E8F5E9' : '#FFEBEE',
            color:      result.success ? '#388E3C'  : '#C62828',
            border:     `1px solid ${result.success ? '#C8E6C9' : '#FFCDD2'}`,
          }}
        >
          {result.success ? result.message : result.error}
        </div>
      )}

      {/* Fields */}
      <div className="grid grid-cols-1 gap-5">

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field
            label="Título"
            name="title"
            value={values.title}
            onChange={set('title')}
            required
          />
          <Field
            label="Subtítulo"
            name="subtitle"
            value={values.subtitle}
            onChange={set('subtitle')}
            required
          />
        </div>

        <SlugField
          value={values.slug}
          onChange={setSlug}
          invitationId={invitation.id}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field
            label="Fecha del evento"
            name="eventDate"
            value={values.eventDate}
            onChange={set('eventDate')}
            type="date"
          />
          <Field
            label="Hora del evento"
            name="eventTime"
            value={values.eventTime}
            onChange={set('eventTime')}
            type="time"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field
            label="Venue / Lugar"
            name="venueName"
            value={values.venueName}
            onChange={set('venueName')}
          />
          <Field
            label="Dirección"
            name="address"
            value={values.address}
            onChange={set('address')}
          />
        </div>

        <Field
          label="WhatsApp RSVP"
          name="rsvpWhatsAppNumber"
          value={values.rsvpWhatsAppNumber}
          onChange={set('rsvpWhatsAppNumber')}
          hint="10 a 15 dígitos. Acepta +52, espacios o guiones. Ej: +52 961 234 5678"
          type="tel"
        />

        <div>
          <label
            htmlFor="finalMessageQuote"
            className="block text-xs uppercase tracking-widest mb-1.5"
            style={{ color: '#6B5B4E' }}
          >
            Mensaje final
          </label>
          <textarea
            id="finalMessageQuote"
            name="finalMessageQuote"
            value={values.finalMessageQuote}
            onChange={set('finalMessageQuote')}
            rows={3}
            className="w-full px-3 py-2 rounded-lg text-sm resize-none transition-colors"
            style={{
              background: '#FAFAF8',
              border: '1px solid #E8E2DA',
              color: '#1A1410',
              outline: 'none',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#C5A880'; }}
            onBlur={(e)  => { e.currentTarget.style.borderColor = '#E8E2DA'; }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3 mt-8">
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2.5 rounded-lg text-sm font-medium transition-opacity"
          style={{ background: '#1A1410', color: '#F5F3F0', opacity: isPending ? 0.6 : 1 }}
        >
          {isPending ? 'Guardando…' : 'Guardar cambios'}
        </button>

        <Link
          href={`/preview/${invitation.id}?from=editor`}
          target="_blank"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          style={{ background: '#C4A962', color: '#0D0A07' }}
        >
          ✨ Previsualiza tu invitación
        </Link>

        <Link
          href="/dashboard/invitations"
          className="px-5 py-2.5 rounded-lg text-sm transition-colors"
          style={{ color: '#9B8878' }}
        >
          ← Volver
        </Link>
      </div>
    </form>
  );
}
