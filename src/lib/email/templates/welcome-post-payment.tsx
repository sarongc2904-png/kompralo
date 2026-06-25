import {
  Html, Body, Container, Text, Button, Hr, Link, Head, Preview,
} from '@react-email/components';

export interface WelcomePostPaymentProps {
  name?: string;
  dashboardUrl: string;
  plan: string;
  unsubscribeUrl: string;
}

export const subject = '¡Bienvenida a Kompralo! Aquí están tus accesos 🎉';

export default function WelcomePostPayment({ name, dashboardUrl, plan, unsubscribeUrl }: WelcomePostPaymentProps) {
  const greeting = name ? `¡Hola ${name}! 🎉` : '¡Bienvenida a Kompralo! 🎉';

  return (
    <Html lang="es">
      <Head />
      <Preview>Tu plan {plan} está activo — accede a tu panel y empieza a personalizar</Preview>
      <Body style={{ background: '#F5F0E8', fontFamily: 'Georgia, serif', margin: 0, padding: '32px 0' }}>
        <Container style={{ maxWidth: 600, background: '#fff', borderRadius: 8, overflow: 'hidden', margin: '0 auto' }}>

          <div style={{ background: '#0D0A07', padding: '24px 40px', textAlign: 'center' }}>
            <Text style={{ margin: 0, color: '#C4A962', fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'sans-serif' }}>
              KOMPRALO
            </Text>
          </div>

          <div style={{ padding: '40px 40px 32px' }}>
            <Text style={{ margin: '0 0 8px', fontSize: 26, fontWeight: 700, color: '#0D0A07', lineHeight: 1.3 }}>
              {greeting}
            </Text>
            <Text style={{ margin: '0 0 28px', fontSize: 15, color: '#1A1612', lineHeight: 1.6, fontFamily: 'sans-serif' }}>
              Tu plan <strong>{plan}</strong> ya está activo. Aquí te explicamos cómo empezar en 3 pasos:
            </Text>

            {[
              { n: '1', title: 'Entra a tu panel', desc: 'Usa el botón de abajo para acceder a tu panel de edición con el email que usaste al pagar.' },
              { n: '2', title: 'Personaliza tu invitación', desc: 'Agrega tu foto, música, itinerario y todos los datos de tu evento.' },
              { n: '3', title: 'Compártela por WhatsApp', desc: 'Copia tu link y compártelo directamente con tus invitados. Sin instalar nada.' },
            ].map(({ n, title, desc }) => (
              <div key={n} style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#0D0A07', color: '#C4A962', fontSize: 13, fontWeight: 700, fontFamily: 'sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, lineHeight: '28px', textAlign: 'center' }}>
                  {n}
                </div>
                <div>
                  <Text style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: '#0D0A07', fontFamily: 'sans-serif' }}>{title}</Text>
                  <Text style={{ margin: 0, fontSize: 13, color: '#1A1612', lineHeight: 1.5, fontFamily: 'sans-serif' }}>{desc}</Text>
                </div>
              </div>
            ))}

            <Button
              href={dashboardUrl}
              style={{ background: '#0D0A07', color: '#F1E3C8', padding: '14px 32px', borderRadius: 8, fontSize: 15, fontWeight: 700, fontFamily: 'sans-serif', display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: 8 }}
            >
              Ir a mi panel ahora →
            </Button>

            <Hr style={{ margin: '32px 0', borderColor: '#EAD7A3' }} />

            <Text style={{ margin: 0, fontSize: 13, color: '#6B4A35', fontFamily: 'sans-serif', lineHeight: 1.6 }}>
              ¿Tienes dudas? Escríbenos por WhatsApp y te ayudamos en minutos.
            </Text>
          </div>

          <div style={{ background: '#FAF7F2', padding: '20px 40px', borderTop: '1px solid #EAD7A3' }}>
            <Text style={{ margin: '0 0 8px', fontSize: 11, color: '#9A7A65', fontFamily: 'sans-serif', textAlign: 'center' }}>
              Kompralo · Invitaciones digitales para eventos
            </Text>
            <Text style={{ margin: 0, fontSize: 11, color: '#9A7A65', fontFamily: 'sans-serif', textAlign: 'center' }}>
              <Link href={unsubscribeUrl} style={{ color: '#9A7A65' }}>Cancelar suscripción</Link>
            </Text>
          </div>
        </Container>
      </Body>
    </Html>
  );
}
