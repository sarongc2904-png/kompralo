import { InvitationContent } from '../types';

export const baptismDemoInvitation: InvitationContent = {
  id: 'baptism-demo',
  slug: 'baptism-demo',
  category: 'baptism',
  variant: 'girl',
  templateId: 'kompralo-master-baptism-v1',
  planId: 'premium',
  status: 'published',
  themeId: 'azure',
  featureOverrides: {
    showStoryBook: false,
    showTimeline: false,
    showHashtag: true,
    showGiftRegistry: true,
    showPadrinos: true,
    showAccommodation: false,
  },
  title: 'Bautizo de Emilia',
  subtitle: 'Bienvenida a la fe',
  protagonists: [
    {
      id: 'emilia',
      name: 'Emilia',
      role: 'bride',
      familyLabel: 'Emilia',
    },
  ],
  eventDate: '2027-04-18T10:30:00',
  eventTime: '10:30 HRS',
  location: {
    venueName: 'Parroquia del Sagrado Corazón',
    address: 'Calle Hidalgo 45, Col. Centro, San Miguel de Allende, Guanajuato, CP 37700',
    googleMapsLink: 'https://maps.google.com',
    wazeLink: 'https://waze.com/ul',
  },
  hero: {
    emotionalPhrase: '"Con amor la recibimos en el mundo, y con fe la entregamos a Dios."',
    imageUrl: 'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?q=80&w=800',
    eventLabel: 'Bautizo',
  },
  music: {
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  },
  story: {
    slides: [],
  },
  gallery: {
    images: [
      'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?q=80&w=800',
      'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=800',
      'https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=800',
      'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?q=80&w=800',
    ],
  },
  timeline: [],
  itinerary: [
    {
      id: 'iti-1',
      time: '10:30 HRS',
      title: 'Ceremonia de Bautizo',
      location: 'Parroquia del Sagrado Corazón',
      icon: 'church',
    },
    {
      id: 'iti-2',
      time: '12:00 HRS',
      title: 'Sesión de Fotos',
      location: 'Atrio de la Parroquia',
      icon: 'rings',
    },
    {
      id: 'iti-3',
      time: '13:00 HRS',
      title: 'Recepción y Almuerzo',
      location: 'Hacienda El Recreo, San Miguel de Allende',
      icon: 'utensils',
    },
    {
      id: 'iti-4',
      time: '15:00 HRS',
      title: 'Pastel y Brindis',
      location: 'Jardín principal de la hacienda',
      icon: 'glass',
    },
  ],
  dressCode: {
    type: 'Formal Elegante',
    description: 'Colores claros y pastel. Vestimenta respetuosa para la ceremonia religiosa.',
    suggestions: 'Tonos blancos, azules suaves, lilas y beige. Evitar colores oscuros.',
  },
  giftRegistry: {
    items: [
      {
        id: 'gift-1',
        provider: 'Amazon Baby Registry',
        logoType: 'amazon',
        link: 'https://www.amazon.com/baby',
      },
      {
        id: 'gift-2',
        provider: 'Mesa de Regalos Liverpool',
        logoType: 'liverpool',
        link: 'https://mesaderegalos.liverpool.com.mx',
      },
      {
        id: 'gift-3',
        provider: 'Transferencia Bancaria',
        logoType: 'bank',
        bankDetails: {
          bankName: 'Banorte',
          clabe: '0123 4567 8901 2345 67',
          accountOwner: 'Familia Castillo Reyes',
        },
      },
    ],
  },
  finalMessage: {
    quote: 'Hoy Emilia recibe la luz de la fe. Gracias por compartir con nosotros este día tan sagrado e irrepetible.',
    imageUrl: 'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?q=80&w=800',
  },
  parents: [
    {
      side: 'bride',
      protagonistId: 'emilia',
      fatherName: 'Diego Castillo Mendoza',
      motherName: 'Fernanda Reyes de Castillo',
    },
  ],
  padrinos: [
    { id: 'p-1', rubro: 'Bautismo', icon: 'church', names: ['Familia Gutiérrez Lara'] },
    { id: 'p-2', rubro: 'Flores', icon: 'flowers', names: ['Familia Peña Solís'] },
    { id: 'p-3', rubro: 'Pastel', icon: 'cake', names: ['Familia Ramírez Vega'] },
    { id: 'p-4', rubro: 'Fotografía', icon: 'photo', names: ['Familia Torres Núñez'] },
    { id: 'p-5', rubro: 'Recuerdos', icon: 'gift', names: ['Familia Álvarez Cruz'] },
  ],
  hotels: [],
  social: {
    hashtag: '#BautizoEmilia2027',
    instagramHandle: '@bautizoemilia',
    note: 'Comparte los momentos más especiales del día con nuestro hashtag.',
  },
  rsvpWhatsAppNumber: '5215512345678',
  createdAt: '2026-06-17T10:30:00-05:00',
  updatedAt: '2026-06-17T10:30:00-05:00',
  publishedAt: '2026-06-17T10:30:00-05:00',
  rsvpMode: 'open',
};
