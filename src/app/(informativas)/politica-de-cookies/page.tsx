import type { Metadata } from 'next';
import Link from 'next/link';
import {
  InfoHero,
  LegalArticle,
  LegalSection,
  LegalList,
  LegalContactBlock,
} from '@/components/public/InfoShell';

export const metadata: Metadata = {
  title: 'Política de Cookies | KOMPRALO',
  description:
    'Conoce cómo KOMPRALO utiliza cookies y tecnologías similares para mejorar la experiencia del sitio y medir campañas.',
};

export default function PoliticaDeCookiesPage() {
  return (
    <>
      <InfoHero eyebrow="Legal" title="Política de Cookies" />
      <LegalArticle>
        <LegalSection title="1. ¿Qué son las cookies?">
          <p className="m-0">
            Las cookies son pequeños archivos o tecnologías que se guardan en tu navegador y que
            ayudan a recordar tus preferencias, medir visitas y mejorar tu experiencia al usar el
            sitio.
          </p>
        </LegalSection>

        <LegalSection title="2. Tipos de cookies que podemos usar">
          <LegalList
            items={[
              'Cookies necesarias: permiten el funcionamiento básico del sitio, incluida la cookie de acceso a tu invitación.',
              'Cookies de análisis: nos ayudan a entender cómo se usa el sitio.',
              'Cookies de publicidad: sirven para medir campañas, eventos y mostrar anuncios relevantes.',
              'Cookies de funcionalidad: recuerdan preferencias o mejoran la navegación.',
            ]}
          />
        </LegalSection>

        <LegalSection title="3. Meta Pixel y herramientas de medición">
          <p className="m-0">
            Podemos utilizar herramientas como Meta Pixel u otras tecnologías similares para medir
            el rendimiento de nuestras campañas, entender acciones dentro del sitio y mejorar la
            relevancia de nuestros anuncios.
          </p>
        </LegalSection>

        <LegalSection title="4. Cómo controlar cookies">
          <p className="m-0">
            Puedes configurar o bloquear las cookies desde los ajustes de tu navegador en cualquier
            momento. Toma en cuenta que bloquear las cookies necesarias puede afectar funciones del
            sitio, como el acceso a tu invitación.
          </p>
        </LegalSection>

        <LegalSection title="5. Relación con el aviso de privacidad">
          <p className="m-0">
            El uso de cookies forma parte del tratamiento de datos descrito en nuestro{' '}
            <Link href="/aviso-de-privacidad" className="font-semibold text-site-rosa-antiguo underline-offset-2 hover:underline">
              Aviso de Privacidad
            </Link>
            .
          </p>
        </LegalSection>

        <LegalSection title="6. Contacto">
          <LegalContactBlock />
        </LegalSection>
      </LegalArticle>
    </>
  );
}
