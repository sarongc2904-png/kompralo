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
      background: '#131316',
    }}>
      <style dangerouslySetInnerHTML={{ __html: `
        body {
          background-color: #131316 !important;
          color: #F5F0E8 !important;
        }
        main {
          background-color: #131316 !important;
          color: #F5F0E8 !important;
        }
        h1, h2, h3, h4, h5, h6 {
          color: #FFFFFF !important;
        }
        p, span, label {
          color: #E5E5EB;
        }
        
        /* Form inputs, selects, labels */
        form {
          background-color: #1A1A22 !important;
          border-color: rgba(226, 88, 34, 0.15) !important;
        }
        input, select, textarea {
          background-color: #22222E !important;
          border: 1px solid rgba(226, 88, 34, 0.25) !important;
          color: #F5F0E8 !important;
        }
        input:focus, select:focus, textarea:focus {
          border-color: #E25822 !important;
          outline: none;
        }
        input::placeholder {
          color: #767682 !important;
        }
        
        /* Tables */
        table {
          background-color: #1A1A22 !important;
          border: 1px solid rgba(226, 88, 34, 0.15) !important;
        }
        tr {
          border-bottom: 1px solid rgba(255, 255, 255, 0.04) !important;
        }
        tr:hover {
          background-color: rgba(255, 255, 255, 0.02) !important;
        }
        th {
          background-color: #16161E !important;
          color: #A5A5AB !important;
          border-bottom: 1px solid rgba(226, 88, 34, 0.15) !important;
        }
        td {
          color: #F5F0E8 !important;
          border-bottom-color: rgba(255, 255, 255, 0.04) !important;
        }
        
        /* Standard White Containers & Cards (fallback targeting) */
        div[style*="background: rgb(255, 255, 255)"],
        div[style*="background: #fff"],
        div[style*="background-color: rgb(255, 255, 255)"],
        div[style*="background-color: #fff"] {
          background-color: #1A1A22 !important;
          border: 1px solid rgba(226, 88, 34, 0.15) !important;
          color: #F5F0E8 !important;
        }
        
        /* Overriding specific text colors in lists/tables */
        td p, td span {
          color: #F5F0E8 !important;
        }
        td p[style*="color: rgb(138, 133, 128)"],
        td span[style*="color: rgb(138, 133, 128)"],
        td p[style*="color: #8A8580"],
        td span[style*="color: #8A8580"],
        td p[style*="color: #B0A898"],
        td span[style*="color: #B0A898"] {
          color: #A5A5AB !important;
        }
        
        /* Darker subtle borders for tables and dividers */
        tr[style*="border-bottom: 1px solid #F5F2ED"],
        tr[style*="border-bottom: 1px solid rgb(245, 242, 237)"] {
          border-bottom: 1px solid rgba(255, 255, 255, 0.04) !important;
        }
        
        /* Primary Buttons */
        button[style*="background: rgb(23, 18, 14)"],
        button[style*="background: #17120E"],
        a[style*="background: rgb(23, 18, 14)"],
        a[style*="background: #17120E"] {
          background: linear-gradient(135deg, #E25822 0%, #D84A16 100%) !important;
          color: #FFFFFF !important;
          box-shadow: 0 4px 14px rgba(226, 88, 34, 0.3) !important;
          border: none !important;
        }
        button[style*="background: rgb(23, 18, 14)"]:hover,
        button[style*="background: #17120E"]:hover,
        a[style*="background: rgb(23, 18, 14)"]:hover,
        a[style*="background: #17120E"]:hover {
          background: linear-gradient(135deg, #F06A35 0%, #E25822 100%) !important;
        }
        
        /* Secondary/Light Buttons */
        button[style*="background: rgb(240, 236, 231)"],
        button[style*="background: #F0ECE7"],
        a[style*="background: rgb(240, 236, 231)"],
        a[style*="background: #F0ECE7"],
        button[style*="background: rgb(255, 255, 255)"],
        button[style*="background: #fff"],
        a[style*="background: rgb(255, 255, 255)"],
        a[style*="background: #fff"] {
          background-color: #2C2C35 !important;
          color: #F5F0E8 !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
        }
        button[style*="background: rgb(240, 236, 231)"]:hover,
        button[style*="background: #F0ECE7"]:hover,
        a[style*="background: rgb(240, 236, 231)"]:hover,
        a[style*="background: #F0ECE7"]:hover,
        button[style*="background: rgb(255, 255, 255)"]:hover,
        a[style*="background: #fff"]:hover {
          background-color: #383844 !important;
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
