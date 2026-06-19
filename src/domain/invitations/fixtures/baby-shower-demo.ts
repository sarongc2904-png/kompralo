import { InvitationContent } from '../types';

export const babyShowerDemoInvitation: InvitationContent = {
  id: 'baby-shower-demo',
  slug: 'baby-shower-demo',
  category: 'baby-shower',
  variant: 'girl',
  templateId: 'kompralo-master-baby-shower-v1',
  planId: 'platinum',
  status: 'published',
  themeId: 'floral',
  featureOverrides: {
    showStoryBook: false,
    showTimeline: false,
    showPadrinos: false,
    showGiftRegistry: true,
    showHashtag: true,
  },
  title: 'Baby Shower de Valentina',
  subtitle: 'Bienvenida al mundo',
  protagonists: [
    {
      id: 'valentina',
      name: 'Valentina',
      role: 'bride',
      familyLabel: 'Valentina',
    },
  ],
  eventDate: '2027-03-15T11:00:00',
  eventTime: '11:00 HRS',
  location: {
    venueName: 'Jardín Rosaleda',
    address: 'Av. de las Flores 120, Col. Jardines, Guadalajara, Jalisco, CP 44900',
    googleMapsLink: 'https://maps.google.com',
    wazeLink: 'https://waze.com/ul',
  },
  hero: {
    emotionalPhrase: '"Cada bebé es un poema de amor escrito en el cielo, y este es el nuestro."',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800',
    eventLabel: 'Baby Shower',
  },
  music: {
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  },
  story: {
    slides: [],
  },
  gallery: {
    images: [
      'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=800',
      'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?q=80&w=800',
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800',
      'https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=800',
    ],
  },
  timeline: [],
  itinerary: [
    {
      id: 'iti-1',
      time: '11:00 HRS',
      title: 'Llegada de Invitados',
      location: 'Entrada principal del Jardín Rosaleda',
      icon: 'glass',
    },
    {
      id: 'iti-2',
      time: '11:30 HRS',
      title: 'Juegos y Actividades',
      location: 'Área central del jardín',
      icon: 'music',
    },
    {
      id: 'iti-3',
      time: '13:00 HRS',
      title: 'Brunch y Pastel',
      location: 'Salón de banquetes',
      icon: 'utensils',
    },
    {
      id: 'iti-4',
      time: '14:30 HRS',
      title: 'Apertura de Regalos',
      location: 'Área de honor',
      icon: 'rings',
    },
  ],
  dressCode: {
    type: 'Casual Elegante',
    description: 'Colores pastel, blancos y rosas. Outfits cómodos y festivos.',
    suggestions: 'Evitar colores muy oscuros. ¡Ven lista para jugar!',
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
          bankName: 'Banca Premier',
          clabe: '0123 4567 8901 2345 67',
          accountOwner: 'Familia Rodríguez',
        },
      },
    ],
  },
  finalMessage: {
    quote: 'Tu presencia es el regalo más grande que Valentina puede recibir. Te esperamos con el corazón lleno de alegría.',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800',
  },
  parents: [
    {
      side: 'bride',
      protagonistId: 'valentina',
      fatherName: 'Carlos Rodríguez Medina',
      motherName: 'Andrea Fuentes de Rodríguez',
    },
  ],
  padrinos: [],
  hotels: [
    {
      id: 'h-1',
      name: 'Hotel Demetria',
      stars: 5,
      distance: '5 min del venue',
      priceRange: '$$$',
      address: 'Av. Américas 1600, Guadalajara, Jalisco',
      phone: '+52 33 3669 9000',
      bookingLink: 'https://booking.com',
    },
  ],
  social: {
    hashtag: '#BabyValentina2027',
    instagramHandle: '@babyvalentina',
    note: '¡Comparte tus fotos del día con nuestro hashtag y ayúdanos a recordar este momento!',
  },
  rsvpWhatsAppNumber: '5215512345678',
  createdAt: '2026-06-17T10:00:00-05:00',
  updatedAt: '2026-06-17T10:00:00-05:00',
  publishedAt: '2026-06-17T10:00:00-05:00',
};
