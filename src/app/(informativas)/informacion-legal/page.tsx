import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import {
  InfoHero,
  LegalArticle,
  LegalIntro,
  LegalSection,
  LegalContactBlock,
  LegalUpdatedAt,
} from '@/components/public/InfoShell';

export const metadata: Metadata = {
  title: 'Información Legal | KOMPRALO',
  description:
    'Identificación del titular y datos legales del negocio responsable de KOMPRALO, invitaciones digitales de boda.',
};

/** Fila etiqueta/valor del bloque de identificación del titular. */
function DatoLegal({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="m-0 mb-1 font-site-sans text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-site-rosa-antiguo">
        {label}
      </p>
      <p className="m-0 font-site-serif text-xl leading-snug text-site-marron md:text-2xl">
        {children}
      </p>
    </div>
  );
}

export default function InformacionLegalPage() {
  return (
    <>
      <InfoHero
        eyebrow="Legal"
        title="Información Legal"
        subtitle="Datos de identificación del negocio responsable de la plataforma KOMPRALO."
      />
      <LegalArticle>
        <LegalIntro>
          KOMPRALO es una plataforma de invitaciones digitales de boda operada por la persona
          física que se identifica a continuación. Esta página se publica para verificación de
          identidad del negocio y transparencia frente a clientes, proveedores y plataformas de
          pago y publicidad.
        </LegalIntro>

        <LegalSection title="Identificación del titular">
          <div className="flex flex-col gap-6 rounded-2xl border border-site-marron/10 bg-white/55 p-6 md:p-8">
            <DatoLegal label="Titular">José Iván Gómez Mayorga</DatoLegal>
            <DatoLegal label="Nombre comercial">Soluciones Tecnológicas</DatoLegal>
            <DatoLegal label="Ubicación">Tuxtla Gutiérrez, Chiapas, México</DatoLegal>
          </div>
        </LegalSection>

        <LegalSection title="Actividad">
          <p className="m-0">
            Servicios digitales: desarrollo de software, plataformas SaaS, CRM, automatización y
            consultoría en publicidad digital. A través de la marca KOMPRALO se comercializan
            invitaciones digitales de boda.
          </p>
        </LegalSection>

        <LegalSection title="Contacto">
          <LegalContactBlock />
        </LegalSection>

        <LegalUpdatedAt>Última actualización: agosto de 2026</LegalUpdatedAt>
      </LegalArticle>
    </>
  );
}
