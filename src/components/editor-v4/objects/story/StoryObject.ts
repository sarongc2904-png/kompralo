import { StoryInspector } from './StoryInspector';

export const StoryObject = {
  type: 'story' as const,
  sectionId: 'story',
  inspector: StoryInspector,
  canvasMode: 'normal' as const,
};
