/**
 * Detects the type of a video URL and returns a safe embed URL.
 *
 * Supported inputs:
 *   YouTube: youtu.be/ID, youtube.com/watch?v=ID, youtube.com/embed/ID, m.youtube.com/...
 *   Direct:  .mp4, .webm, .ogg (any origin)
 *
 * Returns null if the URL is empty, invalid, or unrecognised.
 */

export type VideoEmbedResult =
  | { type: 'youtube'; embedUrl: string }
  | { type: 'direct'; embedUrl: string };

const DIRECT_EXTENSIONS = ['.mp4', '.webm', '.ogg'];

/**
 * Extracts a YouTube video ID from any recognised YouTube URL format.
 * Returns null when no valid ID is found.
 */
export function getYouTubeEmbedUrl(input: string): string | null {
  if (!input) return null;

  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^(www\.|m\.)/, '');

  if (host === 'youtu.be') {
    // https://youtu.be/VIDEO_ID?si=...
    const id = url.pathname.slice(1).split('/')[0];
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }

  if (host === 'youtube.com') {
    if (url.pathname.startsWith('/embed/')) {
      // Already an embed URL — extract the ID and re-build cleanly
      const id = url.pathname.replace('/embed/', '').split('/')[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (url.pathname === '/watch') {
      const id = url.searchParams.get('v');
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    // Shorts: /shorts/VIDEO_ID
    if (url.pathname.startsWith('/shorts/')) {
      const id = url.pathname.replace('/shorts/', '').split('/')[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
  }

  return null;
}

/**
 * Returns a VideoEmbedResult for a given URL, or null if not a supported video format.
 *
 * Usage:
 *   const result = getVideoEmbedUrl(videoUrl);
 *   if (result?.type === 'youtube') { render iframe }
 *   if (result?.type === 'direct')  { render <video> }
 *   else                            { render image fallback }
 */
export function getVideoEmbedUrl(input: string | undefined | null): VideoEmbedResult | null {
  if (!input?.trim()) return null;

  const youtubeEmbed = getYouTubeEmbedUrl(input);
  if (youtubeEmbed) return { type: 'youtube', embedUrl: youtubeEmbed };

  const lower = input.toLowerCase().split('?')[0];
  if (DIRECT_EXTENSIONS.some((ext) => lower.endsWith(ext))) {
    return { type: 'direct', embedUrl: input.trim() };
  }

  return null;
}
