import { getAssistantResponse } from '@/features/virtual-assistant/assistantRules';
import { shouldUseAssistantAI } from '@/features/virtual-assistant/assistantAiRouting';
import { canUseAssistantAI, getAssistantAIResponse } from '@/features/virtual-assistant/assistantAiService';
import { VIRTUAL_ASSISTANT_ENABLED, ASSISTANT_AI_ENABLED } from '@/features/virtual-assistant/assistantConfig';
import type {
  AssistantApiError,
  AssistantApiRequest,
  AssistantApiResponse,
  AssistantPageContext,
} from '@/features/virtual-assistant/types';

const MAX_MESSAGE_LENGTH = 1000;

function jsonError(error: AssistantApiError['error'], status: number): Response {
  return Response.json({ error } satisfies AssistantApiError, { status });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizePageContext(value: unknown): AssistantPageContext | undefined {
  if (!isRecord(value)) return undefined;

  return {
    pathname: typeof value.pathname === 'string' ? value.pathname.slice(0, 300) : undefined,
    planId: typeof value.planId === 'string' ? value.planId.slice(0, 80) : undefined,
    invitationId: typeof value.invitationId === 'string' ? value.invitationId.slice(0, 120) : undefined,
    customerEmail: typeof value.customerEmail === 'string' ? value.customerEmail.slice(0, 254) : undefined,
  };
}

function parseAssistantRequest(body: unknown): AssistantApiRequest | AssistantApiError {
  if (!isRecord(body)) return { error: 'invalid_request' };

  if (!('message' in body)) {
    return { error: 'message_required' };
  }

  if (typeof body.message !== 'string') {
    return { error: 'invalid_request' };
  }

  const message = body.message.trim();
  if (!message) {
    return { error: 'message_required' };
  }

  return {
    message: message.slice(0, MAX_MESSAGE_LENGTH),
    pageContext: normalizePageContext(body.pageContext),
    conversationId:
      typeof body.conversationId === 'string' ? body.conversationId.slice(0, 120) : undefined,
  };
}

export async function POST(request: Request) {
  // Feature gate: Virtual assistant disabled
  if (!VIRTUAL_ASSISTANT_ENABLED) {
    return jsonError('assistant_error', 403);
  }

  try {
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return jsonError('invalid_request', 400);
    }

    const parsed = parseAssistantRequest(body);
    if ('error' in parsed) {
      return jsonError(parsed.error, 400);
    }

    const localResponse = getAssistantResponse(parsed.message, parsed.pageContext);

    if (!shouldUseAssistantAI(parsed.message) || !canUseAssistantAI()) {
      return Response.json({
        answer: localResponse.answer,
        suggestedActions: localResponse.suggestedActions,
        source: 'local-rules',
      } satisfies AssistantApiResponse);
    }

    try {
      const aiResponse = await getAssistantAIResponse({
        message: parsed.message,
        pathname: parsed.pageContext?.pathname,
      });

      return Response.json({
        answer: aiResponse.answer,
        suggestedActions: aiResponse.suggestedActions,
        source: 'ai',
      } satisfies AssistantApiResponse);
    } catch {
      return Response.json({
        answer: localResponse.answer,
        suggestedActions: localResponse.suggestedActions,
        source: 'local-fallback',
      } satisfies AssistantApiResponse);
    }
  } catch {
    return jsonError('assistant_error', 500);
  }
}
