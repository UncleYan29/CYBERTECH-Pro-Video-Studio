/**
 * High-precision timecode formatting and frame conversion utilities
 */

export function formatTimecode(totalSeconds: number, fps: number = 30): string {
  if (isNaN(totalSeconds) || totalSeconds < 0) totalSeconds = 0;
  
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const frames = Math.floor((totalSeconds % 1) * fps);

  const pad = (n: number, z = 2) => String(n).padStart(z, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}:${pad(frames)}`;
}

export function formatSimpleDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(mins)}:${pad(secs)}`;
}

export function parseTimecode(tc: string, fps: number = 30): number {
  const parts = tc.trim().split(':').map(Number);
  if (parts.some(isNaN)) return 0;

  if (parts.length === 4) {
    const [h, m, s, f] = parts;
    return h * 3600 + m * 60 + s + f / fps;
  }
  if (parts.length === 3) {
    const [m, s, f] = parts;
    return m * 60 + s + f / fps;
  }
  if (parts.length === 2) {
    const [m, s] = parts;
    return m * 60 + s;
  }
  return 0;
}
