export type AssistantRole = 'assistant' | 'user';

export type AssistantSuggestedAction = {
  label: string;
  href?: string;
  action?: string;
};

// Renamed from AssistantMessage to avoid clash with the AssistantMessage component.
export type VirtualAssistantMessage = {
  id: string;
  role: AssistantRole;
  content: string;
  createdAt: number;
  suggestedActions?: AssistantSuggestedAction[];
};

export type AssistantResponse = {
  answer: string;
  suggestedActions?: AssistantSuggestedAction[];
};

export type AssistantResponseSource = 'local-rules' | 'ai' | 'local-fallback';

export type AssistantPageContext = {
  pathname?: string;
  planId?: string;
  invitationId?: string;
  customerEmail?: string;
};

export type AssistantApiRequest = {
  message: string;
  pageContext?: AssistantPageContext;
  conversationId?: string;
};

export type AssistantApiResponse = {
  answer: string;
  suggestedActions?: AssistantSuggestedAction[];
  source: AssistantResponseSource;
};

export type AssistantApiError = {
  error: 'message_required' | 'invalid_request' | 'assistant_error';
};
