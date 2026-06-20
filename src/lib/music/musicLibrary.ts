export type MusicTrack = {
  id: string;
  title: string;
  mood: string;
  url: string | null;
};

function trackUrl(filename: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  return `${base}/storage/v1/object/public/invitation-assets/music/${filename}`;
}

export const MUSIC_LIBRARY: MusicTrack[] = [
  {
    id: 'none',
    title: 'Sin música',
    mood: 'Sin música',
    url: null,
  },
  {
    id: 'piano-romantico',
    title: 'Piano romántico',
    mood: 'Romántica',
    url: trackUrl('piano-romantico.mp3'),
  },
  {
    id: 'boda-elegante',
    title: 'Boda elegante',
    mood: 'Elegante',
    url: trackUrl('boda-elegante.mp3'),
  },
  {
    id: 'cinematica-emocional',
    title: 'Cinemática emocional',
    mood: 'Emocional',
    url: trackUrl('cinematica-emocional.mp3'),
  },
  {
    id: 'clasica-suave',
    title: 'Clásica suave',
    mood: 'Clásica',
    url: trackUrl('clasica-suave.mp3'),
  },
  {
    id: 'celebracion-alegre',
    title: 'Celebración alegre',
    mood: 'Alegre',
    url: trackUrl('celebracion-alegre.mp3'),
  },
];

export function getMusicTrackById(id?: string | null): MusicTrack {
  return MUSIC_LIBRARY.find((track) => track.id === id) ?? MUSIC_LIBRARY[0];
}
