import type { PlanId } from '@/domain/plans/types';
import type {
  InvitationContent,
  InvitationBasicInfoInput,
  InvitationMediaInput,
  InvitationHeroVideoInput,
  InvitationGalleryInput,
  InvitationProtagonistsInput,
  InvitationItineraryInput,
  InvitationGiftRegistryInput,
  InvitationDressCodeInput,
  InvitationParentsInput,
  InvitationSponsorsInput,
  InvitationStoryBookInput,
  InvitationAccommodationInput,
  InvitationSocialInput,
  InvitationFinalMessageInput,
  InvitationTimelineInput,
  InvitationThemeSelectionInput,
} from '@/domain/invitations/types';
import type { FeatureOverrides } from '@/domain/plans/types';

export interface ActivateAfterPaymentInput {
  invitationId:    string;
  planId:          PlanId;
  stripeSessionId: string;
  customerEmail?:  string;
}

export interface CreateFromPaidOrderInput {
  planId:          PlanId;
  customerEmail:   string;
  customerName?:   string | null;
  stripeSessionId: string;
  /** Auth user who initiated the purchase. Persisted as invitations.user_id. */
  ownerUserId?:    string | null;
}

export interface CreateFromPaidOrderResult {
  invitationId: string;
}

export interface IInvitationRepository {
  list(): Promise<InvitationContent[]>;
  getBySlug(slug: string): Promise<InvitationContent | null>;
  getById(id: string): Promise<InvitationContent | null>;
  getPreviewById(id: string): Promise<InvitationContent | null>;
  updateBasicInfo(id: string, input: InvitationBasicInfoInput): Promise<InvitationContent>;
  updateMediaInfo(id: string, input: InvitationMediaInput): Promise<InvitationContent>;
  updateHeroVideo(id: string, input: InvitationHeroVideoInput): Promise<InvitationContent>;
  updateGallery(id: string, input: InvitationGalleryInput): Promise<InvitationContent>;
  updateProtagonists(id: string, input: InvitationProtagonistsInput): Promise<InvitationContent>;
  updateItinerary(id: string, input: InvitationItineraryInput): Promise<InvitationContent>;
  updateGiftRegistry(id: string, input: InvitationGiftRegistryInput): Promise<InvitationContent>;
  updateDressCode(id: string, input: InvitationDressCodeInput): Promise<InvitationContent>;
  updateParents(id: string, input: InvitationParentsInput): Promise<InvitationContent>;
  updatePadrinos(id: string, input: InvitationSponsorsInput): Promise<InvitationContent>;
  updateStoryBook(id: string, input: InvitationStoryBookInput): Promise<InvitationContent>;
  updateAccommodation(id: string, input: InvitationAccommodationInput): Promise<InvitationContent>;
  updateSocial(id: string, input: InvitationSocialInput): Promise<InvitationContent>;
  updateFinalMessage(id: string, input: InvitationFinalMessageInput): Promise<InvitationContent>;
  updateTimeline(id: string, input: InvitationTimelineInput): Promise<InvitationContent>;
  updateFeatureOverrides(id: string, overrides: FeatureOverrides): Promise<InvitationContent>;
  updateThemeSelection(id: string, input: InvitationThemeSelectionInput): Promise<InvitationContent>;
  /**
   * Activates an invitation after a successful Stripe payment.
   * Updates plan_id and transitions status to 'paid' (unless already paid/published).
   * Idempotent — safe to call multiple times for the same session.
   */
  activateAfterPayment(input: ActivateAfterPaymentInput): Promise<InvitationContent>;
  /**
   * Creates a blank, editable invitation for a customer who purchased without a
   * pre-existing invitation (e.g. bought directly from the pricing page).
   * Returns the new invitation's id.
   * Callers are responsible for idempotency — check order.invitationId before calling.
   */
  createFromPaidOrder(input: CreateFromPaidOrderInput): Promise<CreateFromPaidOrderResult>;
}
