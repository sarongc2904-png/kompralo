'use client';

import React from 'react';
import { Theme } from '@/domain/themes/types';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { ThemeDivider } from '@/components/theme-v2';
import InkRevealText from './InkRevealText';

interface DressCodeProps {

  dressCode: {
    type: string;
    description: string;
    suggestions: string;
  };
  theme: Theme;
}

export default function DressCode({ dressCode, theme }: DressCodeProps) {
  if (!dressCode) return null;

  return (
    <section className="py-20 md:py-28 px-6 md:px-8 bg-transparent text-center select-none">
      <div className="max-w-xl mx-auto">
        
        {/* Header */}
        <div className="mb-10">
          <p className={`text-xs uppercase tracking-[0.25em] mb-3 ${theme.accentText} ${theme.bodyFont}`}>
            Código de Vestimenta
          </p>
          <h3 className={`text-3xl md:text-4xl font-light tracking-wide ${theme.headingFont} ${theme.bodyText}`}>
            Etiqueta Requerida
          </h3>
          <ThemeDivider className="mt-6" />
        </div>



        {/* Info Card */}
        <div className="p-6 md:p-12 overflow-hidden shadow-sm"
          style={{ border: `1px solid var(--v2-color-border, ${theme.colors.border})`, background: `var(--v2-color-surface, ${theme.colors.surface})`, borderRadius: `var(--v2-radius-lg, 16px)`, boxShadow: `var(--v2-shadow-card, 0 4px 16px rgba(0,0,0,0.08))` }}>
          <div className="inline-block p-3 rounded-full mb-6" style={{ background: `var(--v2-color-accent-soft, rgba(197,168,128,0.10))` }}>
            <Sparkles className={`w-5 h-5 ${theme.accentText}`} />
          </div>

          <h4
            className={`text-2xl font-light tracking-wide mb-4 ${theme.headingFont}`}
            style={{ color: 'var(--v2-color-text-primary, inherit)' }}
          >
            {dressCode.type}
          </h4>

          <p
            className={`text-sm leading-relaxed mb-8 ${theme.bodyFont}`}
            style={{ color: 'var(--v2-color-text-secondary, inherit)', opacity: 0.9 }}
          >
            {dressCode.description}
          </p>

          {/* Color Swatches */}
          {theme.dressCodeSwatches && theme.dressCodeSwatches.length > 0 && (
            <div className="mt-8">
              <p className={`text-[10px] uppercase tracking-[0.2em] mb-4 opacity-65 ${theme.cardText} ${theme.bodyFont}`}>
                Sugerencia de Colores
              </p>
              
              <div className="flex flex-wrap gap-3 justify-center items-center">
                {theme.dressCodeSwatches.map((color, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      type: 'spring',
                      stiffness: 150,
                      damping: 15,
                      delay: index * 0.1,
                    }}
                    className="flex-shrink-0 flex flex-col items-center gap-1.5"
                  >
                    <div
                      className="w-9 h-9 rounded-full border border-black/10 shadow-sm"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Important notes */}
          {dressCode.suggestions && (
            <p className={`text-xs italic opacity-70 mt-8 pt-6 ${theme.bodyFont} ${theme.cardText}`}
              style={{ borderTop: `1px solid var(--v2-color-border, ${theme.colors.border})` }}>
              * {dressCode.suggestions}
            </p>
          )}
        </div>

      </div>
    </section>
  );
}
