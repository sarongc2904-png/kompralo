import type { Metadata } from 'next';
import Link from 'next/link';
import { requireAdmin } from '@/lib/admin';

export const metadata: Metadata = { title: 'Admin — Kompralo' };

const NAV = [
  { href: '/admin',                    label: 'Resumen',         icon: '◈' },
  { href: '/admin/orders',             label: 'Órdenes',         icon: '📋' },
  { href: '/admin/invitations',        label: 'Invitaciones',    icon: '✉' },
  { href: '/admin/invitations/new',    label: 'Crear invitación',icon: '＋' },
  { href: '/admin/recovery',           label: 'Recuperar compra',icon: '🔧' },
  { href: '/admin/users',              label: 'Usuarios',        icon: '👥' },
  { href: '/admin/logs',               label: 'Logs',            icon: '📊' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  return (
    <div style={{ display: 'flex', minHeight: '100dvh', fontFamily: 'system-ui, -apple-system, sans-serif', background: '#f5f4f2' }}>

      {/* Sidebar */}
      <aside style={{
        width: 220, flexShrink: 0,
        background: '#ffffff', borderRight: '1px solid #e5e2dc',
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100dvh', overflow: 'auto',
      }}>
        {/* Logo */}
        <div style={{ padding: '1.25rem 1rem', borderBottom: '1px solid #e5e2dc' }}>
          <p style={{ fontSize: '.65rem', fontWeight: 800, letterSpacing: '.2em', textTransform: 'uppercase', color: '#C4A962', margin: '0 0 .125rem' }}>
            Kompralo
          </p>
          <p style={{ fontSize: '.7rem', color: '#8a8580', margin: 0, fontWeight: 600 }}>
            Panel Admin
          </p>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '.5rem 0' }}>
          {NAV.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex', alignItems: 'center', gap: '.625rem',
                padding: '.5rem 1rem', fontSize: '.8125rem', color: '#2c2a26',
                textDecoration: 'none', transition: 'background .1s',
                borderRadius: '0', fontWeight: 500,
              }}
              className="admin-nav-link"
            >
              <span style={{ fontSize: '.9rem', width: 18, textAlign: 'center' }}>{icon}</span>
              {label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: '1rem', borderTop: '1px solid #e5e2dc', fontSize: '.7rem', color: '#8a8580' }}>
          <p style={{ margin: '0 0 .5rem', fontWeight: 600, color: '#4a4742', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {admin.email}
          </p>
          <p style={{ margin: '0 0 .5rem', textTransform: 'uppercase', letterSpacing: '.1em', fontSize: '.6rem', color: '#C4A962', fontWeight: 700 }}>
            {admin.role}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.25rem' }}>
            <Link href="/invitaciones" style={{ color: '#8a8580', textDecoration: 'none', fontSize: '.7rem' }}>
              ← Ver sitio
            </Link>
            <Link href="/auth/signout" style={{ color: '#8a8580', textDecoration: 'none', fontSize: '.7rem' }}>
              Cerrar sesión
            </Link>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: '2rem 2.5rem', overflow: 'auto', minWidth: 0 }}>
        {children}
      </main>

      {/* Nav hover style */}
      <style>{`
        .admin-nav-link:hover { background: #f5f4f0 !important; }
      `}</style>
    </div>
  );
}
