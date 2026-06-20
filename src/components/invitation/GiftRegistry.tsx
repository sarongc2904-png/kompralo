'use client';

import React, { useState } from 'react';
import { Theme } from '@/domain/themes/types';
import { GiftRegistryItem } from '@/domain/invitations/types';
import { Gift, Copy, Check, ExternalLink, Eye, EyeOff, Building, User, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionHeader from './SectionHeader';
import SectionShell from './SectionShell';

interface GiftRegistryProps {
  items: GiftRegistryItem[];
  theme: Theme;
}

export default function GiftRegistry({ items, theme }: GiftRegistryProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});

  if (!items || items.length === 0) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <SectionShell className="select-none relative z-20" contentClassName="max-w-4xl mx-auto">
        
        {/* Header */}
        <SectionHeader eyebrow="Detalles" title="Mesa de Regalos" theme={theme} className="mb-0" />
        <p className={`text-sm opacity-75 mt-6 mb-16 max-w-md mx-auto text-center ${theme.bodyFont} ${theme.bodyText}`}>
          Su presencia es nuestro mayor regalo, pero si desean tener un detalle con nosotros, les compartimos nuestras opciones:
        </p>

        {/* Registry — flex wrap so 1 or 2 cards stay centred */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-8 mt-12">
          {items.map((item) => {
            const isRevealed = !!revealedIds[item.id];
            return (
              <div
                key={item.id}
                className={`relative p-8 border rounded-xl flex flex-col justify-between items-center text-center overflow-hidden transition-all duration-500 bg-white/70 hover:bg-white backdrop-blur-md shadow-sm hover:shadow-xl hover:-translate-y-1.5 group w-full sm:w-[300px] md:w-[280px] ${theme.cardBorder}`}
              >
                {/* 1. Tactile Cotton/Linen Card Paper Texture */}
                <div 
                  className="absolute inset-0 pointer-events-none opacity-[0.06] mix-blend-color-burn" 
                  style={{ 
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
                  }} 
                />

                {/* 2. Elegant Inner Double Border */}
                <div className="absolute inset-2.5 rounded-lg pointer-events-none z-0"
                  style={{ border: `1px solid var(--v2-color-border, ${theme.colors.border})`, opacity: 0.5 }} />

                {/* 3. Subtle Glossy Shimmer Reflection */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out pointer-events-none z-10" />

                {/* Content */}
                <div className="flex flex-col items-center w-full relative z-10">
                  {/* Icon Wrapper with Gold/Accent Glow */}
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 ${theme.accentText}`}
                    style={{ background: `var(--v2-color-accent-soft, rgba(197,168,128,0.10))` }}>
                    <Gift className="w-6 h-6" strokeWidth={1.1} />
                  </div>

                  <h4 className={`text-xl font-light tracking-wide mb-3 ${theme.headingFont} ${theme.cardText}`}>
                    {item.provider}
                  </h4>

                  {/* Bank Details (Hidden by default, reveals on toggle) */}
                  {item.logoType === 'bank' && item.bankDetails && (
                    <div className="w-full">
                      <p className={`text-[11px] opacity-70 mb-2 max-w-[200px] mx-auto ${theme.bodyFont}`}>
                        Información bancaria para realizar transferencias.
                      </p>
                      
                      <AnimatePresence initial={false}>
                        {isRevealed && (
                          <motion.div
                            initial={{ height: 0, opacity: 0, marginTop: 0 }}
                            animate={{ height: 'auto', opacity: 1, marginTop: 12 }}
                            exit={{ height: 0, opacity: 0, marginTop: 0 }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            className="w-full overflow-hidden"
                          >
                            <div className="w-full text-[11px] text-left p-4 rounded-lg space-y-3 relative overflow-hidden shadow-inner"
                              style={{ background: `var(--v2-color-surface-alt, #FAF8F5)`, border: `1px solid var(--v2-color-border, #EDE8DF)` }}>
                              <Building className="absolute right-[-10px] bottom-[-10px] w-20 h-20 opacity-[0.03] pointer-events-none" />
                              
                              <div className="flex items-start gap-2.5">
                                <Building className={`w-3.5 h-3.5 mt-0.5 opacity-60 ${theme.accentText}`} />
                                <div>
                                  <span className="block opacity-60 font-semibold uppercase text-[8px] tracking-wider">Banco</span>
                                  <span className={`font-semibold ${theme.cardText}`}>{item.bankDetails.bankName}</span>
                                </div>
                              </div>

                              <div className="flex items-start gap-2.5">
                                <User className={`w-3.5 h-3.5 mt-0.5 opacity-60 ${theme.accentText}`} />
                                <div>
                                  <span className="block opacity-60 font-semibold uppercase text-[8px] tracking-wider">Titular</span>
                                  <span className={`font-semibold ${theme.cardText}`}>{item.bankDetails.accountOwner}</span>
                                </div>
                              </div>

                              <div className="flex items-start gap-2.5">
                                <CreditCard className={`w-3.5 h-3.5 mt-0.5 opacity-60 ${theme.accentText}`} />
                                <div className="w-full">
                                  <span className="block opacity-60 font-semibold uppercase text-[8px] tracking-wider">CLABE</span>
                                  <span className={`font-bold font-mono ${theme.cardText} break-all block text-xs select-all mt-0.5`}>
                                    {item.bankDetails.clabe}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Standard description for normal links */}
                  {item.logoType !== 'bank' && (
                    <p className={`text-[11px] opacity-70 mb-4 max-w-[200px] mx-auto ${theme.bodyFont}`}>
                      Haz clic abajo para ver la mesa de regalos directamente.
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
                          className={`w-full py-3 border ${theme.cardBorder} hover:opacity-80 text-[10px] uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer bg-white/80 hover:bg-white ${theme.bodyFont} ${theme.cardText}`}
                        >
                          <Eye className="w-3.5 h-3.5 opacity-70" />
                          Revelar Datos
                        </button>
                      ) : (
                        <div className="flex flex-col gap-2 w-full">
                          <button
                            onClick={() => copyToClipboard(item.bankDetails!.clabe, item.id)}
                            className={`w-full py-3 border ${theme.cardBorder} hover:opacity-80 text-[10px] uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer bg-white hover:opacity-80 ${theme.bodyFont} ${theme.cardText}`}
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
                            className="text-[9px] uppercase tracking-wider text-gray-400 hover:text-black transition-colors py-1 cursor-pointer flex items-center justify-center gap-1"
                          >
                            <EyeOff className="w-3 h-3" />
                            Ocultar Datos
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-full py-3 border ${theme.cardBorder} hover:opacity-80 text-[10px] uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 bg-white/80 hover:bg-white ${theme.bodyFont} ${theme.cardText}`}
                    >
                      Ver Mesa
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

    </SectionShell>
  );
}
