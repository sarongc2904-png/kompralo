export type DashboardAssistantPromptType =
  | 'welcome_message'
  | 'hero_phrase'
  | 'love_story'
  | 'final_message'
  | 'rsvp_text'
  | 'dress_code'
  | 'gift_registry'
  | 'parents_message'
  | 'padrinos_message'
  | 'itinerary_text'
  | 'hotel_info'
  | 'social_message';

export type DashboardAssistantEventType =
  | 'wedding'
  | 'xv'
  | 'baptism'
  | 'baby_shower'
  | 'birthday'
  | 'unknown';

export type DashboardAssistantGeneratedText = {
  promptType: DashboardAssistantPromptType;
  text: string;
  createdAt: number;
};

export type DashboardAssistantPromptOption = {
  type: DashboardAssistantPromptType;
  label: string;
  description: string;
};

export type DashboardAssistantStatus =
  | 'idle'
  | 'generating'
  | 'generated'
  | 'copied'
  | 'copy_error'
  | 'error';
