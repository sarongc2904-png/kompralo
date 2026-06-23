import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { invitationRepository } from '@/domain/invitations';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { isAdminUser } from '@/lib/admin';
import { verifyInvitationAccess } from '@/lib/access/verifyInvitationAccess';
import { normalizePlanId } from '@/domain/plans/types';
import EditForm from './EditForm';
import MediaForm from './MediaForm';
import LocationForm from './LocationForm';
import GalleryForm from './GalleryForm';
import ProtagonistsForm from './ProtagonistsForm';
import ParentsForm from './ParentsForm';
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
import type { DashboardAssistantEventType, InvitationAssistantContext } from '@/features/dashboard-assistant/types';
import { WeddingQuickStartSetup } from '@/components/editor/setup/WeddingQuickStartSetup';

function isAdminMode(): boolean {
  return process.env.ADMIN_ACCESS_ENABLED === 'true';
}

function getDashboardAssistantEventType(category: string): DashboardAssistantEventType {
  switch (category) {
    case 'wedding':    return 'wedding';
    case 'baptism':    return 'baptism';
    case 'baby-shower':return 'baby_shower';
    case 'birthday':   return 'birthday';
    default:           return 'wedding';
  }
}

// ─── Shared section wrapper ───────────────────────────────────────────────────

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <h2 className="text-xs uppercase tracking-widest mb-3 mt-8" style={{ color: '#3D2B1A' }}>
        {title}
      </h2>
      <div className="rounded-xl p-6 mb-8" style={{ background: '#FFFFFF', border: '1px solid #E8E2DA' }}>
        {hint && (
          <p className="text-xs mb-4" style={{ color: '#9B8878' }}>{hint}</p>
        )}
        {children}
      </div>
    </>
  );
}

// ─── Upsell block ─────────────────────────────────────────────────────────────

function UpsellBlock({ plan }: { plan: 'basic' | 'premium' }) {
  const text = plan === 'basic'
    ? 'Tu plan Basic incluye lo esencial: portada, cuenta regresiva, mapa, itinerario, vestimenta y mensaje final. Para agregar música, galería, video de portada y más, mejora tu plan.'
    : 'Tu plan Premium incluye música, galería, video e itinerario completo. Para agregar StoryBook, línea del tiempo, padrinos, mesa de regalos y hospedaje, mejora a Deluxe.';

  return (
    <div
      className="rounded-xl p-5 mb-8"
      style={{ background: '#F6F2EC', border: '1px solid #DED7CE' }}
    >
      <p className="text-xs uppercase tracking-widest mb-2" style={{ color: '#B99752' }}>
        {plan === 'basic' ? 'Plan Basic' : 'Plan Premium'}
      </p>
      <p className="text-sm mb-3" style={{ color: '#746B62', lineHeight: 1.6 }}>{text}</p>
      <Link
        href="/invitaciones#planes"
        className="inline-flex items-center gap-1 text-xs font-semibold"
        style={{ color: '#B99752' }}
      >
        Ver planes →
      </Link>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface Props {
  params:       Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const invitation = await invitationRepository.getById(id);
  if (!invitation) return { title: 'Invitación no encontrada — Kompralo Admin' };
  return { title: `Editar: ${invitation.title} — Kompralo Admin` };
}

export default async function EditInvitationPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const fromAdmin = sp.from === 'admin';
  const invitation = await invitationRepository.getById(id);

  if (!invitation) {
    notFound();
  }

  // Ownership check
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
    const emailMismatch =
      !hasScopedAccess &&
      ownerEmail &&
      ownerEmail.toLowerCase() !== (sessionUser?.email ?? '').toLowerCase();

    if (emailMismatch) {
      // Admin users can edit any invitation — check before showing error
      const adminCheck = sessionUser?.id ? await isAdminUser(sessionUser.id) : false;
      if (!adminCheck) {
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
  }

  const plan = normalizePlanId(invitation.planId);
  const isPremiumOrDeluxe = plan === 'premium' || plan === 'deluxe';
  const isDeluxe          = plan === 'deluxe';

  const assistantEnabledByEnv   = isDashboardAssistantEnabled();
  const assistantAllowedForPlan = isDashboardAssistantAllowedForPlan(invitation.planId);

  const assistantContext: InvitationAssistantContext = {
    eventType:            getDashboardAssistantEventType(invitation.category),
    title:                invitation.title || undefined,
    protagonists:         invitation.protagonists
                            .filter((p) => p.name)
                            .map((p) => ({ name: p.name, role: p.role || undefined })),
    eventDate:            invitation.eventDate || undefined,
    eventTime:            invitation.eventTime || undefined,
    venueName:            invitation.location?.venueName || undefined,
    address:              invitation.location?.address   || undefined,
    hashtag:              invitation.social?.hashtag     || undefined,
    dressCodeType:        invitation.dressCode?.type        || undefined,
    dressCodeDescription: invitation.dressCode?.description || undefined,
  };

  const previewUrl = `/preview/${invitation.id}?from=editor`;

  return (
    <div className="relative">
      {/* ── Editor column ───────────────────────────────────────────────────── */}
      <div className="w-full xl:pr-[500px] overflow-x-hidden">

        {/* Header */}
        <div className="mb-8">
          {fromAdmin && (
            <Link
              href="/admin/invitations"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                fontSize: '0.75rem', fontWeight: 600, color: '#E25822',
                textDecoration: 'none', marginBottom: '0.75rem',
              }}
            >
              ← Volver al admin
            </Link>
          )}
          <p className="text-xs uppercase tracking-widest mb-2" style={{ color: '#C5A880' }}>
            {invitation.category} · {plan} · {invitation.status}
          </p>
          <h1 className="text-2xl font-light break-words" style={{ color: '#1A1410' }}>
            {invitation.title}
          </h1>
          <p className="text-sm mt-1 font-mono break-all" style={{ color: '#9B8878' }}>
            /{invitation.slug}
          </p>
        </div>

        <WeddingQuickStartSetup invitation={invitation}>
          {/* ── 1. Datos del evento ──────────────────────────────────────────── */}
        <Section title="Datos del evento">
          <EditForm invitation={invitation} />
        </Section>

        {/* ── 2. Portada y multimedia ─────────────────────────────────────── */}
        <Section
          title="Portada y multimedia"
          hint={
            plan === 'basic'
              ? 'Imagen principal, música y video disponibles en plan Premium.'
              : 'Imagen principal, video de portada y música de fondo.'
          }
        >
          <MediaForm invitation={invitation} plan={plan} />
        </Section>

        {/* ── Novios / Protagonistas (no aparece en la lista numerada
             pero no se elimina — va justo después de Portada) ─────────── */}
        <Section
          title={invitation.category === 'wedding' ? 'Novios / Protagonistas' : 'Protagonistas'}
          hint={
            invitation.category === 'wedding'
              ? 'Agrega los nombres de los novios. Estos datos aparecerán en la portada, la introducción y los mensajes principales de la invitación.'
              : 'Agrega a la persona o personas principales del evento. Estos datos aparecerán en la portada, la introducción y los mensajes principales de la invitación.'
          }
        >
          <ProtagonistsForm invitation={invitation} />
        </Section>

        {/* ── 4. Nuestros padres — bodas (Deluxe) ────────────────────────── */}
        {invitation.category === 'wedding' && isDeluxe && (
          <Section
            title="Nuestros padres"
            hint="Nombres de los padres de los novios. Aparecerán en la sección 'Nuestras Familias' de la invitación."
          >
            <ParentsForm invitation={invitation} />
          </Section>
        )}

        {/* ── 3. Nuestra historia — Deluxe ────────────────────────────────── */}
        {isDeluxe && (
          <Section
            title="Nuestra historia"
            hint="Slides que narran la historia del evento. Cada slide tiene imagen, título, texto y fecha opcional."
          >
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
          </Section>
        )}

        {/* ── 4. Nuestra galería — Premium+ ───────────────────────────────── */}
        {isPremiumOrDeluxe && (
          <Section
            title="Nuestra galería"
            hint="Las imágenes se muestran en el carrusel de la invitación en el orden definido aquí."
          >
            <GalleryForm invitation={invitation} />
          </Section>
        )}

        {/* ── 5. Línea de tiempo — Deluxe ─────────────────────────────────── */}
        {isDeluxe && (
          <Section
            title="Línea de tiempo"
            hint="Momentos clave de la historia del evento en orden cronológico."
          >
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
          </Section>
        )}

        {/* ── 6. Itinerario del evento ─────────────────────────────────────── */}
        <Section
          title="Itinerario del evento"
          hint="Define los momentos clave del día en orden cronológico."
        >
          <ItineraryForm invitation={invitation} />
        </Section>

        {/* ── 7. Ubicación ────────────────────────────────────────────────── */}
        <Section
          title="Ubicación"
          hint="Agrega los links de Google Maps y Waze para que los invitados lleguen fácilmente al venue."
        >
          <LocationForm invitation={invitation} />
        </Section>

        {/* ── 8. Código de vestimenta ──────────────────────────────────────── */}
        <Section
          title="Código de vestimenta"
          hint="Define la etiqueta, descripción y colores sugeridos."
        >
          <DressCodeForm invitation={invitation} />
        </Section>

        {/* ── 9. Mesa de regalos — Deluxe ──────────────────────────────────── */}
        {isDeluxe && (
          <Section
            title="Mesa de regalos"
            hint="Agrega tiendas en línea o datos bancarios."
          >
            <GiftRegistryForm invitation={invitation} />
          </Section>
        )}

        {/* ── 10. Nuestros padrinos — Deluxe ───────────────────────────────── */}
        {isDeluxe && (
          <Section
            title="Nuestros padrinos"
            hint="Agrupa a los padrinos por rubro."
          >
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
          </Section>
        )}

        {/* ── 11. Hospedaje — Deluxe ───────────────────────────────────────── */}
        {isDeluxe && (
          <Section
            title="Hospedaje"
            hint="Hoteles recomendados para los invitados."
          >
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
          </Section>
        )}

        {/* ── 12. Redes y Hashtag — Premium+ ──────────────────────────────── */}
        {isPremiumOrDeluxe && (
          <Section
            title="Redes y Hashtag"
            hint="Hashtag oficial del evento y redes sociales para que los invitados compartan."
          >
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
          </Section>
        )}

        {/* ── 13. Mensaje final ────────────────────────────────────────────── */}
        <Section
          title="Mensaje final"
          hint="La sección de cierre de la invitación: cita destacada, mensaje personal e imagen de fondo."
        >
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
            protagonists={invitation.protagonists.map((p) => ({
              id:          p.id,
              name:        p.name,
              role:        p.role        ?? '',
              familyLabel: p.familyLabel ?? '',
              imageUrl:    p.imageUrl    ?? '',
              quote:       p.quote       ?? '',
            }))}
          />
        </Section>

        {/* ── Diseño y tema ────────────────────────────────────────────────── */}
        <Section
          title="Diseño y tema"
          hint="Elige el tema visual de la invitación. Cada tema define colores, tipografía, formas y efectos."
        >
          <ThemeSelectorForm
            invitationId={invitation.id}
            slug={invitation.slug}
            currentThemeId={invitation.themeId}
          />
        </Section>

        {/* ── Secciones activas ────────────────────────────────────────────── */}
        <Section
          title="Secciones activas"
          hint="Activa o desactiva secciones individualmente. Las secciones bloqueadas requieren un plan superior."
        >
          <FeaturesForm
            invitationId={invitation.id}
            slug={invitation.slug}
            planId={invitation.planId}
            initialOverrides={invitation.featureOverrides ?? {}}
          />
        </Section>

        {/* ── Upsell — solo Basic y Premium ───────────────────────────────── */}
        {(plan === 'basic' || plan === 'premium') && (
          <UpsellBlock plan={plan} />
        )}

        {/* ── Mobile preview button ───────────────────────────────────────── */}
        <div className="xl:hidden mt-2 mb-2">
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
        </WeddingQuickStartSetup>
      </div>{/* end editor column */}

      {/* ── Preview panel ───────────────────────────────────────────────────── */}
      <aside className="hidden xl:block fixed right-8 top-6 z-30 h-[calc(100vh-48px)] w-[460px]">
        <div className="h-full overflow-hidden rounded-[28px] border border-[#e7dccb] bg-white shadow-2xl">
          <LivePreview invitationId={invitation.id} />
        </div>
      </aside>

      <DashboardAssistantMount
        enabledByEnv={assistantEnabledByEnv}
        enabledForPlan={assistantAllowedForPlan}
        invitationContext={assistantContext}
      />
    </div>
  );
}
