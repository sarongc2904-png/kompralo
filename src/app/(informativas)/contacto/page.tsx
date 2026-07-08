import type { Metadata } from 'next';
import { MessageCircle, Mail, Clock, MapPin } from 'lucide-react';
import { SiteButton } from '@/components/public/Button';
import { InfoHero } from '@/components/public/InfoShell';
import { CONTACT, MAILTO_HREF, buildWhatsAppHref } from '@/lib/contact';

export const metadata: Metadata = {
  title: 'Contacto | KOMPRALO',
  description:
    'Contáctanos por WhatsApp o correo para resolver dudas sobre invitaciones digitales de boda KOMPRALO.',
};

const quickQuestions = [
  '¿Quieres ver una demo?',
  '¿No sabes qué plan elegir?',
  '¿Quieres saber qué puedes personalizar en tu invitación?',
  '¿Ya tienes fecha de boda?',
];

function ContactCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-2xl border border-site-marron/10 bg-white/60 p-6 shadow-[0_10px_30px_rgba(74,59,53,0.06)]">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-site-rosa-antiguo/10 text-site-rosa-antiguo">
        {icon}
      </span>
      <h2 className="m-0 font-site-serif text-xl font-normal text-site-marron">{title}</h2>
      <div className="flex w-full flex-col gap-3 font-site-sans text-[0.95rem] leading-7 text-site-marron/80">
        {children}
      </div>
    </div>
  );
}

export default function ContactoPage() {
  const whatsappHref = buildWhatsAppHref();

  return (
    <>
      <InfoHero
        eyebrow="Contacto"
        title="¿Tienes dudas antes de crear tu invitación?"
        subtitle="Estamos para ayudarte a elegir el plan ideal y resolver cualquier duda sobre tu invitación digital de boda."
      />

      <section className="mx-auto w-[min(1040px,calc(100%-48px))] py-12 md:py-16">
        <div className="grid gap-5 sm:grid-cols-2">
          <ContactCard icon={<MessageCircle size={22} strokeWidth={1.6} />} title="WhatsApp">
            <p className="m-0 font-site-serif text-2xl text-site-marron">{CONTACT.whatsappDisplay}</p>
            <p className="m-0 text-sm text-site-marron/65">
              Respuesta estimada en 10 minutos dentro de nuestro horario de atención.
            </p>
            <SiteButton
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 w-full border-[#B87378] bg-[#B87378] text-center text-site-crema hover:border-site-rosa-antiguo hover:bg-site-rosa-antiguo sm:w-auto"
              data-event="click-contacto-whatsapp"
            >
              Escribir por WhatsApp
            </SiteButton>
          </ContactCard>

          <ContactCard icon={<Mail size={22} strokeWidth={1.6} />} title="Correo">
            <p className="m-0 break-all font-site-serif text-xl text-site-marron">{CONTACT.email}</p>
            <SiteButton
              href={MAILTO_HREF}
              variant="secondary"
              className="mt-1 w-full border-site-rosa-antiguo/45 bg-white/40 text-center text-site-rosa-antiguo hover:bg-white/70 sm:w-auto"
              data-event="click-contacto-correo"
            >
              Enviar correo
            </SiteButton>
          </ContactCard>

          <ContactCard icon={<Clock size={22} strokeWidth={1.6} />} title="Horario de atención">
            <p className="m-0">{CONTACT.schedule}</p>
          </ContactCard>

          <ContactCard icon={<MapPin size={22} strokeWidth={1.6} />} title="Dirección">
            <p className="m-0">{CONTACT.address}</p>
          </ContactCard>
        </div>
      </section>

      {/* Ayuda rápida */}
      <section className="border-t border-site-marron/10 bg-white/40">
        <div className="mx-auto w-[min(760px,calc(100%-48px))] py-12 text-center md:py-16">
          <h2 className="m-0 font-site-serif text-3xl font-normal text-site-marron">
            Ayuda rápida
          </h2>
          <ul className="mx-auto mt-7 flex max-w-md list-none flex-col gap-3 p-0 text-left">
            {quickQuestions.map((q) => (
              <li
                key={q}
                className="rounded-xl border border-site-marron/10 bg-site-crema px-5 py-3.5 font-site-sans text-[0.95rem] text-site-marron/85"
              >
                {q}
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <SiteButton
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="border-[#B87378] bg-[#B87378] text-site-crema hover:border-site-rosa-antiguo hover:bg-site-rosa-antiguo"
              data-event="click-contacto-soporte"
            >
              Hablar con soporte
            </SiteButton>
          </div>
        </div>
      </section>
    </>
  );
}
