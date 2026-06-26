'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignOutButton } from '@/components/auth/SignOutButton';
import { useState } from 'react';

const NAV = [
  { href: '/admin',                 label: 'Resumen',          icon: '⊞' },
  { href: '/admin/orders',          label: 'Órdenes',          icon: '◫' },
  { href: '/admin/invitations',     label: 'Invitaciones',     icon: '✉' },
  { href: '/admin/invitations/new', label: 'Crear invitación', icon: '+' },
  { href: '/admin/recovery',        label: 'Recuperar compra', icon: '↺' },
  { href: '/admin/users',           label: 'Usuarios',         icon: '◎' },
  { href: '/admin/logs',            label: 'Logs',             icon: '≡' },
];

interface AdminSidebarProps {
  email: string;
  role: string;
}

export default function AdminSidebar({ email, role }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  function isActive(href: string): boolean {
    if (href === '/admin') return pathname === '/admin';
    return pathname === href || pathname.startsWith(href + '/');
  }

  return (
    <>
      <style>{`
        .adm-nav-link:hover { background: rgba(200,169,91,0.08) !important; color: rgba(255,255,255,0.9) !important; }
        .adm-footer-link:hover { color: rgba(255,255,255,0.7) !important; }
        @media (max-width: 768px) {
          .adm-sidebar {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            bottom: 0 !important;
            z-index: 1000 !important;
            transform: translateX(-100%);
            transition: transform 0.3s ease-in-out;
            display: flex !important;
          }
          .adm-sidebar.open {
            transform: translateX(0) !important;
          }
          .adm-mobile-header {
            display: flex !important;
          }
          .adm-mobile-backdrop {
            display: block !important;
          }
          .adm-close-btn {
            display: block !important;
          }
        }

        .adm-mobile-header {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 56px;
          background: #1C1713;
          border-bottom: 1px solid rgba(200,169,91,0.2);
          z-index: 999;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.25rem;
        }

        .adm-mobile-backdrop {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(4px);
          z-index: 998;
        }
      `}</style>

      {/* Mobile Top Header */}
      <div className="adm-mobile-header">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '.55rem', fontWeight: 900, letterSpacing: '.2em', textTransform: 'uppercase', color: '#C8A95B' }}>
            Kompralo
          </span>
          <span style={{ fontSize: '.85rem', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.1 }}>
            Admin
          </span>
        </div>
        <button
          onClick={() => setIsMobileOpen(true)}
          style={{
            background: 'none',
            border: 'none',
            color: '#C8A95B',
            fontSize: '1.5rem',
            cursor: 'pointer',
            padding: '.25rem .5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Abrir menú"
        >
          ☰
        </button>
      </div>

      {/* Backdrop (mobile only) */}
      {isMobileOpen && (
        <div
          className="adm-mobile-backdrop"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`adm-sidebar ${isMobileOpen ? 'open' : ''}`}
        style={{
          width: 260,
          flexShrink: 0,
          background: '#1C1713',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100dvh',
          overflow: 'auto',
          borderRight: '1px solid rgba(200,169,91,0.15)',
        }}
      >
        {/* Brand */}
        <div style={{
          padding: '1.5rem 1.25rem 1.25rem',
          borderBottom: '1px solid rgba(200,169,91,0.15)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}>
          <div>
            <p style={{
              fontSize: '.6rem',
              fontWeight: 900,
              letterSpacing: '.28em',
              textTransform: 'uppercase',
              color: '#C8A95B',
              textShadow: '0 0 10px rgba(200,169,91,0.25)',
              margin: '0 0 .375rem',
            }}>
              Kompralo
            </p>
            <p style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: '#FFFFFF',
              margin: '0 0 .125rem',
              lineHeight: 1.2,
            }}>
              Admin
            </p>
            <p style={{
              fontSize: '.7rem',
              color: 'rgba(255,255,255,0.35)',
              margin: 0,
            }}>
              Centro de control
            </p>
          </div>
          <button
            className="adm-close-btn"
            onClick={() => setIsMobileOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.4)',
              fontSize: '1.25rem',
              cursor: 'pointer',
              padding: 0,
              lineHeight: 1,
              display: 'none',
            }}
            aria-label="Cerrar menú"
          >
            ✕
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '.625rem 0' }}>
          {NAV.map(({ href, label, icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className="adm-nav-link"
                onClick={() => setIsMobileOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '.75rem',
                  padding: '.625rem 1.25rem',
                  fontSize: '.8125rem',
                  color: active ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
                  textDecoration: 'none',
                  background: active ? 'rgba(200,169,91,0.12)' : 'transparent',
                  borderLeft: active ? '3px solid #C8A95B' : '3px solid transparent',
                  fontWeight: active ? 600 : 400,
                  transition: 'background 0.12s, color 0.12s',
                }}
              >
                <span style={{
                  width: 18,
                  textAlign: 'center',
                  fontSize: '1rem',
                  opacity: active ? 1 : 0.6,
                  color: active ? '#C8A95B' : 'inherit',
                  textShadow: active ? '0 0 8px rgba(200,169,91,0.4)' : 'none',
                }}>
                  {icon}
                </span>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{
          padding: '1rem 1.25rem',
          borderTop: '1px solid rgba(200,169,91,0.15)',
        }}>
          <p style={{
            margin: '0 0 .25rem',
            fontSize: '.8rem',
            fontWeight: 600,
            color: 'rgba(255,255,255,0.75)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {email}
          </p>
          <span style={{
            display: 'inline-block',
            background: '#C8A95B',
            color: '#1C1713',
            fontSize: '.6rem',
            fontWeight: 900,
            letterSpacing: '.14em',
            textTransform: 'uppercase',
            padding: '.2rem .55rem',
            borderRadius: 4,
            marginBottom: '.875rem',
          }}>
            {role}
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.375rem' }}>
            <a
              href="/invitaciones"
              target="_blank"
              rel="noopener noreferrer"
              className="adm-footer-link"
              style={{
                fontSize: '.75rem',
                color: 'rgba(255,255,255,0.4)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '.5rem',
                transition: 'color 0.12s',
              }}
            >
              <span style={{ fontSize: '.8rem' }}>↗</span> Ver sitio
            </a>
            <SignOutButton
              className="adm-footer-link"
              style={{
                fontSize: '.75rem',
                color: 'rgba(255,255,255,0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '.5rem',
                transition: 'color 0.12s',
              }}
            >
              <span style={{ fontSize: '.8rem' }}>→</span> Cerrar sesión
            </SignOutButton>
          </div>
        </div>
      </aside>
    </>
  );
}
