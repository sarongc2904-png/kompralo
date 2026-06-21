'use client';

import { useActionState, useState } from 'react';
import type { InvitationContent } from '@/domain/invitations';
import { updateInvitationParents } from './actions';
import type { UpdateInvitationResult } from './actions';
import { notifyPreviewRefresh } from './previewRefresh';

const INITIAL_STATE: UpdateInvitationResult | null = null;

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg text-sm transition-colors"
        style={{ background: '#FAFAF8', border: '1px solid #E8E2DA', color: '#1A1410', outline: 'none' }}
        onFocus={(e) => { e.currentTarget.style.borderColor = '#C5A880'; }}
        onBlur={(e)  => { e.currentTarget.style.borderColor = '#E8E2DA'; }}
      />
    </div>
  );
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] uppercase tracking-[0.2em] mb-3 pb-2"
      style={{ color: '#C5A880', borderBottom: '1px solid #F0EBE4' }}>
      {children}
    </p>
  );
}

interface ParentsFormProps {
  invitation: InvitationContent;
}

export default function ParentsForm({ invitation }: ParentsFormProps) {
  const brideData = invitation.parents?.find((p) => p.side === 'bride');
  const groomData = invitation.parents?.find((p) => p.side === 'groom');

  // Derive protagonistIds from existing protagonists
  const prot0 = invitation.protagonists?.[0];
  const prot1 = invitation.protagonists?.[1];
  const brideProtId = brideData?.protagonistId ?? prot0?.id ?? 'bride';
  const groomProtId = groomData?.protagonistId ?? prot1?.id ?? 'groom';

  const [brideFather, setBrideFather] = useState(brideData?.fatherName ?? '');
  const [brideMother, setBrideMother] = useState(brideData?.motherName ?? '');
  const [groomFather, setGroomFather] = useState(groomData?.fatherName ?? '');
  const [groomMother, setGroomMother] = useState(groomData?.motherName ?? '');

  const [result, formAction, isPending] = useActionState(
    async (_prev: UpdateInvitationResult | null, _formData: FormData) => {
      const res = await updateInvitationParents({
        id:                 invitation.id,
        slug:               invitation.slug,
        brideFather,
        brideMother,
        groomFather,
        groomMother,
        brideProtagonistId: brideProtId,
        groomProtagonistId: groomProtId,
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

      <div className="grid grid-cols-1 gap-6">

        {/* Padres de la novia */}
        <div>
          <GroupLabel>Padres de la novia</GroupLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Papá de la novia"
              name="brideFather"
              value={brideFather}
              onChange={(e) => setBrideFather(e.target.value)}
              placeholder="Ej: Eduardo García Pérez"
            />
            <Field
              label="Mamá de la novia"
              name="brideMother"
              value={brideMother}
              onChange={(e) => setBrideMother(e.target.value)}
              placeholder="Ej: Laura Sánchez de García"
            />
          </div>
        </div>

        {/* Padres del novio */}
        <div>
          <GroupLabel>Padres del novio</GroupLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Papá del novio"
              name="groomFather"
              value={groomFather}
              onChange={(e) => setGroomFather(e.target.value)}
              placeholder="Ej: Roberto Martínez Flores"
            />
            <Field
              label="Mamá del novio"
              name="groomMother"
              value={groomMother}
              onChange={(e) => setGroomMother(e.target.value)}
              placeholder="Ej: Carmen Ruiz de Martínez"
            />
          </div>
        </div>

      </div>

      <div className="mt-6">
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2.5 rounded-lg text-sm font-medium transition-opacity"
          style={{ background: '#1A1410', color: '#F5F3F0', opacity: isPending ? 0.6 : 1 }}
        >
          {isPending ? 'Guardando…' : 'Guardar padres'}
        </button>
      </div>
    </form>
  );
}
