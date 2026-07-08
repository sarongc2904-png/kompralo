import Link from 'next/link';
import type { ReactNode } from 'react';
import { CONTACT, buildWhatsAppHref, MAILTO_HREF } from '@/lib/contact';

const footerNavigationLinks = [
  { href: '/invitaciones', label: 'Inicio' },
  { href: '/i/nuestrabodaarletteymayorga', label: 'Demo real' },
  { href: '/invitaciones#planes', label: 'Planes' },
  { href: '/como-funciona', label: 'Cómo funciona' },
  { href: '/contacto', label: 'Contacto' },
  { href: '/login', label: 'Acceder' },
] as const;

const footerLegalLinks = [
  { href: '/aviso-de-privacidad', label: 'Aviso de privacidad' },
  { href: '/politica-de-cookies', label: 'Política de cookies' },
  { href: '/terminos-y-condiciones', label: 'Términos y condiciones' },
  { href: '/politica-de-reembolsos', label: 'Política de reembolsos' },
] as const;

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="font-site-sans text-sm text-site-crema/80 no-underline transition-colors duration-300 hover:text-[#E8B8BE]"
    >
      {children}
    </Link>
  );
}

function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="mb-4 font-site-sans text-xs font-bold uppercase tracking-[0.15em] text-site-crema/55">
        {title}
      </h3>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

export function InvitacionesFooter() {
  const year = new Date().getFullYear();
  const whatsappHref = buildWhatsAppHref();

  return (
    <footer className="border-t border-site-crema/10 bg-site-marron py-14 text-site-crema md:py-16">
      <div className="cro-shell">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.25fr_1fr_0.8fr_0.9fr]">
          <div>
            <Link href="/" className="font-site-serif text-3xl font-semibold tracking-[-0.02em] text-site-crema no-underline">
              KOMPRALO
            </Link>
            <p className="mt-4 max-w-sm font-site-sans text-sm leading-6 text-site-crema/70">
              Invitaciones digitales de boda para compartir por WhatsApp.
            </p>
          </div>

          <FooterColumn title="Contacto">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="font-site-sans text-sm text-site-crema/80 no-underline transition-colors duration-300 hover:text-[#E8B8BE]"
            >
              WhatsApp: {CONTACT.whatsappDisplay}
            </a>
            <a
              href={MAILTO_HREF}
              className="font-site-sans text-sm text-site-crema/80 no-underline transition-colors duration-300 hover:text-[#E8B8BE]"
            >
              {CONTACT.email}
            </a>
            <span className="font-site-sans text-sm leading-6 text-site-crema/65">
              {CONTACT.schedule}
            </span>
            <span className="font-site-sans text-sm leading-6 text-site-crema/65">
              {CONTACT.address}
            </span>
          </FooterColumn>

          <FooterColumn title="Enlaces">
            {footerNavigationLinks.map((link) => (
              <FooterLink key={link.href} href={link.href}>
                {link.label}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title="Legal">
            {footerLegalLinks.map((link) => (
              <FooterLink key={link.href} href={link.href}>
                {link.label}
              </FooterLink>
            ))}
          </FooterColumn>
        </div>

        <div className="mt-12 border-t border-site-crema/10 pt-6">
          <p className="font-site-sans text-xs font-semibold uppercase tracking-[0.15em] text-site-crema/55">
            © {year} KOMPRALO. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
