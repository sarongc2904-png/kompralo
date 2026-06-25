'use client';

import type { CSSProperties } from 'react';

interface Props {
  publicPath: string | null;
  style?: CSSProperties;
}

function buildAbsoluteInvitationUrl(publicPath: string, origin: string): string {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, '');
  const baseUrl = configuredUrl || origin;
  return new URL(publicPath, baseUrl).toString();
}

export function WizardWhatsAppShareLink({ publicPath, style }: Props) {
  const origin = typeof window === 'undefined' ? '' : window.location.origin;

  const href = publicPath && (process.env.NEXT_PUBLIC_APP_URL || origin)
    ? `https://wa.me/?text=${encodeURIComponent(`Te compartimos nuestra invitación ${buildAbsoluteInvitationUrl(publicPath, origin)}`)}`
    : undefined;

  if (!href) {
    return (
      <span style={{ ...style, cursor: 'not-allowed', opacity: 0.55 }}>
        Compartir por WhatsApp
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={style}
    >
      Compartir por WhatsApp
    </a>
  );
}
