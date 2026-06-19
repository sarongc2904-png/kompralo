export const VIRTUAL_ASSISTANT_ENABLED =
  process.env.NEXT_PUBLIC_VIRTUAL_ASSISTANT_ENABLED === 'true';

export const VIRTUAL_ASSISTANT_MESSAGES_KEY = 'kompralo_virtual_assistant_messages';

export const VIRTUAL_ASSISTANT_OPEN_KEY = 'kompralo_virtual_assistant_open';

export const ASSISTANT_AI_ENABLED =
  process.env.ASSISTANT_AI_ENABLED === 'true';

export const VIRTUAL_ASSISTANT_ALLOWED_ROUTES = [
  '/invitaciones',
  '/invitaciones/precios',
  '/checkout/success',
  '/cliente',
];

export function isVirtualAssistantRoute(pathname: string): boolean {
  return VIRTUAL_ASSISTANT_ALLOWED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}
