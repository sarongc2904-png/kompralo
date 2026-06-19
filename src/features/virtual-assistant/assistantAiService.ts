import { getOpenAIClient, hasOpenAIKey } from '@/lib/openai/openai';
import { ASSISTANT_AI_ENABLED } from './assistantConfig';
import type { AssistantResponse, AssistantSuggestedAction } from './types';

const MODEL = 'gpt-4o-mini';
const REQUEST_TIMEOUT_MS = 8000;
const SENSITIVE_PATH_PATTERN =
  /(access_token|refresh_token|id_token|token|secret|password|email|customer|session|stripe|resend|service_role|apikey|api_key)/i;
const EMAIL_PATTERN = /[^\s/?#]+@[^\s/?#]+\.[^\s/?#]+/;

const SYSTEM_PROMPT = `
Eres el asistente virtual de KOMPRALO.
Respondes en español mexicano.
Tu objetivo es ayudar a vender invitaciones digitales y guiar al cliente.
Producto: invitaciones digitales editables para bodas, XV años, bautizos, baby shower y cumpleaños.
Planes: Basic $499 MXN, Premium $899 MXN, Deluxe $1499 MXN.
Flujo: 1. Elige plan 2. Paga con Stripe 3. Recibe correo 4. Entra con el enlace del correo 5. Edita 6. Comparte por WhatsApp.
No inventes funciones que no existen.
No prometas soporte humano 24/7.
No pidas datos sensibles.
No pidas tarjetas.
Si el usuario quiere comprar, manda a /invitaciones/precios.
Si ya compró, manda a /login o /cliente.
Si pregunta algo técnico interno, responde simple y no reveles arquitectura sensible.
Mantén respuestas breves, útiles y orientadas a acción.
Para textos de invitación, da opciones elegantes y copiables.
`.trim();

function sanitizePathname(pathname?: string): string | undefined {
  if (!pathname) return undefined;

  const cleanPathname = pathname.split(/[?#]/)[0]?.slice(0, 300).trim();
  if (!cleanPathname || !cleanPathname.startsWith('/')) return undefined;
  if (SENSITIVE_PATH_PATTERN.test(pathname) || EMAIL_PATTERN.test(pathname)) return undefined;

  return cleanPathname;
}

function buildUserInput(message: string, pathname?: string): string {
  const safePathname = sanitizePathname(pathname);
  const pageLine = safePathname
    ? `Página actual: ${safePathname}`
    : 'Página actual: no disponible';

  return `${pageLine}\nMensaje del usuario:\n${message}`;
}

function suggestedActionsFor(message: string, answer: string): AssistantSuggestedAction[] | undefined {
  const text = `${message} ${answer}`.toLowerCase();

  if (text.includes('ya compr') || text.includes('pag')) {
    return [
      { label: 'Iniciar sesión', href: '/login' },
      { label: 'Ver mis invitaciones', href: '/cliente' },
    ];
  }

  if (text.includes('compr') || text.includes('precio') || text.includes('plan')) {
    return [{ label: 'Ver precios', href: '/invitaciones/precios' }];
  }

  if (
    text.includes('texto') ||
    text.includes('frase') ||
    text.includes('mensaje') ||
    text.includes('invitacion') ||
    text.includes('invitación')
  ) {
    return [{ label: 'Ver precios', href: '/invitaciones/precios' }];
  }

  return undefined;
}

export function canUseAssistantAI(): boolean {
  return ASSISTANT_AI_ENABLED && hasOpenAIKey();
}

export async function getAssistantAIResponse(params: {
  message: string;
  pathname?: string;
}): Promise<AssistantResponse> {
  if (!canUseAssistantAI()) {
    throw new Error('assistant_ai_disabled');
  }

  const client = getOpenAIClient();
  if (!client) {
    throw new Error('assistant_ai_missing_client');
  }

  const response = await client.responses.create(
    {
      model: MODEL,
      instructions: SYSTEM_PROMPT,
      input: buildUserInput(params.message, params.pathname),
      temperature: 0.7,
      max_output_tokens: 350,
    },
    {
      timeout: REQUEST_TIMEOUT_MS,
    },
  );

  const answer = response.output_text.trim();
  if (!answer) {
    throw new Error('assistant_ai_empty_response');
  }

  return {
    answer,
    suggestedActions: suggestedActionsFor(params.message, answer),
  };
}
