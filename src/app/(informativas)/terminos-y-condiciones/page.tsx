import type { Metadata } from 'next';
import {
  InfoHero,
  LegalArticle,
  LegalSection,
  LegalList,
  LegalContactBlock,
} from '@/components/public/InfoShell';

export const metadata: Metadata = {
  title: 'Términos y Condiciones | KOMPRALO',
  description:
    'Consulta las condiciones de uso y contratación de invitaciones digitales de boda KOMPRALO.',
};

export default function TerminosYCondicionesPage() {
  return (
    <>
      <InfoHero eyebrow="Legal" title="Términos y Condiciones" />
      <LegalArticle>
        <LegalSection title="1. Descripción del servicio">
          <p className="m-0">
            KOMPRALO es una plataforma en línea que permite crear, personalizar y publicar
            invitaciones digitales de boda, diseñadas para compartirse mediante un link,
            principalmente por WhatsApp. El cliente personaliza su invitación directamente en el
            editor de la plataforma y obtiene su enlace de forma inmediata tras la contratación.
          </p>
        </LegalSection>

        <LegalSection title="2. Planes y precios">
          <p className="m-0">
            Los planes, precios y beneficios disponibles son los publicados en el sitio web al
            momento de la contratación. El servicio se contrata mediante pago único y cada plan
            incluye las secciones y funciones descritas en el sitio.
          </p>
        </LegalSection>

        <LegalSection title="3. Información capturada por el cliente">
          <p className="m-0">
            El cliente es responsable de la exactitud de la información que capture en su
            invitación, incluyendo:
          </p>
          <LegalList
            items={[
              'Nombres.',
              'Fecha.',
              'Hora.',
              'Ubicación.',
              'Itinerario.',
              'Mesa de regalos.',
              'Fotografías.',
              'Textos.',
              'Canciones.',
              'Datos de invitados, si aplica.',
            ]}
          />
        </LegalSection>

        <LegalSection title="4. Personalización y alcance del plan">
          <p className="m-0">
            La personalización se realiza directamente por el cliente mediante el editor de la
            plataforma, dentro de las secciones y funciones incluidas en el plan contratado. No se
            consideran parte del servicio los rediseños fuera de las opciones del editor,
            funcionalidades nuevas o solicitudes que no formen parte del plan contratado, salvo
            acuerdo previo por escrito.
          </p>
        </LegalSection>

        <LegalSection title="5. Entrega y vigencia">
          <p className="m-0">
            El acceso a la plataforma y el enlace de la invitación se entregan de forma inmediata
            tras la confirmación del pago. La invitación permanece activa conforme a la vigencia
            publicada en el sitio para el plan contratado.
          </p>
        </LegalSection>

        <LegalSection title="6. Pagos">
          <p className="m-0">
            El servicio se contrata mediante pago único, salvo que en el sitio se indique
            expresamente otra condición. Los pagos se procesan a través de pasarelas de pago de
            terceros.
          </p>
        </LegalSection>

        <LegalSection title="7. Uso de materiales cargados por el cliente">
          <p className="m-0">
            El cliente declara contar con autorización para usar fotografías, textos, canciones,
            nombres, marcas o cualquier material que cargue en su invitación.
          </p>
        </LegalSection>

        <LegalSection title="8. Disponibilidad del servicio">
          <p className="m-0">
            KOMPRALO buscará mantener disponible el acceso a las invitaciones digitales, aunque
            pueden existir interrupciones temporales por mantenimiento, proveedores externos,
            fallas técnicas o causas fuera de nuestro control.
          </p>
        </LegalSection>

        <LegalSection title="9. Uso adecuado">
          <p className="m-0">
            No está permitido usar la plataforma para publicar contenido ilegal, ofensivo,
            fraudulento o que vulnere derechos de terceros. KOMPRALO puede suspender invitaciones
            que incumplan esta condición.
          </p>
        </LegalSection>

        <LegalSection title="10. Limitación de responsabilidad">
          <p className="m-0">
            KOMPRALO no garantiza una disponibilidad perfecta ni resultados específicos derivados
            del uso del servicio. La responsabilidad de KOMPRALO se limita, en cualquier caso, al
            monto pagado por el plan contratado.
          </p>
        </LegalSection>

        <LegalSection title="11. Contacto">
          <LegalContactBlock />
        </LegalSection>
      </LegalArticle>
    </>
  );
}
