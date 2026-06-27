import { LocationInspector } from './LocationInspector';

export const LocationObject = {
  type: 'location' as const,
  sectionId: 'location',
  inspector: LocationInspector,
  canvasMode: 'normal' as const,
};
