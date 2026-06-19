import type { Metadata } from 'next';
import type { InvitationContent } from '@/domain/invitations/types';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export function buildInvitationMetadata(invitation: InvitationContent): Metadata {
  const protagonistNames = invitation.protagonists.map((p) => p.name).join(' & ');
  const title = `${protagonistNames} | ${invitation.subtitle}`;
  const description =
    `Te invitamos a celebrar con nosotros. Confirma tu asistencia y conoce todos los detalles del evento.`;

  const heroImage = invitation.hero?.imageUrl ?? null;
  const ogImages = heroImage
    ? [{ url: heroImage, width: 1200, height: 630, alt: title }]
    : [];

  const canonicalUrl = `${APP_URL}/${invitation.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Kompralo',
      images: ogImages,
      type: 'website',
      locale: 'es_MX',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: heroImage ? [heroImage] : [],
    },
    robots: {
      index: true,
      follow: false,
    },
  };
}

export function buildNoIndexMetadata(): Metadata {
  return {
    title: 'Vista previa — Kompralo',
    description: 'No indexar - Vista previa Kompralo',
    robots: {
      index: false,
      follow: false,
    },
  };
}
