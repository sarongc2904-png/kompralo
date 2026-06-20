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

  const previewUrl = `/preview/${invitation.id}`;

  return (
    // overflow-x-hidden must NOT be on the xl:flex container — it breaks position:sticky.
    // Instead clip overflow on the inner editor column only.
    <div className="w-full xl:flex xl:gap-6 xl:items-start">
      {/* ── Editor column ───────────────────────────────────────────────────── */}
      <div className="w-full flex-1 min-w-0 overflow-x-hidden" style={{ maxWidth: 720 }}>
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

      {/* ── Datos generales ──────────────────────────────────────────────────── */}
      <h2 className="text-xs uppercase tracking-widest mb-3" style={{ color: '#3D2B1A' }}>
        Datos generales
      </h2>
      <div
        className="rounded-xl p-6 mb-8"
        style={{ background: '#FFFFFF', border: '1px solid #E8E2DA' }}
      >
        <EditForm invitation={invitation} />
      </div>

      {/* ── Multimedia y enlaces ─────────────────────────────────────────────── */}
      <h2 className="text-xs uppercase tracking-widest mb-3" style={{ color: '#3D2B1A' }}>
        Multimedia y enlaces
      </h2>
      <div
        className="rounded-xl p-6 mb-8"
        style={{ background: '#FFFFFF', border: '1px solid #E8E2DA' }}
      >
        <MediaForm invitation={invitation} />
      </div>

      {/* ── Galería ──────────────────────────────────────────────────────────── */}
      <h2 className="text-xs uppercase tracking-widest mb-3" style={{ color: '#3D2B1A' }}>
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

      {/* ── Protagonistas ────────────────────────────────────────────────────── */}
      <h2 className="text-xs uppercase tracking-widest mb-3" style={{ color: '#3D2B1A' }}>
        Protagonistas
      </h2>
      <div
        className="rounded-xl p-6"
        style={{ background: '#FFFFFF', border: '1px solid #E8E2DA' }}
      >
        <p className="text-xs mb-4" style={{ color: '#9B8878' }}>
          Los protagonistas aparecen en la intro cinemática, el hero y el mensaje final.
          Bodas: dos protagonistas. Bautizos y cumpleaños: uno.
        </p>
        <ProtagonistsForm invitation={invitation} />
      </div>

      {/* ── Itinerario ───────────────────────────────────────────────────────── */}
      <h2 className="text-xs uppercase tracking-widest mb-3 mt-8" style={{ color: '#3D2B1A' }}>
        Itinerario del evento
      </h2>
      <div
        className="rounded-xl p-6"
        style={{ background: '#FFFFFF', border: '1px solid #E8E2DA' }}
      >
        <p className="text-xs mb-4" style={{ color: '#9B8878' }}>
          Define los momentos clave del día en orden cronológico.
          Solo se muestra si la feature <span className="font-mono">showItinerary</span> está activa en el plan.
        </p>
        <ItineraryForm invitation={invitation} />
      </div>

      {/* ── Mesa de Regalos ──────────────────────────────────────────────────── */}
      <h2 className="text-xs uppercase tracking-widest mb-3 mt-8" style={{ color: '#3D2B1A' }}>
        Mesa de regalos
      </h2>
      <div
        className="rounded-xl p-6"
        style={{ background: '#FFFFFF', border: '1px solid #E8E2DA' }}
      >
        <p className="text-xs mb-4" style={{ color: '#9B8878' }}>
          Agrega tiendas en línea o datos bancarios. Solo se muestra si la feature{' '}
          <span className="font-mono">showGiftRegistry</span> está activa en el plan.
        </p>
        <GiftRegistryForm invitation={invitation} />
      </div>

      {/* ── Dress Code ───────────────────────────────────────────────────────── */}
      <h2 className="text-xs uppercase tracking-widest mb-3 mt-8" style={{ color: '#3D2B1A' }}>
        Dress code
      </h2>
      <div
        className="rounded-xl p-6"
        style={{ background: '#FFFFFF', border: '1px solid #E8E2DA' }}
      >
        <p className="text-xs mb-4" style={{ color: '#9B8878' }}>
          Define la etiqueta, descripción y colores sugeridos. Solo se muestra si la feature{' '}
          <span className="font-mono">showDressCode</span> está activa en el plan.
        </p>
        <DressCodeForm invitation={invitation} />
      </div>

      {/* ── StoryBook ────────────────────────────────────────────────────────── */}
      <h2 className="text-xs uppercase tracking-widest mb-3 mt-8" style={{ color: '#3D2B1A' }}>
        StoryBook
      </h2>
      <div
        className="rounded-xl p-6"
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

      {/* ── Timeline ─────────────────────────────────────────────────────────── */}
      <h2 className="text-xs uppercase tracking-widest mb-3 mt-8" style={{ color: '#3D2B1A' }}>
        Timeline
      </h2>
      <div
        className="rounded-xl p-6"
        style={{ background: '#FFFFFF', border: '1px solid #E8E2DA' }}
      >
        <p className="text-xs mb-4" style={{ color: '#9B8878' }}>
          Línea de tiempo con los momentos clave de la historia del evento.
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

      {/* ── Padrinos ─────────────────────────────────────────────────────────── */}
      <h2 className="text-xs uppercase tracking-widest mb-3 mt-8" style={{ color: '#3D2B1A' }}>
        Padrinos
      </h2>
      <div
        className="rounded-xl p-6"
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

      {/* ── Hospedaje ─────────────────────────────────────────────────────────── */}
      <h2 className="text-xs uppercase tracking-widest mb-3 mt-8" style={{ color: '#3D2B1A' }}>
        Hospedaje
      </h2>
      <div
        className="rounded-xl p-6"
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

      {/* ── Hashtag y Redes ───────────────────────────────────────────────────── */}
      <h2 className="text-xs uppercase tracking-widest mb-3 mt-8" style={{ color: '#3D2B1A' }}>
        Hashtag y Redes
      </h2>
      <div
        className="rounded-xl p-6"
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

      {/* ── Mensaje Final ─────────────────────────────────────────────────────── */}
      <h2 className="text-xs uppercase tracking-widest mb-3 mt-8" style={{ color: '#3D2B1A' }}>
        Mensaje Final
      </h2>
      <div
        className="rounded-xl p-6"
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

      {/* ── Diseño y Tema ─────────────────────────────────────────────────────── */}
      <h2 className="text-xs uppercase tracking-widest mb-3 mt-8" style={{ color: '#3D2B1A' }}>
        Diseño y Tema
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

      {/* ── Secciones activas ─────────────────────────────────────────────────── */}
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
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-opacity"
          style={{ background: '#1A1410', color: '#F5F3F0' }}
        >
          ↗ Ver preview en nueva pestaña
        </a>
      </div>
      </div>{/* end editor column */}

      {/* ── Preview column — sticky on desktop, hidden on narrow viewports ── */}
      <div
        className="hidden xl:flex flex-col flex-shrink-0"
        style={{ width: 420, position: 'sticky', top: 24, height: 'calc(100vh - 48px)' }}
      >
        <LivePreview invitationId={invitation.id} />
      </div>

      <DashboardAssistantMount
        enabledByEnv={assistantEnabledByEnv}
        enabledForPlan={assistantAllowedForPlan}
        eventType={assistantEventType}
      />
    </div>
  );
}
