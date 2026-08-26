function timestampedName() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `tawaf-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.png`;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function snapshotSceneCanvas(source: HTMLCanvasElement): HTMLCanvasElement {
  const copy = document.createElement('canvas');
  copy.width = source.width;
  copy.height = source.height;
  const ctx = copy.getContext('2d');
  if (!ctx) {
    throw new Error('Could not create 2D context for screenshot');
  }
  ctx.drawImage(source, 0, 0);
  return copy;
}

export function downloadCanvasPng(canvas: HTMLCanvasElement) {
  canvas.toBlob((blob) => {
    if (!blob) {
      console.error('Failed to encode screenshot PNG');
      return;
    }
    triggerDownload(blob, timestampedName());
  }, 'image/png');
}
