'use client';

import Link from 'next/link';

type DashboardNavLink = {
  href: string;
  label: string;
};

interface DashboardShellProps {
  adminMode: boolean;
  navLinks: DashboardNavLink[];
  children: React.ReactNode;
}

function SidebarContent({
  adminMode,
  navLinks,
  onNavigate,
}: {
  adminMode: boolean;
  navLinks: DashboardNavLink[];
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="px-5 py-6 border-b" style={{ borderColor: '#2D2420' }}>
        <p className="text-[10px] uppercase tracking-[0.3em]" style={{ color: '#C5A880' }}>
          Kompralo
        </p>
        <p className="text-xs mt-0.5" style={{ color: '#6B5B4E' }}>
          {adminMode ? 'Admin' : 'Mi cuenta'}
        </p>
      </div>

      <nav className="flex-1 py-4">
        {navLinks.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className="flex items-center px-5 py-2.5 text-sm transition-colors duration-150"
            style={{ color: '#A89080' }}
          >
            {label}
          </Link>
        ))}
      </nav>

      <div className="px-5 py-4 border-t" style={{ borderColor: '#2D2420' }}>
        <p className="text-[10px]" style={{ color: '#4A3B2A' }}>
          {adminMode ? 'ADMIN_ACCESS_ENABLED=true' : 'Auth: sesion activa'}
        </p>
      </div>
    </>
  );
}

export function DashboardShell({ adminMode, navLinks, children }: DashboardShellProps) {
  return (
    <div
      className="min-h-screen md:flex overflow-x-hidden"
      style={{ background: '#F5F3F0', fontFamily: 'system-ui, sans-serif' }}
    >
      <input id="dashboard-mobile-menu" type="checkbox" className="peer sr-only" />

      <aside
        className="hidden md:flex w-56 flex-shrink-0 flex-col"
        style={{ background: '#1A1410', minHeight: '100vh' }}
      >
        <SidebarContent adminMode={adminMode} navLinks={navLinks} />
      </aside>

      <header
        className="md:hidden sticky top-0 z-[1030] flex items-center justify-between px-4 py-3 border-b"
        style={{ background: '#1A1410', borderColor: '#2D2420' }}
      >
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em]" style={{ color: '#C5A880' }}>
            Kompralo
          </p>
          <p className="text-xs" style={{ color: '#8A7565' }}>
            {adminMode ? 'Admin' : 'Mi cuenta'}
          </p>
        </div>
        <label
          htmlFor="dashboard-mobile-menu"
          role="button"
          tabIndex={0}
          aria-label="Abrir menu del dashboard"
          className="rounded-lg px-3 py-2 text-sm"
          style={{ background: '#2D2420', color: '#F5EDD8', border: '1px solid #4A3B2A' }}
        >
          Menu
        </label>
      </header>

      <div className="hidden peer-checked:block md:hidden fixed inset-0 z-[1060]">
          <label
            htmlFor="dashboard-mobile-menu"
            aria-label="Cerrar menu del dashboard"
            className="absolute inset-0 block w-full h-full"
            style={{ background: 'rgba(26,20,16,0.48)' }}
          />
          <aside
            className="absolute left-0 top-0 h-full w-[min(82vw,280px)] flex flex-col"
            style={{ background: '#1A1410', boxShadow: '18px 0 40px rgba(26,20,16,0.24)' }}
          >
            <div className="flex justify-end px-4 pt-4">
              <label
                htmlFor="dashboard-mobile-menu"
                role="button"
                tabIndex={0}
                aria-label="Cerrar menu del dashboard"
                className="rounded-full px-3 py-2 text-sm"
                style={{ background: '#2D2420', color: '#F5EDD8', border: '1px solid #4A3B2A' }}
              >
                Cerrar
              </label>
            </div>
            <SidebarContent
              adminMode={adminMode}
              navLinks={navLinks}
            />
          </aside>
        </div>

      <main className="flex-1 min-w-0 w-full px-4 py-5 md:p-8 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
