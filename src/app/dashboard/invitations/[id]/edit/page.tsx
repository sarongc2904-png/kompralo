import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { invitationRepository } from '@/domain/invitations';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { isAdminUser } from '@/lib/admin';
import { normalizePlanId } from '@/domain/plans/types';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';
import { EditorV4Shell } from '@/components/editor-v4/EditorV4Shell';
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
import { shouldShowWeddingWizard } from '@/lib/invitations/completion-score';
import { WizardShell } from './WizardShell';
import { WizardExpress } from '@/components/wizard/WizardExpress';
import { VisualEditorMobileEntry } from '@/components/visual-editor/VisualEditorMobileEntry';
import { getAvailableModules } from '@/domain/modules';
import { getEditableElements } from '@/domain/visual-editor';

// Always render fresh â€” prevents the router/prefetch cache from serving a stale
// redirect-to-login response when navigating via <Link> from /cliente.
export const dynamic = 'force-dynamic';

function getDashboardAssistantEventType(category: string): DashboardAssistantEventType {
  switch (category) {
    case 'wedding':    return 'wedding';
    case 'baptism':    return 'baptism';
    case 'baby-shower':return 'baby_shower';
    case 'birthday':   return 'birthday';
    default:           return 'wedding';
  }
}

// â”€â”€â”€ Shared section wrapper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function Section({
  id,
  title,
  hint,
  children,
}: {
  id?: string;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id}>
      <h2 className="text-xs uppercase tracking-widest mb-3 mt-8" style={{ color: '#3D2B1A' }}>
        {title}
      </h2>
      <div className="rounded-xl p-6 mb-8" style={{ background: '#FFFFFF', border: '1px solid #E8E2DA' }}>
        {hint && (
          <p className="text-xs mb-4" style={{ color: '#9B8878' }}>{hint}</p>
        )}
        {children}
      </div>
    </section>
  );
}

// â”€â”€â”€ Upsell block â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function UpsellBlock({ plan }: { plan: 'basic' | 'premium' }) {
  const text = plan === 'basic'
    ? 'Tu plan Basic incluye lo esencial: portada, cuenta regresiva, mapa, itinerario, vestimenta y mensaje final. Para agregar mÃºsica, galerÃ­a, video de portada y mÃ¡s, mejora tu plan.'
    : 'Tu plan Premium incluye mÃºsica, galerÃ­a, video e itinerario completo. Para agregar StoryBook, lÃ­nea del tiempo, padrinos, mesa de regalos y hospedaje, mejora a Deluxe.';

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
        Ver planes â†’
      </Link>
    </div>
  );
}

// â”€â”€â”€ Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface Props {
  params:       Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const invitation = await invitationRepository.getById(id);
  if (!invitation) return { title: 'InvitaciÃ³n no encontrada â€” Kompralo Admin' };
  return { title: `Editar: ${invitation.title} â€” Kompralo Admin` };
}

export default async function EditInvitationPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const fromAdmin    = sp.from     === 'admin';
  const isWizardView = sp.view     === 'wizard';
  const isEditorV4   = sp.editor   === 'v4';
  const wizardHref   = fromAdmin ? '?from=admin&view=wizard' : '?view=wizard';
  const scrollHref   = fromAdmin ? '?from=admin' : '?';
  const v4Href       = fromAdmin ? `?from=admin&editor=v4` : '?editor=v4';
  const invitation = await invitationRepository.getById(id);

  if (!invitation) {
    notFound();
  }

  // Ownership check (always enforced â€” ADMIN_ACCESS_ENABLED removed)
  {
    let sessionUser = null;
    try {
      const supabase = await createServerSupabaseClient();
      const { data, error: getUserError } = await supabase.auth.getUser();
      sessionUser = data.user;
      console.log('[session-debug]', JSON.stringify({
        route:      `/dashboard/invitations/${id}/edit`,
        methodUsed: 'getUser',
        hasSession: !!sessionUser,
        hasUser:    !!data.user,
        userId:     data.user?.id ?? null,
        userEmail:  data.user?.email ?? null,
        error:      getUserError?.message ?? null,
      }));
    } catch (e) {
      console.error('[editPage] createServerSupabaseClient threw:', e);
      console.log('[session-debug]', JSON.stringify({
        route:      `/dashboard/invitations/${id}/edit`,
        methodUsed: 'getUser',
        hasSession: false,
        hasUser:    false,
        userId:     null,
        userEmail:  null,
        error:      String(e),
      }));
    }

    const ownerEmail  = invitation.customerEmail ?? null;
    const ownerUserId = invitation.ownerUserId ?? null;

    // TEMP diagnostic logs â€” remove after auth bug is resolved.
    const hasUser = !!sessionUser;
    const redirectTarget = `/login?redirect=${encodeURIComponent(`/dashboard/invitations/${id}/edit`)}`;
    console.log('[editPage] route=/dashboard/invitations/%s/edit', id);
    console.log('[editPage] hasUser=%s userId=%s userEmail=%s',
      hasUser, sessionUser?.id ?? 'null', sessionUser?.email ?? 'null');
    console.log('[editPage] invitationOwnerUserId=%s invitationCustomerEmail=%s',
      ownerUserId ?? 'null', ownerEmail ?? 'null');

    if (!sessionUser) {
      console.log('[editPage] redirectTarget=%s reason=no-session', redirectTarget);
      redirect(redirectTarget);
    }

    // Grant access if: user_id match OR customer_email match.
    const isOwnerByUserId = !!(ownerUserId && sessionUser.id && ownerUserId === sessionUser.id);
    const isOwnerByEmail  = !!(ownerEmail && sessionUser.email &&
      ownerEmail.toLowerCase() === sessionUser.email.toLowerCase());

    console.log('[editPage] isOwnerByUserId=%s isOwnerByEmail=%s', isOwnerByUserId, isOwnerByEmail);

    if (!isOwnerByUserId && !isOwnerByEmail) {
      const isAdmin = await isAdminUser(sessionUser.id, sessionUser.email);
      const authorized = isAdmin;
      console.log('[editPage] isAdmin=%s authorized=%s', isAdmin, authorized);
      if (!authorized) {
        console.log('[editPage] authorized=false reason=not-owner-not-admin');
        return (
          <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
            <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#C62828', marginBottom: '0.5rem' }}>
              Acceso no autorizado
            </p>
            <p style={{ color: '#6B5B4E', fontSize: '0.9rem', marginBottom: '2rem' }}>
              Esta invitaciÃ³n no pertenece a tu cuenta.
            </p>
            <Link
              href="/cliente"
              style={{ color: '#C5A880', fontSize: '0.875rem', textDecoration: 'none' }}
            >
              â† Ver mis invitaciones
            </Link>
          </div>
        );
      }
    }

    // Reaching here means access is granted (owner or admin passed above).
    const grantReason = isOwnerByUserId ? 'user_id-match' : isOwnerByEmail ? 'email-match' : 'admin';
    console.log('[editPage] authorized=true reason=%s', grantReason);
  }

  const plan = normalizePlanId(invitation.planId);
  const isPremiumOrDeluxe = plan === 'premium' || plan === 'deluxe';
  const isDeluxe          = plan === 'deluxe';
  const availableEditorModules = getAvailableModules(plan);
  const editableElements = getEditableElements(plan);

  // Quick Setup Wizard gate â€” show for new wedding invitations that haven't
  // completed the 3-step quick setup yet. Admins bypass it.
  // Uses service role to avoid RLS issues reading the new column.
  console.log('[wizard-gate] category=%s fromAdmin=%s id=%s', invitation.category, fromAdmin, id);
  if (!fromAdmin) {
    const { data: invRow, error: wizardQueryErr } = await createServiceRoleSupabaseClient()
      .from('invitations')
      .select('wizard_step_completed')
      .eq('id', id)
      .single();
    const raw = (invRow as { wizard_step_completed?: number } | null)?.wizard_step_completed;
    const { data: contentRow, error: contentWizardErr } = await createServiceRoleSupabaseClient()
      .from('invitation_content')
      .select('hero')
      .eq('invitation_id', id)
      .maybeSingle();
    const hero = (contentRow as { hero?: { wizardExpressCompleted?: boolean } } | null)?.hero;
    const wizardExpressCompleted = hero?.wizardExpressCompleted === true;
    console.log(
      '[wizard-gate] invRow=%j raw=%s wizardExpressCompleted=%s err=%s contentErr=%s',
      invRow,
      raw,
      wizardExpressCompleted,
      wizardQueryErr?.message ?? null,
      contentWizardErr?.message ?? null,
    );
    if (!wizardExpressCompleted) {
      const brideName = invitation.protagonists.find((p) => p.role === 'novia' || p.role === 'bride')?.name ?? '';
      const groomName = invitation.protagonists.find((p) => p.role === 'novio' || p.role === 'groom')?.name ?? '';
      return (
        <WizardExpress
          invitationId={id}
          planId={invitation.planId ?? 'basic'}
          invitationTitle={invitation.title}
          editorUrl={`/dashboard/invitations/${id}/edit`}
          prefilled={{
            brideName,
            groomName,
            eventDate: invitation.eventDate ?? '',
            venueName: invitation.location?.venueName ?? '',
          }}
        />
      );
    }
  }

  // V4 is the only editor â€” skip the wizard redirect.
  if (invitation.category === 'wedding' && !isEditorV4 && !fromAdmin &&
      shouldShowWeddingWizard(invitation, plan)) {
    redirect(v4Href);
  }

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

  // â”€â”€ Editor V4 gate â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (isEditorV4) {
    return (
      <EditorV4Shell
        invitationId={invitation.id}
        invitationTitle={invitation.title}
        slug={invitation.slug}
        invitationSnapshot={{
          eventDate:        invitation.eventDate                  ?? undefined,
          eventTime:        invitation.eventTime                  ?? undefined,
          protagonist1Name: invitation.protagonists?.[0]?.name   ?? undefined,
          protagonist2Name: invitation.protagonists?.[1]?.name   ?? undefined,
          venueName:        invitation.location?.venueName        ?? undefined,
          emotionalPhrase:  invitation.hero?.emotionalPhrase      ?? undefined,
          planId:           invitation.planId                     ?? undefined,
          slug:             invitation.slug                       ?? undefined,
          selectedVideoId:  invitation.hero?.selectedVideoId      ?? undefined,
          imageUrl:         invitation.hero?.imageUrl             ?? undefined,
          videoUrl:         invitation.hero?.videoUrl             ?? undefined,
          youtubeUrl:       invitation.hero?.youtubeUrl           ?? undefined,
          musicUrl:         invitation.music?.audioUrl            ?? undefined,
          musicTitle:       invitation.music?.title               ?? undefined,
          googleMapsLink:   invitation.location?.googleMapsLink   ?? undefined,
          wazeLink:         invitation.location?.wazeLink         ?? undefined,
          eventLabel:       invitation.hero?.eventLabel           ?? undefined,
          connectorText:    invitation.hero?.connectorText        ?? undefined,
          storySectionTitle:  invitation.story?.sectionTitle       ?? undefined,
          storySectionEyebrow: invitation.story?.sectionEyebrow    ?? undefined,
          storySlidesJson: JSON.stringify(invitation.story?.slides.map((s) => ({
            id:       s.id,
            title:    s.title,
            subtitle: s.subtitle ?? '',
            text:     s.text,
            imageUrl: s.imageUrl,
            date:     s.date ?? '',
          })) ?? []),
          galleryImages:    invitation.gallery?.images               ?? [],
          dressCodeJson:    JSON.stringify(invitation.dressCode      ?? {}),
          finalMessageJson: JSON.stringify(invitation.finalMessage   ?? {}),
          parentsJson:      JSON.stringify({
            brideFather: invitation.parents.find((p) => p.side === 'bride')?.fatherName ?? '',
            brideMother: invitation.parents.find((p) => p.side === 'bride')?.motherName ?? '',
            groomFather: invitation.parents.find((p) => p.side === 'groom')?.fatherName ?? '',
            groomMother: invitation.parents.find((p) => p.side === 'groom')?.motherName ?? '',
          }),
          padrinosJson:     JSON.stringify(
            invitation.padrinos?.map((p) => ({
              id:    p.id,
              rubro: p.rubro,
              icon:  p.icon,
              names: p.names ?? [],
            })) ?? []
          ),
          hotelsJson:       JSON.stringify(invitation.hotels ?? []),
          itineraryJson:    JSON.stringify(invitation.itinerary ?? []),
          timelineJson:     JSON.stringify(invitation.timeline ?? []),
          giftRegistryJson: JSON.stringify(invitation.giftRegistry?.items ?? []),
          hiddenSections:   (invitation.featureOverrides as { hiddenSections?: string[]; globalTextColor?: string } | undefined)?.hiddenSections ?? [],
          themeId:          invitation.themeId ?? undefined,
          globalTextColor:  (invitation.featureOverrides as { hiddenSections?: string[]; globalTextColor?: string } | undefined)?.globalTextColor ?? undefined,
        }}
      />
    );
  }

  // V4 is the only supported editor - redirect any legacy URL to V4.
  redirect(v4Href);
}
