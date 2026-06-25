import {
  Html, Body, Container, Text, Button, Hr, Link, Head, Preview,
} from '@react-email/components';

export interface InvitationNotPublishedProps {
  name?: string;
  dashboardUrl: string;
  whatsappUrl: string;
  unsubscribeUrl: string;
}

export const subject = '¿Todo bien con tu invitación? 👀';

export default function InvitationNotPublished({ name, dashboardUrl, whatsappUrl, unsubscribeUrl }: InvitationNotPublishedProps) {
  const greeting = name ? `Hola ${name},` : 'Hola,';

  return (
    <Html lang="es">
      <Head />
      <Preview>Tu invitación sigue en borrador — publícala y empieza a recibir confirmaciones</Preview>
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
              Tu invitación sigue en borrador 👀
            </Text>
            <Text style={{ margin: '0 0 24px', fontSize: 15, color: '#1A1612', lineHeight: 1.6, fontFamily: 'sans-serif' }}>
              Notamos que creaste tu invitación pero aún no la has publicado. Tus invitados no pueden verla todavía.
            </Text>

            {/* Checklist */}
            <div style={{ background: '#FAF7F2', border: '1px solid #EAD7A3', borderRadius: 8, padding: '16px 20px', marginBottom: 28 }}>
              <Text style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: '#0D0A07', fontFamily: 'sans-serif' }}>
                Antes de publicar, revisa:
              </Text>
              {[
                'Foto de portada lista',
                'Fecha y lugar del evento correctos',
                'Formulario RSVP activado',
                'Música o video de fondo (si aplica)',
              ].map((item) => (
                <Text key={item} style={{ margin: '0 0 6px', fontSize: 13, color: '#1A1612', fontFamily: 'sans-serif' }}>
                  ☐ {item}
                </Text>
              ))}
            </div>

            <Button
              href={dashboardUrl}
              style={{ background: '#0D0A07', color: '#F1E3C8', padding: '14px 32px', borderRadius: 8, fontSize: 15, fontWeight: 700, fontFamily: 'sans-serif', display: 'block', textAlign: 'center', textDecoration: 'none', marginBottom: 12 }}
            >
              Publicar mi invitación →
            </Button>

            <Button
              href={whatsappUrl}
              style={{ background: '#25D366', color: '#fff', padding: '12px 32px', borderRadius: 8, fontSize: 14, fontWeight: 600, fontFamily: 'sans-serif', display: 'block', textAlign: 'center', textDecoration: 'none' }}
            >
              💬 Pedir ayuda por WhatsApp
            </Button>

            <Hr style={{ margin: '32px 0', borderColor: '#EAD7A3' }} />

            <Text style={{ margin: 0, fontSize: 13, color: '#6B4A35', fontFamily: 'sans-serif', lineHeight: 1.6 }}>
              Una vez publicada, tus invitados podrán confirmar su asistencia desde cualquier celular, sin instalar ninguna app.
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
