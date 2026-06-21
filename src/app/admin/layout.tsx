import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/admin';
import AdminSidebar from './_components/AdminSidebar';

export const metadata: Metadata = { title: 'Admin — Kompralo' };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  return (
    <div style={{
      display: 'flex',
      minHeight: '100dvh',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      background: '#F5F2ED',
    }}>
      <AdminSidebar email={admin.email} role={admin.role} />

      <main style={{
        flex: 1,
        padding: '2rem 2.5rem',
        overflow: 'auto',
        minWidth: 0,
        maxWidth: '100%',
      }}>
        {children}
      </main>
    </div>
  );
}
