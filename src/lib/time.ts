export function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return "00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const hours = Math.floor(totalSeconds / 3600);
  const parts = hours > 0 ? [hours, minutes, seconds] : [minutes, seconds];
  return parts.map((part) => part.toString().padStart(2, "0")).join(":");
}

export function parseTime(input: string): number | null {
  if (/^\d+$/.test(input)) return Number(input) * 1000;
  const match = input.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (!match) return null;
  const [, h = "0", m = "0", s = "0"] = match;
  const total = Number(h) * 3_600_000 + Number(m) * 60_000 + Number(s) * 1000;
  return total > 0 ? total : null;
}

export function progressBar(position: number, length: number, size = 18): string {
  if (!length || length <= 0) return "▬".repeat(size);
  const index = Math.min(size - 1, Math.floor((position / length) * size));
  return "▬".repeat(index) + "🔘" + "▬".repeat(size - index - 1);
}
