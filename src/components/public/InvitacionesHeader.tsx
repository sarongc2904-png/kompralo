'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { SiteButton } from '@/components/public/Button';

const navLinks = [
  { href: '#como-funciona', label: 'Cómo funciona', event: 'click-header-como-funciona', cta: undefined },
  { href: '/i/nuestrabodaarletteymayorga', label: 'Demo real', event: 'click-header-demo', cta: undefined },
  { href: '#planes', label: 'Ver planes', event: 'click-header-planes', cta: 'nav-planes' },
] as const;

const mobileNavLinks = [
  { href: '#como-funciona', label: 'Cómo funciona', event: 'click-mobile-header-como-funciona' },
  { href: '/i/nuestrabodaarletteymayorga', label: 'Demo real', event: 'click-mobile-header-demo' },
  { href: '#planes', label: 'Ver planes', event: 'click-mobile-header-planes' },
] as const;

export function InvitacionesHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="sticky top-0 z-[1000] border-b border-site-border-subtle bg-site-crema/80 py-3.5 backdrop-blur-md transition-all duration-300">
        <div className="cro-shell flex items-center justify-between gap-6">
          <Link
            href="/invitaciones"
            className="font-site-serif text-[1.35rem] font-semibold tracking-[-0.01em] text-site-marron no-underline transition-colors duration-300 hover:text-site-rosa-antiguo"
          >
            KOMPRALO
          </Link>

          <div className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-site-sans text-sm font-semibold text-site-marron no-underline transition-colors duration-300 hover:text-site-rosa-antiguo"
                data-cta={link.cta}
                data-event={link.event}
              >
                {link.label}
              </Link>
            ))}
            <SiteButton href="/dashboard" data-event="click-header-acceso-cliente">
              Acceso cliente
            </SiteButton>
          </div>

          <button
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-site-border-subtle bg-site-blanco/60 text-site-marron transition-colors duration-300 hover:text-site-rosa-antiguo lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-[73px] z-[999] border-b border-site-border-subtle bg-site-crema px-5 py-6 shadow-[0_20px_45px_rgba(74,59,53,0.12)] lg:hidden">
          <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-1">
            {mobileNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-site-serif text-3xl font-semibold text-site-marron no-underline transition-colors duration-300 hover:text-site-rosa-antiguo"
                onClick={handleNavClick}
                data-event={link.event}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-5 border-t border-site-border-subtle pt-5">
              <SiteButton href="/dashboard" onClick={handleNavClick} data-event="click-mobile-header-acceso-cliente">
                Acceso cliente
              </SiteButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
