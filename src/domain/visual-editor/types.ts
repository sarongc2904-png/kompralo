import type { PlanId } from '@/domain/plans/types';
import type { EventModuleId } from '@/domain/modules';

export type EditableElementId =
  | 'hero'
  | 'event'
  | 'location'
  | 'gallery'
  | 'music';

export type RendererKey =
  | 'hero'
  | 'event'
  | 'location'
  | 'gallery'
  | 'music';

export type EditorComponentKey =
  | 'MediaForm'
  | 'EditForm'
  | 'LocationForm'
  | 'GalleryForm';

export type EditorActionType =
  | 'open-form'
  | 'focus-section'
  | 'edit-inline';

export interface EditorAction {
  id: string;
  label: string;
  type: EditorActionType;
  target: EditorComponentKey | RendererKey;
}

export interface EditableElement {
  id: EditableElementId;
  moduleId: EventModuleId;
  label: string;
  plan: PlanId[];
  editable: boolean;
  rendererKey: RendererKey;
  editorComponent: EditorComponentKey;
  priority: number;
  actions?: EditorAction[];
}

export interface EditableSection {
  id: string;
  moduleId: EventModuleId;
  title: string;
  elements: EditableElementId[];
  priority: number;
}

export interface EditorModule {
  id: EventModuleId;
  title: string;
  elements: EditableElementId[];
  priority: number;
}
