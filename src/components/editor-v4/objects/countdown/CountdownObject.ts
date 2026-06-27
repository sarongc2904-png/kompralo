import { CountdownInspector } from './CountdownInspector';

export const CountdownObject = {
  type: 'countdown' as const,
  sectionId: 'countdown',
  inspector: CountdownInspector,
  canvasMode: 'normal' as const,
};
