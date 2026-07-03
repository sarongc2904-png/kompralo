// Oculto por default hasta nuevo aviso; la var anterior
// (NEXT_PUBLIC_VIRTUAL_ASSISTANT_ENABLED) queda sin efecto.
export const VIRTUAL_ASSISTANT_ENABLED =
  process.env.NEXT_PUBLIC_SHOW_VIRTUAL_ASSISTANT === 'true';

export const VIRTUAL_ASSISTANT_MESSAGES_KEY = 'kompralo_virtual_assistant_messages';

export const VIRTUAL_ASSISTANT_OPEN_KEY = 'kompralo_virtual_assistant_open';

export const ASSISTANT_AI_ENABLED =
  process.env.ASSISTANT_AI_ENABLED === 'true';

export const VIRTUAL_ASSISTANT_ALLOWED_ROUTES = [
  '/invitaciones',
  '/invitaciones/precios',
];

function isPrivateAppRoute(pathname: string): boolean {
  return (
    pathname === '/dashboard' ||
    pathname.startsWith('/dashboard/') ||
    pathname === '/cliente' ||
    pathname.startsWith('/cliente/') ||
    pathname === '/admin' ||
    pathname.startsWith('/admin/')
  );
}

export function isVirtualAssistantRoute(pathname: string): boolean {
  if (isPrivateAppRoute(pathname)) return false;
  if (pathname === '/invitaciones' || pathname === '/invitaciones/') {
    return false;
  }
  return VIRTUAL_ASSISTANT_ALLOWED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}
