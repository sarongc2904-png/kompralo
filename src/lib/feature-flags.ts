export const FEATURE_FLAGS = {
  templateSelector: process.env.NEXT_PUBLIC_ENABLE_TEMPLATE_SELECTOR === 'true',
  templatesAsJson:  process.env.NEXT_PUBLIC_USE_JSON_TEMPLATES === 'true',
} as const;
