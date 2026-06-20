import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { invitationRepository } from '@/domain/invitations';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { verifyInvitationAccess } from '@/lib/access/verifyInvitationAccess';
import EditForm from './EditForm';
import MediaForm from './MediaForm';
import GalleryForm from './GalleryForm';
import ProtagonistsForm from './ProtagonistsForm';
import ItineraryForm from './ItineraryForm';
import GiftRegistryForm from './GiftRegistryForm';
import DressCodeForm from './DressCodeForm';
import { SponsorsForm } from './SponsorsForm';
import { StoryBookForm } from './StoryBookForm';
import { AccommodationForm } from './AccommodationForm';
import { SocialForm } from './SocialForm';
import { FinalMessageForm } from './FinalMessageForm';
import { TimelineForm } from './TimelineForm';
import { FeaturesForm } from './FeaturesForm';
import { ThemeSelectorForm } from './ThemeSelectorForm';
import { LivePreview } from './LivePreview';
import { DashboardAssistantMount } from '@/features/dashboard-assistant/DashboardAssistantMount';
import {
  isDashboardAssistantAllowedForPlan,
  isDashboardAssistantEnabled,
} from '@/features/dashboard-assistant/dashboardAssistantConfig';
import type { DashboardAssistantEventType } from '@/features/dashboard-assistant/types';

function isAdminMode(): boolean {
  return process.env.ADMIN_ACCESS_ENABLED === 'true';
}

function getDashboardAssistantEventType(category: string): DashboardAssistantEventType {
  switch (category) {
    case 'wedding':
      return 'wedding';
    case 'baptism':
      return 'baptism';
    case 'baby-shower':
      return 'baby_shower';
    case 'birthday':
      return 'birthday';
    default:
      // TODO: Infer XV and other event types from invitation content when available.
      return 'wedding';
  }
}

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const invitation = await invitationRepository.getById(id);
  if (!invitation) return { title: 'Invitación no encontrada — Kompralo Admin' };
  return { title: `Editar: ${invitation.title} — Kompralo Admin` };
}

export default async function EditInvitationPage({ params }: Props) {
  const { id } = await params;
  const invitation = await invitationRepository.getById(id);

  if (!invitation) {
    notFound();
  }

  // Ownership check — enforced when not in admin mode
  if (!isAdminMode()) {
    let sessionUser = null;
    try {
      const supabase = await createServerSupabaseClient();
      const { data } = await supabase.auth.getUser();
      sessionUser = data.user;
    } catch {
      // Supabase not configured — fall through to redirect
    }

    const hasScopedAccess = await verifyInvitationAccess(id);

    if (!sessionUser && !hasScopedAccess) {
      redirect(`/login?redirect=/dashboard/invitations/${id}/edit`);
    }

    const ownerEmail = invitation.customerEmail ?? null;
    if (
      !hasScopedAccess &&
      ownerEmail &&
      ownerEmail.toLowerCase() !== (sessionUser?.email ?? '').toLowerCase()
    ) {
      return (
        <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
          <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#C62828', marginBottom: '0.5rem' }}>
            Acceso no autorizado
          </p>
          <p style={{ color: '#6B5B4E', fontSize: '0.9rem', marginBottom: '2rem' }}>
            Esta invitación no pertenece a tu cuenta.
          </p>
          <Link
            href="/cliente"
            style={{ color: '#C5A880', fontSize: '0.875rem', textDecoration: 'none' }}
          >
            ← Ver mis invitaciones
          </Link>
        </div>
      );
    }
  }

  const assistantEnabledByEnv = isDashboardAssistantEnabled();
  const assistantAllowedForPlan = isDashboardAssistantAllowedForPlan(invitation.planId);
  const assistantEventType = getDashboardAssistantEventType(invitation.category);

  const previewUrl = `/preview/${invitation.id}?from=editor`;

  return (
    // position:fixed on the preview aside bypasses the overflow-x-hidden on DashboardShell
    // ancestors (which would break position:sticky). The editor column gets xl:pr-[500px]
    // so content never slides under the fixed panel.
    <div className="relative">
      {/* ── Editor column ───────────────────────────────────────────────────── */}
      <div className="w-full xl:pr-[500px] overflow-x-hidden">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest mb-2" style={{ color: '#C5A880' }}>
          {invitation.category} · {invitation.planId} · {invitation.status}
        </p>
        <h1 className="text-2xl font-light break-words" style={{ color: '#1A1410' }}>
          {invitation.title}
        </h1>
        <p className="text-sm mt-1 font-mono break-all" style={{ color: '#9B8878' }}>
          /{invitation.slug}
        </p>
      </div>

      {/* ── 1. Datos generales ───────────────────────────────────────────────── */}
      <h2 className="text-xs uppercase tracking-widest mb-3" style={{ color: '#3D2B1A' }}>
        Datos generales
      </h2>
      <div
        className="rounded-xl p-6 mb-8"
        style={{ background: '#FFFFFF', border: '1px solid #E8E2DA' }}
      >
        <EditForm invitation={invitation} />
      </div>

      {/* ── 2. Portada y multimedia ──────────────────────────────────────────── */}
      <h2 className="text-xs uppercase tracking-widest mb-3 mt-8" style={{ color: '#3D2B1A' }}>
        Portada y multimedia
      </h2>
      <div
        className="rounded-xl p-6 mb-8"
        style={{ background: '#FFFFFF', border: '1px solid #E8E2DA' }}
      >
        <p className="text-xs mb-4" style={{ color: '#9B8878' }}>
          Imagen principal, video de portada, música de fondo y links de navegación al venue.
        </p>
        <MediaForm invitation={invitation} />
      </div>

      {/* ── 3. Protagonistas ─────────────────────────────────────────────────── */}
      <h2 className="text-xs uppercase tracking-widest mb-3 mt-8" style={{ color: '#3D2B1A' }}>
        Protagonistas
      </h2>
      <div
        className="rounded-xl p-6 mb-8"
        style={{ background: '#FFFFFF', border: '1px solid #E8E2DA' }}
      >
        <p className="text-xs mb-4" style={{ color: '#9B8878' }}>
          Los protagonistas aparecen en el hero, la intro cinemática y el mensaje final.
          Bodas: dos protagonistas. Bautizos y cumpleaños: uno.
        </p>
        <ProtagonistsForm invitation={invitation} />
      </div>

      {/* ── 4. Nuestra historia ──────────────────────────────────────────────── */}
      <h2 className="text-xs uppercase tracking-widest mb-3 mt-8" style={{ color: '#3D2B1A' }}>
        Nuestra historia
      </h2>
      <div
        className="rounded-xl p-6 mb-8"
        style={{ background: '#FFFFFF', border: '1px solid #E8E2DA' }}
      >
        <p className="text-xs mb-4" style={{ color: '#9B8878' }}>
          Slides que narran la historia del evento. Cada slide tiene imagen, título, texto y fecha opcional.
          Solo se muestra si la feature <span className="font-mono">showStory</span> está activa en el plan.
        </p>
        <StoryBookForm
          invitationId={invitation.id}
          slug={invitation.slug}
          initialSlides={invitation.story.slides.map((s) => ({
            id:       s.id,
            title:    s.title,
            subtitle: s.subtitle ?? '',
            text:     s.text,
            imageUrl: s.imageUrl,
            date:     s.date ?? '',
          }))}
        />
      </div>

      {/* ── 5. Galería ───────────────────────────────────────────────────────── */}
      <h2 className="text-xs uppercase tracking-widest mb-3 mt-8" style={{ color: '#3D2B1A' }}>
        Galería de fotos
      </h2>
      <div
        className="rounded-xl p-6 mb-8"
        style={{ background: '#FFFFFF', border: '1px solid #E8E2DA' }}
      >
        <p className="text-xs mb-4" style={{ color: '#9B8878' }}>
          Las imágenes se muestran en el carrusel de la invitación en el orden definido aquí.
          La primera imagen también se usa como imagen de respaldo en el mensaje final.
        </p>
        <GalleryForm invitation={invitation} />
      </div>

      {/* ── 6. Línea del tiempo ──────────────────────────────────────────────── */}
      <h2 className="text-xs uppercase tracking-widest mb-3 mt-8" style={{ color: '#3D2B1A' }}>
        Línea del tiempo
      </h2>
      <div
        className="rounded-xl p-6 mb-8"
        style={{ background: '#FFFFFF', border: '1px solid #E8E2DA' }}
      >
        <p className="text-xs mb-4" style={{ color: '#9B8878' }}>
          Momentos clave de la historia del evento en orden cronológico.
          Solo se muestra si la feature <span className="font-mono">showTimeline</span> está activa en el plan.
        </p>
        <TimelineForm
          invitationId={invitation.id}
          slug={invitation.slug}
          initialEvents={invitation.timeline.map((e) => ({
            id:          e.id,
            year:        e.year,
            title:       e.title,
            description: e.description,
            imageUrl:    e.imageUrl ?? '',
          }))}
        />
      </div>

      {/* ── 7. Itinerario del evento ─────────────────────────────────────────── */}
      <h2 className="text-xs uppercase tracking-widest mb-3 mt-8" style={{ color: '#3D2B1A' }}>
        Itinerario del evento
      </h2>
      <div
        className="rounded-xl p-6 mb-8"
        style={{ background: '#FFFFFF', border: '1px solid #E8E2DA' }}
      >
        <p className="text-xs mb-4" style={{ color: '#9B8878' }}>
          Define los momentos clave del día en orden cronológico.
          Solo se muestra si la feature <span className="font-mono">showItinerary</span> está activa en el plan.
        </p>
        <ItineraryForm invitation={invitation} />
      </div>

      {/* ── 8. Código de vestimenta ──────────────────────────────────────────── */}
      <h2 className="text-xs uppercase tracking-widest mb-3 mt-8" style={{ color: '#3D2B1A' }}>
        Código de vestimenta
      </h2>
      <div
        className="rounded-xl p-6 mb-8"
        style={{ background: '#FFFFFF', border: '1px solid #E8E2DA' }}
      >
        <p className="text-xs mb-4" style={{ color: '#9B8878' }}>
          Define la etiqueta, descripción y colores sugeridos. Solo se muestra si la feature{' '}
          <span className="font-mono">showDressCode</span> está activa en el plan.
        </p>
        <DressCodeForm invitation={invitation} />
      </div>

      {/* ── 9. Mesa de regalos ───────────────────────────────────────────────── */}
      <h2 className="text-xs uppercase tracking-widest mb-3 mt-8" style={{ color: '#3D2B1A' }}>
        Mesa de regalos
      </h2>
      <div
        className="rounded-xl p-6 mb-8"
        style={{ background: '#FFFFFF', border: '1px solid #E8E2DA' }}
      >
        <p className="text-xs mb-4" style={{ color: '#9B8878' }}>
          Agrega tiendas en línea o datos bancarios. Solo se muestra si la feature{' '}
          <span className="font-mono">showGiftRegistry</span> está activa en el plan.
        </p>
        <GiftRegistryForm invitation={invitation} />
      </div>

      {/* ── 10. Padrinos ──────────────────────────────────────────────────────── */}
      <h2 className="text-xs uppercase tracking-widest mb-3 mt-8" style={{ color: '#3D2B1A' }}>
        Padrinos
      </h2>
      <div
        className="rounded-xl p-6 mb-8"
        style={{ background: '#FFFFFF', border: '1px solid #E8E2DA' }}
      >
        <p className="text-xs mb-4" style={{ color: '#9B8878' }}>
          Agrupa a los padrinos por rubro. Solo se muestra si la feature{' '}
          <span className="font-mono">showSponsors</span> está activa en el plan.
        </p>
        <SponsorsForm
          invitationId={invitation.id}
          slug={invitation.slug}
          initialPadrinos={invitation.padrinos.map((p) => ({
            id:    p.id,
            rubro: p.rubro,
            icon:  p.icon,
            names: p.names,
          }))}
        />
      </div>

      {/* ── 11. Hospedaje ─────────────────────────────────────────────────────── */}
      <h2 className="text-xs uppercase tracking-widest mb-3 mt-8" style={{ color: '#3D2B1A' }}>
        Hospedaje
      </h2>
      <div
        className="rounded-xl p-6 mb-8"
        style={{ background: '#FFFFFF', border: '1px solid #E8E2DA' }}
      >
        <p className="text-xs mb-4" style={{ color: '#9B8878' }}>
          Hoteles recomendados para los invitados. Solo se muestra si la feature{' '}
          <span className="font-mono">showHotels</span> está activa en el plan.
        </p>
        <AccommodationForm
          invitationId={invitation.id}
          slug={invitation.slug}
          initialHotels={invitation.hotels.map((h) => ({
            id:          h.id,
            name:        h.name,
            stars:       h.stars,
            address:     h.address,
            distance:    h.distance,
            priceRange:  h.priceRange,
            phone:       h.phone        ?? '',
            bookingLink: h.bookingLink  ?? '',
            imageUrl:    h.imageUrl     ?? '',
            description: h.description  ?? '',
          }))}
        />
      </div>

      {/* ── 12. Redes y hashtag ───────────────────────────────────────────────── */}
      <h2 className="text-xs uppercase tracking-widest mb-3 mt-8" style={{ color: '#3D2B1A' }}>
        Redes y hashtag
      </h2>
      <div
        className="rounded-xl p-6 mb-8"
        style={{ background: '#FFFFFF', border: '1px solid #E8E2DA' }}
      >
        <p className="text-xs mb-4" style={{ color: '#9B8878' }}>
          Hashtag oficial del evento y redes sociales para que los invitados compartan.
        </p>
        <SocialForm
          invitationId={invitation.id}
          slug={invitation.slug}
          initialSocial={{
            hashtag:         invitation.social.hashtag          ?? '',
            instagramHandle: invitation.social.instagramHandle  ?? '',
            tiktokHandle:    invitation.social.tiktokHandle     ?? '',
            facebookUrl:     invitation.social.facebookUrl      ?? '',
            youtubeUrl:      invitation.social.youtubeUrl       ?? '',
            note:            invitation.social.note             ?? '',
          }}
        />
      </div>

      {/* ── 13. Mensaje final ─────────────────────────────────────────────────── */}
      <h2 className="text-xs uppercase tracking-widest mb-3 mt-8" style={{ color: '#3D2B1A' }}>
        Mensaje final
      </h2>
      <div
        className="rounded-xl p-6 mb-8"
        style={{ background: '#FFFFFF', border: '1px solid #E8E2DA' }}
      >
        <p className="text-xs mb-4" style={{ color: '#9B8878' }}>
          La sección de cierre de la invitación: cita destacada, mensaje personal e imagen de fondo.
        </p>
        <FinalMessageForm
          invitationId={invitation.id}
          slug={invitation.slug}
          initial={{
            title:     invitation.finalMessage.title     ?? '',
            message:   invitation.finalMessage.message   ?? '',
            quote:     invitation.finalMessage.quote     ?? '',
            imageUrl:  invitation.finalMessage.imageUrl  ?? '',
            signature: invitation.finalMessage.signature ?? '',
          }}
        />
      </div>

      {/* ── 14. Diseño y tema ─────────────────────────────────────────────────── */}
      <h2 className="text-xs uppercase tracking-widest mb-3 mt-8" style={{ color: '#3D2B1A' }}>
        Diseño y tema
      </h2>
      <div
        className="rounded-xl p-6 mb-8"
        style={{ background: '#FFFFFF', border: '1px solid #E8E2DA' }}
      >
        <p className="text-xs mb-5" style={{ color: '#9B8878' }}>
          Elige el tema visual de la invitación. Cada tema define colores, tipografía, formas y efectos.
          El cambio se refleja en la vista previa y en la invitación pública inmediatamente.
        </p>
        <ThemeSelectorForm
          invitationId={invitation.id}
          slug={invitation.slug}
          currentThemeId={invitation.themeId}
        />
      </div>

      {/* ── 15. Secciones activas ─────────────────────────────────────────────── */}
      <h2 className="text-xs uppercase tracking-widest mb-3 mt-8" style={{ color: '#3D2B1A' }}>
        Secciones activas
      </h2>
      <div
        className="rounded-xl p-6"
        style={{ background: '#FFFFFF', border: '1px solid #E8E2DA' }}
      >
        <p className="text-xs mb-6" style={{ color: '#9B8878' }}>
          Activa o desactiva secciones individualmente. Las secciones bloqueadas requieren un plan superior.
          Los cambios aquí tienen prioridad sobre el plan base.
        </p>
        <FeaturesForm
          invitationId={invitation.id}
          slug={invitation.slug}
          planId={invitation.planId}
          initialOverrides={invitation.featureOverrides ?? {}}
        />
      </div>
      {/* ── Mobile preview button — visible below xl ───────────────────────── */}
      <div className="xl:hidden mt-8 mb-2">
        <a
          href={previewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl text-base font-bold transition-transform hover:scale-[1.01]"
          style={{ background: '#C4A962', color: '#0D0A07', padding: '1rem 1.5rem', boxShadow: '0 4px 18px rgba(196,169,98,0.35)' }}
        >
          ✨ Previsualiza tu invitación
        </a>
      </div>
      </div>{/* end editor column */}

      {/* ── Preview panel — fixed on desktop, hidden on narrow viewports ── */}
      {/* Fixed positioning is unaffected by overflow on any ancestor element. */}
      <aside className="hidden xl:block fixed right-8 top-6 z-30 h-[calc(100vh-48px)] w-[460px]">
        <div className="h-full overflow-hidden rounded-[28px] border border-[#e7dccb] bg-white shadow-2xl">
          <LivePreview invitationId={invitation.id} />
        </div>
      </aside>

      <DashboardAssistantMount
        enabledByEnv={assistantEnabledByEnv}
        enabledForPlan={assistantAllowedForPlan}
        eventType={assistantEventType}
      />
    </div>
  );
}
