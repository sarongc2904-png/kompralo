import { DresscodeInspector } from './DresscodeInspector';

export const DresscodeObject = {
  type: 'dresscode' as const,
  sectionId: 'dresscode',
  inspector: DresscodeInspector,
  canvasMode: 'normal' as const,
};
