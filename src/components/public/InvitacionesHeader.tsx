'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

const T = {
  black:  '#000000',
  onyx:   '#050505',
  ink:    '#FFFFFF',
  cyan:   '#A67B5B',
  silver: '#E0E0E0',
  muted:  '#8A8A8A',
  glass:  'rgba(255,255,255,0.03)',
  border: 'rgba(255,255,255,0.1)',
} as const;

export function InvitacionesHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="cro-nav">
        <div className="cro-shell cro-nav-inner">
          <Link href="/invitaciones" className="cro-logo">KOMPRALO</Link>

          {/* Desktop navigation */}
          <div className="cro-nav-links">
            <Link href="#como-funciona" className="cro-nav-link" data-event="click-header-como-funciona">Cómo funciona</Link>
            <Link href="/i/nuestrabodaarletteymayorga" className="cro-nav-link" data-event="click-header-demo">Demo real</Link>
            <Link href="#planes" className="cro-nav-link" data-cta="nav-planes" data-event="click-header-planes">Ver planes</Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <Link href="/dashboard" className="cro-nav-link" style={{ color: T.ink }} data-event="click-header-acceso-cliente">Acceso cliente</Link>
            </div>
          </div>

          {/* Mobile hamburger button */}
          <button
            className="cro-mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="cro-mobile-menu">
          <Link href="#como-funciona" className="cro-mobile-menu-link" onClick={handleNavClick} data-event="click-mobile-header-como-funciona">Cómo funciona</Link>
          <Link href="/i/nuestrabodaarletteymayorga" className="cro-mobile-menu-link" onClick={handleNavClick} data-event="click-mobile-header-demo">Demo real</Link>
          <Link href="#planes" className="cro-mobile-menu-link" onClick={handleNavClick} data-event="click-mobile-header-planes">Ver planes</Link>
          <div style={{ borderTop: `1px solid ${T.border}`, marginTop: '1rem', paddingTop: '1rem' }}>
            <Link href="/dashboard" className="cro-mobile-menu-link" onClick={handleNavClick} data-event="click-mobile-header-acceso-cliente">
              Acceso cliente
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
