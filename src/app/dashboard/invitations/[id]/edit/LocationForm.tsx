'use client';

import { useActionState } from 'react';
import type { InvitationContent } from '@/domain/invitations';
import { updateInvitationLocation } from './actions';
import type { UpdateInvitationResult } from './actions';
import { notifyPreviewRefresh } from './previewRefresh';

const INITIAL_STATE: UpdateInvitationResult | null = null;

function Field({
  label,
  name,
  defaultValue,
  hint,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue: string;
  hint?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-xs uppercase tracking-widest mb-1.5"
        style={{ color: '#6B5B4E' }}
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type="url"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg text-sm transition-colors"
        style={{
          background: '#FAFAF8',
          border: '1px solid #E8E2DA',
          color: '#1A1410',
          outline: 'none',
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = '#C5A880'; }}
        onBlur={(e)  => { e.currentTarget.style.borderColor = '#E8E2DA'; }}
      />
      {hint && (
        <p className="text-[10px] mt-1" style={{ color: '#B0A090' }}>{hint}</p>
      )}
    </div>
  );
}

interface LocationFormProps {
  invitation: InvitationContent;
}

export default function LocationForm({ invitation }: LocationFormProps) {
  const [result, formAction, isPending] = useActionState(
    async (_prev: UpdateInvitationResult | null, formData: FormData) => {
      const res = await updateInvitationLocation({
        id:            invitation.id,
        slug:          invitation.slug,
        googleMapsUrl: formData.get('googleMapsUrl') as string ?? '',
        wazeUrl:       formData.get('wazeUrl')       as string ?? '',
      });
      if (res.success) notifyPreviewRefresh();
      return res;
    },
    INITIAL_STATE,
  );

  return (
    <form action={formAction}>
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

      <div className="grid grid-cols-1 gap-4">
        <Field
          label="Google Maps URL"
          name="googleMapsUrl"
          defaultValue={invitation.location?.googleMapsLink ?? ''}
          hint="Enlace de maps.google.com, google.com/maps o goo.gl/maps."
          placeholder="https://maps.google.com/..."
        />
        <Field
          label="Waze URL"
          name="wazeUrl"
          defaultValue={invitation.location?.wazeLink ?? ''}
          hint="Enlace de waze.com."
          placeholder="https://waze.com/ul?..."
        />
      </div>

      <div className="mt-6">
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2.5 rounded-lg text-sm font-medium transition-opacity"
          style={{ background: '#1A1410', color: '#F5F3F0', opacity: isPending ? 0.6 : 1 }}
        >
          {isPending ? 'Guardando…' : 'Guardar ubicación'}
        </button>
      </div>
    </form>
  );
}
