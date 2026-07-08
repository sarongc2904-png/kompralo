import type { Metadata } from 'next';
import { SiteButton } from '@/components/public/Button';
import { InfoHero } from '@/components/public/InfoShell';

export const metadata: Metadata = {
  title: 'Cómo Funciona | KOMPRALO',
  description:
    'Crea tu invitación digital de boda en minutos y compártela por WhatsApp. Tú la personalizas, tu link se genera al instante.',
};

const steps = [
  {
    title: 'Elige tu plan',
    text: 'Selecciona el plan que mejor se ajuste al tipo de invitación que quieres. Pago único, sin mensualidades.',
  },
  {
    title: 'Entra al editor al instante',
    text: 'En cuanto se confirma tu pago, recibes acceso inmediato para crear tu invitación.',
  },
  {
    title: 'Personalízala tú mismo en minutos',
    text: 'Nuestro asistente te guía paso a paso: nombres, fecha, ubicación, itinerario, mesa de regalos, fotos y más. Sin conocimientos técnicos.',
  },
  {
    title: 'Publica y obtén tu link',
    text: 'Cuando estés listo, publicas tu invitación y tu enlace queda activo al momento.',
  },
  {
    title: 'Mándala por WhatsApp',
    text: 'Tus invitados la abren desde el link, sin descargar apps.',
  },
  {
    title: 'Recibe confirmaciones',
    text: 'Si tu plan lo incluye, tus invitados podrán confirmar asistencia desde la invitación.',
  },
];

export default function ComoFuncionaPage() {
  return (
    <>
      <InfoHero
        eyebrow="Cómo funciona"
        title="Tu invitación lista hoy, no en una semana"
        subtitle="Crea una invitación digital elegante en minutos: tú la personalizas, tu link se genera al instante y la compartes por WhatsApp."
      />

      <section className="mx-auto w-[min(880px,calc(100%-48px))] py-12 md:py-16">
        <ol className="m-0 grid list-none gap-5 p-0 sm:grid-cols-2">
          {steps.map((step, i) => (
            <li
              key={step.title}
              className="flex items-start gap-4 rounded-2xl border border-site-marron/10 bg-white/60 p-6 shadow-[0_10px_30px_rgba(74,59,53,0.06)]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-site-rosa-antiguo/12 font-site-serif text-lg text-site-rosa-antiguo">
                {i + 1}
              </span>
              <div>
                <h2 className="m-0 font-site-serif text-xl font-normal text-site-marron">
                  {step.title}
                </h2>
                <p className="m-0 mt-2 font-site-sans text-[0.95rem] leading-7 text-site-marron/75">
                  {step.text}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <p className="mx-auto mt-9 max-w-xl rounded-xl border border-dashed border-site-rosa-antiguo/40 bg-white/45 px-5 py-4 text-center font-site-sans text-sm leading-6 text-site-marron/75">
          ¿Necesitas hacer un cambio después? Puedes editar tu invitación cuando quieras dentro
          de la vigencia de tu plan.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <SiteButton
            href="/invitaciones#planes"
            className="w-full border-[#B87378] bg-[#B87378] text-center text-site-crema hover:border-site-rosa-antiguo hover:bg-site-rosa-antiguo sm:w-auto"
            data-event="view_plans"
            data-cta="como-funciona-planes"
          >
            Ver planes
          </SiteButton>
          <SiteButton
            href="/i/nuestrabodaarletteymayorga"
            variant="secondary"
            className="w-full border-site-rosa-antiguo/45 bg-white/40 text-center text-site-rosa-antiguo hover:bg-white/70 sm:w-auto"
            data-event="view_demo"
            data-cta="como-funciona-demo"
          >
            Ver demo real
          </SiteButton>
        </div>
      </section>
    </>
  );
}
