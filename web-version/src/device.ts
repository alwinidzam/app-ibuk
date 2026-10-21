// Small wrappers around platform features. Each one degrades quietly where the phone doesn't support it.

/** Short vibration on Android. iOS Safari has no Vibration API; it's simply skipped. */
export const haptic = (pattern: number | number[] = 10) => navigator.vibrate?.(pattern);

/**
 * Shrink a receipt photo so thousands fit on the phone: longest side 1280 px, JPEG 0.72 (~100–250 KB).
 * Modern browsers apply EXIF rotation when decoding, so the photo stays upright.
 */
export async function compressImage(file: File, maxSide = 1280): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.72);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function downloadBlob(blob: Blob, filename: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 10_000);
}

/** Opens the Android share sheet with a file (WhatsApp, Drive…). Returns false if the phone can't share files. */
export async function shareFile(blob: Blob, filename: string, title: string): Promise<boolean> {
  const file = new File([blob], filename, { type: blob.type });
  if (!navigator.canShare?.({ files: [file] })) return false;
  try {
    await navigator.share({ files: [file], title });
  } catch (e) {
    if ((e as Error).name !== 'AbortError') throw e; // user closing the sheet is not an error
  }
  return true;
}

export function openWhatsApp(text: string) {
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
}
