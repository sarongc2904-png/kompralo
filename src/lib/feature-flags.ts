export const FEATURE_FLAGS = {
  templateSelector:   process.env.NEXT_PUBLIC_ENABLE_TEMPLATE_SELECTOR === 'true',
  templatesAsJson:    process.env.NEXT_PUBLIC_USE_JSON_TEMPLATES === 'true',
  templateSelectorV2: process.env.NEXT_PUBLIC_TEMPLATE_SELECTOR === 'true',
} as const;
