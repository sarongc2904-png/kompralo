'use client';

import React from 'react';
import { Theme } from '@/domain/themes/types';
import { ParentCouple } from '@/domain/invitations/types';
import { motion } from 'framer-motion';
import ElegantInvitationCard from './ElegantInvitationCard';
import SectionShell from './SectionShell';
import SectionHeader from './SectionHeader';
import { EditableText } from '@/components/visual-editor/EditableText';

interface ParentsProps {
  parents: ParentCouple[];
  theme: Theme;
  editablePreview?: boolean;
}

// Ornament SVG
function Ornament() {
  return (
    <svg
      width="80" height="24" viewBox="0 0 80 24" fill="none"
      style={{ opacity: 0.55, color: `var(--v2-color-accent, #C5A880)` }}
      aria-hidden="true"
    >
      <line x1="0" y1="12" x2="28" y2="12" stroke="currentColor" strokeWidth="0.7" />
      <circle cx="32" cy="12" r="2" fill="currentColor" />
      <circle cx="40" cy="12" r="3.5" stroke="currentColor" strokeWidth="0.7" fill="none" />
      <circle cx="48" cy="12" r="2" fill="currentColor" />
      <line x1="52" y1="12" x2="80" y2="12" stroke="currentColor" strokeWidth="0.7" />
    </svg>
  );
}

// Single parent couple card
function FamilyCard({
  couple,
  index,
  editablePreview,
}: {
  couple: ParentCouple;
  index: number;
  editablePreview: boolean;
}) {
  const sidePrefix = couple.side === 'bride' ? 'bride' : 'groom';
  const cardTitle = couple.title || (couple.side === 'bride' ? 'Padres de la Novia' : 'Padres del Novio');
  const fatherLabel = couple.fatherLabel || 'Padre';
  const motherLabel = couple.motherLabel || 'Madre';

  return (
    <ElegantInvitationCard
      animateFrom={index % 2 === 0 ? 'left' : 'right'}
      animateDelay={index * 0.12}
      style={{ padding: '36px 32px 32px' }}
    >
      {/* Whose side label */}
      <div className="relative z-10 text-center mb-6">
        <span
          className="text-[13px] md:text-[14px] uppercase tracking-[0.25em] font-semibold"
          style={{ color: `var(--v2-color-accent, #C5A880)` }}
        >
          <EditableText value={cardTitle} fieldPath={`parents.${sidePrefix}Title`} isEditable={editablePreview} />
        </span>
        <div className="flex justify-center mt-2.5">
          <Ornament />
        </div>
      </div>

      {/* Parents */}
      <div className="relative z-10 flex flex-col gap-6">
        {/* Father */}
        <div className="flex items-center gap-4">
          <div
            style={{
              width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, rgba(200, 167, 93, 0.12) 0%, rgba(200, 167, 93, 0.04) 100%)',
              border: `1px solid var(--v2-color-border, rgba(200, 167, 93, 0.25))`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(116,84,38,0.03)',
              color: 'var(--v2-color-accent, #C5A880)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.2" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p
              className="text-[11px] md:text-[12px] uppercase tracking-[0.2em] mb-1 font-semibold"
              style={{ color: `var(--v2-color-text-muted, #8A7665)` }}
            >
              <EditableText value={fatherLabel} fieldPath={`parents.${sidePrefix}FatherLabel`} isEditable={editablePreview} />
            </p>
            <p 
              className="text-xl md:text-2xl font-normal tracking-wide leading-snug" 
              style={{ 
                fontFamily: 'var(--v2-font-heading, inherit)', 
                color: `var(--v2-color-text-primary, #1F1A16)` 
              }}
            >
              <EditableText value={couple.fatherName} fieldPath={`parents.${sidePrefix}FatherName`} isEditable={editablePreview} />
            </p>
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            height: 1,
            background: `linear-gradient(90deg, transparent, var(--v2-divider-color, rgba(200,167,93,0.25)), transparent)`,
          }}
        />

        {/* Mother */}
        <div className="flex items-center gap-4">
          <div
            style={{
              width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, rgba(200, 167, 93, 0.12) 0%, rgba(200, 167, 93, 0.04) 100%)',
              border: `1px solid var(--v2-color-border, rgba(200, 167, 93, 0.25))`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(116,84,38,0.03)',
              color: 'var(--v2-color-accent, #C5A880)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.2" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p
              className="text-[11px] md:text-[12px] uppercase tracking-[0.2em] mb-1 font-semibold"
              style={{ color: `var(--v2-color-text-muted, #8A7665)` }}
            >
              <EditableText value={motherLabel} fieldPath={`parents.${sidePrefix}MotherLabel`} isEditable={editablePreview} />
            </p>
            <p 
              className="text-xl md:text-2xl font-normal tracking-wide leading-snug" 
              style={{ 
                fontFamily: 'var(--v2-font-heading, inherit)', 
                color: `var(--v2-color-text-primary, #1F1A16)` 
              }}
            >
              <EditableText value={couple.motherName} fieldPath={`parents.${sidePrefix}MotherName`} isEditable={editablePreview} />
            </p>
          </div>
        </div>
      </div>
    </ElegantInvitationCard>
  );
}

export default function Parents({ parents, theme, editablePreview = false }: ParentsProps) {
  if (!parents || parents.length === 0) return null;

  const groomParents = parents.find((p) => p.side === 'groom');
  const brideParents = parents.find((p) => p.side === 'bride');

  return (
    <SectionShell variant="alt" className="select-none" contentClassName="max-w-3xl mx-auto">
      {/* Header */}
      <SectionHeader 
        eyebrow="Con la bendición de nuestros padres" 
        title="Nuestras Familias" 
        subtitle="Este día no sería posible sin el amor y apoyo incondicional de nuestras familias."
        theme={theme}
        className="mb-14"
      />

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {groomParents && (
          <FamilyCard couple={groomParents} index={0} editablePreview={editablePreview} />
        )}
        {brideParents && (
          <FamilyCard couple={brideParents} index={1} editablePreview={editablePreview} />
        )}
      </div>

      {/* Bottom ornament */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.4 }}
        className="flex justify-center mt-14"
      >
        <svg width="160" height="20" viewBox="0 0 160 20" fill="none" aria-hidden="true" style={{ opacity: 0.35, color: `var(--v2-color-accent, #C5A880)` }}>
          <line x1="0" y1="10" x2="60" y2="10" stroke="currentColor" strokeWidth="0.7" />
          <circle cx="67" cy="10" r="2.5" fill="currentColor" />
          <circle cx="80" cy="10" r="5" stroke="currentColor" strokeWidth="0.7" fill="none" />
          <circle cx="93" cy="10" r="2.5" fill="currentColor" />
          <line x1="100" y1="10" x2="160" y2="10" stroke="currentColor" strokeWidth="0.7" />
        </svg>
      </motion.div>
    </SectionShell>
  );
}
