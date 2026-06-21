# Premium Plan Migration — Complete Plan

## Problem Statement
Premium invitations in production have legacy themes (`champagne`, `luxury-gold`) instead of `ivory-editorial`. They need to be:
1. Normalized from `plan_id='premium'` to `plan_id='gold'` (canonical)
2. Updated to use `theme_id='ivory-editorial'`

---

## Code Changes (COMPLETED)

### 1. Plan Type System — `src/domain/plans/types.ts`
**Changed:** `PlanId = 'basic' | 'premium' | 'deluxe'` → `PlanId = 'basic' | 'gold' | 'deluxe'`

- **parsePlanId():** Both `'gold'` and `'premium'` (from Stripe) now map to `'gold'`
- **normalizePlanId():** Default fallback changed from `'premium'` to `'gold'`
- **inferPlanIdFromAmount():** 89900 amount now infers `'gold'` instead of `'premium'`
- **LegacyPlanId:** Updated to `'premium' | 'platinum'` (both are now legacy)

### 2. Plan Registry — `src/domain/plans/registry.ts`
**Changed:** `plansById['premium']` → `plansById['gold']`

- Key changed from `'premium'` to `'gold'`
- `plan.id = 'gold'` (canonical ID in DB)
- `plan.name = 'Premium'` (display name still says Premium)
- `defaultPlanId = 'gold'`

### 3. Products Catalog — `src/domain/products/catalog.ts`
**Changed:** `productsById['premium']` → `productsById['gold']`

- Key: `'gold'`
- `planId: 'gold'`
- Name: still "Premium" for UI

### 4. Admin API — `src/app/api/admin/invitations/route.ts`
**Changed:** Default plan from `'premium'` to `'gold'` (line 41)

### 5. Admin Dashboard — `src/app/admin/page.tsx`
**Changed:** Premium filter to include both `'gold'` and `'premium'` (line 89)

```typescript
const premiumPaid = paid.filter(o => o.plan_id === 'gold' || o.plan_id === 'premium');
```

---

## SQL Migration Steps

### Step 1: Verify Before Migration
```bash
psql -U postgres -d your_db -f scripts/01_premium_migration_verify_before.sql
```

**Output you should see:**
- Count of `plan_id='premium'` with `theme_id IN ('champagne', 'luxury-gold')`
- Status breakdown (paid/published)
- Sample invitations with legacy themes

### Step 2: Execute Migration
```bash
psql -U postgres -d your_db -f scripts/02_premium_migration_execute.sql
```

**This will:**
- UPDATE all `plan_id='premium'` to `plan_id='gold'`
- UPDATE all theme_id to `'ivory-editorial'`
- SET `updated_at=now()`
- Only for `status IN ('paid', 'published')` and `deleted IS NULL`

**Safety:** Wrapped in transaction — you can ROLLBACK if needed.

### Step 3: Verify After Migration
```bash
psql -U postgres -d your_db -f scripts/03_premium_migration_verify_after.sql
```

**Output you should see:**
- All migrated invitations now have `plan_id='gold'` ✓
- All have `theme_id='ivory-editorial'` ✓
- NO invitations still have `plan_id='premium'` ✓
- `invitation_content` still exists for all ✓
- `basic` and `deluxe` untouched ✓

### Step 4: Optional — Backfill Missing Content
If invitations have empty `invitation_content`:
```bash
psql -U postgres -d your_db -f scripts/04_premium_backfill_content.sql
```

---

## Testing Premium After Migration

### New Premium Purchase
1. **In Stripe checkout:**
   - Select Premium plan
   - Stripe sends `plan_id='premium'` in metadata

2. **In webhook:**
   - `resolvePurchasedPlanId('premium')` → `parsePlanId('premium')` → `'gold'`
   - Saves to DB with `plan_id='gold'` ✓

3. **Verify in Supabase:**
   - New row in `invitations` table has `plan_id='gold'` ✓
   - `theme_id='ivory-editorial'` ✓
   - `invitation_content` has complete Sofia-Alejandro fixture data ✓

4. **Render check:**
   - `/preview/[id]` should show ivory-editorial theme with final Hero design
   - `/i/[slug]` should show same template
   - NO golden heart (CinematicIntro) ✓
   - Gallery, music, parents sections enabled ✓
   - StoryBook, timeline, padrinos DISABLED ✓

### Existing Premium (Migrated)
1. **Check Supabase:**
   - All old `plan_id='premium'` now `'gold'` ✓
   - All old themes now `'ivory-editorial'` ✓

2. **Render check:**
   - `/i/[slug]` for old Premium should show corrected template
   - Theme should be ivory-editorial, not champagne ✓
   - Hero should be final photographic design ✓

---

## Rollback Plan

If something goes wrong:

**During migration (before COMMIT):**
```sql
ROLLBACK;
```

**After migration:**
```sql
UPDATE public.invitations
SET plan_id = 'premium', theme_id = 'champagne'  -- or luxury-gold
WHERE plan_id = 'gold'
  AND status IN ('paid', 'published');
```

Then revert code changes to `src/domain/plans/types.ts`.

---

## Plan Normalization Summary

**What goes into Stripe checkout metadata:**
- `plan_id: 'premium'` (sent by frontend)

**What gets saved to Supabase:**
- `plan_id: 'gold'` (normalized via parsePlanId)
- `theme_id: 'ivory-editorial'` (set in supabase.repository.ts:901)

**How it's resolved in code:**
- `getPlanById('gold')` → `plansById.gold` → premiumFeatures ✓
- `resolvePurchasedPlanId('premium')` → `'gold'` ✓
- Both Stripe and legacy invitations use same plan ID ✓

---

## Files Modified

### Code Changes
- ✅ `src/domain/plans/types.ts` — PlanId type, parsePlanId, normalizePlanId
- ✅ `src/domain/plans/registry.ts` — plansById, defaultPlanId
- ✅ `src/domain/products/catalog.ts` — productsById
- ✅ `src/app/api/admin/invitations/route.ts` — default plan
- ✅ `src/app/admin/page.tsx` — premium filter

### Migration Scripts
- ✅ `scripts/01_premium_migration_verify_before.sql`
- ✅ `scripts/02_premium_migration_execute.sql`
- ✅ `scripts/03_premium_migration_verify_after.sql`
- ✅ `scripts/04_premium_backfill_content.sql`

---

## Status: READY FOR DEPLOYMENT

✅ Code changes committed  
✅ SQL migration scripts ready  
✅ Verification queries included  
✅ Backfill script available (optional)  
✅ Rollback plan documented  

**Next:** Run migration scripts against production in order.
