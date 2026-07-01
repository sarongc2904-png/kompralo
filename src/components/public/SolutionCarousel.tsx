'use client';

import { useRef, useCallback } from 'react';
import {
  CalendarClock,
  Gift,
  Images,
  MapPin,
  Smartphone,
  Users,
  Link2,
  QrCode,
  Music,
  Shirt,
  Hotel,
  Hash,
  Sparkles,
  Heart,
} from 'lucide-react';

const T = {
  black:  '#0C0A09',
  onyx:   '#1C1917',
  ink:    '#F5F5F4',
  cyan:   '#C5A880',
  muted:  '#A8A29E',
  border: 'rgba(197, 168, 128, 0.15)',
} as const;

const SOLUTIONS = [
  { icon: Sparkles, title: 'Portada con los nombres de los novios', text: 'Presenta tu boda desde el primer momento con una portada elegante.' },
  { icon: CalendarClock, title: 'Cuenta regresiva', text: 'Muestra cuánto falta para el gran día.' },
  { icon: Heart, title: 'Historia de la pareja', text: 'Comparte un relato breve y especial sobre ustedes.' },
  { icon: Images, title: 'Galería de fotos', text: 'Agrega recuerdos importantes en una sección visual.' },
  { icon: MapPin, title: 'Ubicación del evento', text: 'Incluye el lugar de la ceremonia o recepción.' },
  { icon: Shirt, title: 'Código de vestimenta', text: 'Ayuda a tus invitados a elegir cómo asistir.' },
  { icon: Users, title: 'Familias y padrinos', text: 'Muestra a las personas importantes de la celebración.' },
  { icon: Gift, title: 'Mesa de regalos', text: 'Comparte la información de regalos de forma clara.' },
  { icon: Hash, title: 'Hashtag', text: 'Reúne las fotos y mensajes de tus invitados.' },
  { icon: Music, title: 'Mensaje final', text: 'Cierra la invitación con una nota especial.' },
  { icon: QrCode, title: 'Itinerario y línea de tiempo', text: 'Ordena los momentos principales de tu boda.' },
  { icon: Hotel, title: 'Hospedaje', text: 'Comparte opciones útiles para invitados que viajan.' },
  { icon: Link2, title: 'Intro cinemática', text: 'Da una entrada más emotiva a la invitación.' },
];

export function SolutionCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.pageX - (scrollRef.current?.offsetLeft ?? 0);
    scrollLeft.current = scrollRef.current?.scrollLeft ?? 0;
    if (scrollRef.current) scrollRef.current.style.cursor = 'grabbing';
  }, []);

  const onMouseLeave = useCallback(() => {
    isDragging.current = false;
    if (scrollRef.current) scrollRef.current.style.cursor = 'grab';
  }, []);

  const onMouseUp = useCallback(() => {
    isDragging.current = false;
    if (scrollRef.current) scrollRef.current.style.cursor = 'grab';
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  }, []);

  const scroll = useCallback((dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'right' ? 640 : -640, behavior: 'smooth' });
  }, []);

  const btnStyle = (side: 'left' | 'right'): React.CSSProperties => ({
    flexShrink: 0,
    alignSelf: 'center',
    background: T.onyx,
    border: `1px solid ${T.border}`,
    color: T.cyan,
    width: 40,
    height: 40,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '1.25rem',
    lineHeight: 1,
    transition: 'background 0.2s',
    zIndex: 10,
  });

  return (
    <div style={{ display: 'flex', alignItems: 'stretch', gap: '0.75rem' }}>
      {/* Left arrow */}
      <button
        onClick={() => scroll('left')}
        aria-label="Anterior"
        style={btnStyle('left')}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(197,168,128,0.1)')}
        onMouseLeave={e => (e.currentTarget.style.background = T.onyx)}
      >
        ‹
      </button>

      {/* Scrollable track */}
      <div
        ref={scrollRef}
        className="cro-sol-grid"
        style={{ flex: 1, minWidth: 0 }}
        onMouseDown={onMouseDown}
        onMouseLeave={onMouseLeave}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
      >
        {SOLUTIONS.map(({ icon: Icon, title, text }) => (
          <div key={title} className="cro-sol-card">
            <Icon size={24} className="cro-sol-icon" strokeWidth={1.5} />
            <h3>{title}</h3>
            <p>{text}</p>
          </div>
        ))}
      </div>

      {/* Right arrow */}
      <button
        onClick={() => scroll('right')}
        aria-label="Siguiente"
        style={btnStyle('right')}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(197,168,128,0.1)')}
        onMouseLeave={e => (e.currentTarget.style.background = T.onyx)}
      >
        ›
      </button>
    </div>
  );
}
