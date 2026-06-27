import type React from 'react';
import type { EditorObjectType, InspectorProps } from './editor-types';
import { TextInspector }     from '../objects/text/TextInspector';
import { IntroInspector }    from '../objects/intro/IntroInspector';
import { DateTimeInspector } from '../objects/datetime/DateTimeInspector';
import { HeroInspector }     from '../objects/hero/HeroInspector';

/**
 * Static map from elementType → Inspector component.
 * To add a new editable object type: create objects/<type>/ and register it here.
 */
const REGISTRY: Record<EditorObjectType, React.ComponentType<InspectorProps>> = {
  text:     TextInspector,
  intro:    IntroInspector,
  datetime: DateTimeInspector,
  hero:     HeroInspector,
};

export function resolveInspector(
  elementType: EditorObjectType | string,
): React.ComponentType<InspectorProps> | null {
  return REGISTRY[elementType as EditorObjectType] ?? null;
}

/**
 * Sections that automatically select an element when clicked in the layers panel.
 * The shell merges these with invitation snapshot data (meta) when needed.
 */
export const SECTION_AUTO_ELEMENT_TYPE: Partial<Record<string, EditorObjectType>> = {
  intro: 'intro',
  hero:  'hero',
};

/** Sections that switch the canvas to a non-normal mode */
export const SECTION_CANVAS_MODE: Partial<Record<string, 'intro' | 'normal'>> = {
  intro: 'intro',
};
