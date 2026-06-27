import { HotelsInspector } from './HotelsInspector';

export const HotelsObject = {
  type: 'hotels' as const,
  sectionId: 'hotels',
  inspector: HotelsInspector,
  canvasMode: 'normal' as const,
};
