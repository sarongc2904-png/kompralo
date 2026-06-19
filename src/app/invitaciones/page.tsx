import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Invitaciones Digitales Editables — Kompralo',
  description:
    'Crea tu invitación digital para boda, XV años, bautizo, baby shower o cumpleaños. Edítala en línea y compártela por WhatsApp. Desde $499 MXN.',
};

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:       '#F5F0EB',
  dark:     '#1A1410',
  mid:      '#6B5B4E',
  light:    '#9B8878',
  gold:     '#C5A880',
  white:    '#FFFFFF',
  border:   '#E8E2DA',
  cardBg:   '#FAFAF8',
  cream:    '#FDF8F2',
} as const;

// ─── Helper components ────────────────────────────────────────────────────────

function Section({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <section
      style={{
        padding: 'clamp(3rem, 8vw, 5rem) clamp(1rem, 4vw, 2rem)',
        ...style,
      }}
    >
      {children}
    </section>
  );
}

function Container({ children, narrow }: { children: React.ReactNode; narrow?: boolean }) {
  return (
    <div style={{ maxWidth: narrow ? '640px' : '1000px', margin: '0 auto' }}>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize:      '0.6875rem',
        fontWeight:    700,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color:         C.gold,
        marginBottom:  '0.75rem',
        margin:        '0 0 0.75rem',
      }}
    >
      {children}
    </p>
  );
}

function SectionTitle({ children, light }: { children: React.ReactNode; light?: boolean }) {
  return (
    <h2
      style={{
        fontSize:    'clamp(1.5rem, 4vw, 2.125rem)',
        fontWeight:  700,
        color:       light ? C.white : C.dark,
        margin:      '0 0 1rem',
        lineHeight:  1.2,
        fontFamily:  'var(--font-playfair, Georgia, serif)',
      }}
    >
      {children}
    </h2>
  );
}

// ─── NAV ──────────────────────────────────────────────────────────────────────

function TopNav() {
  return (
    <nav
      style={{
        position:       'sticky',
        top:            0,
        zIndex:         100,
        background:     'rgba(245,240,235,0.92)',
        backdropFilter: 'blur(8px)',
        borderBottom:   `1px solid ${C.border}`,
        padding:        '0.875rem clamp(1rem, 4vw, 2rem)',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        gap:            '1rem',
      }}
    >
      <Link
        href="/invitaciones"
        style={{
          fontSize:    '1rem',
          fontWeight:  700,
          color:       C.dark,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          textDecoration: 'none',
        }}
      >
        Kompralo
      </Link>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <Link
          href="/sofia-y-alejandro"
          style={{ fontSize: '0.8125rem', color: C.mid, textDecoration: 'none', fontWeight: 500 }}
        >
          Ver demo
        </Link>
        <Link
          href="/invitaciones/precios"
          style={{
            fontSize:       '0.8125rem',
            fontWeight:     700,
            color:          C.dark,
            background:     C.gold,
            padding:        '0.5rem 1.125rem',
            borderRadius:   '6rem',
            textDecoration: 'none',
            whiteSpace:     'nowrap',
          }}
        >
          Ver planes
        </Link>
      </div>
    </nav>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <Section
      style={{
        background:  `linear-gradient(160deg, #F9F3EC 0%, ${C.bg} 60%)`,
        paddingTop:  'clamp(3.5rem, 10vw, 6rem)',
        paddingBottom:'clamp(3.5rem, 10vw, 6rem)',
        textAlign:   'center',
      }}
    >
      <Container narrow>
        <SectionLabel>Invitaciones digitales · Sin instalar apps</SectionLabel>
        <h1
          style={{
            fontSize:   'clamp(2rem, 7vw, 3.5rem)',
            fontWeight: 800,
            color:      C.dark,
            lineHeight: 1.1,
            margin:     '0 0 1.25rem',
            fontFamily: 'var(--font-playfair, Georgia, serif)',
          }}
        >
          Invitaciones digitales editables para eventos inolvidables
        </h1>
        <p
          style={{
            fontSize:   'clamp(1rem, 2.5vw, 1.1875rem)',
            color:      C.mid,
            lineHeight: 1.65,
            margin:     '0 0 2.5rem',
            maxWidth:   '36rem',
            marginLeft: 'auto',
            marginRight:'auto',
          }}
        >
          Compra tu invitación, personalízala en línea y compártela por WhatsApp con todos tus invitados.
          Sin complicaciones. Todo desde tu celular.
        </p>

        {/* CTAs */}
        <div
          style={{
            display:        'flex',
            gap:            '0.875rem',
            justifyContent: 'center',
            flexWrap:       'wrap',
            marginBottom:   '2.5rem',
          }}
        >
          <Link
            href="/invitaciones/precios"
            style={{
              display:        'inline-block',
              padding:        '0.875rem 2rem',
              background:     C.dark,
              color:          '#F5EDD8',
              borderRadius:   '0.625rem',
              fontSize:       '0.9375rem',
              fontWeight:     700,
              textDecoration: 'none',
              letterSpacing:  '0.02em',
            }}
          >
            Crear mi invitación →
          </Link>
          <Link
            href="/sofia-y-alejandro"
            style={{
              display:        'inline-block',
              padding:        '0.875rem 2rem',
              background:     C.white,
              color:          C.dark,
              borderRadius:   '0.625rem',
              fontSize:       '0.9375rem',
              fontWeight:     600,
              textDecoration: 'none',
              border:         `1.5px solid ${C.border}`,
            }}
          >
            Ver invitación demo
          </Link>
        </div>

        {/* Quick trust bullets */}
        <div
          style={{
            display:        'flex',
            gap:            '1.5rem',
            justifyContent: 'center',
            flexWrap:       'wrap',
            fontSize:       '0.8125rem',
            color:          C.light,
          }}
        >
          {['Desde $499 MXN', 'Pago único · Sin suscripción', 'Pago seguro con Stripe', 'Acceso inmediato'].map((t) => (
            <span key={t} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <span style={{ color: C.gold, fontSize: '0.75rem' }}>✓</span> {t}
            </span>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ─── CÓMO FUNCIONA ───────────────────────────────────────────────────────────

const STEPS = [
  { n: '1', title: 'Elige tu plan', desc: 'Basic, Premium o Deluxe según lo que necesitas para tu evento.' },
  { n: '2', title: 'Paga seguro', desc: 'Pago con tarjeta mediante Stripe. Rápido, seguro y sin sorpresas.' },
  { n: '3', title: 'Edita tu invitación', desc: 'Accede a tu editor en línea y personaliza textos, fotos, itinerario y más.' },
  { n: '4', title: 'Comparte por WhatsApp', desc: 'Envía el link a tus invitados desde tu celular. Nada que descargar.' },
];

function HowItWorks() {
  return (
    <Section style={{ background: C.white }}>
      <Container>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <SectionLabel>¿Cómo funciona?</SectionLabel>
          <SectionTitle>Listo en minutos, desde tu celular</SectionTitle>
          <p style={{ color: C.mid, fontSize: '0.9375rem', lineHeight: 1.6, maxWidth: '36rem', margin: '0 auto' }}>
            Sin instalar nada. Sin complicaciones técnicas.
          </p>
        </div>

        <div
          style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 210px), 1fr))',
            gap:                 '1.5rem',
          }}
        >
          {STEPS.map((s) => (
            <div
              key={s.n}
              style={{
                background:   C.cream,
                border:       `1px solid ${C.border}`,
                borderRadius: '0.875rem',
                padding:      '1.5rem',
              }}
            >
              <div
                style={{
                  width:        '2.25rem',
                  height:       '2.25rem',
                  borderRadius: '50%',
                  background:   C.dark,
                  color:        C.gold,
                  fontSize:     '0.875rem',
                  fontWeight:   800,
                  display:      'flex',
                  alignItems:   'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                {s.n}
              </div>
              <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.9375rem', fontWeight: 700, color: C.dark }}>
                {s.title}
              </h3>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: C.mid, lineHeight: 1.6 }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ─── EVENT TYPES ─────────────────────────────────────────────────────────────

const EVENTS = [
  { emoji: '💍', name: 'Bodas', desc: 'Una invitación tan especial como el día más importante de tu vida.' },
  { emoji: '👑', name: 'XV Años', desc: 'Celebra este momento único con una invitación digna de una princesa.' },
  { emoji: '🕊️', name: 'Bautizos', desc: 'Da la bienvenida al nuevo integrante de la familia con elegancia.' },
  { emoji: '🍼', name: 'Baby Shower', desc: 'Comparte la alegría de la llegada de tu bebé con quienes más quieres.' },
  { emoji: '🎂', name: 'Cumpleaños', desc: 'Haz de cada celebración un recuerdo que todos guardarán.' },
];

function EventTypes() {
  return (
    <Section style={{ background: C.bg }}>
      <Container>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <SectionLabel>Para cada ocasión</SectionLabel>
          <SectionTitle>Una invitación para cada momento especial</SectionTitle>
        </div>

        <div
          style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 170px), 1fr))',
            gap:                 '1rem',
          }}
        >
          {EVENTS.map((ev) => (
            <div
              key={ev.name}
              style={{
                background:   C.white,
                border:       `1px solid ${C.border}`,
                borderRadius: '0.875rem',
                padding:      '1.5rem 1.25rem',
                textAlign:    'center',
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem', lineHeight: 1 }}>{ev.emoji}</div>
              <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.9375rem', fontWeight: 700, color: C.dark }}>
                {ev.name}
              </h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: C.mid, lineHeight: 1.55 }}>
                {ev.desc}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ─── BENEFITS ─────────────────────────────────────────────────────────────────

const BENEFITS = [
  { icon: '📱', title: '100% digital', desc: 'Tus invitados la abren desde su celular. Sin papel, sin impresión.' },
  { icon: '✏️', title: 'Editable en línea', desc: 'Cambia textos, fechas y fotos desde el editor. Sin necesitar diseñador.' },
  { icon: '✨', title: 'Diseño elegante', desc: 'Plantillas premium con animaciones suaves y estética sofisticada.' },
  { icon: '💬', title: 'Se comparte por WhatsApp', desc: 'Un link que tus invitados reciben directo en su teléfono.' },
  { icon: '📋', title: 'RSVP integrado', desc: 'Tus invitados confirman asistencia sin salir de la invitación.' },
  { icon: '🤖', title: 'Asistente de textos', desc: 'Genera textos elegantes con IA para cada sección de tu invitación.' },
];

function Benefits() {
  return (
    <Section style={{ background: C.dark }}>
      <Container>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <SectionLabel>Beneficios</SectionLabel>
          <SectionTitle light>Todo lo que necesitas en una sola invitación</SectionTitle>
          <p style={{ color: '#C5B8A8', fontSize: '0.9375rem', lineHeight: 1.6, maxWidth: '36rem', margin: '0 auto' }}>
            Diseñado para parejas, familias y anfitriones que quieren una invitación bonita, clara y fácil de compartir.
          </p>
        </div>

        <div
          style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
            gap:                 '1rem',
          }}
        >
          {BENEFITS.map((b) => (
            <div
              key={b.title}
              style={{
                background:   'rgba(255,255,255,0.05)',
                border:       '1px solid rgba(197,168,128,0.2)',
                borderRadius: '0.875rem',
                padding:      '1.375rem 1.25rem',
                display:      'flex',
                gap:          '1rem',
                alignItems:   'flex-start',
              }}
            >
              <span style={{ fontSize: '1.375rem', lineHeight: 1, flexShrink: 0, marginTop: '0.1rem' }}>{b.icon}</span>
              <div>
                <h3 style={{ margin: '0 0 0.25rem', fontSize: '0.9rem', fontWeight: 700, color: '#F5EDD8' }}>
                  {b.title}
                </h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#C5B8A8', lineHeight: 1.55 }}>
                  {b.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ─── PRICING PREVIEW ─────────────────────────────────────────────────────────

const PLANS_PREVIEW = [
  {
    id:      'basic',
    name:    'Basic',
    price:   '$499',
    ideal:   'Para eventos sencillos y elegantes',
    top:     ['Portada con foto', 'Cuenta regresiva', 'RSVP', 'Botón WhatsApp'],
    dark:    false,
    badge:   null,
  },
  {
    id:      'premium',
    name:    'Premium',
    price:   '$899',
    ideal:   'El más elegido · Bodas, XV y más',
    top:     ['Todo lo de Basic', 'Galería de fotos', 'Música de fondo', 'Itinerario + Mapas'],
    dark:    true,
    badge:   'MÁS POPULAR',
  },
  {
    id:      'deluxe',
    name:    'Deluxe',
    price:   '$1,499',
    ideal:   'Para bodas y quinces inolvidables',
    top:     ['Todo lo de Premium', 'StoryBook animado', 'Padrinos + Hospedaje', 'Mesa de regalos'],
    dark:    false,
    badge:   null,
  },
];

function PricingPreview() {
  return (
    <Section style={{ background: C.white }}>
      <Container>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <SectionLabel>Planes</SectionLabel>
          <SectionTitle>Elige el plan ideal para tu evento</SectionTitle>
          <p style={{ color: C.mid, fontSize: '0.9375rem', lineHeight: 1.6 }}>
            Pago único, sin mensualidades ni sorpresas.
          </p>
        </div>

        <div
          style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
            gap:                 '1.25rem',
            alignItems:          'stretch',
            marginBottom:        '2rem',
          }}
        >
          {PLANS_PREVIEW.map((plan) => (
            <div
              key={plan.id}
              style={{
                position:      'relative',
                display:       'flex',
                flexDirection: 'column',
                background:    plan.dark ? C.dark : C.cream,
                border:        plan.dark ? `2px solid ${C.gold}` : `1px solid ${C.border}`,
                borderRadius:  '1rem',
                padding:       '2rem 1.5rem',
                boxShadow:     plan.dark ? '0 8px 32px rgba(197,168,128,0.15)' : 'none',
              }}
            >
              {plan.badge && (
                <div
                  style={{
                    position:      'absolute',
                    top:           '-1px',
                    left:          '50%',
                    transform:     'translateX(-50%)',
                    background:    C.gold,
                    color:         C.dark,
                    fontSize:      '0.625rem',
                    fontWeight:    800,
                    letterSpacing: '0.12em',
                    padding:       '0.25rem 0.875rem',
                    borderRadius:  '0 0 0.5rem 0.5rem',
                    whiteSpace:    'nowrap',
                  }}
                >
                  {plan.badge}
                </div>
              )}

              <h3
                style={{
                  margin:    '0 0 0.25rem',
                  fontSize:  '1.25rem',
                  fontWeight:700,
                  color:     plan.dark ? '#F5EDD8' : C.dark,
                }}
              >
                {plan.name}
              </h3>
              <p style={{ margin: '0 0 1rem', fontSize: '0.8rem', color: plan.dark ? '#C5B8A8' : C.light }}>
                {plan.ideal}
              </p>

              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: plan.dark ? '#F5EDD8' : C.dark }}>
                  {plan.price}
                </span>
                <span style={{ fontSize: '0.8rem', color: plan.dark ? '#C5B8A8' : C.light, marginLeft: '0.25rem' }}>
                  MXN · pago único
                </span>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                {plan.top.map((f) => (
                  <li key={f} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8125rem', color: plan.dark ? '#C5B8A8' : C.mid }}>
                    <span style={{ color: C.gold, flexShrink: 0 }}>✓</span> {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/invitaciones/precios"
                style={{
                  display:        'block',
                  textAlign:      'center',
                  padding:        '0.75rem',
                  background:     plan.dark ? C.gold : C.dark,
                  color:          plan.dark ? C.dark : '#F5EDD8',
                  borderRadius:   '0.5rem',
                  fontSize:       '0.875rem',
                  fontWeight:     700,
                  textDecoration: 'none',
                }}
              >
                Ver detalles y comprar
              </Link>
            </div>
          ))}
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.8125rem', color: C.light }}>
          Pago seguro con Stripe · Acceso inmediato tras el pago · Soporte en español
        </p>
      </Container>
    </Section>
  );
}

// ─── TRUST STRIP ─────────────────────────────────────────────────────────────

function TrustStrip() {
  const items = [
    '🔒 Pago seguro con Stripe',
    '📲 Acceso desde cualquier celular',
    '✏️ Editable cuando quieras',
    '💬 Comparte por WhatsApp',
    '🇲🇽 Soporte en español',
  ];

  return (
    <div
      style={{
        background:  C.cream,
        borderTop:   `1px solid ${C.border}`,
        borderBottom:`1px solid ${C.border}`,
        padding:     '1.25rem clamp(1rem, 4vw, 2rem)',
        display:     'flex',
        gap:         'clamp(1rem, 3vw, 2.5rem)',
        justifyContent: 'center',
        flexWrap:    'wrap',
        overflowX:   'auto',
      }}
    >
      {items.map((item) => (
        <span key={item} style={{ fontSize: '0.8125rem', color: C.mid, whiteSpace: 'nowrap', fontWeight: 500 }}>
          {item}
        </span>
      ))}
    </div>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: '¿Cómo recibo mi invitación después de pagar?',
    a: 'Recibirás un correo con un enlace de acceso. Al abrirlo, entrarás directo a tu editor para personalizar tu invitación.',
  },
  {
    q: '¿Puedo editarla después de comprarla?',
    a: 'Sí. Puedes editar textos, fechas, fotos, itinerario y más desde el editor en línea cuando quieras.',
  },
  {
    q: '¿Cómo se comparte con los invitados?',
    a: 'Una vez lista, copias el enlace de tu invitación y lo envías por WhatsApp, mensaje o donde prefieras.',
  },
  {
    q: '¿Tiene confirmación de asistencia (RSVP)?',
    a: 'Sí. Todos los planes incluyen RSVP para que tus invitados confirmen su asistencia directamente en la invitación.',
  },
  {
    q: '¿Puedo usarla desde mi celular?',
    a: 'Sí, tanto el editor como la invitación están diseñados para funcionar perfectamente en cualquier celular.',
  },
  {
    q: '¿Qué pasa si necesito ayuda?',
    a: 'Tenemos soporte en español. Si tienes dudas sobre tu invitación, podemos ayudarte por WhatsApp.',
  },
];

function FAQ() {
  return (
    <Section style={{ background: C.bg }}>
      <Container narrow>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <SectionLabel>Preguntas frecuentes</SectionLabel>
          <SectionTitle>Todo lo que necesitas saber</SectionTitle>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {FAQS.map((faq) => (
            <details
              key={faq.q}
              style={{
                background:   C.white,
                border:       `1px solid ${C.border}`,
                borderRadius: '0.75rem',
                overflow:     'hidden',
              }}
            >
              <summary
                style={{
                  padding:    '1.125rem 1.25rem',
                  cursor:     'pointer',
                  fontWeight: 600,
                  fontSize:   '0.9375rem',
                  color:      C.dark,
                  listStyle:  'none',
                  display:    'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap:        '1rem',
                  userSelect: 'none',
                }}
              >
                {faq.q}
                <span style={{ fontSize: '1rem', color: C.gold, flexShrink: 0 }}>+</span>
              </summary>
              <p
                style={{
                  margin:      0,
                  padding:     '0 1.25rem 1.125rem',
                  fontSize:    '0.875rem',
                  color:       C.mid,
                  lineHeight:  1.65,
                  borderTop:   `1px solid ${C.border}`,
                  paddingTop:  '1rem',
                }}
              >
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ─── FINAL CTA ────────────────────────────────────────────────────────────────

function FinalCTA() {
  return (
    <Section
      style={{
        background: `linear-gradient(135deg, #1A1410 0%, #2D1F12 100%)`,
        textAlign:  'center',
      }}
    >
      <Container narrow>
        <SectionLabel>Empieza hoy</SectionLabel>
        <h2
          style={{
            fontSize:   'clamp(1.75rem, 5vw, 2.625rem)',
            fontWeight: 800,
            color:      '#F5EDD8',
            margin:     '0 0 1rem',
            lineHeight: 1.15,
            fontFamily: 'var(--font-playfair, Georgia, serif)',
          }}
        >
          Tu invitación digital lista en minutos
        </h2>
        <p style={{ color: '#C5B8A8', fontSize: '1rem', lineHeight: 1.6, margin: '0 0 2.25rem' }}>
          Paga, edita y comparte. Sin instalar apps. Sin complicaciones.
          Desde <strong style={{ color: C.gold }}>$499 MXN</strong>.
        </p>

        <div style={{ display: 'flex', gap: '0.875rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/invitaciones/precios"
            style={{
              display:        'inline-block',
              padding:        '0.875rem 2.25rem',
              background:     C.gold,
              color:          C.dark,
              borderRadius:   '0.625rem',
              fontSize:       '1rem',
              fontWeight:     700,
              textDecoration: 'none',
            }}
          >
            Crear mi invitación →
          </Link>
          <Link
            href="/sofia-y-alejandro"
            style={{
              display:        'inline-block',
              padding:        '0.875rem 2.25rem',
              background:     'transparent',
              color:          '#F5EDD8',
              borderRadius:   '0.625rem',
              fontSize:       '1rem',
              fontWeight:     600,
              textDecoration: 'none',
              border:         '1.5px solid rgba(245,237,216,0.3)',
            }}
          >
            Ver demo
          </Link>
        </div>

        <p style={{ marginTop: '2rem', fontSize: '0.8rem', color: '#9B8878' }}>
          Después del pago recibirás acceso para editar tu invitación · Pago seguro con Stripe
        </p>
      </Container>
    </Section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer
      style={{
        background:  C.dark,
        borderTop:   '1px solid rgba(255,255,255,0.06)',
        padding:     '1.5rem clamp(1rem, 4vw, 2rem)',
        display:     'flex',
        justifyContent: 'space-between',
        alignItems:  'center',
        flexWrap:    'wrap',
        gap:         '0.75rem',
      }}
    >
      <span style={{ fontSize: '0.75rem', color: '#6B5B4E', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>
        Kompralo
      </span>
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { href: '/invitaciones/precios', label: 'Precios' },
          { href: '/sofia-y-alejandro',    label: 'Demo' },
          { href: '/login',                label: 'Acceder' },
        ].map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            style={{ fontSize: '0.8125rem', color: '#6B5B4E', textDecoration: 'none' }}
          >
            {label}
          </Link>
        ))}
      </div>
      <span style={{ fontSize: '0.75rem', color: '#4B3A2C' }}>© 2026 Kompralo</span>
    </footer>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function InvitacionesPage() {
  return (
    <div style={{ fontFamily: 'var(--font-inter, system-ui, sans-serif)', background: C.bg }}>
      <TopNav />
      <HeroSection />
      <TrustStrip />
      <HowItWorks />
      <EventTypes />
      <Benefits />
      <PricingPreview />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}
