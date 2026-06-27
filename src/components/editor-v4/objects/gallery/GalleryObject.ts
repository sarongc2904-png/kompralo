import { GalleryInspector } from './GalleryInspector';

export const GalleryObject = {
  type: 'gallery' as const,
  sectionId: 'gallery',
  inspector: GalleryInspector,
  canvasMode: 'normal' as const,
};
