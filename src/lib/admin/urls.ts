/**
 * Client-safe URL and message helpers for the admin dashboard.
 * No server-only dependencies — safe to import from 'use client' files.
 */

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL?.trim() ?? 'https://kompralo.vercel.app';
}

export function publicUrl(slug: string): string {
  return `${getAppUrl()}/${slug}`;
}

export function previewUrl(invitationId: string): string {
  return `${getAppUrl()}/preview/${invitationId}`;
}

export function editorUrl(invitationId: string): string {
  return `${getAppUrl()}/dashboard/invitations/${invitationId}/edit`;
}

export function clientDashboardUrl(invitationId: string): string {
  return `${getAppUrl()}/cliente/invitaciones/${invitationId}`;
}

export function adminInvitationUrl(invitationId: string): string {
  return `${getAppUrl()}/admin/invitations/${invitationId}`;
}

export function whatsappClientMessage(editorLink: string, publicLink: string): string {
  return (
    `Hola, tu invitación digital ya está lista para editar.\n\n` +
    `Accede aquí:\n${editorLink}\n\n` +
    `Cuando termines, comparte este link con tus invitados:\n${publicLink}`
  );
}

export function whatsappGuestsMessage(publicLink: string): string {
  return (
    `Hola, te compartimos nuestra invitación digital.\n\n` +
    `Ver invitación:\n${publicLink}\n\n` +
    `Por favor confirma tu asistencia desde la invitación.`
  );
}
