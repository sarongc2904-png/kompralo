'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { SiteButton } from '@/components/public/Button';
import { useKompraloCart } from '@/components/cart/useKompraloCart';

/** Icono de carrito sobrio en currentColor — consistente con el candado de los
 *  botones de pago (trazo, no emoji). */
function CartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="20" r="1.4" />
      <circle cx="18" cy="20" r="1.4" />
      <path d="M2.5 3h2.2l2.3 12.2a1.6 1.6 0 0 0 1.6 1.3h8.4a1.6 1.6 0 0 0 1.6-1.3L21.5 7H6.2" />
    </svg>
  );
}

/**
 * Enlace al carrito con burbuja de conteo. SSR-safe: useKompraloCart arranca
 * en [] y se hidrata tras montar (evita hydration mismatch); el CustomEvent del
 * hook mantiene el badge en vivo al agregar/quitar. Con carrito vacío se muestra
 * solo el icono (más limpio y descubrible que ocultarlo — decisión reportada).
 */
function CartLink({ onClick }: { onClick?: () => void }) {
  const { items } = useKompraloCart();
  const count = items.length;
  return (
    <Link
      href="/invitaciones/precios"
      onClick={onClick}
      data-event="ClickCart"
      aria-label={count > 0 ? `Carrito, ${count} ${count === 1 ? 'artículo' : 'artículos'}` : 'Carrito'}
      className="relative inline-flex h-11 w-11 items-center justify-center rounded-full text-site-marron no-underline transition-colors duration-300 hover:text-site-rosa-antiguo"
    >
      <CartIcon />
      {count > 0 && (
        <span className="absolute right-1 top-1 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-site-rosa-antiguo px-1 text-[11px] font-bold leading-none text-site-crema">
          {count}
        </span>
      )}
    </Link>
  );
}

const navLinks = [
  { href: '/invitaciones#como-funciona', label: 'Cómo funciona', event: 'click-header-como-funciona', cta: undefined },
  { href: '/i/nuestrabodaarletteymayorga', label: 'Demo real', event: 'click-header-demo', cta: undefined },
  { href: '/invitaciones#planes', label: 'Ver planes', event: 'click-header-planes', cta: 'nav-planes' },
  { href: '/login', label: 'Iniciar sesión', event: 'click-header-login', cta: undefined },
] as const;

const mobileNavLinks = [
  { href: '/invitaciones#como-funciona', label: 'Cómo funciona', event: 'click-mobile-header-como-funciona' },
  { href: '/i/nuestrabodaarletteymayorga', label: 'Demo real', event: 'click-mobile-header-demo' },
  { href: '/invitaciones#planes', label: 'Ver planes', event: 'click-mobile-header-planes' },
  { href: '/login', label: 'Iniciar sesión', event: 'click-mobile-header-login' },
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
            <CartLink />
            <SiteButton href="/dashboard" data-event="click-header-acceso-cliente">
              Acceso cliente
            </SiteButton>
          </div>

          <div className="flex items-center gap-1 lg:hidden">
            <CartLink />
            <button
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-site-border-subtle bg-site-blanco/60 text-site-marron transition-colors duration-300 hover:text-site-rosa-antiguo"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
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
