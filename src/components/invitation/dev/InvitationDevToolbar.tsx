'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Palette, Settings, Sliders, X } from 'lucide-react';
import { availablePlans } from '@/domain/plans/registry';
import type { PlanId } from '@/domain/plans/types';
import { availableThemes } from '@/domain/themes/registry';
import type { ThemeId } from '@/domain/themes/types';

interface InvitationDevToolbarProps {
  activePlanId: PlanId;
  activeThemeId: ThemeId;
  onPlanChange: (planId: PlanId) => void;
  onThemeChange: (themeId: ThemeId) => void;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function InvitationDevToolbar({
  activePlanId,
  activeThemeId,
  onPlanChange,
  onThemeChange,
  isOpen,
  onOpenChange,
}: InvitationDevToolbarProps) {
  return (
    <>
      <svg style={{ position: 'fixed', width: 0, height: 0 }} aria-hidden="true">
        <defs>
          <filter id="goo-settings">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div className="fixed top-6 left-6 z-[9990]" style={{ filter: isOpen ? undefined : 'url(#goo-settings)' }}>
        <motion.button
          onClick={() => onOpenChange(!isOpen)}
          animate={{
            borderRadius: isOpen ? '50% 12px 12px 12px' : '50%',
            background: isOpen
              ? 'linear-gradient(135deg, #C5A880 0%, #A8865A 100%)'
              : 'rgba(255,255,255,0.92)',
          }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'relative',
            zIndex: 2,
            width: 44,
            height: 44,
            border: '1px solid rgba(197,168,128,0.35)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          title="Ajustes de Motor"
        >
          <AnimatePresence mode="wait" initial={false}>
            {isOpen ? (
              <motion.span
                key="x"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={{ display: 'flex' }}
              >
                <X className="w-4 h-4" style={{ color: '#fff' }} />
              </motion.span>
            ) : (
              <motion.span
                key="s"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={{ display: 'flex' }}
              >
                <Settings className="w-5 h-5 animate-[spin_12s_linear_infinite]" style={{ color: '#6B5D4F' }} />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="settings-panel"
              initial={{ scale: 0.85, opacity: 0, borderRadius: '22px 4px 22px 22px' }}
              animate={{ scale: 1, opacity: 1, borderRadius: '4px 22px 22px 22px' }}
              exit={{ scale: 0.85, opacity: 0, borderRadius: '22px 4px 22px 22px' }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'absolute',
                top: 52,
                left: 0,
                width: 308,
                padding: '20px 22px 22px',
                background: 'linear-gradient(145deg, rgba(255,255,255,0.97) 0%, rgba(253,249,242,0.97) 100%)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(197,168,128,0.25)',
                boxShadow: '0 8px 40px rgba(0,0,0,0.14), 0 2px 8px rgba(197,168,128,0.12)',
                transformOrigin: 'top left',
                zIndex: 1,
              }}
            >
              <div className="mb-5">
                <h5 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#C5A880] flex items-center gap-1.5 mb-1 font-mono">
                  <Sliders className="w-3.5 h-3.5" />
                  KOMPRALO ENGINE V1
                </h5>
                <p className="text-[10px] opacity-60 text-[#4A4740]">Prueba combinaciones de planes y temas en tiempo real.</p>
              </div>

              <div className="space-y-2.5 mb-5">
                <span className="block text-[10px] uppercase tracking-widest font-mono opacity-80 text-[#4A4740]">Plan Activo</span>
                <div className="grid grid-cols-3 gap-2">
                  {availablePlans.map((planOption) => (
                    <button
                      key={planOption.id}
                      onClick={() => onPlanChange(planOption.id)}
                      className={`py-1.5 text-[10px] uppercase tracking-widest border transition-all cursor-pointer ${
                        activePlanId === planOption.id
                          ? 'border-[#C5A880] bg-[#C5A880]/10 font-bold text-[#A18055]'
                          : 'border-[#EDE8DF] hover:border-[#C5A880] text-gray-500'
                      }`}
                    >
                      {planOption.id}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2.5 mb-5">
                <span className="block text-[10px] uppercase tracking-widest font-mono opacity-80 text-[#4A4740] flex items-center gap-1">
                  <Palette className="w-3 h-3" />
                  Tema Visual
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {availableThemes.map((themeOption) => (
                    <button
                      key={themeOption.id}
                      onClick={() => onThemeChange(themeOption.id)}
                      style={{
                        border: activeThemeId === themeOption.id ? '1.5px solid #C5A880' : '1px solid #EDE8DF',
                        borderRadius: 6,
                        padding: '8px 10px',
                        background: activeThemeId === themeOption.id ? 'rgba(197,168,128,0.07)' : 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        width: '100%',
                        textAlign: 'left',
                        transition: 'all 0.25s',
                      }}
                    >
                      <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                        {themeOption.dressCodeSwatches.map((color, index) => (
                          <span
                            key={index}
                            style={{
                              width: 10,
                              height: 24,
                              borderRadius: 3,
                              backgroundColor: color,
                              border: '0.5px solid rgba(0,0,0,0.08)',
                            }}
                          />
                        ))}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: activeThemeId === themeOption.id ? '#A18055' : '#3A3530',
                            letterSpacing: '0.04em',
                            marginBottom: 1,
                          }}
                        >
                          {themeOption.name}
                        </p>
                        <p
                          style={{
                            fontSize: 9,
                            color: '#888',
                            letterSpacing: '0.06em',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {themeOption.description}
                        </p>
                      </div>
                      {activeThemeId === themeOption.id && (
                        <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#C5A880', flexShrink: 0 }} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[#EDE8DF]/60 text-[9px] opacity-50 space-y-1 text-[#4A4740]">
                <p>Los Feature Gates se adaptan reactivamente.</p>
                <p>El intro y la musica estan bloqueados en plan Basic.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
