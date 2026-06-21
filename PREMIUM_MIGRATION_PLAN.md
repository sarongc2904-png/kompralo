# Premium Plan Theme Migration — Corrected Plan

## Problem Statement
Premium invitations in production have legacy themes (`champagne`, `luxury-gold`) instead of `ivory-editorial`. 

**CORRECTION:** `plan_id` must remain `'premium'` (Supabase constraint allows only 'basic', 'premium', 'deluxe').
Only `theme_id` changes to `'ivory-editorial'` to render with final template.

---

## Code Changes (REVERTED & CORRECTED)

All changes to map Premium to 'gold' plan_id have been REVERTED.

### 1. Plan Type System — `src/domain/plans/types.ts` ✅ REVERTED
- `PlanId = 'basic' | 'premium' | 'deluxe'` (UNCHANGED — no 'gold')
- `parsePlanId()`: Both `'gold'` (legacy) and `'premium'` (Stripe) → `'premium'`
- `normalizePlanId()`: Default `'premium'`
- `inferPlanIdFromAmount()`: 89900 → `'premium'`

### 2. Plan Registry — `src/domain/plans/registry.ts` ✅ REVERTED
- `plansById['premium']` (RESTORED — no 'gold' key)
- `plan.id = 'premium'`
- `plan.name = 'Premium'`

### 3. Products Catalog — `src/domain/products/catalog.ts` ✅ REVERTED
- `productsById['premium']` (RESTORED)
- `planId: 'premium'`

### 4. Admin API — `src/app/api/admin/invitations/route.ts` ✅ REVERTED
- Default plan: `'premium'`

### 5. Admin Dashboard — `src/app/admin/page.tsx` ✅ REVERTED
- Filter: `plan_id === 'premium'` (no 'gold')

---

## SQL Migration (CORRECTED)

### Step 1: Verify Before Migration
```bash
psql -U postgres -d your_db -f scripts/01_premium_theme_migration_verify_before.sql
```

**Expected output:**
- Count of Premium invitations with legacy theme
- Sample invitations that need theme update

### Step 2: Execute Migration (THEME ONLY)
```bash
psql -U postgres -d your_db -f scripts/02_premium_theme_migration_execute.sql
```

**This will:**
```sql
UPDATE public.invitations
SET
  theme_id = 'ivory-editorial',
  updated_at = now()
WHERE
  plan_id = 'premium'
  AND status IN ('paid', 'published')
  AND deleted IS NULL
  AND theme_id != 'ivory-editorial';
```

**Safety:**
- ✓ `plan_id` remains `'premium'` (Supabase constraint)
- ✓ Only updates Premium invitations
- ✓ Only updates paid/published
- ✓ Respects soft deletes
- ✓ Does NOT touch basic or deluxe
- ✓ Does NOT delete invitation_content

### Step 3: Verify After Migration
```bash
psql -U postgres -d your_db -f scripts/03_premium_theme_migration_verify_after.sql
```

**Expected output:**
- All Premium now have `theme_id='ivory-editorial'` ✓
- All still have `plan_id='premium'` ✓
- No Premium with other themes ✓
- Basic and Deluxe untouched ✓

---

## Premium Plan Flow (Corrected)

```
Stripe Checkout    →    Webhook        →    Supabase
────────────────────────────────────────────────────────
premium metadata   →    parsePlanId()  →    plan_id='premium'
                   →    (normalizes)   →    theme_id='ivory-editorial'
```

New Premium invitations:
- **plan_id:** `'premium'` (persisted to DB)
- **theme_id:** `'ivory-editorial'` (final template)
- **features:** premiumFeatures (music, gallery, video, QR, parents)

---

## Testing Premium After Migration

### New Premium Purchase
1. **Stripe checkout:** Select Premium plan
2. **Webhook:** Receives `plan_id='premium'`, saves with `theme_id='ivory-editorial'`
3. **Supabase check:**
   - `plan_id='premium'` ✓
   - `theme_id='ivory-editorial'` ✓
   - `invitation_content` has complete data ✓
4. **Render:**
   - `/preview/[id]` → ivory-editorial theme, final Hero design ✓
   - `/i/[slug]` → same ✓
   - NO golden heart ✓
   - Gallery, Music, Parents enabled ✓

### Existing Premium (After Migration)
1. **Check Supabase:** All Premium now have `theme_id='ivory-editorial'` ✓
2. **Render:**
   - `/i/[slug]` → corrected theme ✓
   - Hero final design ✓
   - Not champagne/luxury-gold ✓

---

## Rollback Plan

If needed:
```sql
UPDATE public.invitations
SET theme_id = 'champagne'  -- or whatever was the original theme
WHERE plan_id = 'premium' AND status IN ('paid', 'published');
```

No code changes needed to rollback (types unchanged).

---

## Files Modified

### Code (REVERTED)
- ✅ `src/domain/plans/types.ts` — back to 'premium', no 'gold'
- ✅ `src/domain/plans/registry.ts` — back to 'premium' key
- ✅ `src/domain/products/catalog.ts` — back to 'premium'
- ✅ `src/app/api/admin/invitations/route.ts` — default 'premium'
- ✅ `src/app/admin/page.tsx` — filter 'premium' only

### Migration Scripts (CORRECTED)
- ✅ `scripts/01_premium_theme_migration_verify_before.sql`
- ✅ `scripts/02_premium_theme_migration_execute.sql`
- ✅ `scripts/03_premium_theme_migration_verify_after.sql`

---

## Status: ✅ CORRECTED

✅ Code reverted to use 'premium' (no 'gold')  
✅ SQL migration ONLY changes theme_id  
✅ Supabase constraint respected  
✅ Verification queries included  
✅ Rollback documented  

**Next:** Run migration scripts 01 → 02 → 03 against Supabase production.
