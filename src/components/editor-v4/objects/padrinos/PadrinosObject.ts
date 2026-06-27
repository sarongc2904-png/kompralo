import { PadrinosInspector } from './PadrinosInspector';

export const PadrinosObject = {
  type: 'padrinos' as const,
  sectionId: 'padrinos',
  inspector: PadrinosInspector,
  canvasMode: 'normal' as const,
};
