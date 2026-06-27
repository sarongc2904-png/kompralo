import { ParentsInspector } from './ParentsInspector';

export const ParentsObject = {
  type: 'parents' as const,
  sectionId: 'parents',
  inspector: ParentsInspector,
  canvasMode: 'normal' as const,
};
