import type React from 'react';
import type { EditorObjectType, InspectorProps } from './editor-types';
import { TextInspector }      from '../objects/text/TextInspector';
import { IntroInspector }     from '../objects/intro/IntroInspector';
import { DateTimeInspector }  from '../objects/datetime/DateTimeInspector';
import { HeroInspector }      from '../objects/hero/HeroInspector';
import { CountdownInspector } from '../objects/countdown/CountdownInspector';
import { ParentsInspector }   from '../objects/parents/ParentsInspector';
import { StoryInspector }     from '../objects/story/StoryInspector';
import { GalleryInspector }   from '../objects/gallery/GalleryInspector';
import { TimelineInspector }  from '../objects/timeline/TimelineInspector';
import { ItineraryInspector } from '../objects/itinerary/ItineraryInspector';
import { LocationInspector }  from '../objects/location/LocationInspector';
import { DresscodeInspector } from '../objects/dresscode/DresscodeInspector';
import { GiftsInspector }     from '../objects/gifts/GiftsInspector';
import { PadrinosInspector }  from '../objects/padrinos/PadrinosInspector';
import { HotelsInspector }    from '../objects/hotels/HotelsInspector';
import { HashtagInspector }   from '../objects/hashtag/HashtagInspector';
import { MessageInspector }   from '../objects/message/MessageInspector';
import { ColorsInspector }    from '../objects/colors/ColorsInspector';

/**
 * Static map from elementType → Inspector component.
 * To add a new editable object type: create objects/<type>/ and register it here.
 */
const REGISTRY: Record<EditorObjectType, React.ComponentType<InspectorProps>> = {
  // ── Fully-featured ──────────────────────────────────────────────────────────
  text:      TextInspector,
  intro:     IntroInspector,
  datetime:  DateTimeInspector,
  hero:      HeroInspector,
  // ── Placeholder — full inspector coming in future sprints ─────────────────
  countdown: CountdownInspector,
  parents:   ParentsInspector,
  story:     StoryInspector,
  gallery:   GalleryInspector,
  timeline:  TimelineInspector,
  itinerary: ItineraryInspector,
  location:  LocationInspector,
  dresscode: DresscodeInspector,
  gifts:     GiftsInspector,
  padrinos:  PadrinosInspector,
  hotels:    HotelsInspector,
  hashtag:   HashtagInspector,
  message:   MessageInspector,
  colors:    ColorsInspector,
};

export function resolveInspector(
  elementType: EditorObjectType | string,
): React.ComponentType<InspectorProps> | null {
  return REGISTRY[elementType as EditorObjectType] ?? null;
}

/**
 * Sections that automatically open the inspector when clicked in the layers panel.
 * The shell merges snapshot data (meta) for hero; future inspectors can use meta too.
 */
export const SECTION_AUTO_ELEMENT_TYPE: Partial<Record<string, EditorObjectType>> = {
  colors:    'colors',
  intro:     'intro',
  hero:      'hero',
  countdown: 'countdown',
  parents:   'parents',
  story:     'story',
  gallery:   'gallery',
  timeline:  'timeline',
  itinerary: 'itinerary',
  location:  'location',
  dresscode: 'dresscode',
  gifts:     'gifts',
  padrinos:  'padrinos',
  hotels:    'hotels',
  hashtag:   'hashtag',
  message:   'message',
};

/** Sections that switch the canvas to a non-normal mode */
export const SECTION_CANVAS_MODE: Partial<Record<string, 'intro' | 'normal'>> = {
  intro: 'intro',
};
