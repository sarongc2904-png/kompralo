/**
 * Regla ÚNICA del hashtag de bodas para toda la app.
 *
 *   #<Nombre1>y<Nombre2><Año>   →   ejemplo: ArletteyMayorga2026
 *
 * - Cada nombre: se quitan espacios y signos; se capitaliza SOLO la primera
 *   letra y se respeta el resto (nombres compuestos tipo "MariaJose" se
 *   conservan). No se aplastan a minúsculas ni se les quita el acento.
 * - Conector "y" SIEMPRE en minúscula.
 * - Año (4 dígitos) al final, sin separadores. Opcional.
 *
 * Devuelve el valor SIN "#" — el render antepone el "#".
 */
export function formatWeddingHashtag(
  name1: string | null | undefined,
  name2: string | null | undefined,
  year?: string | number | null,
): string {
  const clean = (n: string | null | undefined): string => {
    const s = (n ?? '').trim().replace(/\s+/g, '').replace(/[^\p{L}\p{N}]/gu, '');
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
  };

  const a = clean(name1);
  const b = clean(name2);
  const y = year != null && String(year).trim() ? String(year).trim().slice(0, 4) : '';

  // Con un solo nombre no forzamos año (comportamiento previo de los generadores).
  if (!a || !b) return a || b || '';
  return `${a}y${b}${y}`;
}
