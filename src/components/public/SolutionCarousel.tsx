'use client';

import { useRef, useCallback } from 'react';
import {
  CalendarClock,
  Gift,
  Images,
  MapPin,
  Users,
  Shirt,
  Hotel,
  Sparkles,
} from 'lucide-react';

const SOLUTIONS = [
  { icon: MapPin, title: 'Ubicación con mapa', text: 'Tus invitados saben dónde llegar sin pedirte la dirección otra vez.' },
  { icon: Users, title: 'Confirmación de asistencia', text: 'Cada invitado puede responder desde la misma invitación.' },
  { icon: Gift, title: 'Mesa de regalos', text: 'Comparte el link o datos importantes de regalos de forma clara.' },
  { icon: CalendarClock, title: 'Itinerario', text: 'Ordena ceremonia, recepción y momentos clave en un solo lugar.' },
  { icon: Images, title: 'Galería e historia', text: 'Agrega fotos y una historia breve para que se sienta personal.' },
  { icon: Hotel, title: 'Hospedaje', text: 'Ayuda a invitados de fuera con opciones y detalles útiles.' },
  { icon: Shirt, title: 'Código de vestimenta', text: 'Evita dudas sobre colores, formalidad o estilo del evento.' },
  { icon: Sparkles, title: 'Cuenta regresiva', text: 'Mantén visible cuánto falta para el día de la boda.' },
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

  const btnStyle = (): React.CSSProperties => ({
    flexShrink: 0,
    alignSelf: 'center',
    background: 'var(--site-color-blanco)',
    border: '1px solid var(--site-color-border-subtle)',
    color: 'var(--site-color-rosa-antiguo)',
    width: 40,
    height: 40,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '1.25rem',
    lineHeight: 1,
    boxShadow: '0 10px 24px rgba(74, 59, 53, 0.08)',
    transition: 'background 0.2s, transform 0.2s',
    zIndex: 10,
  });

  return (
    <div style={{ display: 'flex', alignItems: 'stretch', gap: '0.75rem' }}>
      {/* Left arrow */}
      <button
        onClick={() => scroll('left')}
        aria-label="Anterior"
        style={btnStyle()}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(156, 107, 112, 0.08)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'var(--site-color-blanco)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
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
          <div
            key={title}
            className="min-h-[230px] w-[230px] flex-none rounded-2xl border border-site-border-subtle bg-site-blanco p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md"
          >
            <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-site-crema text-site-rosa-antiguo">
              <Icon size={22} strokeWidth={1.5} />
            </span>
            <h3 className="m-0 font-site-serif text-xl font-semibold leading-tight text-site-marron">{title}</h3>
            <p className="mt-3 font-site-sans text-sm leading-6 text-site-marron/70">{text}</p>
          </div>
        ))}
      </div>

      {/* Right arrow */}
      <button
        onClick={() => scroll('right')}
        aria-label="Siguiente"
        style={btnStyle()}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(156, 107, 112, 0.08)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'var(--site-color-blanco)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        ›
      </button>
    </div>
  );
}
