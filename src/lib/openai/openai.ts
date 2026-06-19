import OpenAI from 'openai';

let openaiClient: OpenAI | null = null;

export function hasOpenAIKey(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

export function getOpenAIClient(): OpenAI | null {
  if (!hasOpenAIKey()) return null;

  openaiClient ??= new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  return openaiClient;
}
