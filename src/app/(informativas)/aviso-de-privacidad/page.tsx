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
          KOMPRALO, con domicilio en Av. Rosa del Norte 4, Col. Infonavit El Rosario, C.P. 29049,
          Tuxtla Gutiérrez, Chiapas, México, es responsable del tratamiento de los datos
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

        <LegalSection title="9. Servicio de CRM y atención por WhatsApp">
          <p className="m-0">
            Soluciones Tecnológicas (José Iván Gómez Mayorga) opera una plataforma de CRM y
            atención a clientes por WhatsApp (Vocero), utilizada por negocios para gestionar la
            comunicación con sus propios clientes mediante WhatsApp Business Platform de Meta.
          </p>

          <p className="m-0">
            <strong>Datos que se reciben.</strong> Cuando una persona se comunica mediante
            WhatsApp con un negocio que utiliza la plataforma, pueden recibirse y almacenarse
            datos como su número telefónico, nombre de perfil de WhatsApp, contenido de los
            mensajes, archivos o documentos enviados, así como la fecha y hora de las
            comunicaciones.
          </p>

          <p className="m-0">
            <strong>Finalidades.</strong> Estos datos se utilizan para permitir que el negocio
            atienda, administre y dé seguimiento a las conversaciones con sus clientes, gestione
            citas, mantenga un historial de atención y proporcione los servicios solicitados.
            Algunas respuestas pueden ser generadas o asistidas automáticamente mediante
            sistemas de inteligencia artificial. El personal autorizado del negocio puede
            intervenir en las conversaciones cuando la operación del servicio así lo requiera.
          </p>

          <p className="m-0">
            <strong>Responsabilidades.</strong> El negocio que utiliza la plataforma determina
            las finalidades para las cuales trata los datos personales de sus clientes y es
            responsable de dicho tratamiento conforme a la legislación aplicable. Soluciones
            Tecnológicas procesa los datos necesarios para prestar y operar la plataforma por
            cuenta del negocio y no vende los datos personales de los usuarios.
          </p>

          <p className="m-0">
            <strong>Proveedores y terceros.</strong> Para la prestación del servicio pueden
            intervenir proveedores tecnológicos necesarios para la transmisión, procesamiento y
            almacenamiento de información, incluyendo Meta Platforms, Inc., a través de WhatsApp
            Business Platform, así como proveedores de infraestructura, hosting, bases de datos y
            servicios tecnológicos utilizados para operar la plataforma.
          </p>

          <p className="m-0">
            <strong>Conservación.</strong> Las conversaciones y datos asociados podrán conservarse
            mientras la cuenta del negocio permanezca activa y hasta 90 días después de su baja.
            Una vez concluido dicho plazo, los datos serán eliminados o anonimizados cuando ya no
            sean necesarios para las finalidades que justificaron su tratamiento, salvo aquellos
            que deban conservarse o bloquearse durante un periodo adicional para cumplir
            obligaciones legales, contractuales o atender posibles responsabilidades.
          </p>

          <p className="m-0">
            <strong>Eliminación y derechos ARCO.</strong> Las personas que hayan interactuado con
            un negocio que utiliza esta plataforma pueden solicitar el acceso, rectificación,
            cancelación u oposición respecto de sus datos personales conforme a la sección 5 de
            este Aviso de Privacidad. También pueden solicitar la eliminación de sus datos
            mediante la página{' '}
            <Link href="/eliminacion-de-datos" className="font-semibold text-site-rosa-antiguo underline-offset-2 hover:underline">
              Eliminación de datos
            </Link>{' '}
            o escribiendo a soporte@kompralo.com.mx.
          </p>
        </LegalSection>

        <LegalUpdatedAt>Última actualización: octubre de 2026</LegalUpdatedAt>
      </LegalArticle>
    </>
  );
}
