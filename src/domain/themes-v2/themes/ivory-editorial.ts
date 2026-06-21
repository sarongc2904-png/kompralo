import type { InvitationTheme } from '@/domain/themes/types';
import type { InvitationThemeV2 } from '@/domain/themes-v2/types';

export const ivoryEditorialTheme: InvitationThemeV2 = {
  id: 'ivory-editorial',
  name: 'Ivory Editorial Romance',
  description: 'Boda premium champagne. Papel fino, dorados suaves, letras oscuras legibles. Quiet luxury.',
  categorySupport: ['wedding', 'baptism', 'baby-shower', 'birthday'],

  colors: {
    pageBackground:  '#FBF7EF',
    surface:         'rgba(255,250,238,0.93)',
    surfaceAlt:      '#F5ECD9',
    surfaceElevated: '#FFFDF8',
    textPrimary:     '#000000',
    textSecondary:   '#222222',
    textMuted:       '#444444',
    accent:          '#C8A75D',
    accentSoft:      'rgba(200,167,93,0.15)',
    accentHover:     '#D4B870',
    border:          'rgba(200,167,93,0.35)',
    borderStrong:    'rgba(200,167,93,0.70)',
    overlay:         'rgba(251,247,239,0.90)',
  },

  typography: {
    headingFamily:   '"Cormorant Garamond", "Georgia", serif',
    bodyFamily:      '"Inter", system-ui, sans-serif',
    scriptFamily:    '"Pinyon Script", cursive',
    headingWeight:   '400',
    headingTracking: '0.06em',
    bodyTracking:    '0.01em',
    headingClass:    'font-editorial font-normal tracking-wide',
    bodyClass:       'font-sans',
    scriptClass:     'font-calligraphy',
  },

  spacing: {
    sectionPaddingY: '6rem',
    cardPaddingX:    '2rem',
    cardPaddingY:    '1.875rem',
    stackGap:        '1.5rem',
  },

  shapes: {
    radiusSm:   '6px',
    radiusMd:   '12px',
    radiusLg:   '20px',
    radiusXl:   '28px',
    radiusFull: '9999px',
    cardStyle:  'rounded',
  },

  effects: {
    glassBlur:       'blur(16px)',
    glassSaturation: 'saturate(110%)',
    glassBackground: 'rgba(255,250,238,0.82)',
    paperTexture:    true,
    grain:           true,
    particles:       false,
    parallax:        false,
    lightSweep:      false,
    grainIntensity:  0.04,
  },

  shadows: {
    soft:     '0 2px 8px rgba(116,84,38,0.06), 0 8px 24px rgba(116,84,38,0.10)',
    card:     '0 2px 6px rgba(116,84,38,0.06), 0 16px 40px rgba(120,88,40,0.13), inset 0 1px 0 rgba(255,255,255,0.85)',
    elevated: '0 6px 14px rgba(116,84,38,0.08), 0 28px 64px rgba(120,88,40,0.17), inset 0 1px 0 rgba(255,255,255,0.9)',
    book:     '0 8px 20px rgba(116,84,38,0.10), 0 40px 80px rgba(116,84,38,0.22), inset 0 1px 0 rgba(255,255,255,0.9)',
  },

  button: {
    background:      'rgba(200,167,93,0.15)',
    text:            '#1F1A16',
    border:          '1px solid rgba(200,167,93,0.65)',
    hoverBackground: '#C8A75D',
    hoverText:       '#1F1A16',
    borderRadius:    '8px',
    fontClass:       'font-editorial tracking-widest text-xs uppercase',
    shadow:          '0 0 20px rgba(200,167,93,0.18)',
    paddingX:        '2.5rem',
    paddingY:        '0.875rem',
  },

  divider: {
    color:        'rgba(200,167,93,0.45)',
    variant:      'ornamental',
    thickness:    '1px',
    opacity:      0.8,
    ornamentChar: '✦',
    gradientFrom: 'transparent',
    gradientTo:   'transparent',
  },

  backgrounds: {
    main:      '#FBF7EF',
    hero:      'linear-gradient(180deg, rgba(251,247,239,0.08) 0%, transparent 35%, rgba(251,247,239,0.96) 100%)',
    sections:  'rgba(200,167,93,0.05)',
    storyBook: '#FBF7EF',
    gallery:   'transparent',
    final:     'linear-gradient(160deg, #F2E4C8 0%, #FBF7EF 100%)',
  },

  assets: {
    backgroundLayer1: '/layers/bg_layer1_champagne.png',
    backgroundLayer2: '/layers/bg_layer2_champagne.png',
    backgroundLayer3: '/layers/bg_layer3_champagne.png',
  },

  dressCodeSwatches: ['#FBF7EF', '#F2E4C8', '#C8A75D', '#E8C5B8', '#C8D1C1'],

  cssVariables: {
    '--v2-color-page-bg':          '#FBF7EF',
    '--v2-color-surface':          'linear-gradient(145deg, rgba(255,250,238,0.96), rgba(255,244,220,0.90))',
    // ── Premium card chrome ──
    '--v2-card-ivory-bg':          'linear-gradient(152deg, rgba(255,251,242,0.97) 0%, rgba(253,245,229,0.93) 45%, rgba(247,235,210,0.90) 100%)',
    '--v2-card-border':            'rgba(200,167,93,0.35)',
    '--v2-card-radius':            '24px',
    '--v2-color-surface-alt':      '#F5ECD9',
    '--v2-color-surface-elevated': '#FFFDF8',
    '--v2-color-text-primary':     '#000000',
    '--v2-color-text-secondary':   '#222222',
    '--v2-color-text-muted':       '#444444',
    '--v2-color-accent':           '#C8A75D',
    '--v2-color-accent-soft':      'rgba(200,167,93,0.12)',
    '--v2-color-accent-hover':     '#D4B870',
    '--v2-color-border':           'rgba(200,167,93,0.30)',
    '--v2-color-border-strong':    'rgba(200,167,93,0.65)',
    '--v2-color-overlay':          'rgba(251,247,239,0.90)',
    '--v2-radius-sm':              '6px',
    '--v2-radius-md':              '12px',
    '--v2-radius-lg':              '20px',
    '--v2-radius-xl':              '28px',
    '--v2-shadow-card':            '0 2px 6px rgba(116,84,38,0.06), 0 16px 40px rgba(120,88,40,0.13), inset 0 1px 0 rgba(255,255,255,0.85)',
    '--v2-shadow-elevated':        '0 6px 14px rgba(116,84,38,0.08), 0 28px 64px rgba(120,88,40,0.17), inset 0 1px 0 rgba(255,255,255,0.9)',
    '--v2-glass-bg':               'rgba(255,250,238,0.82)',
    '--v2-btn-bg':                 'rgba(200,167,93,0.15)',
    '--v2-btn-text':               '#1F1A16',
    '--v2-btn-border':             '1px solid rgba(200,167,93,0.65)',
    '--v2-btn-hover-bg':           '#C8A75D',
    '--v2-btn-hover-text':         '#1F1A16',
    '--v2-divider-color':          'rgba(200,167,93,0.40)',
    '--v2-ornament-color':         'rgba(200,167,93,0.40)',
    '--v2-section-bg-alt':         'rgba(247, 240, 227, 0.45)',
    '--v2-background-main':        '#FBF7EF',
    '--v2-background-story':       '#FBF7EF',
    '--v2-background-sections':    'rgba(200,167,93,0.05)',
    '--v2-background-final':       'linear-gradient(160deg, #F5ECD9 0%, #FBF7EF 100%)',
    '--v2-font-heading':           '"Cormorant Garamond", "Georgia", serif',
    '--v2-font-body':              '"Inter", system-ui, sans-serif',
    '--v2-bg-layer-1':             '/layers/bg_layer1_champagne.png',
    '--v2-bg-layer-2':             '/layers/bg_layer2_champagne.png',
    '--v2-bg-layer-3':             '/layers/bg_layer3_champagne.png',
  },
};

/**
 * V1 Theme bridge — maps ivory-editorial values to the legacy InvitationTheme shape
 * so all existing components (Hero, Countdown, etc.) pick up the ivory palette
 * when this theme is active in preview mode.
 */
export const ivoryEditorialThemeV1: InvitationTheme = {
  id:          'champagne',
  name:        'Ivory Editorial Romance',
  description: 'Boda premium champagne. Papel fino, dorados suaves, letras oscuras legibles.',
  categorySupport: ['wedding', 'baptism', 'baby-shower', 'birthday'],

  colors: {
    pageBackground: '#FBF7EF',
    surface:        'rgba(255,250,238,0.93)',
    surfaceAlt:     '#F2E4C8',
    textPrimary:    '#000000',
    textSecondary:  '#222222',
    accent:         '#C8A75D',
    accentSoft:     'rgba(200,167,93,0.15)',
    border:         'rgba(200,167,93,0.35)',
    overlay:        'rgba(251,247,239,0.90)',
  },

  typography: {
    headingFont: 'font-editorial font-light tracking-wide',
    bodyFont:    'font-sans',
    scriptFont:  'font-calligraphy',
  },

  backgrounds: {
    main:      '#FBF7EF',
    hero:      'linear-gradient(180deg, rgba(251,247,239,0.08) 0%, transparent 35%, rgba(251,247,239,0.96) 100%)',
    sections:  'rgba(200,167,93,0.04)',
    storyBook: '#FBF7EF',
    gallery:   'transparent',
    final:     'linear-gradient(160deg, #F2E4C8 0%, #FBF7EF 100%)',
  },

  textures: {
    paper:   'rgba(242,228,200,0.40)',
    grain:   'rgba(31,26,22,0.04)',
    leather: 'linear-gradient(145deg, #1F1A16 0%, #3A2E26 50%, #5C4A3E 100%)',
  },

  borders: {
    subtle:   'rgba(200,167,93,0.15)',
    accent:   'rgba(200,167,93,0.35)',
    strong:   '#C8A75D',
    radiusSm: 6,
    radiusMd: 12,
    radiusLg: 28,
  },

  shadows: {
    soft:     '0 2px 8px rgba(116,84,38,0.06), 0 8px 24px rgba(116,84,38,0.10)',
    card:     '0 2px 6px rgba(116,84,38,0.06), 0 16px 40px rgba(120,88,40,0.13), inset 0 1px 0 rgba(255,255,255,0.85)',
    elevated: '0 6px 14px rgba(116,84,38,0.08), 0 28px 64px rgba(120,88,40,0.17), inset 0 1px 0 rgba(255,255,255,0.9)',
    book:     '0 8px 20px rgba(116,84,38,0.10), 0 40px 80px rgba(116,84,38,0.22), inset 0 1px 0 rgba(255,255,255,0.9)',
  },

  effects: {
    glass:        'blur(16px) saturate(110%)',
    paperTexture: true,
    grain:        true,
    particles:    false,
    parallax:     false,
    lightSweep:   false,
  },

  animations: {
    introPreset:      'cinematic-soft',
    sectionReveal:    'soft-rise',
    galleryMotion:    'horizontal-parallax',
    storyTransition:  'page-turn',
    hoverMotion:      'soft-scale',
  },

  assets: {
    backgroundLayer1: '/layers/bg_layer1_champagne.png',
    backgroundLayer2: '/layers/bg_layer2_champagne.png',
    backgroundLayer3: '/layers/bg_layer3_champagne.png',
  },

  // Legacy Tailwind class strings — consumed directly by components
  bodyBg:       'bg-[#FBF7EF]',
  bodyText:     'text-[#1F1A16]',
  headingFont:  'font-editorial font-normal tracking-wide',
  bodyFont:     'font-sans',
  accentBg:     'bg-[#C8A75D] hover:bg-[#D4B870]',
  accentText:   'text-[#5C4A3E]',
  accentBorder: 'border-[rgba(200,167,93,0.35)]',
  cardBg:       'bg-[rgba(255,250,238,0.93)] backdrop-blur-md',
  cardBorder:   'border-[rgba(200,167,93,0.35)]',
  cardText:     'text-[#1F1A16]',
  dividerColor: 'bg-[#C8A75D]',
  countdownBg:  'bg-[rgba(200,167,93,0.12)]',
  rsvpInputBg:  'bg-[#F2E4C8]',
  storyLeftBg:  'bg-[#F2E4C8]',
  storyRightBg: 'bg-[#FBF7EF]',
  heroOverlay:  'from-[rgba(251,247,239,0.06)] via-transparent to-[rgba(251,247,239,0.94)]',

  paperTexture:      true,
  bgSolid:           '#FBF7EF',
  bgGlows:           ['#C8A75D', 'rgba(200,167,93,0.25)', '#F2E4C8'],
  dressCodeSwatches: ['#FBF7EF', '#F2E4C8', '#C8A75D', '#E8C5B8', '#C8D1C1'],

  cssVariables: {
    '--color-page-bg':        '#FBF7EF',
    '--color-surface':        'rgba(255,250,238,0.93)',
    '--color-surface-alt':    '#F2E4C8',
    '--color-text-primary':   '#000000',
    '--color-text-secondary': '#222222',
    '--color-accent':         '#C8A75D',
    '--color-accent-soft':    'rgba(200,167,93,0.15)',
    '--color-border':         'rgba(200,167,93,0.35)',
    '--color-overlay':        'rgba(251,247,239,0.90)',
    '--background-main':      '#FBF7EF',
    '--background-story-book':'#FBF7EF',
    '--background-final':     'linear-gradient(160deg, #F2E4C8 0%, #FBF7EF 100%)',
    '--effect-glass':         'blur(16px) saturate(110%)',
    '--shadow-card':          '0 18px 45px rgba(116,84,38,0.14)',
    '--color-text-over-video':'#FBF7EF',
  },
};
