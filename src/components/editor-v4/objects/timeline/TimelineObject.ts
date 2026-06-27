import { TimelineInspector } from './TimelineInspector';

export const TimelineObject = {
  type: 'timeline' as const,
  sectionId: 'timeline',
  inspector: TimelineInspector,
  canvasMode: 'normal' as const,
};
