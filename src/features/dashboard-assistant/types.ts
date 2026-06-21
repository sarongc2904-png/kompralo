export type DashboardAssistantEventType =
  | 'wedding'
  | 'xv'
  | 'baptism'
  | 'baby_shower'
  | 'birthday'
  | 'unknown';

export type AssistantTone =
  | 'elegant'
  | 'romantic'
  | 'formal'
  | 'emotional'
  | 'modern'
  | 'religious'
  | 'fun'
  | 'brief';

export type AssistantLength = 'short' | 'medium' | 'long';

export type DashboardAssistantPromptOption = {
  id: string;
  category: string;
  title: string;
  description: string;
  targetField?: string;
  defaultTone?: AssistantTone;
};

export type DashboardAssistantGeneratedText = {
  promptId: string;
  text: string;
  createdAt: number;
};

export type DashboardAssistantStatus =
  | 'idle'
  | 'generating'
  | 'generated'
  | 'copied'
  | 'copy_error'
  | 'error';

export type InvitationAssistantContext = {
  eventType: DashboardAssistantEventType;
  protagonists?: { name: string; role?: string }[];
  eventDate?: string;
  eventTime?: string;
  venueName?: string;
  address?: string;
  hashtag?: string;
  dressCodeType?: string;
  dressCodeDescription?: string;
  title?: string;
};
