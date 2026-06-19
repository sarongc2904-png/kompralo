/** Post a message that LivePreview.tsx listens for to reload its iframe. */
export function notifyPreviewRefresh(): void {
  if (typeof window !== 'undefined') {
    window.postMessage({ type: 'KOMPRALO_PREVIEW_REFRESH' }, window.location.origin);
  }
}
