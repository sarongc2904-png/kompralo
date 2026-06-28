'use client';

import React from 'react';

interface ChecklistCardProps {
  slug:        string | null;
  publishedAt: string | null;
  rsvpMode:    string | null;
  rsvpTotal:   number;
  eventDate:   string | null;
  editUrl:     string;
  publicUrl:   string | null;
  planId:      string;
}

interface Step {
  id:       string;
  label:    string;
  done:     boolean;
  inProgress: boolean;
  cta:      { href: string; label: string; external?: boolean } | null;
}

export function ChecklistCard({
  slug,
  publishedAt,
  rsvpMode,
  rsvpTotal,
  editUrl,
  publicUrl,
}: ChecklistCardProps) {
  const steps: Step[] = [
    {
      id:         'edit',
      label:      'Personaliza tu invitación',
      done:       false,
      inProgress: true,
      cta:        { href: editUrl, label: '✨ Abrir editor' },
    },
    {
      id:         'rsvp-mode',
      label:      'Configura cómo recibirás confirmaciones',
      done:       !!(rsvpMode && rsvpMode !== ''),
      inProgress: false,
      cta:        { href: '#configuracion', label: 'Configurar' },
    },
    {
      id:         'publish',
      label:      'Publica y comparte tu invitación',
      done:       publishedAt !== null,
      inProgress: false,
      cta:        publicUrl ? { href: publicUrl, label: 'Ver invitación', external: true } : null,
    },
    {
      id:         'rsvp',
      label:      'Recibe tus primeras confirmaciones',
      done:       rsvpTotal > 0,
      inProgress: false,
      cta:        null,
    },
  ];

  const completedCount = steps.filter(s => s.done).length;

  if (completedCount === 4) return null;

  const pct = Math.round((completedCount / 4) * 100);
  const barColor = completedCount === 4 ? '#1a7a45' : '#C9A96E';

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #E5D2A8',
      borderRadius: '1.25rem',
      padding: '1.5rem',
      marginBottom: '1.5rem',
      boxShadow: '0 4px 20px rgba(26,18,8,0.02)',
    }}>
      {/* Header */}
      <p style={{ margin: '0 0 .25rem', fontSize: '.6875rem', fontWeight: 800, letterSpacing: '.2em', textTransform: 'uppercase', color: '#C9A96E' }}>
        Primeros pasos
      </p>
      <h2 style={{
        margin: '0 0 .25rem',
        fontSize: '1.1rem', fontWeight: 700,
        color: '#1A1208',
        fontFamily: 'var(--font-playfair, Georgia, serif)',
      }}>
        Tu lista de inicio 🎯
      </h2>
      <p style={{ margin: '0 0 1rem', fontSize: '.8125rem', color: '#7A6A5B' }}>
        Sigue estos pasos para lanzar tu invitación
      </p>

      {/* Progress bar */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.375rem' }}>
          <span style={{ fontSize: '.75rem', fontWeight: 600, color: '#7A6A5B' }}>
            {completedCount} de 4 pasos completados
          </span>
          <span style={{ fontSize: '.75rem', fontWeight: 700, color: barColor }}>
            {pct}%
          </span>
        </div>
        <div style={{ height: 6, background: '#F0E8D4', borderRadius: 9999, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${pct}%`,
            background: barColor,
            borderRadius: 9999,
            transition: 'width .4s ease, background .3s ease',
          }} />
        </div>
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
        {steps.map((step, i) => (
          <div
            key={step.id}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: '.875rem',
              padding: '.875rem 1rem',
              background: step.done
                ? '#F0FBF4'
                : step.inProgress
                  ? '#FFFBF0'
                  : '#FAFAF8',
              border: `1px solid ${step.done ? '#B8DFC4' : step.inProgress ? '#EAD7A3' : '#EDE8DF'}`,
              borderRadius: '.875rem',
            }}
          >
            {/* Icon */}
            <span style={{ fontSize: '1.125rem', flexShrink: 0, marginTop: '.05rem', lineHeight: 1 }}>
              {step.done ? '✅' : step.inProgress ? '🔄' : '⬜'}
            </span>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '.5rem', marginBottom: step.done || !step.cta ? 0 : '.5rem' }}>
                <span style={{
                  fontSize: '.875rem', fontWeight: step.done ? 500 : 600,
                  color: step.done ? '#4f7d5a' : '#1A1208',
                  textDecoration: step.done ? 'none' : 'none',
                }}>
                  <span style={{ color: '#B0A090', fontSize: '.75rem', fontWeight: 600, marginRight: '.375rem' }}>
                    {i + 1}.
                  </span>
                  {step.label}
                </span>
                {step.done && (
                  <span style={{
                    fontSize: '.6875rem', fontWeight: 700,
                    padding: '.15rem .5rem', borderRadius: '9999px',
                    background: '#D1F0DC', color: '#1a7a45',
                    letterSpacing: '.03em',
                  }}>
                    Completado
                  </span>
                )}
              </div>

              {/* CTA */}
              {!step.done && step.cta && (
                <a
                  href={step.cta.href}
                  {...(step.cta.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '.3rem',
                    padding: '.35rem .875rem',
                    background: step.inProgress ? '#1A1208' : 'transparent',
                    color: step.inProgress ? '#C9A96E' : '#1A1208',
                    border: step.inProgress ? '1px solid transparent' : '1px solid #C9A96E',
                    borderRadius: '.5rem',
                    fontSize: '.8rem', fontWeight: 700,
                    textDecoration: 'none',
                    transition: 'opacity .15s',
                  }}
                >
                  {step.cta.label}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
