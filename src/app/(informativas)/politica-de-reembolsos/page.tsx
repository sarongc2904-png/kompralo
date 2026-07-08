import type { Metadata } from 'next';
import {
  InfoHero,
  LegalArticle,
  LegalSection,
  LegalContactBlock,
} from '@/components/public/InfoShell';

export const metadata: Metadata = {
  title: 'Política de Reembolsos | KOMPRALO',
  description:
    'Consulta las condiciones de cancelaciones, cambios y reembolsos para invitaciones digitales KOMPRALO.',
};

export default function PoliticaDeReembolsosPage() {
  return (
    <>
      <InfoHero eyebrow="Legal" title="Política de Reembolsos" />
      <LegalArticle>
        <LegalSection title="1. Naturaleza del servicio">
          <p className="m-0">
            KOMPRALO es un producto digital con acceso inmediato: al confirmar tu pago, obtienes
            al instante acceso al editor y al enlace de tu invitación. Por esta razón, las
            condiciones de reembolso dependen del acceso y uso de la plataforma.
          </p>
        </LegalSection>

        <LegalSection title="2. Solicitudes antes de usar la plataforma">
          <p className="m-0">
            Si realizaste un pago y aún no has ingresado al editor ni publicado tu invitación,
            puedes solicitar revisión de reembolso escribiendo a soporte@kompralo.com.mx o por
            WhatsApp. Evaluaremos cada caso de forma individual.
          </p>
        </LegalSection>

        <LegalSection title="3. Cuando ya se otorgó y utilizó el acceso">
          <p className="m-0">
            Una vez que has ingresado al editor, personalizado información o publicado tu
            invitación, el pago puede no ser reembolsable debido a la naturaleza digital del
            servicio y a que el acceso ya fue otorgado y utilizado.
          </p>
        </LegalSection>

        <LegalSection title="4. Errores atribuibles a KOMPRALO">
          <p className="m-0">
            Si existe una falla técnica atribuible a KOMPRALO que impida usar las funciones
            incluidas en tu plan, realizaremos las correcciones necesarias sin costo adicional.
            Si la falla no puede resolverse, evaluaremos el reembolso correspondiente.
          </p>
        </LegalSection>

        <LegalSection title="5. Errores en información capturada por el cliente">
          <p className="m-0">
            La información de la invitación es capturada y editable por el propio cliente desde el
            editor, por lo que puede corregirla en cualquier momento dentro de la vigencia de su
            plan. Estos casos no constituyen motivo de reembolso.
          </p>
        </LegalSection>

        <LegalSection title="6. Cómo solicitar una aclaración">
          <LegalContactBlock />
          <p className="m-0 text-sm text-site-marron/65">
            Tiempo estimado de respuesta: 10 minutos dentro del horario de atención (lunes a
            sábado de 9:00 a.m. a 7:00 p.m.).
          </p>
        </LegalSection>
      </LegalArticle>
    </>
  );
}
