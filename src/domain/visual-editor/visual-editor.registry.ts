import { getAvailableModules } from '@/domain/modules';
import type { EventModuleId } from '@/domain/modules';
import type { PlanId } from '@/domain/plans/types';
import { normalizePlanId } from '@/domain/plans/types';
import type { EditableElement, EditableSection, EditorModule } from '@/domain/visual-editor/types';

const ALL_PLANS: PlanId[] = ['basic', 'premium', 'deluxe'];
const PREMIUM_PLUS: PlanId[] = ['premium', 'deluxe'];

export const editorModules: EditorModule[] = [
  { id: 'cover',         title: 'Hero',     elements: ['hero'],     priority: 10 },
  { id: 'event_details', title: 'Event',    elements: ['event'],    priority: 20 },
  { id: 'location',      title: 'Location', elements: ['location'], priority: 30 },
  { id: 'gallery',       title: 'Gallery',  elements: ['gallery'],  priority: 40 },
  { id: 'music',         title: 'Music',    elements: ['music'],    priority: 50 },
];

export const editableSections: EditableSection[] = [
  { id: 'hero-section',     moduleId: 'cover',         title: 'Hero',     elements: ['hero'],     priority: 10 },
  { id: 'event-section',    moduleId: 'event_details', title: 'Event',    elements: ['event'],    priority: 20 },
  { id: 'location-section', moduleId: 'location',      title: 'Location', elements: ['location'], priority: 30 },
  { id: 'gallery-section',  moduleId: 'gallery',       title: 'Gallery',  elements: ['gallery'],  priority: 40 },
  { id: 'music-section',    moduleId: 'music',         title: 'Music',    elements: ['music'],    priority: 50 },
];

export const editableElements: EditableElement[] = [
  {
    id: 'hero',
    moduleId: 'cover',
    label: 'Hero',
    plan: ALL_PLANS,
    editable: true,
    rendererKey: 'hero',
    editorComponent: 'MediaForm',
    priority: 10,
    actions: [{ id: 'edit-hero', label: 'Editar portada', type: 'open-form', target: 'MediaForm' }],
  },
  {
    id: 'event',
    moduleId: 'event_details',
    label: 'Event',
    plan: ALL_PLANS,
    editable: true,
    rendererKey: 'event',
    editorComponent: 'EditForm',
    priority: 20,
    actions: [{ id: 'edit-event', label: 'Editar evento', type: 'open-form', target: 'EditForm' }],
  },
  {
    id: 'location',
    moduleId: 'location',
    label: 'Location',
    plan: ALL_PLANS,
    editable: true,
    rendererKey: 'location',
    editorComponent: 'LocationForm',
    priority: 30,
    actions: [{ id: 'edit-location', label: 'Editar ubicación', type: 'open-form', target: 'LocationForm' }],
  },
  {
    id: 'gallery',
    moduleId: 'gallery',
    label: 'Gallery',
    plan: PREMIUM_PLUS,
    editable: true,
    rendererKey: 'gallery',
    editorComponent: 'GalleryForm',
    priority: 40,
    actions: [{ id: 'edit-gallery', label: 'Editar galería', type: 'open-form', target: 'GalleryForm' }],
  },
  {
    id: 'music',
    moduleId: 'music',
    label: 'Music',
    plan: PREMIUM_PLUS,
    editable: true,
    rendererKey: 'music',
    editorComponent: 'MediaForm',
    priority: 50,
    actions: [{ id: 'edit-music', label: 'Editar música', type: 'open-form', target: 'MediaForm' }],
  },
];

export function getEditableElements(planId?: string | null): EditableElement[] {
  const plan = normalizePlanId(planId);
  const availableModuleIds = new Set<EventModuleId>(
    getAvailableModules(plan).map((module) => module.id),
  );

  return editableElements
    .filter((element) => element.plan.includes(plan))
    .filter((element) => availableModuleIds.has(element.moduleId))
    .sort((a, b) => a.priority - b.priority);
}
