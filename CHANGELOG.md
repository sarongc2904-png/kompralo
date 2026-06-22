# Changelog

Todos los cambios notables en este proyecto se documentan aquí.

---

## [Unreleased]

### Added - 2026-06-21

#### 🎨 Three New Pastel Editorial Theme Variants
Added three new complementary theme variants based on the ivory-editorial layout structure:

**New Themes:**
- **Pastel Rose Editorial** (`pastel-rose-editorial`)
  - Label: Pastel Rose Editorial
  - Mood: Romántico, suave, elegante
  - Primary: #B76E79 (rose)
  - Background: #FFF7F8
  - Typography: Cormorant Garamond (titles) + Inter (body)

- **Pastel Sage Editorial** (`pastel-sage-editorial`)
  - Label: Pastel Sage Editorial
  - Mood: Natural, jardín, fresco
  - Primary: #6F8F72 (sage)
  - Background: #F6FAF6
  - Typography: Cormorant Garamond (titles) + Inter (body)

- **Pastel Sky Editorial** (`pastel-sky-editorial`)
  - Label: Pastel Sky Editorial
  - Mood: Limpio, moderno, luminoso
  - Primary: #6F8FBF (sky blue)
  - Background: #F5FAFF
  - Typography: Playfair Display (titles) + Inter (body)

**Implementation Details:**
- All three themes use the same component structure and layout as ivory-editorial
- Only colors, typography, backgrounds, and button/card styling differ
- No new layout components created
- Full V2 theme definitions with CSS variables for editor/preview/public rendering
- V1 bridge themes for backward compatibility
- High contrast maintained for mobile viewing
- Cursive fonts avoided (only Pinyon Script used sparingly)

**Files Created:**
- `src/domain/themes-v2/themes/pastel-rose-editorial.ts`
- `src/domain/themes-v2/themes/pastel-sage-editorial.ts`
- `src/domain/themes-v2/themes/pastel-sky-editorial.ts`

**Files Modified:**
- `src/domain/themes-v2/registry.ts` - Added imports and registered all 3 new themes
- `src/domain/themes-v2/types.ts` - Added theme IDs to ThemeIdV2 union type
- `src/domain/themes-v2/themesCatalog.ts` - Catalog entries already present
- `src/domain/themes-v2/index.ts` - Exports already present
- `src/domain/themes/types.ts` - Added theme IDs to v1 ThemeId type
- `src/domain/themes/registry.ts` - Added v1 mappings (all map to champagne layout)
- `src/app/dashboard/invitations/[id]/edit/ThemeSelectorForm.tsx` - Updated visible theme IDs

**Features:**
- ✅ All themes selectable in editor theme selector
- ✅ ivory-editorial remains the default for new invitations
- ✅ Existing invitations remain unaffected
- ✅ Public invitation rendering uses correct theme_id resolution
- ✅ Preview/editor/public use same theme resolution
- ✅ High contrast text for mobile accessibility
- ✅ Full backward compatibility via V1 bridge themes

**Build Status:**
- ✓ Compiled successfully in 16.6s
- ✓ TypeScript strict mode: passed
- ✓ Static page generation: 32 pages successfully generated
- ✓ No compilation errors or warnings

---

## Version Format

This project follows [Semantic Versioning](https://semver.org/) (MAJOR.MINOR.PATCH).

- **MAJOR** version for incompatible API changes
- **MINOR** version for backward compatible functionality additions
- **PATCH** version for backward compatible bug fixes

---

## How to Contribute

When making changes:
1. Update this CHANGELOG.md with your changes under the [Unreleased] section
2. Use descriptive section headers (Added, Fixed, Changed, Deprecated, Removed, Security)
3. Include file paths and technical details for implementation changes
4. Keep entries concise but informative
5. Run `npm run build` to verify no breaking changes
