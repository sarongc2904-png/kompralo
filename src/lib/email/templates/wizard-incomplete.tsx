import {
  Html, Body, Container, Text, Button, Hr, Link, Head, Preview,
} from '@react-email/components';

export interface WizardIncompleteProps {
  name?: string;
  wizardUrl: string;
  unsubscribeUrl: string;
}

export const subject = 'Tu invitación está casi lista... ✨';

export default function WizardIncomplete({ name, wizardUrl, unsubscribeUrl }: WizardIncompleteProps) {
  const greeting = name ? `Hola ${name},` : 'Hola,';

  return (
    <Html lang="es">
      <Head />
      <Preview>Tu invitación quedó a medias — continúa donde lo dejaste en 2 minutos</Preview>
      <Body style={{ background: '#F5F0E8', fontFamily: 'Georgia, serif', margin: 0, padding: '32px 0' }}>
        <Container style={{ maxWidth: 600, background: '#fff', borderRadius: 8, overflow: 'hidden', margin: '0 auto' }}>

          <div style={{ background: '#0D0A07', padding: '24px 40px', textAlign: 'center' }}>
            <Text style={{ margin: 0, color: '#C4A962', fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'sans-serif' }}>
              KOMPRALO
            </Text>
          </div>

          <div style={{ padding: '40px 40px 32px' }}>
            <Text style={{ margin: '0 0 8px', fontSize: 14, color: '#6B4A35', fontFamily: 'sans-serif' }}>{greeting}</Text>
            <Text style={{ margin: '0 0 16px', fontSize: 22, fontWeight: 700, color: '#0D0A07', lineHeight: 1.3 }}>
              Tu invitación quedó casi lista ✨
            </Text>
            <Text style={{ margin: '0 0 28px', fontSize: 15, color: '#1A1612', lineHeight: 1.6, fontFamily: 'sans-serif' }}>
              Empezaste a personalizar tu invitación pero no terminaste. Son solo unos minutos más —
              tus invitados merecen una invitación tan especial como tu evento.
            </Text>

            <Button
              href={wizardUrl}
              style={{ background: '#0D0A07', color: '#F1E3C8', padding: '14px 32px', borderRadius: 8, fontSize: 15, fontWeight: 700, fontFamily: 'sans-serif', display: 'block', textAlign: 'center', textDecoration: 'none' }}
            >
              Continuar donde lo dejé →
            </Button>

            <Hr style={{ margin: '32px 0', borderColor: '#EAD7A3' }} />

            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 20 }}>
              <Text style={{ margin: 0, fontSize: 20 }}>🏆</Text>
              <div>
                <Text style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 700, color: '#166534', fontFamily: 'sans-serif' }}>Garantía de satisfacción 48 h</Text>
                <Text style={{ margin: 0, fontSize: 12, color: '#166534', fontFamily: 'sans-serif', lineHeight: 1.5 }}>
                  Si no quedas satisfecha, te devolvemos el 100% de tu dinero.
                </Text>
              </div>
            </div>

            <Text style={{ margin: 0, fontSize: 13, color: '#6B4A35', fontFamily: 'sans-serif', lineHeight: 1.6 }}>
              💬 ¿Necesitas ayuda? Escríbenos por WhatsApp y te guiamos paso a paso.
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
