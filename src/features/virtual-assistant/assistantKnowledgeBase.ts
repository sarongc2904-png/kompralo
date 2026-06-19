export const KOMPRALO_PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: '$499 MXN',
    description: 'Ideal para una invitación sencilla, elegante y funcional.',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$899 MXN',
    description: 'Ideal si quieres más secciones, más personalización y una presentación más completa.',
  },
  {
    id: 'deluxe',
    name: 'Deluxe',
    price: '$1499 MXN',
    description: 'Ideal si quieres una experiencia más visual, premium y completa.',
  },
];

export const KOMPRALO_EDITABLE_FEATURES = [
  'Nombres', 'Fecha', 'Ubicación', 'Fotos', 'Galería', 'Itinerario',
  'Dress Code', 'Mesa de regalos', 'Hospedaje', 'Mensaje final', 'Padrinos', 'Redes sociales',
];

export const EVENT_INVITATION_TEXTS: Record<string, string> = {
  boda: '"Con mucha alegría queremos compartir contigo el inicio de nuestra nueva historia. Te invitamos a acompañarnos en este día tan especial y celebrar juntos nuestro amor."',
  xv: '"Con ilusión y alegría, te invitamos a celebrar una noche inolvidable en honor a mis XV años. Tu presencia hará este momento aún más especial."',
  babyShower: '"Con mucho amor esperamos la llegada de nuestro bebé y queremos compartir esta alegría contigo. Te invitamos a celebrar este momento tan especial."',
  bautizo: '"Con amor y gratitud, queremos compartir contigo este día tan especial en el que celebraremos una bendición muy importante para nuestra familia."',
  cumpleanos: '"Quiero celebrar este día tan especial rodeado de las personas que más quiero. Tu presencia hará que esta celebración sea aún más inolvidable."',
};

export const KOMPRALO_HOW_IT_WORKS_STEPS = [
  'Eliges el plan que prefieres.',
  'Pagas de forma segura con Stripe.',
  'Recibes un correo con tu acceso.',
  'Entras con magic link usando el mismo correo de compra.',
  'Editas tu invitación desde el dashboard.',
  'Compartes el link por WhatsApp con tus invitados.',
];
