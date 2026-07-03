import Link from 'next/link';
import type { ReactNode } from 'react';

const supportWhatsAppNumber = process.env.SUPPORT_WHATSAPP_NUMBER?.replace(/\D/g, '') ?? '';
const supportWhatsAppHref = supportWhatsAppNumber
  ? `https://wa.me/${supportWhatsAppNumber}?text=${encodeURIComponent('Hola, necesito ayuda con mi invitación KOMPRALO.')}`
  : null;

const footerNavigationLinks = [
  { href: '#como-funciona', label: 'Cómo funciona' },
  { href: '#planes', label: 'Planes' },
] as const;

const footerAccountLinks = [
  { href: '/login', label: 'Acceder' },
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

  return (
    <footer className="border-t border-site-crema/10 bg-site-marron py-14 text-site-crema md:py-16">
      <div className="cro-shell">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.25fr_0.8fr_0.8fr_1fr]">
          <div>
            <Link href="/" className="font-site-serif text-3xl font-semibold tracking-[-0.02em] text-site-crema no-underline">
              KOMPRALO
            </Link>
            <p className="mt-4 max-w-sm font-site-sans text-sm leading-6 text-site-crema/70">
              Invitaciones digitales elegantes para bodas, listas para compartir por WhatsApp.
            </p>
          </div>

          <FooterColumn title="Navegación">
            {footerNavigationLinks.map((link) => (
              <FooterLink key={link.href} href={link.href}>
                {link.label}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title="Legales">
            {footerAccountLinks.map((link) => (
              <FooterLink key={link.href} href={link.href}>
                {link.label}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title="Contacto">
            {supportWhatsAppHref ? (
              <a
                href={supportWhatsAppHref}
                className="font-site-sans text-sm text-site-crema/80 no-underline transition-colors duration-300 hover:text-[#E8B8BE]"
                target="_blank"
                rel="noreferrer"
              >
                Soporte por WhatsApp
              </a>
            ) : (
              <span className="font-site-sans text-sm text-site-crema/65">Soporte por WhatsApp</span>
            )}
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
