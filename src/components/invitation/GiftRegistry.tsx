'use client';

import React, { useState } from 'react';
import { Theme } from '@/domain/themes/types';
import { GiftRegistryItem } from '@/domain/invitations/types';
import { Gift, Copy, Check, ExternalLink, Eye, EyeOff, Building, User, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionHeader from './SectionHeader';
import SectionShell from './SectionShell';
import ElegantInvitationCard from './ElegantInvitationCard';
import { EditableText } from '@/components/visual-editor/EditableText';

interface GiftRegistryProps {
  items: GiftRegistryItem[];
  theme: Theme;
  editablePreview?: boolean;
  sectionEyebrow?: string;
  sectionTitle?: string;
  subtitle?: string;
}


export default function GiftRegistry({
  items,
  theme,
  editablePreview = false,
  sectionEyebrow,
  sectionTitle,
  subtitle,
}: GiftRegistryProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  const [acknowledgedIds, setAcknowledgedIds] = useState<Record<string, boolean>>({});

  if (!items || items.length === 0) return null;

  // Transferencia bancaria sin CLABE capturada: se oculta al público (los
  // defaults nunca traen datos bancarios). En el editor sí se muestra, con un
  // aviso para capturarlos. No filtrar en editablePreview también preserva los
  // índices de los fieldPath editables.
  const visibleItems = editablePreview
    ? items
    : items.filter((item) => item.logoType !== 'bank' || !!item.bankDetails?.clabe?.trim());

  if (visibleItems.length === 0) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAcknowledge = (id: string) => {
    setAcknowledgedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  function defaultGiftDescription(logoType: string, provider: string): string {
    if (logoType === 'custom' && provider === 'Lluvia de sobres') return 'En nuestra boda tendremos una urna disponible para quienes deseen obsequiarnos un sobre con su cariño.';
    const map: Record<string, string> = {
      liverpool:    'Búscanos en Liverpool bajo el nombre de los novios o accede a nuestra lista.',
      palacio:      'Encuéntranos en El Palacio de Hierro o accede directamente a nuestra lista.',
      amazon:       'Visita nuestra lista en Amazon y elige el regalo que más te guste.',
      mercadolibre: 'Explora nuestra lista de deseos en Mercado Libre.',
      paypal:       'Puedes enviarnos un regalo a través de PayPal.',
      bank:         "Toca 'Revelar datos' para ver nuestra información bancaria.",
    };
    return map[logoType] ?? 'Haz clic abajo para ver la mesa de regalos directamente.';
  }

  return (
    <SectionShell className="select-none relative z-20" contentClassName="max-w-4xl mx-auto">
      {/* Header */}
      <SectionHeader
        eyebrow={sectionEyebrow ?? 'Detalles'}
        title={sectionTitle ?? 'Mesa de Regalos'}
        theme={theme}
        className="mb-0"
        editablePreview={editablePreview}
        eyebrowFieldPath="gift_registry.sectionEyebrow"
        titleFieldPath="gift_registry.sectionTitle"
      />
      <p
        className={`text-base md:text-lg opacity-85 mt-6 mb-16 max-w-md mx-auto text-center ${theme.bodyFont}`}
        style={{ color: 'var(--v2-color-text-secondary, #5C4A3E)' }}
      >
        <EditableText
          value={subtitle ?? 'Su presencia es nuestro mayor regalo, pero si desean tener un detalle con nosotros, les compartimos nuestras opciones:'}
          fieldPath="gift_registry.subtitle"
          isEditable={editablePreview}
          as="span"
          singleLine={false}
          placeholder="Mensaje introductorio…"
        />
      </p>

      {/* Registry — flex wrap so 1 or 2 cards stay centred */}
      <div className="flex flex-wrap justify-center gap-6 md:gap-8 mt-12">
        {visibleItems.map((item, idx) => {
          const isRevealed = !!revealedIds[item.id];
          const isInternalAnchor = !item.link || item.link.startsWith('#');
          const actionHref = item.link || '#rsvp-name';
          return (
            <ElegantInvitationCard
              key={item.id}
              animateDelay={idx * 0.08}
              className="relative flex flex-col justify-between items-center text-center group w-full sm:w-[300px] md:w-[280px]"
              style={{ padding: '36px 32px 32px', isolation: 'isolate' }}
            >
              {/* Content */}
              <div className="flex flex-col items-center w-full relative z-10">
                {/* Icon Wrapper with Gold/Accent Glow */}
                <div 
                  className="w-14 h-14 rounded-full flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110"
                  style={{ 
                    background: `var(--v2-color-accent-soft, rgba(200, 167, 93, 0.12))`,
                    border: '1px solid var(--v2-color-border, rgba(200, 167, 93, 0.25))',
                    color: 'var(--v2-color-accent, #C8A75D)'
                  }}
                >
                  <Gift className="w-6 h-6" strokeWidth={1.1} />
                </div>

                <h4 
                  className={`text-2xl font-normal tracking-wide mb-3 ${theme.headingFont}`}
                  style={{ fontFamily: 'var(--v2-font-heading, inherit)', color: 'var(--v2-color-text-primary, #1F1A16)' }}
                >
                  <EditableText value={item.provider} fieldPath={`gift_registry.items.${idx}.provider`} isEditable={editablePreview} />
                </h4>

                {/* Bank Details (Hidden by default, reveals on toggle) */}
                {item.logoType === 'bank' && item.bankDetails && (
                  <div className="w-full">
                    <p className={`text-[13px] md:text-[14px] opacity-75 mb-2 max-w-[200px] mx-auto ${theme.bodyFont}`} style={{ color: 'var(--v2-color-text-secondary, #5C4A3E)' }}>
                      Información bancaria para realizar transferencias.
                    </p>

                    {editablePreview && !item.bankDetails.clabe?.trim() && (
                      <div
                        className="w-full mt-2 rounded-lg px-3 py-2.5 text-[12px] font-medium text-left"
                        style={{ background: '#FAF3EE', border: '1px dashed #4A3B35', color: '#4A3B35' }}
                      >
                        ⚠ Agrega tus datos bancarios para que esta tarjeta aparezca en tu invitación.
                      </div>
                    )}
                    
                    <AnimatePresence initial={false}>
                      {isRevealed && (
                        <motion.div
                          initial={{ height: 0, opacity: 0, marginTop: 0 }}
                          animate={{ height: 'auto', opacity: 1, marginTop: 12 }}
                          exit={{ height: 0, opacity: 0, marginTop: 0 }}
                          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                          className="w-full overflow-hidden"
                        >
                          <div 
                            className="w-full text-[12px] md:text-[13px] text-left p-4 rounded-xl space-y-3 relative overflow-hidden shadow-inner"
                            style={{ 
                              background: 'linear-gradient(180deg, rgba(245, 236, 217, 0.4) 0%, rgba(245, 236, 217, 0.7) 100%)', 
                              border: '1px solid var(--v2-color-border, rgba(200, 167, 93, 0.25))' 
                            }}
                          >
                            <Building className="absolute right-[-10px] bottom-[-10px] w-20 h-20 opacity-[0.03] pointer-events-none" style={{ color: 'var(--v2-color-accent, currentColor)' }} />
                            
                            <div className="flex items-start gap-2.5">
                              <Building className="w-3.5 h-3.5 mt-0.5 opacity-60 flex-shrink-0" style={{ color: 'var(--v2-color-accent, #C8A75D)' }} />
                              <div>
                                <span className="block opacity-60 font-semibold uppercase text-[10px] md:text-[11px] tracking-[0.14em]" style={{ color: 'var(--v2-color-text-secondary, #5C4A3E)' }}>Banco</span>
                                <span className="font-semibold" style={{ color: 'var(--v2-color-text-primary, #1F1A16)' }}>
                                  <EditableText
                                    value={item.bankDetails.bankName}
                                    fieldPath={`gift_registry.items.${idx}.bankDetails.bankName`}
                                    isEditable={editablePreview}
                                  />
                                </span>
                              </div>
                            </div>

                            <div className="flex items-start gap-2.5">
                              <User className="w-3.5 h-3.5 mt-0.5 opacity-60 flex-shrink-0" style={{ color: 'var(--v2-color-accent, #C8A75D)' }} />
                              <div>
                                <span className="block opacity-60 font-semibold uppercase text-[10px] md:text-[11px] tracking-[0.14em]" style={{ color: 'var(--v2-color-text-secondary, #5C4A3E)' }}>Titular</span>
                                <span className="font-semibold" style={{ color: 'var(--v2-color-text-primary, #1F1A16)' }}>
                                  <EditableText
                                    value={item.bankDetails.accountOwner}
                                    fieldPath={`gift_registry.items.${idx}.bankDetails.accountOwner`}
                                    isEditable={editablePreview}
                                  />
                                </span>
                              </div>
                            </div>

                            <div className="flex items-start gap-2.5">
                              <CreditCard className="w-3.5 h-3.5 mt-0.5 opacity-60 flex-shrink-0" style={{ color: 'var(--v2-color-accent, #C8A75D)' }} />
                              <div className="w-full">
                                <span className="block opacity-60 font-semibold uppercase text-[10px] md:text-[11px] tracking-[0.14em]" style={{ color: 'var(--v2-color-text-secondary, #5C4A3E)' }}>CLABE</span>
                                <span className="font-bold font-mono break-all block text-sm md:text-base select-all mt-0.5" style={{ color: 'var(--v2-color-text-primary, #1F1A16)' }}>
                                  <EditableText
                                    value={item.bankDetails.clabe}
                                    fieldPath={`gift_registry.items.${idx}.bankDetails.clabe`}
                                    isEditable={editablePreview}
                                  />
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Description for non-bank cards */}
                {item.logoType !== 'bank' && (
                  <p className={`text-[13px] md:text-[14px] opacity-75 mb-4 max-w-[200px] mx-auto ${theme.bodyFont}`} style={{ color: 'var(--v2-color-text-secondary, #5C4A3E)' }}>
                    <EditableText
                      value={item.description || defaultGiftDescription(item.logoType, item.provider)}
                      fieldPath={`gift_registry.items.${idx}.description`}
                      isEditable={editablePreview}
                    />
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="w-full flex flex-col gap-2.5 relative z-10 mt-6">
                {item.logoType === 'bank' && item.bankDetails ? (
                  <>
                    {!isRevealed ? (
                      <button
                        onClick={() => toggleReveal(item.id)}
                        className={`w-full py-3 border text-[12px] md:text-[13px] uppercase tracking-[0.22em] font-semibold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow hover:-translate-y-0.5 ${theme.bodyFont}`}
                        style={{ 
                          borderRadius: '30px', 
                          borderColor: 'var(--v2-color-border, rgba(200, 167, 93, 0.35))', 
                          background: 'linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(255,250,238,0.6) 100%)',
                          color: 'var(--v2-color-text-primary, #1F1A16)',
                          backdropFilter: 'blur(8px)',
                        }}
                      >
                        <Eye className="w-3.5 h-3.5 opacity-70" />
                        Revelar Datos
                      </button>
                    ) : (
                      <div className="flex flex-col gap-2.5 w-full">
                        <button
                          onClick={() => copyToClipboard(item.bankDetails!.clabe, item.id)}
                          className={`w-full py-3 border text-[12px] md:text-[13px] uppercase tracking-[0.22em] font-semibold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow hover:-translate-y-0.5 ${theme.bodyFont}`}
                          style={{ 
                            borderRadius: '30px', 
                            borderColor: 'var(--v2-color-border, rgba(200, 167, 93, 0.35))', 
                            background: 'linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(255,250,238,0.6) 100%)',
                            color: 'var(--v2-color-text-primary, #1F1A16)',
                            backdropFilter: 'blur(8px)',
                          }}
                        >
                          {copiedId === item.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-green-600 animate-bounce" />
                              Copiado
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 opacity-70" />
                              Copiar CLABE
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => toggleReveal(item.id)}
                          className="text-[9px] uppercase tracking-[0.18em] text-stone-400 hover:text-stone-700 transition-colors py-1 cursor-pointer flex items-center justify-center gap-1"
                        >
                          <EyeOff className="w-3 h-3" />
                          Ocultar Datos
                        </button>
                      </div>
                    )}
                  </>
                ) : isInternalAnchor ? (
                  /* Envelope / lluvia de sobres — local toggle, no navigation */
                  <button
                    type="button"
                    onClick={() => toggleAcknowledge(item.id)}
                    className={`w-full py-3 border text-[12px] md:text-[13px] uppercase tracking-[0.22em] font-semibold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow hover:-translate-y-0.5 ${theme.bodyFont}`}
                    style={{
                      borderRadius: '30px',
                      borderColor: acknowledgedIds[item.id] ? 'rgba(60,160,80,0.4)' : 'var(--v2-color-border, rgba(200, 167, 93, 0.35))',
                      background: acknowledgedIds[item.id]
                        ? 'linear-gradient(180deg, rgba(220,255,230,0.85) 0%, rgba(200,245,215,0.6) 100%)'
                        : 'linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(255,250,238,0.6) 100%)',
                      color: acknowledgedIds[item.id] ? '#2A8040' : 'var(--v2-color-text-primary, #1F1A16)',
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    {acknowledgedIds[item.id] ? (
                      <><Check className="w-3.5 h-3.5" /> GRACIAS</>
                    ) : 'CONFIRMO'}
                  </button>
                ) : (
                  <a
                    href={actionHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full py-3 border text-[12px] md:text-[13px] uppercase tracking-[0.22em] font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow hover:-translate-y-0.5 ${theme.bodyFont}`}
                    style={{
                      borderRadius: '30px',
                      borderColor: 'var(--v2-color-border, rgba(200, 167, 93, 0.35))',
                      background: 'linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(255,250,238,0.6) 100%)',
                      color: 'var(--v2-color-text-primary, #1F1A16)',
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    Ver Mesa
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                )}
              </div>
            </ElegantInvitationCard>
          );
        })}
      </div>
    </SectionShell>
  );
}
