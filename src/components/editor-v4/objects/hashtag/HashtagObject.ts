import { HashtagInspector } from './HashtagInspector';

export const HashtagObject = {
  type: 'hashtag' as const,
  sectionId: 'hashtag',
  inspector: HashtagInspector,
  canvasMode: 'normal' as const,
};
