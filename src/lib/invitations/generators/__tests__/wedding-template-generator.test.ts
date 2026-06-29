/**
 * Test cases for wedding-template-generator and completion-score.
 *
 * These are self-contained, testable scenarios without external test framework.
 * Can be run with a test runner (vitest/jest) or reviewed as documentation.
 */

import { generateWeddingTemplate, type GeneratedWeddingTemplateContent } from '../wedding-template-generator';
import { evaluateWeddingCompletion, shouldShowWeddingWizard } from '../../completion-score';
import { resolveWeddingThemeId } from '@/domain/themes-v2/style-to-theme-map';
import type { InvitationContent } from '@/domain/invitations/types';

// ─── Test helpers ──────────────────────────────────────────────────────────

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function assertEqual<T>(actual: T, expected: T, message: string): void {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`Assertion failed: ${message}\nExpected: ${JSON.stringify(expected)}\nActual: ${JSON.stringify(actual)}`);
  }
}

// ─── Test fixtures ────────────────────────────────────────────────────────

const BASIC_PARAMS = {
  brideName: 'María',
  groomName: 'Juan',
  weddingDate: '2026-10-24',
  weddingTime: '18:00 HRS',
  selectedStyle: 'elegante' as const,
  planId: 'basic' as const,
};

const PREMIUM_PARAMS = {
  ...BASIC_PARAMS,
  planId: 'premium' as const,
};

const DELUXE_PARAMS = {
  ...BASIC_PARAMS,
  planId: 'deluxe' as const,
};

// ─── Test 1: Basic plan generates only core fields ─────────────────────────

function test_1_basic_plan_core_fields(): void {
  const result = generateWeddingTemplate(BASIC_PARAMS);

  // Should have core fields
  assert(result.protagonists !== undefined, 'protagonists should exist');
  assert(result.event_time !== undefined, 'event_time should exist');
  assert(result.hero !== undefined, 'hero should exist');
  assert(result.final_message !== undefined, 'final_message should exist');

  // Should NOT have premium/deluxe fields
  assert(result.gallery === undefined, 'gallery should not exist in basic');
  assert(result.itinerary === undefined, 'itinerary should not exist in basic');
  assert(result.dress_code === undefined, 'dress_code should not exist in basic');
  assert(result.location === undefined, 'location should not exist in basic');
  assert(result.timeline === undefined, 'timeline should not exist in basic');
  assert(result.gift_registry === undefined, 'gift_registry should not exist in basic');
  assert(result.parents === undefined, 'parents should not exist in basic');
  assert(result.padrinos === undefined, 'padrinos should not exist in basic');

  // Check content
  assert(Array.isArray(result.protagonists), 'protagonists should be array');
  assert(result.protagonists!.length === 2, 'should have 2 protagonists');
  assert(result.protagonists![0].name === 'María', 'bride name should match');
  assert(result.protagonists![1].name === 'Juan', 'groom name should match');
  assert(result.event_time === '18:00 HRS', 'event_time should match input');
  assert(result.hero!.emotionalPhrase !== undefined, 'hero should have emotionalPhrase');
  assert(result.final_message!.quote !== undefined, 'final_message should have quote');

  console.log('✓ Test 1 passed: Basic plan core fields');
}

// ─── Test 2: Premium plan adds gallery, itinerary, dress_code, location ────

function test_2_premium_plan_adds_fields(): void {
  const result = generateWeddingTemplate(PREMIUM_PARAMS);

  // Should have premium fields
  assert(result.gallery !== undefined, 'gallery should exist in premium');
  assert(result.itinerary !== undefined, 'itinerary should exist in premium');
  assert(result.dress_code !== undefined, 'dress_code should exist in premium');
  assert(result.location !== undefined, 'location should exist in premium');

  // Should NOT have deluxe-only fields
  assert(result.timeline === undefined, 'timeline should not exist in premium');
  assert(result.gift_registry === undefined, 'gift_registry should not exist in premium');
  assert(result.padrinos === undefined, 'padrinos should not exist in premium');
  assert(result.hotels === undefined, 'hotels should not exist in premium');
  // social is now premium+ (hashtag auto-generated)
  assert(result.social !== undefined, 'social should exist in premium');
  // music is now premium+ (default track)
  assert(result.music !== undefined, 'music should exist in premium');
  assert(result.music!.enabled === true, 'music should be enabled in premium');
  assert(typeof result.music!.audioUrl === 'string' && result.music!.audioUrl.length > 0, 'music.audioUrl should be non-empty');

  // Check structure
  assert(Array.isArray(result.itinerary), 'itinerary should be array');
  assert(result.itinerary!.length > 0, 'itinerary should have items');
  assert(result.gallery!.images !== undefined, 'gallery should have images');
  assert(Array.isArray(result.gallery!.images), 'gallery.images should be array');

  console.log('✓ Test 2 passed: Premium plan adds fields');
}

// ─── Test 3: Deluxe plan includes all fields ──────────────────────────────

function test_3_deluxe_plan_includes_all(): void {
  const result = generateWeddingTemplate(DELUXE_PARAMS);

  // Deluxe should have all optional fields
  assert(result.timeline !== undefined, 'timeline should exist in deluxe');
  assert(result.gift_registry !== undefined, 'gift_registry should exist in deluxe');
  assert(result.parents !== undefined, 'parents should exist in deluxe');
  assert(result.padrinos !== undefined, 'padrinos should exist in deluxe');
  assert(result.hotels !== undefined, 'hotels should exist in deluxe');
  assert(result.social !== undefined, 'social should exist in deluxe');
  assert(result.music !== undefined, 'music should exist in deluxe');
  assert(result.music!.enabled === true, 'music should be enabled in deluxe');

  // Check types
  assert(Array.isArray(result.timeline), 'timeline should be array');
  assert(Array.isArray(result.parents), 'parents should be array');
  assert(Array.isArray(result.padrinos), 'padrinos should be array');
  assert(Array.isArray(result.hotels), 'hotels should be array');

  console.log('✓ Test 3 passed: Deluxe plan includes all fields');
}

// ─── Test 4: Existing real data is preserved ─────────────────────────────

function test_4_preserve_real_data(): void {
  const realGallery = {
    images: ['http://example.com/1.jpg', 'http://example.com/2.jpg'],
    captions: ['Photo 1', 'Photo 2'],
  };

  const realHero = {
    emotionalPhrase: 'Custom emotional phrase from user',
    imageUrl: 'http://example.com/custom.jpg',
    eventLabel: 'Nuestra boda',
  } as const;

  const existingContent = {
    gallery: realGallery,
    hero: realHero,
  };

  const result = generateWeddingTemplate({
    ...PREMIUM_PARAMS,
    existingContent,
  });

  // Should preserve real data
  assert(
    JSON.stringify(result.gallery) === JSON.stringify(realGallery),
    'gallery should be preserved exactly',
  );
  assert(
    result.hero!.emotionalPhrase === 'Custom emotional phrase from user',
    'hero.emotionalPhrase should be preserved',
  );

  console.log('✓ Test 4 passed: Preserve real data');
}

// ─── Test 5: Empty arrays allow generation ─────────────────────────────

function test_5_empty_arrays_allow_generation(): void {
  const existingContent = {
    gallery: { images: [], captions: [] },
    itinerary: [],
  };

  const result = generateWeddingTemplate({
    ...PREMIUM_PARAMS,
    existingContent,
  });

  // Empty arrays should be replaced with templates
  assert(result.gallery!.images !== undefined, 'gallery should be generated');
  assert(Array.isArray(result.itinerary), 'itinerary should be array');
  // May be empty, but structure should exist
  assert(result.itinerary !== undefined, 'itinerary should exist');

  console.log('✓ Test 5 passed: Empty arrays allow generation');
}

// ─── Test 6: event_time is always string ──────────────────────────────────

function test_6_event_time_always_string(): void {
  const result1 = generateWeddingTemplate({
    ...BASIC_PARAMS,
    weddingTime: '18:00 HRS',
  });
  assert(typeof result1.event_time === 'string', 'event_time should be string with input');

  const result2 = generateWeddingTemplate({
    ...BASIC_PARAMS,
    weddingTime: undefined,
  });
  assert(typeof result2.event_time === 'string', 'event_time should be string even without input');
  assert(result2.event_time === '', 'event_time should be empty string if no input');

  console.log('✓ Test 6 passed: event_time is always string');
}

// ─── Test 7: No theme_id or sections in result ────────────────────────────

function test_7_no_theme_or_sections(): void {
  const result = generateWeddingTemplate(DELUXE_PARAMS) as Record<string, unknown>;

  assert(result.theme_id === undefined, 'theme_id should not be in result');
  assert(result.sections === undefined, 'sections should not exist');
  assert(result.themeId === undefined, 'themeId should not be in result');
  assert(result.feature_overrides === undefined, 'feature_overrides should not be auto-set');
  assert(result.music === undefined, 'music should not be in V1 generator');

  console.log('✓ Test 7 passed: No theme_id or sections');
}

// ─── Test 8: Style map resolves all 6 wedding styles ──────────────────────

function test_8_style_map_resolves_all(): void {
  const styles = ['elegante', 'minimalista', 'jardín', 'playa', 'clásico', 'moderno'] as const;
  const themes = styles.map((s) => resolveWeddingThemeId(s));

  // All should resolve to valid theme IDs
  assert(themes.every((t) => typeof t === 'string'), 'all styles should resolve to strings');

  // Spot check mappings
  assert(resolveWeddingThemeId('elegante') === 'ivory-editorial', 'elegante → ivory-editorial');
  assert(resolveWeddingThemeId('minimalista') === 'pastel-sky-editorial', 'minimalista → pastel-sky-editorial');
  assert(resolveWeddingThemeId('jardín') === 'garden-romance', 'jardín → garden-romance');
  assert(resolveWeddingThemeId('playa') === 'boho-terracotta', 'playa → boho-terracotta');
  assert(resolveWeddingThemeId('clásico') === 'luxury-champagne', 'clásico → luxury-champagne');
  assert(resolveWeddingThemeId('moderno') === 'pastel-sky-editorial', 'moderno → pastel-sky-editorial');

  // Unknown style falls back
  assert(resolveWeddingThemeId('unknown') === 'ivory-editorial', 'unknown style → ivory-editorial');

  console.log('✓ Test 8 passed: Style map resolves all 6 styles');
}

// ─── Test 9: Completion score detection ───────────────────────────────────

function test_9_completion_score(): void {
  // Empty invitation
  const emptyContent: Partial<InvitationContent> = {};
  const emptyScore = evaluateWeddingCompletion(emptyContent, 'basic');
  assert(emptyScore.isEmpty, 'empty content should be isEmpty=true');
  assert(emptyScore.isIncomplete, 'empty content should be isIncomplete=true');
  assert(emptyScore.percentage < 50, 'empty content should have low percentage');

  // Partially filled
  const partialContent: Partial<InvitationContent> = {
    protagonists: [
      { id: 'bride', name: 'María' },
      { id: 'groom', name: 'Juan' },
    ],
    eventTime: '18:00 HRS',
    hero: { emotionalPhrase: 'Our special day', imageUrl: '', eventLabel: 'Boda' },
  };
  const partialScore = evaluateWeddingCompletion(partialContent, 'basic');
  assert(!partialScore.isEmpty, 'partial content should not be isEmpty');
  // May still be incomplete if final_message missing
  assert(partialScore.percentage > 50, 'partial content should have decent percentage');

  console.log('✓ Test 9 passed: Completion score detection');
}

// ─── Test 10: shouldShowWeddingWizard convenience ───────────────────────

function test_10_should_show_wizard(): void {
  const emptyContent: Partial<InvitationContent> = {};
  assert(shouldShowWeddingWizard(emptyContent, 'basic'), 'empty should show wizard');

  const basicContent: Partial<InvitationContent> = {
    protagonists: [
      { id: 'bride', name: 'María' },
      { id: 'groom', name: 'Juan' },
    ],
    eventTime: '18:00 HRS',
    hero: { emotionalPhrase: 'Our day', imageUrl: '', eventLabel: 'Boda' },
    finalMessage: { quote: 'Thanks' },
  };
  // Should not show wizard if all critical fields filled
  const showWizard = shouldShowWeddingWizard(basicContent, 'basic');
  assert(!showWizard, 'complete basic invitation should not show wizard');

  console.log('✓ Test 10 passed: shouldShowWeddingWizard');
}

// ─── Test runner ──────────────────────────────────────────────────────────

/**
 * Run all tests.
 * Can be executed as: node -r esbuild-register src/lib/invitations/generators/__tests__/wedding-template-generator.test.ts
 * Or integrated into vitest/jest.
 */
export function runAllTests(): void {
  try {
    test_1_basic_plan_core_fields();
    test_2_premium_plan_adds_fields();
    test_3_deluxe_plan_includes_all();
    test_4_preserve_real_data();
    test_5_empty_arrays_allow_generation();
    test_6_event_time_always_string();
    test_7_no_theme_or_sections();
    test_8_style_map_resolves_all();
    test_9_completion_score();
    test_10_should_show_wizard();

    console.log('\n✅ All 10 tests passed!');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run tests if executed directly
if (require.main === module) {
  runAllTests();
}
