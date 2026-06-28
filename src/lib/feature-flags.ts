export const FEATURE_FLAGS = {
  templateSelector: process.env.NEXT_PUBLIC_ENABLE_TEMPLATE_SELECTOR === 'true',
} as const;
