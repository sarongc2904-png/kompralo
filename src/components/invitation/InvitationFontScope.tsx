import { greatVibes } from '@/fonts';

/**
 * Define --font-script (Great Vibes) y --intro-name-scale para el árbol que
 * envuelve. El CinematicIntro consume ambas variables con fallback al font del
 * tema, así que este scope decide dónde se ve la caligrafía: rutas públicas
 * (/i, /invitacion, /invitaciones/[slug], /[slug]) y /preview (pestaña "Vista
 * previa" + iframe del Editor V4). La demo del playground en `/` queda fuera
 * a propósito.
 */
export default function InvitationFontScope({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      className={greatVibes.variable}
      style={{ '--intro-name-scale': '1.35' } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
