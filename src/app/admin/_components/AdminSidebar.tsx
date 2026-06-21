'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

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

  function isActive(href: string): boolean {
    if (href === '/admin') return pathname === '/admin';
    return pathname === href || pathname.startsWith(href + '/');
  }

  return (
    <>
      <style>{`
        .adm-nav-link:hover { background: rgba(255,255,255,0.06) !important; color: rgba(255,255,255,0.85) !important; }
        .adm-footer-link:hover { color: rgba(255,255,255,0.7) !important; }
        @media (max-width: 768px) {
          .adm-sidebar { display: none !important; }
        }
      `}</style>

      <aside
        className="adm-sidebar"
        style={{
          width: 260,
          flexShrink: 0,
          background: '#17120E',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100dvh',
          overflow: 'auto',
        }}
      >
        {/* Brand */}
        <div style={{
          padding: '1.5rem 1.25rem 1.25rem',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}>
          <p style={{
            fontSize: '.6rem',
            fontWeight: 900,
            letterSpacing: '.28em',
            textTransform: 'uppercase',
            color: '#C9A45C',
            margin: '0 0 .375rem',
          }}>
            Kompralo
          </p>
          <p style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: '#F5F0E8',
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

        {/* Nav */}
        <nav style={{ flex: 1, padding: '.625rem 0' }}>
          {NAV.map(({ href, label, icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className="adm-nav-link"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '.75rem',
                  padding: '.625rem 1.25rem',
                  fontSize: '.8125rem',
                  color: active ? '#F5F0E8' : 'rgba(255,255,255,0.5)',
                  textDecoration: 'none',
                  background: active ? 'rgba(201,164,92,0.12)' : 'transparent',
                  borderLeft: active ? '2.5px solid #C9A45C' : '2.5px solid transparent',
                  fontWeight: active ? 600 : 400,
                  transition: 'background 0.12s, color 0.12s',
                }}
              >
                <span style={{
                  width: 18,
                  textAlign: 'center',
                  fontSize: '1rem',
                  opacity: active ? 1 : 0.6,
                  color: active ? '#C9A45C' : 'inherit',
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
          borderTop: '1px solid rgba(255,255,255,0.07)',
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
            background: '#C9A45C',
            color: '#17120E',
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
            <a
              href="/auth/signout"
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
              <span style={{ fontSize: '.8rem' }}>→</span> Cerrar sesión
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}
