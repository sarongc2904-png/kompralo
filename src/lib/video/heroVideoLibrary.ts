export type HeroVideoTrack = {
  id: string;
  title: string;
  suggestedPath: string;
  url: string | null;
};

const BASE = 'https://djztbgidfrhpkmyvhuyo.supabase.co/storage/v1/object/public/invitation-assets';

export const HERO_VIDEO_LIBRARY: HeroVideoTrack[] = [
  {
    id: 'none',
    title: 'Sin video',
    suggestedPath: '',
    url: null,
  },
  {
    id: 'hero-anillos',
    title: 'Anillos elegantes',
    suggestedPath: 'videos/hero-anillos.mp4',
    url: `${BASE}/videos/hero-anillos.mp4`,
  },
  {
    id: 'hero-flores',
    title: 'Flores románticas',
    suggestedPath: 'videos/hero-flores.mp4',
    url: `${BASE}/videos/hero-flores.mp4`,
  },
  {
    id: 'hero-romantico',
    title: 'Escena romántica',
    suggestedPath: 'videos/hero-romantico.mp4',
    url: `${BASE}/videos/hero-romantico.mp4`,
  },
];

export function getHeroVideoById(id?: string | null): HeroVideoTrack {
  return HERO_VIDEO_LIBRARY.find((v) => v.id === id) ?? HERO_VIDEO_LIBRARY[0];
}
