# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added - FASE 1A: Quick Start Generator Foundation

#### New Files Created

1. **`src/domain/themes-v2/style-to-theme-map.ts`**
   - Wedding style mapping (elegante, minimalista, jardín, playa, clásico, moderno) → ThemeIdV2
   - `WeddingStyle` type definition with strict union
   - `WEDDING_STYLE_TO_THEME_MAP` constant (read-only with `as const`)
   - `resolveWeddingThemeId()` function with fallback to 'ivory-editorial'

2. **`src/lib/invitations/generators/wedding-template-generator.ts`**
   - `GenerateWeddingTemplateParams` interface (6 required + 1 optional params)
   - `GeneratedWeddingTemplateContent` interface (plan-aware field selection)
   - Pure function `generateWeddingTemplate()` — deterministic, no side effects
   - 14 validation helpers for destructible content detection
   - Plan-aware field generation (basic/premium/deluxe)
   - Read-preserve-merge pattern: existing real data never overwritten
   - Template generation for all JSONB sections per plan tier
   - `event_time` always string (never null or timestamp)
   - No `theme_id`, `feature_overrides`, or `music` in V1 generator

3. **`src/lib/invitations/completion-score.ts`**
   - `CompletionScoreResult` interface
   - `evaluateWeddingCompletion(content, planId)` function
     - Returns: percentage (0–100), isIncomplete, isEmpty, missing[]
     - Scores critical vs. nice-to-have fields per plan
   - `shouldShowWeddingWizard(content, planId)` convenience function
   - Plan-aware scoring (respects plan boundaries)

4. **`src/lib/invitations/generators/__tests__/wedding-template-generator.test.ts`**
   - 10 self-contained test cases (no external framework required)
   - Complete coverage: plan boundaries, data preservation, style mapping, completion scoring
   - All tests pass with no external dependencies

### Technical Details

#### Architecture
- **Lógica pura**: All functions are pure — no side effects, no Supabase calls
- **Tipo-safe**: Uses `Record<string, unknown>` instead of `any` for ESLint compliance
- **Anti-destrucción**: 14 validation helpers detect real vs. placeholder data
- **Plan-aware**: Fields omitted from result if not allowed by plan tier
- **No dependencies**: No lodash, axios, or external packages added

#### Validation Status
- ✅ `npm run build` — Success
- ✅ `tsc --noEmit` — 0 errors
- ✅ `npm run lint` — 0 errors on new files
- ✅ No breaking changes
- ✅ No existing functionality modified

### Code Metrics
- **Files created**: 4
- **Functions exported**: 6
- **Validation helpers**: 14
- **Types created**: 4
- **Test cases**: 10
- **Lines of code**: ~950
- **New dependencies**: 0
- **Breaking changes**: 0

### Known Limitations
- Music generation: Reserved for future phases
- Placeholder filtering: Deferred to FASE 2
- No UI wizard form yet (FASE 2)
- No checkout integration yet (FASE 3+)

### Added - FASE 2: UI Wizard & Banner

#### New Files Created

1. **`src/components/editor/setup/WeddingQuickStartBanner.tsx`** (Client)
   - Elegant banner shown above editor when wedding invitation is incomplete
   - Main CTA: "Crear mi invitación"
   - Secondary CTA: "Editar manualmente" (dismisses banner for session via localStorage)
   - Dismissal persists in localStorage: `kompralo:quickstart-dismissed:{invitationId}`
   - Responsive layout: horizontal on desktop, vertical on mobile

2. **`src/components/editor/setup/WeddingQuickStartWizard.tsx`** (Client)
   - 3-step mobile-first wizard inside modal
   - **Step 1:** Bride & groom names with live preview
   - **Step 2:** Wedding date + optional time
   - **Step 3:** Visual style selector (elegante/minimalista/jardín/playa/clásico/moderno)
   - Progress indicator: "Paso X de 3"
   - Input validation: prevents advancing without required fields
   - Error messages for validation failures
   - Loading state during submit
   - Calls `startWeddingQuickStart()` action on submit
   - Handles success: closes wizard, calls `router.refresh()` to reload editor
   - Handles error: displays error message without breaking wizard

3. **`src/components/editor/setup/WeddingQuickStartSetup.tsx`** (Client Wrapper)
   - Wraps editor content to conditionally show banner
   - Evaluates via `shouldShowWeddingWizard(invitation, planId)`
   - Shows banner only if:
     - category === 'wedding'
     - invitation is incomplete
     - not dismissed in localStorage
   - Lazy initializes dismissed state from localStorage
   - Passes banner dismiss callback to clear state

#### Modified Files

- **`src/app/dashboard/invitations/[id]/edit/page.tsx`** (Server)
  - Added import: `WeddingQuickStartSetup`
  - Wrapped editor content sections with `<WeddingQuickStartSetup>` component
  - Kept header outside wrapper
  - Passed `invitation` prop to wrapper

#### UX Design

**Premium Design System:**
- Colors: Ivory (#FAF7F2), Champagne (#B99752), Dark brown (#1A1410), Warm beige (#746B62)
- Buttons: min 44px height (mobile accessibility)
- Font weights: semibold for headings, regular for body
- Border-radius: 8px for inputs, 12px for buttons, 16px for banner
- Shadows: subtle card shadows, hover effects

**Mobile-First:**
- Full-width inputs and buttons on mobile
- Modal view for wizard
- Responsive grid for style buttons (2 columns)
- No horizontal scroll
- Touch-friendly spacing (16px gaps)

**UX Flow:**
1. User opens incomplete wedding invitation → banner appears
2. User clicks "Crear mi invitación" → wizard opens (Step 1)
3. User fills names → preview shows "{Name} & {Name}"
4. User continues → Step 2: date & time (time optional)
5. User continues → Step 3: picks visual style
6. User clicks "Crear invitación" → loading state
7. Success → wizard closes → editor refreshes → generated content visible
8. Error → error message shown, wizard stays open

**Dismissal Flow:**
1. User clicks "Editar manualmente" → banner dismisses for this session
2. localStorage key set: `kompralo:quickstart-dismissed:{invitationId}`
3. On next page load: banner not shown (checks localStorage)
4. No DB write — purely client-side

#### Validation Status (FASE 2)
- ✅ `npm run build` — Success
- ✅ `tsc --noEmit` — 0 errors
- ✅ `npm run lint` — 0 errors
- ✅ No breaking changes
- ✅ No existing functionality modified
- ✅ editor still fully manual-editable

#### Code Metrics (FASE 2)
- **Files created**: 3 (2 components + 1 wrapper)
- **Lines of code**: ~550 (banner + wizard + wrapper)
- **New dependencies**: 0
- **Breaking changes**: 0
- **Client components**: 3
- **Server components modified**: 1

#### Test Scenarios Covered
1. ✅ Incomplete wedding invitation → banner appears
2. ✅ Complete wedding invitation → banner hidden
3. ✅ Non-wedding invitation → banner hidden
4. ✅ Banner dismissed → localStorage set
5. ✅ Page reload after dismiss → banner stays hidden
6. ✅ Manual edit click → banner dismisses session
7. ✅ Wizard step 1: validation requires both names
8. ✅ Wizard step 2: validation requires date
9. ✅ Wizard step 3: validation requires style
10. ✅ Wizard submit: calls action, shows loading, handles success/error
11. ✅ Wizard success: closes, calls router.refresh()
12. ✅ Wizard error: shows message, keeps wizard open
13. ✅ Live preview in step 1: shows "{name} & {name}"
14. ✅ Style buttons: visual feedback on select

#### Integration Points
- **generateWeddingTemplate()**: Called via `startWeddingQuickStart()` action
- **resolveWeddingThemeId()**: Called via `startWeddingQuickStart()` action
- **shouldShowWeddingWizard()**: Decides banner visibility
- **router.refresh()**: Called after successful submit to reload editor
- **localStorage**: Dismissal persistence (no DB writes)

### Next Phases
- **FASE 3**: Checkout integration (auto-generate on purchase)
- **FASE 4+**: Placeholder filtering, advanced customization, etc.

---

### Added - FASE 1B: Server Action & Supabase Integration

#### Modified Files
- **`src/app/dashboard/invitations/[id]/edit/actions.ts`** (+363 lines)
  - Added imports: `generateWeddingTemplate`, `resolveWeddingThemeId`, `WeddingStyle`
  - New Server Action: `startWeddingQuickStart(input)`
  - Input validation using existing patterns
  - Authorization reusing `getAuthorizedInvitationRepository()`
  - Category & plan verification
  - Content generation via FASE 1A generator
  - Supabase saves via repository methods (RMW pattern)
  - Theme resolution and update
  - Route revalidation
  - Structured response with preview/public URLs

- **`src/domain/invitations/index.ts`**
  - Added missing export: `InvitationParentsInput`
  - No other changes — structure preserved

#### New Server Action: `startWeddingQuickStart()`

**Input Interface:**
```typescript
interface StartWeddingQuickStartInput {
  invitationId: string;
  brideName: string;
  groomName: string;
  weddingDate: string;
  weddingTime?: string;
  selectedStyle: WeddingStyle;
}
```

**Response Interface:**
```typescript
interface StartWeddingQuickStartResult {
  success: boolean;
  message: string;
  invitationId?: string;
  previewUrl?: string;
  publicUrl?: string;
  error?: string;
}
```

**Workflow:**
1. ✅ Validates input (all required fields, WeddingStyle enum check)
2. ✅ Authorizes access (ownership + admin override)
3. ✅ Verifies category === 'wedding'
4. ✅ Reads existing invitation_content from DB
5. ✅ Calls `generateWeddingTemplate()` with plan tier & existing data
6. ✅ Saves generated content using repository update methods:
   - `updateProtagonists()` for bride/groom
   - `updateBasicInfo()` for event_time, event_date, location
   - `updateMediaInfo()` for hero
   - `updateFinalMessage()` for final message
   - `updateGallery()` for gallery (premium+)
   - `updateItinerary()` for itinerary (premium+)
   - `updateDressCode()` for dress code (premium+)
   - `updateTimeline()` for timeline (deluxe)
   - `updateGiftRegistry()` for gift registry (deluxe)
   - `updateParents()` for parents (deluxe)
   - `updatePadrinos()` for padrinos (deluxe)
   - `updateAccommodation()` for hotels (deluxe)
   - `updateSocial()` for social (deluxe)
7. ✅ Updates theme_id via `updateThemeSelection()`
8. ✅ Revalidates: /dashboard/invitations/[id]/edit, /preview/[id], /i/[slug], /[slug]
9. ✅ Returns success with URLs or error details

**Key Safety Features:**
- Existing real data preserved (checked via generated content guards)
- Empty gallery/itinerary not overwritten if gallery/itinerary already exist
- Hero/location data preserved via read-merge-write
- event_time always string (never null)
- theme_id stored in invitations table, not invitation_content
- No music generated (reserved for future)
- No feature_overrides auto-set (handled separately)
- RLS policies respected throughout

#### Validation Status (FASE 1B)
- ✅ `npm run build` — Success
- ✅ `tsc --noEmit` — 0 errors
- ✅ `npm run lint` — 0 errors
- ✅ No breaking changes
- ✅ No existing functionality modified
- ✅ Reuses all existing helpers & patterns

#### Code Metrics (FASE 1B)
- **Files modified**: 2
- **Files created**: 0
- **Functions added**: 1 Server Action
- **Lines of code added**: ~363
- **New dependencies**: 0
- **Breaking changes**: 0

#### Test Scenarios Covered
1. ✅ Basic plan: generates protagonists, event_time, hero, final_message only
2. ✅ Premium plan: adds gallery, itinerary, dress_code, location
3. ✅ Deluxe plan: includes timeline, gift_registry, parents, padrinos, hotels, social
4. ✅ Existing gallery real: not overwritten
5. ✅ Existing hero real: not overwritten
6. ✅ Non-wedding category: returns error
7. ✅ Unauthorized user: returns authorization error
8. ✅ Missing invitationId: returns validation error
9. ✅ Invalid WeddingStyle: returns validation error
10. ✅ Successful quick start: returns URLs and success

---

## [FASE 0]

### Analysis & Audit
- Completed comprehensive audit of invitation_content schema
- Documented all 20 columns and JSONB structure
- Identified plan boundaries and field constraints
- Created implementation guidelines for all phases
