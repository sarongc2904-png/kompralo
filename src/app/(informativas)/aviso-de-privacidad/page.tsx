import type { Metadata } from 'next';
import Link from 'next/link';
import {
  InfoHero,
  LegalArticle,
  LegalIntro,
  LegalSection,
  LegalList,
  LegalContactBlock,
  LegalUpdatedAt,
} from '@/components/public/InfoShell';

export const metadata: Metadata = {
  title: 'Aviso de Privacidad | KOMPRALO',
  description:
    'Conoce cómo KOMPRALO recopila, usa y protege tus datos personales al contratar invitaciones digitales de boda.',
};

export default function AvisoDePrivacidadPage() {
  return (
    <>
      <InfoHero eyebrow="Legal" title="Aviso de Privacidad" />
      <LegalArticle>
        <LegalIntro>
          KOMPRALO, con domicilio en Av. Independencia No. 1312, Sector Centro, C.P. 88000,
          Nuevo Laredo, Tamaulipas, México, es responsable del tratamiento de los datos
          personales que nos proporciones a través de nuestro sitio web, WhatsApp, correo
          electrónico, formularios o cualquier otro medio de contacto.
        </LegalIntro>

        <LegalSection title="1. Datos personales que podemos recopilar">
          <LegalList
            items={[
              'Nombre de la persona contratante.',
              'Teléfono.',
              'Correo electrónico.',
              'Datos relacionados con el evento.',
              'Nombres de los novios.',
              'Fecha, hora y ubicación de la boda.',
              'Información de itinerario, hospedaje, mesa de regalos, código de vestimenta y otros detalles del evento que el cliente capture en su invitación.',
              'Fotografías, textos, canciones, mensajes o materiales que el cliente decida cargar para personalizar su invitación.',
              'Datos de invitados cuando el servicio contratado incluya confirmación de asistencia.',
              'Información de pago procesada por terceros autorizados (pasarelas de pago); KOMPRALO no almacena datos bancarios completos.',
            ]}
          />
        </LegalSection>

        <LegalSection title="2. Finalidades del tratamiento">
          <LegalList
            items={[
              'Operar la plataforma de creación, personalización y publicación de invitaciones digitales.',
              'Contactar al cliente para seguimiento y soporte.',
              'Gestionar confirmaciones de asistencia si el plan lo incluye.',
              'Procesar solicitudes, pagos, aclaraciones y soporte.',
              'Mejorar la experiencia del sitio.',
              'Enviar información relacionada con el servicio contratado.',
              'Realizar medición publicitaria y analítica cuando aplique.',
            ]}
          />
        </LegalSection>

        <LegalSection title="3. Uso de datos de invitados">
          <p className="m-0">
            Cuando el cliente capture datos de invitados o estos confirmen asistencia mediante
            una invitación digital, dicha información se utilizará únicamente para operar las
            funciones relacionadas con el evento, como registro de asistencia, acompañantes,
            mensajes o confirmaciones.
          </p>
        </LegalSection>

        <LegalSection title="4. Transferencias y terceros">
          <p className="m-0">
            Para operar el servicio podemos apoyarnos en proveedores necesarios, como servicios
            de hosting, pasarelas de pago, herramientas de analítica, plataformas de publicidad
            como Meta, servicios de mensajería, correo o WhatsApp, y herramientas de soporte.
            Estos proveedores tratan la información únicamente para prestar sus servicios.
          </p>
        </LegalSection>

        <LegalSection title="5. Derechos ARCO">
          <p className="m-0">
            Puedes solicitar el acceso, rectificación, cancelación u oposición al tratamiento de
            tus datos personales enviando un correo a soporte@kompralo.com.mx.
          </p>
        </LegalSection>

        <LegalSection title="6. Cookies y tecnologías de seguimiento">
          <p className="m-0">
            Este sitio puede usar cookies, Meta Pixel, herramientas de analítica o tecnologías
            similares para mejorar la experiencia, medir resultados y mostrar anuncios
            relacionados. Consulta nuestra{' '}
            <Link href="/politica-de-cookies" className="font-semibold text-site-rosa-antiguo underline-offset-2 hover:underline">
              Política de Cookies
            </Link>{' '}
            para más detalle.
          </p>
        </LegalSection>

        <LegalSection title="7. Cambios al aviso de privacidad">
          <p className="m-0">
            Podremos actualizar este Aviso de Privacidad cuando sea necesario. Cualquier cambio
            será publicado en esta misma página.
          </p>
        </LegalSection>

        <LegalSection title="8. Contacto">
          <LegalContactBlock />
        </LegalSection>

        <LegalUpdatedAt>Última actualización: julio de 2026</LegalUpdatedAt>
      </LegalArticle>
    </>
  );
}
