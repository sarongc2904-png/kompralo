import type { Metadata } from 'next';
import { SiteButton } from '@/components/public/Button';
import { buildWhatsAppHref } from '@/lib/contact';

export const metadata: Metadata = {
  title: 'Gracias | KOMPRALO',
  description: 'Gracias por contactar a KOMPRALO. Te responderemos lo antes posible.',
};

/**
 * Página de gracias para contacto/formularios. NO es la success page del
 * checkout (/checkout/success), que sigue intacta.
 */
export default function GraciasPage() {
  return (
    <section className="mx-auto flex min-h-[60svh] w-[min(680px,calc(100%-48px))] flex-col items-center justify-center py-16 text-center md:py-24">
      <p className="m-0 mb-4 font-site-sans text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-site-rosa-antiguo">
        Mensaje recibido
      </p>
      <h1 className="m-0 font-site-serif text-4xl font-normal leading-tight text-site-marron md:text-5xl">
        ¡Gracias por contactarnos!
      </h1>
      <p className="mx-auto mt-5 max-w-lg font-site-sans text-base leading-7 text-site-marron/75 md:text-lg">
        Recibimos tu interés. Si quieres una respuesta más rápida, también puedes escribirnos
        por WhatsApp.
      </p>

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <SiteButton
          href={buildWhatsAppHref()}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full border-[#B87378] bg-[#B87378] text-center text-site-crema hover:border-site-rosa-antiguo hover:bg-site-rosa-antiguo sm:w-auto"
          data-event="click-gracias-whatsapp"
        >
          Escribir por WhatsApp
        </SiteButton>
        <SiteButton
          href="/invitaciones"
          variant="secondary"
          className="w-full border-site-rosa-antiguo/45 bg-white/40 text-center text-site-rosa-antiguo hover:bg-white/70 sm:w-auto"
        >
          Volver al inicio
        </SiteButton>
      </div>

      <p className="mt-7 font-site-sans text-sm text-site-marron/60">
        Tiempo estimado de respuesta: 10 minutos dentro de nuestro horario de atención.
      </p>
    </section>
  );
}
