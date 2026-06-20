export interface MusicTrack {
  id: string;
  title: string;
  description: string;
  filename: string;
}

export const MUSIC_TRACKS: MusicTrack[] = [
  {
    id: 'piano-romantico',
    title: 'Piano Romántico',
    description: 'Melodía suave de piano, ideal para bodas íntimas',
    filename: 'piano-romantico.mp3',
  },
  {
    id: 'boda-elegante',
    title: 'Boda Elegante',
    description: 'Cuarteto de cuerdas con acento clásico y sofisticado',
    filename: 'boda-elegante.mp3',
  },
  {
    id: 'cinematica-emocional',
    title: 'Cinemática Emocional',
    description: 'Orquestal con crecimiento emocional, ideal para momentos especiales',
    filename: 'cinematica-emocional.mp3',
  },
  {
    id: 'clasica-suave',
    title: 'Clásica Suave',
    description: 'Piano con violín, elegante y atemporal',
    filename: 'clasica-suave.mp3',
  },
  {
    id: 'celebracion-alegre',
    title: 'Celebración Alegre',
    description: 'Ritmo festivo para recepciones y celebraciones',
    filename: 'celebracion-alegre.mp3',
  },
];

export function getMusicTrackUrl(track: MusicTrack): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  return `${supabaseUrl}/storage/v1/object/public/invitation-assets/music/${track.filename}`;
}

export function findTrackById(id: string): MusicTrack | undefined {
  return MUSIC_TRACKS.find((t) => t.id === id);
}
