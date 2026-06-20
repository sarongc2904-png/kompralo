export type MusicTrack = {
  id: string;
  title: string;
  mood: string;
  url: string | null;
};

export const MUSIC_LIBRARY: MusicTrack[] = [
  {
    id: 'none',
    title: 'Sin música',
    mood: 'Sin música',
    url: null,
  },
  {
    id: 'boda-elegante',
    title: 'Boda elegante',
    mood: 'Elegante',
    url: 'https://djztbgidfrhpkmyvhuyo.supabase.co/storage/v1/object/public/invitation-assets/music/boda-elegante.mp3',
  },
  {
    id: 'celebracion-alegre',
    title: 'Celebración alegre',
    mood: 'Alegre',
    url: 'https://djztbgidfrhpkmyvhuyo.supabase.co/storage/v1/object/public/invitation-assets/music/celebracion-alegre.mp3',
  },
  {
    id: 'cinematica-emocional',
    title: 'Cinemática emocional',
    mood: 'Emocional',
    url: 'https://djztbgidfrhpkmyvhuyo.supabase.co/storage/v1/object/public/invitation-assets/music/cinematica-emocional.mp3',
  },
  {
    id: 'clasica-suave',
    title: 'Clásica suave',
    mood: 'Clásica',
    url: 'https://djztbgidfrhpkmyvhuyo.supabase.co/storage/v1/object/public/invitation-assets/music/clasica-suave.mp3',
  },
  {
    id: 'piano-romantico',
    title: 'Piano romántico',
    mood: 'Romántica',
    url: 'https://djztbgidfrhpkmyvhuyo.supabase.co/storage/v1/object/public/invitation-assets/music/piano-romantico.mp3',
  },
];

export function getMusicTrackById(id?: string | null): MusicTrack {
  return MUSIC_LIBRARY.find((track) => track.id === id) ?? MUSIC_LIBRARY[0];
}
