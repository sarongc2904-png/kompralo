'use client';

import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import type {
  AssistantApiResponse,
  AssistantSuggestedAction,
  VirtualAssistantMessage,
} from './types';
import {
  VIRTUAL_ASSISTANT_MESSAGES_KEY,
  VIRTUAL_ASSISTANT_OPEN_KEY,
} from './assistantConfig';
import { getAssistantResponse, ACTION_MESSAGES } from './assistantRules';
import { AssistantBubble } from './AssistantBubble';
import { AssistantChat } from './AssistantChat';

// ─── Initial greeting ─────────────────────────────────────────────────────────

const INITIAL_MESSAGE: VirtualAssistantMessage = {
  id: 'init-0',
  role: 'assistant',
  content:
    'Hola, soy el asistente de KOMPRALO. Te ayudo a elegir tu invitación, resolver dudas o empezar tu compra.',
  createdAt: 0,
  suggestedActions: [
    { label: 'Ver precios',             href:   '/invitaciones/precios' },
    { label: '¿Qué plan me conviene?',  action: 'recommend_plan' },
    { label: '¿Cómo funciona?',         action: 'how_it_works' },
    { label: 'Ya compré, ¿qué sigue?',  action: 'post_purchase' },
  ],
};

const DEFAULT_STATE = {
  messages:   [INITIAL_MESSAGE] as VirtualAssistantMessage[],
  isOpen:     false,
  hydrated:   false,
};

type WidgetState = typeof DEFAULT_STATE;

interface VirtualAssistantWidgetProps {
  pathname?: string;
}

function generateId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // quota or security — ignore
  }
}

function getConversationId(): string {
  const key = 'kompralo.virtualAssistant.conversationId';
  const existing = safeGetItem(key);
  if (existing) return existing;

  const next = `conv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  safeSetItem(key, next);
  return next;
}

async function requestAssistantResponse(
  message: string,
  pathname?: string,
): Promise<AssistantApiResponse> {
  const response = await fetch('/api/assistant', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      pageContext: {
        pathname,
      },
      conversationId: getConversationId(),
    }),
  });

  if (!response.ok) {
    throw new Error('assistant_api_failed');
  }

  const data = (await response.json()) as AssistantApiResponse;
  if (
    !data ||
    typeof data.answer !== 'string' ||
    !['local-rules', 'ai', 'local-fallback'].includes(data.source)
  ) {
    throw new Error('assistant_api_invalid_response');
  }

  return data;
}

// ─── Widget ───────────────────────────────────────────────────────────────────

export function VirtualAssistantWidget({ pathname }: VirtualAssistantWidgetProps) {
  const [widgetState, setWidgetState] = useState<WidgetState>(DEFAULT_STATE);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ── Hydrate from localStorage in a single setState call ────────────────────
  // The react-hooks/set-state-in-effect rule is intentionally bypassed here:
  // localStorage hydration in useEffect is the only safe pattern in Next.js App Router
  // (lazy useState initializers cause hydration mismatch because server lacks localStorage).
  useEffect(() => {
    let messages: VirtualAssistantMessage[] = [INITIAL_MESSAGE];
    let isOpen = false;

    const savedMessages = safeGetItem(VIRTUAL_ASSISTANT_MESSAGES_KEY);
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages) as unknown;
        if (Array.isArray(parsed) && parsed.length > 0) {
          messages = parsed as VirtualAssistantMessage[];
        }
      } catch {
        // corrupted — keep default
      }
    }

    if (safeGetItem(VIRTUAL_ASSISTANT_OPEN_KEY) === 'true') {
      isOpen = true;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWidgetState({ messages, isOpen, hydrated: true });
  }, []);

  // ── Persist messages ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!widgetState.hydrated) return;
    safeSetItem(VIRTUAL_ASSISTANT_MESSAGES_KEY, JSON.stringify(widgetState.messages));
  }, [widgetState.messages, widgetState.hydrated]);

  // ── Persist open state ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!widgetState.hydrated) return;
    safeSetItem(VIRTUAL_ASSISTANT_OPEN_KEY, String(widgetState.isOpen));
  }, [widgetState.isOpen, widgetState.hydrated]);

  // ── Keyboard: Escape closes the panel ─────────────────────────────────────
  useEffect(() => {
    if (!widgetState.isOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setWidgetState((s) => ({ ...s, isOpen: false }));
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [widgetState.isOpen]);

  // ── Send message ───────────────────────────────────────────────────────────
  const handleSend = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (isLoading) return;
    if (!trimmed) return;

    const userMsg: VirtualAssistantMessage = {
      id:        generateId(),
      role:      'user',
      content:   trimmed,
      createdAt: Date.now(),
    };

    setWidgetState((s) => ({
      ...s,
      messages: [...s.messages, userMsg],
    }));
    setInput('');
    setIsLoading(true);

    try {
      const response = await requestAssistantResponse(trimmed, pathname);

      const assistantMsg: VirtualAssistantMessage = {
        id:               generateId(),
        role:             'assistant',
        content:          response.answer,
        createdAt:        Date.now() + 1,
        suggestedActions: response.suggestedActions,
      };

      setWidgetState((s) => ({
        ...s,
        messages: [...s.messages, assistantMsg],
      }));
    } catch {
      const response = getAssistantResponse(trimmed, { pathname });

      const assistantMsg: VirtualAssistantMessage = {
        id:               generateId(),
        role:             'assistant',
        content:          response.answer,
        createdAt:        Date.now() + 1,
        suggestedActions: response.suggestedActions,
      };

      setWidgetState((s) => ({
        ...s,
        messages: [...s.messages, assistantMsg],
      }));
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, pathname]);

  // ── Quick action handler ───────────────────────────────────────────────────
  const handleAction = useCallback(
    (action: AssistantSuggestedAction) => {
      if (action.href) return; // Link handles navigation
      if (isLoading) return;
      const text = action.action
        ? (ACTION_MESSAGES[action.action] ?? action.label)
        : action.label;
      handleSend(text);
    },
    [handleSend, isLoading],
  );

  // ── Toggle open ────────────────────────────────────────────────────────────
  const toggleOpen = useCallback(() => {
    setWidgetState((s) => ({ ...s, isOpen: !s.isOpen }));
  }, []);

  // ── Avoid hydration mismatch: render nothing until localStorage is loaded ──
  if (!widgetState.hydrated) return null;

  return (
    <>
      <AnimatePresence>
        {widgetState.isOpen && (
          <AssistantChat
            key="chat-panel"
            messages={widgetState.messages}
            input={input}
            isLoading={isLoading}
            onInputChange={setInput}
            onSend={handleSend}
            onClose={() => setWidgetState((s) => ({ ...s, isOpen: false }))}
            onAction={handleAction}
          />
        )}
      </AnimatePresence>

      <AssistantBubble isOpen={widgetState.isOpen} onClick={toggleOpen} />
    </>
  );
}
