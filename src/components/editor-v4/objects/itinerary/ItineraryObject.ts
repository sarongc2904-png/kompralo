import { ItineraryInspector } from './ItineraryInspector';

export const ItineraryObject = {
  type: 'itinerary' as const,
  sectionId: 'itinerary',
  inspector: ItineraryInspector,
  canvasMode: 'normal' as const,
};
