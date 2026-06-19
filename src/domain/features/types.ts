import type { PlanId, InvitationFeatureKey } from '@/domain/plans/types';

// ─── Status ───────────────────────────────────────────────────────────────────

/** Feature is live and renderable in InvitationRenderer. */
export type FeatureStatus = 'active' | 'comingSoon' | 'hidden';

// ─── Category ────────────────────────────────────────────────────────────────

export type FeatureCategory =
  | 'core'        // always-on structural elements
  | 'engagement'  // interactive elements (rsvp, guestbook, messages)
  | 'media'       // gallery, music, video, streaming
  | 'social'      // hashtag, spotify, instagram embed
  | 'logistics'   // location, accommodation, qr, itinerary
  | 'content'     // story, timeline, padrinos, parents, dress code
  | 'ai';         // ai-assisted features

// ─── Feature descriptor ───────────────────────────────────────────────────────

export interface FeatureDescriptor {
  /** Matches InvitationFeatureKey for active features; free-form id for comingSoon/hidden. */
  id: string;

  /** Human-readable label (español). */
  label: string;

  /** Short description of what the feature does. */
  description: string;

  /** Grouping category for the feature catalog UI. */
  category: FeatureCategory;

  /** Lifecycle status. */
  status: FeatureStatus;

  /**
   * Minimum plan required to activate this feature.
   * null = not yet assigned to any plan (comingSoon/hidden).
   */
  minimumPlan: PlanId | null;

  /**
   * Icon name for the feature catalog UI.
   * Uses a simple string identifier; the UI layer resolves it to an actual icon.
   */
  iconName: string;

  /**
   * True if the feature requires server-side persistence (DB, storage, etc.).
   * False means it is purely presentational / client-rendered.
   */
  requiresPersistence: boolean;

  /** Customer can toggle this feature on/off in the self-serve editor. */
  editableByCustomer: boolean;

  /** Admin can override this feature outside the plan matrix. */
  editableByAdmin: boolean;

  /**
   * The corresponding InvitationFeatureKey in the plans system.
   * Only set for active features that map 1:1 to a plan feature flag.
   */
  planFeatureKey?: InvitationFeatureKey;
}
