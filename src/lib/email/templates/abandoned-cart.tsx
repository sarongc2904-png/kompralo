import {
  Html, Body, Container, Text, Button, Hr, Link, Head, Preview,
} from '@react-email/components';

export interface AbandonedCartProps {
  name?: string;
  plan: string;
  price: number;
  features: string[];
  checkoutUrl?: string;
  unsubscribeUrl: string;
  isLastChance?: boolean;
}

export const subject = (isLastChance?: boolean) =>
  isLastChance ? 'Última oportunidad 🕐 — tu invitación sigue esperándote' : 'Tu invitación te está esperando 💌';

export default function AbandonedCart({
  name,
  plan,
  price,
  features,
  checkoutUrl = 'https://kompralo.com.mx/invitaciones/precios',
  unsubscribeUrl,
  isLastChance = false,
}: AbandonedCartProps) {
  const greeting = name ? `Hola ${name},` : 'Hola,';
  const priceStr = `$${(price / 100).toLocaleString('es-MX', { maximumFractionDigits: 0 })} MXN`;

  return (
    <Html lang="es">
      <Head />
      <Preview>{isLastChance ? `Última oportunidad: tu plan ${plan} sigue disponible` : `Tu plan ${plan} te está esperando — ${priceStr} pago único`}</Preview>
      <Body style={{ background: '#F5F0E8', fontFamily: 'Georgia, serif', margin: 0, padding: '32px 0' }}>
        <Container style={{ maxWidth: 600, background: '#fff', borderRadius: 8, overflow: 'hidden', margin: '0 auto' }}>

          {/* Header */}
          <div style={{ background: '#0D0A07', padding: '24px 40px', textAlign: 'center' }}>
            <Text style={{ margin: 0, color: '#C4A962', fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'sans-serif' }}>
              KOMPRALO
            </Text>
          </div>

          {/* Body */}
          <div style={{ padding: '40px 40px 32px' }}>
            <Text style={{ margin: '0 0 8px', fontSize: 14, color: '#6B4A35', fontFamily: 'sans-serif' }}>{greeting}</Text>
            <Text style={{ margin: '0 0 24px', fontSize: 22, fontWeight: 700, color: '#0D0A07', lineHeight: 1.3 }}>
              {isLastChance
                ? 'Tu plan sigue aquí — hoy es el último recordatorio'
                : 'Dejaste tu invitación a punto de estar lista'}
            </Text>
            <Text style={{ margin: '0 0 24px', fontSize: 15, color: '#1A1612', lineHeight: 1.6, fontFamily: 'sans-serif' }}>
              {isLastChance
                ? `Solo te escribimos una vez más. Tu plan ${plan} sigue disponible al mismo precio.`
                : `Seleccionaste el plan ${plan} por ${priceStr}. Solo falta un clic para tener tu invitación lista y compartirla con tus invitados.`}
            </Text>

            {/* Plan summary */}
            <div style={{ background: '#FAF7F2', border: '1px solid #EAD7A3', borderRadius: 8, padding: '20px 24px', marginBottom: 28 }}>
              <Text style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6B4A35', fontFamily: 'sans-serif' }}>
                Tu selección
              </Text>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
                <Text style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0D0A07' }}>Plan {plan}</Text>
                <Text style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0D0A07', fontFamily: 'sans-serif' }}>{priceStr}</Text>
              </div>
              {features.slice(0, 3).map((f) => (
                <Text key={f} style={{ margin: '0 0 6px', fontSize: 13, color: '#1A1612', fontFamily: 'sans-serif' }}>
                  ✓ {f}
                </Text>
              ))}
              {features.length > 3 && (
                <Text style={{ margin: '8px 0 0', fontSize: 12, color: '#6B4A35', fontFamily: 'sans-serif' }}>
                  + {features.length - 3} características más incluidas
                </Text>
              )}
            </div>

            <Button
              href={checkoutUrl}
              style={{ background: '#0D0A07', color: '#F1E3C8', padding: '14px 32px', borderRadius: 8, fontSize: 15, fontWeight: 700, fontFamily: 'sans-serif', display: 'block', textAlign: 'center', textDecoration: 'none' }}
            >
              Completar mi compra →
            </Button>

            <Hr style={{ margin: '32px 0', borderColor: '#EAD7A3' }} />

            {/* Guarantee */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <Text style={{ margin: 0, fontSize: 20 }}>🏆</Text>
              <div>
                <Text style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 700, color: '#166534', fontFamily: 'sans-serif' }}>Garantía de satisfacción 48 h</Text>
                <Text style={{ margin: 0, fontSize: 12, color: '#166534', fontFamily: 'sans-serif', lineHeight: 1.5 }}>
                  Si tu invitación no está lista en 48 horas, te devolvemos el 100% de tu dinero. Sin preguntas.
                </Text>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ background: '#FAF7F2', padding: '20px 40px', borderTop: '1px solid #EAD7A3' }}>
            <Text style={{ margin: '0 0 8px', fontSize: 11, color: '#9A7A65', fontFamily: 'sans-serif', textAlign: 'center' }}>
              Kompralo · Invitaciones digitales para eventos
            </Text>
            <Text style={{ margin: 0, fontSize: 11, color: '#9A7A65', fontFamily: 'sans-serif', textAlign: 'center' }}>
              <Link href={unsubscribeUrl} style={{ color: '#9A7A65' }}>Cancelar suscripción</Link>
              {' '}· No volver a recibir estos correos
            </Text>
          </div>
        </Container>
      </Body>
    </Html>
  );
}
