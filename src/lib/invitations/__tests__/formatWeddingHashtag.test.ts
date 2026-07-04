import { formatWeddingHashtag } from '@/lib/invitations/formatWeddingHashtag';

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error('FAIL: ' + msg);
  console.log('ok -', msg);
}

// Conector "y" minúscula + año
assert(formatWeddingHashtag('Arlette', 'Mayorga', '2026') === 'ArletteyMayorga2026',
  'caso base: ArletteyMayorga2026');

// Sin año
assert(formatWeddingHashtag('Sofía', 'Alejandro') === 'SofíayAlejandro',
  'sin año conserva acentos: SofíayAlejandro');

// Capitaliza solo la primera letra; respeta compuestos tipo "MariaJose"
assert(formatWeddingHashtag('mariaJose', 'carlos', 2027) === 'MariaJoseyCarlos2027',
  'compuesto MariaJose preservado + Carlos capitalizado');

// Quita espacios internos y signos
assert(formatWeddingHashtag('Maria José', 'Alejandro Pérez', '2026') === 'MariaJoséyAlejandroPérez2026',
  'quita espacios: MariaJoséyAlejandroPérez2026');

// Año se recorta a 4 dígitos (fecha completa)
assert(formatWeddingHashtag('Ana', 'Luis', '2026-08-15') === 'AnayLuis2026',
  'recorta fecha a año: AnayLuis2026');

// Un solo nombre: sin conector ni año forzado
assert(formatWeddingHashtag('Valentina', '') === 'Valentina', 'un solo nombre: Valentina');
assert(formatWeddingHashtag('', '') === '', 'ambos vacíos: cadena vacía');

console.log('\nformatWeddingHashtag: todos los casos OK');
