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
      background: '#F7F1E8',
    }}>
      <style dangerouslySetInnerHTML={{ __html: `
        body {
          background-color: #F7F1E8 !important;
          color: #241A14 !important;
        }
        main {
          background-color: #F7F1E8 !important;
          color: #241A14 !important;
        }
        h1, h2, h3, h4, h5, h6 {
          color: #241A14 !important;
        }
        p, span, label {
          color: #241A14;
        }

        /* Mobile Layout Spacing */
        @media (max-width: 768px) {
          main {
            padding: 5rem 1rem 2rem !important;
          }
        }

        /* Responsive grids */
        .adm-plans-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .adm-activity-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
          margin-bottom: 1.5rem;
        }
        @media (max-width: 768px) {
          .adm-plans-grid {
            grid-template-columns: 1fr !important;
          }
          .adm-activity-grid {
            grid-template-columns: 1fr !important;
          }
        }

        /* Form inputs */
        form {
          background-color: #FFFBF4 !important;
          border-color: #E5D2A8 !important;
        }
        input, select, textarea {
          background-color: #FAF3E6 !important;
          border: 1px solid #E5D2A8 !important;
          color: #241A14 !important;
        }
        input:focus, select:focus, textarea:focus {
          border-color: #C8A95B !important;
          outline: none;
        }
        input::placeholder {
          color: #7A6A5B !important;
        }

        /* Tables */
        table {
          background-color: #FFFBF4 !important;
          border: 1px solid #E5D2A8 !important;
        }
        tr {
          border-bottom: 1px solid rgba(200,169,91,0.15) !important;
        }
        tr:hover {
          background-color: rgba(200,169,91,0.04) !important;
        }
        th {
          background-color: #FAF3E6 !important;
          color: #7A6A5B !important;
          border-bottom: 1px solid #E5D2A8 !important;
        }
        td {
          color: #241A14 !important;
          border-bottom-color: rgba(200,169,91,0.15) !important;
        }
      `}} />
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
