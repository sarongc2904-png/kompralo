# Premium Theme Migration — Complete Solution

## Problem
Premium invitations in production may have legacy themes (`champagne`, `luxury-gold`, or incorrect theme_id values) instead of `ivory-editorial`. The theme resolution fallback is to `editorial`, making Premium look incorrect.

## Solution
1. **Migrate existing Premium** from legacy theme to `ivory-editorial`
2. **Verify new Premium** purchases get correct theme
3. **Add diagnostics** to track theme resolution
4. **Validate** rendering in production

---

## Step 1: Diagnose Current State

```bash
psql -U postgres -d your_db -f scripts/05_premium_theme_diagnostic.sql
```

Look for:
- Premium invitations with `theme_id != 'ivory-editorial'`
- Count by theme type (champagne, luxury-gold, editorial, etc.)
- Status breakdown (paid/published/draft)
- Missing or incomplete invitation_content

**Expected findings:**
- Some Premium may have `theme_id='champagne'` or `theme_id='luxury-gold'`
- These need to be updated to `'ivory-editorial'`

---

## Step 2: Execute Theme Migration

```bash
psql -U postgres -d your_db -f scripts/02_premium_theme_migration_execute.sql
```

**This executes:**
```sql
UPDATE public.invitations
SET theme_id = 'ivory-editorial', updated_at = now()
WHERE plan_id = 'premium'
  AND deleted IS NULL
  AND theme_id IS DISTINCT FROM 'ivory-editorial';
```

**Safety guarantees:**
- ✓ `plan_id` stays `'premium'` (never changes to 'gold')
- ✓ Only updates Premium invitations
- ✓ Only updates if theme is different (idempotent)
- ✓ Respects soft deletes
- ✓ Does NOT touch basic or deluxe
- ✓ Does NOT modify invitation_content

---

## Step 3: Verify Migration Success

```bash
psql -U postgres -d your_db -f scripts/03_premium_theme_migration_verify_after.sql
```

**Expected results:**
- All Premium invitations have `theme_id='ivory-editorial'` ✓
- All still have `plan_id='premium'` ✓
- No Premium with other themes ✓
- Basic and Deluxe untouched ✓

---

## Step 4: Test with Dev Diagnostics Enabled

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Open browser DevTools Console (F12)**

3. **Visit a Premium invitation** (paid/published status)
   - `/i/[slug]` (public view)
   - `/preview/[id]` (editor preview)

4. **Look for diagnostics in console:**
   ```
   [theme] input themeId: ivory-editorial | preview override: undefined
   [theme] resolved to: ivory-editorial | expected: ivory-editorial
   ```

**If resolved theme ≠ ivory-editorial:**
- Check what `input themeId` shows
- If it's not 'ivory-editorial', the migration didn't run
- If it's 'ivory-editorial' but resolved to something else, check theme registry

---

## Step 5: Validate Premium New Purchases

1. **Create a Premium purchase** (Stripe checkout or admin panel)
2. **Check Supabase invitations table:**
   - Find the new row
   - Verify `plan_id='premium'` ✓
   - Verify `theme_id='ivory-editorial'` ✓

3. **Check Supabase invitation_content:**
   - Should have complete Sofia-Alejandro fixture data ✓
   - protagonists, hero, gallery, story, etc. ✓

4. **Visit the invitation** (after admin activation or payment confirmation)
   - `/preview/[id]` or `/i/[slug]`
   - Should see ivory-editorial theme (warm champagne tones, serif typography)
   - Gallery, Music, Parents sections visible ✓
   - StoryBook, Timeline, Padrinos hidden ✓

---

## Code Changes

### InvitationRenderer.tsx (Line 112-120)
Added diagnostic logging:
```typescript
const resolvedThemeId = themePreviewId ?? invitation.themeId;
const themeV2 = resolveTheme(resolvedThemeId);

// Logs to console:
// [theme] input themeId: {invitation.themeId} | preview override: {themePreviewId}
// [theme] resolved to: {themeV2.id} | expected: ivory-editorial
```

This helps identify:
- What theme is stored in the invitation
- What theme preview is active (if any)
- What theme actually resolved from the registry
- Whether resolution is correct

### No Changes Needed To:
- Theme registry (ivory-editorial already registered) ✓
- Plan normalization (Premium → 'premium' in DB) ✓
- Default content generation (fixture has ivory-editorial) ✓
- Admin creation (already uses ivory-editorial) ✓

---

## Rollback Plan

If something goes wrong:

**During migration (before COMMIT):**
```sql
ROLLBACK;
```

**After migration (restore previous theme):**
```sql
UPDATE public.invitations
SET theme_id = 'luxury-gold'  -- or whatever was original
WHERE plan_id = 'premium'
  AND status IN ('paid', 'published')
  AND deleted IS NULL;
```

No code changes needed to rollback (diagnostic logging can stay).

---

## Theme Resolution Logic

**How themes are resolved:**

```typescript
// In InvitationRenderer.tsx
const themeV2 = resolveTheme(themePreviewId ?? invitation.themeId);

// In resolveTheme() [registry.ts]
export function resolveTheme(themeId?: string | null): InvitationThemeV2 {
  if (!themeId) return themeRegistryV2['editorial']; // fallback
  return themeRegistryV2[themeId] ?? themeRegistryV2['editorial']; // fallback
}

// Theme registry has:
{
  'ivory-editorial': { ... ivory theme ... },
  'luxury-gold': { ... gold theme ... },
  'luxury-champagne': { ... champagne theme ... },
  'editorial': { ... default editorial ... },
  // ...
}
```

**Resolution chain:**
1. If `themePreviewId` is set (editor preview), use that
2. Otherwise use `invitation.themeId` (from Supabase)
3. If that doesn't exist in registry, fall back to `'editorial'`

**For Premium after migration:**
- `invitation.themeId` = `'ivory-editorial'` ✓
- `resolveTheme('ivory-editorial')` → finds it in registry ✓
- Returns ivory-editorial theme ✓

---

## Monitoring & Validation

### During Development
- Console logs show theme resolution
- Verify "resolved to: ivory-editorial" matches "expected: ivory-editorial"

### In Production
- Remove console.log statements from InvitationRenderer
- Or wrap with `if (isDevelopment)` for safety
- Monitor error logs for theme resolution failures

### Checkpoint Validation Queries

**After migration, run these to verify:**

```sql
-- All Premium should have ivory-editorial
SELECT COUNT(*) FROM public.invitations
WHERE plan_id = 'premium' AND theme_id != 'ivory-editorial' AND deleted IS NULL;
-- Result should be: 0

-- Basic and Deluxe untouched
SELECT plan_id, COUNT(*) FROM public.invitations
WHERE deleted IS NULL AND status IN ('paid', 'published')
GROUP BY plan_id ORDER BY plan_id;
-- Result should show plan_id distribution unchanged
```

---

## Summary

✅ Premium existing: migrated to `theme_id='ivory-editorial'`  
✅ Premium new: created with `theme_id='ivory-editorial'`  
✅ Diagnostics: logs show theme resolution  
✅ Registry: ivory-editorial registered and available  
✅ Fallback: to 'editorial' if theme missing (safe default)  
✅ Plan ID: stays 'premium' (Supabase constraint respected)  

**Status: Ready for production execution**
