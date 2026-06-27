import { GiftsInspector } from './GiftsInspector';

export const GiftsObject = {
  type: 'gifts' as const,
  sectionId: 'gifts',
  inspector: GiftsInspector,
  canvasMode: 'normal' as const,
};
