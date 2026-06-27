import { MessageInspector } from './MessageInspector';

export const MessageObject = {
  type: 'message' as const,
  sectionId: 'message',
  inspector: MessageInspector,
  canvasMode: 'normal' as const,
};
