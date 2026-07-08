import { InvitacionesHeader } from '@/components/public/InvitacionesHeader';
import { InvitacionesFooter } from '@/components/public/InvitacionesFooter';

/**
 * Layout de las páginas informativas públicas (/contacto, /como-funciona,
 * legales, /gracias). Comparte header y footer del sitio de venta sin tocar
 * las invitaciones públicas /i/[slug] ni el editor — el grupo de rutas no
 * afecta esas ramas del árbol.
 */
export default function InformativasLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-site-crema">
      <InvitacionesHeader />
      <main>{children}</main>
      <InvitacionesFooter />
    </div>
  );
}
