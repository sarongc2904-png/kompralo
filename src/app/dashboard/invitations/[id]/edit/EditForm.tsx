'use client';

import { useActionState } from 'react';
import type { InvitationContent } from '@/domain/invitations';
import { updateInvitationBasicInfo } from './actions';
import type { UpdateInvitationResult } from './actions';
import { notifyPreviewRefresh } from './previewRefresh';
import Link from 'next/link';

// ─── Initial state ────────────────────────────────────────────────────────────

const INITIAL_STATE: UpdateInvitationResult | null = null;

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({
  label,
  name,
  defaultValue,
  type = 'text',
  hint,
  required,
}: {
  label: string;
  name: string;
  defaultValue: string;
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
        defaultValue={defaultValue}
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

// ─── Form ─────────────────────────────────────────────────────────────────────

interface EditFormProps {
  invitation: InvitationContent;
}

function normalizeDateForInput(value?: string | null): string {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  if (value.includes('T')) return value.split('T')[0];
  return '';
}

export default function EditForm({ invitation }: EditFormProps) {
  const [result, formAction, isPending] = useActionState(
    async (_prev: UpdateInvitationResult | null, formData: FormData) => {
      const res = await updateInvitationBasicInfo({
        id: invitation.id,
        title:                formData.get('title')               as string ?? '',
        subtitle:             formData.get('subtitle')            as string ?? '',
        slug:                 formData.get('slug')                as string ?? '',
        eventDate:            formData.get('eventDate')           as string ?? '',
        eventTime:            formData.get('eventTime')           as string ?? '',
        venueName:            formData.get('venueName')           as string ?? '',
        address:              formData.get('address')             as string ?? '',
        rsvpWhatsAppNumber:   formData.get('rsvpWhatsAppNumber')  as string ?? '',
        finalMessageQuote:    formData.get('finalMessageQuote')   as string ?? '',
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
            defaultValue={invitation.title}
            required
          />
          <Field
            label="Subtítulo"
            name="subtitle"
            defaultValue={invitation.subtitle}
            required
          />
        </div>

        <Field
          label="Slug"
          name="slug"
          defaultValue={invitation.slug}
          hint="Solo minúsculas, números y guiones. Ej: jose-y-maria-2026"
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field
            label="Fecha del evento"
            name="eventDate"
            defaultValue={normalizeDateForInput(invitation.eventDate)}
            type="date"
          />
          <Field
            label="Hora del evento"
            name="eventTime"
            defaultValue={invitation.eventTime}
            type="time"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field
            label="Venue / Lugar"
            name="venueName"
            defaultValue={invitation.location?.venueName ?? ''}
          />
          <Field
            label="Dirección"
            name="address"
            defaultValue={invitation.location?.address ?? ''}
          />
        </div>

        <Field
          label="WhatsApp RSVP"
          name="rsvpWhatsAppNumber"
          defaultValue={invitation.rsvpWhatsAppNumber ?? ''}
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
            defaultValue={invitation.finalMessage?.quote ?? ''}
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
