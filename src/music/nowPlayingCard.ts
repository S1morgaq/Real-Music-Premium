import { createCanvas, GlobalFonts, loadImage } from "@napi-rs/canvas";
import { formatDuration } from "../lib/time";
import type { RadioStation } from "../services/radioService";

type CanvasContext = ReturnType<ReturnType<typeof createCanvas>["getContext"]>;

export interface NowPlayingCardOptions {
  volume?: number;
  loop?: string;
  filters?: string[];
  requesterName?: string;
  requesterAvatar?: string | null;
  guildName?: string;
  radioStation?: RadioStation | null;
}

try {
  GlobalFonts.registerFromPath("C:\\Windows\\Fonts\\arial.ttf", "Arial");
  GlobalFonts.registerFromPath("C:\\Windows\\Fonts\\segoeui.ttf", "Segoe UI");
} catch {
  // Linux/Docker can render with the canvas fallback font.
}

function roundedRect(ctx: CanvasContext, x: number, y: number, width: number, height: number, radius: number): void {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function fillRounded(ctx: CanvasContext, x: number, y: number, width: number, height: number, radius: number, fill: string | CanvasGradient): void {
  ctx.fillStyle = fill;
  roundedRect(ctx, x, y, width, height, radius);
  ctx.fill();
}

function strokeRounded(ctx: CanvasContext, x: number, y: number, width: number, height: number, radius: number, color: string, lineWidth = 1): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  roundedRect(ctx, x, y, width, height, radius);
  ctx.stroke();
}

function fitText(ctx: CanvasContext, text: string, maxWidth: number): string {
  const normalized = text.replace(/\s+/g, " ").trim() || "Bilinmeyen";
  if (ctx.measureText(normalized).width <= maxWidth) return normalized;

  let value = normalized;
  while (value.length > 4 && ctx.measureText(`${value}...`).width > maxWidth) value = value.slice(0, -1);
  return `${value.trim()}...`;
}

function drawSoftNoise(ctx: CanvasContext, width: number, height: number): void {
  ctx.globalAlpha = 0.12;
  for (let i = 0; i < 160; i += 1) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 1 + Math.random() * 2;
    ctx.fillStyle = i % 3 === 0 ? "#38bdf8" : i % 3 === 1 ? "#22c55e" : "#f43f5e";
    ctx.fillRect(x, y, size, size);
  }
  ctx.globalAlpha = 1;
}

function drawFallbackCover(ctx: CanvasContext, x: number, y: number, size: number, title: string): void {
  const gradient = ctx.createLinearGradient(x, y, x + size, y + size);
  gradient.addColorStop(0, "#1d4ed8");
  gradient.addColorStop(0.5, "#0f766e");
  gradient.addColorStop(1, "#be123c");
  fillRounded(ctx, x, y, size, size, 26, gradient);

  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = "800 62px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const initials = title
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  ctx.fillText(initials || "RM", x + size / 2, y + size / 2);
  ctx.textAlign = "start";
  ctx.textBaseline = "alphabetic";
}

async function drawCover(ctx: CanvasContext, thumbnail: string | undefined, x: number, y: number, size: number, title: string): Promise<void> {
  ctx.save();
  roundedRect(ctx, x, y, size, size, 26);
  ctx.clip();

  if (thumbnail) {
    try {
      const image = await loadImage(thumbnail);
      const imageRatio = image.width / image.height;
      const targetRatio = 1;
      let sx = 0;
      let sy = 0;
      let sw = image.width;
      let sh = image.height;

      if (imageRatio > targetRatio) {
        sw = image.height * targetRatio;
        sx = (image.width - sw) / 2;
      } else {
        sh = image.width / targetRatio;
        sy = (image.height - sh) / 2;
      }

      ctx.drawImage(image, sx, sy, sw, sh, x, y, size, size);
    } catch {
      drawFallbackCover(ctx, x, y, size, title);
    }
  } else {
    drawFallbackCover(ctx, x, y, size, title);
  }

  const shade = ctx.createLinearGradient(x, y, x + size, y + size);
  shade.addColorStop(0, "rgba(255,255,255,0.14)");
  shade.addColorStop(0.55, "rgba(0,0,0,0)");
  shade.addColorStop(1, "rgba(0,0,0,0.32)");
  ctx.fillStyle = shade;
  ctx.fillRect(x, y, size, size);
  ctx.restore();

  strokeRounded(ctx, x, y, size, size, 26, "rgba(255,255,255,0.22)", 2);
}

function drawBackground(ctx: CanvasContext, width: number, height: number): void {
  const background = ctx.createLinearGradient(0, 0, width, height);
  background.addColorStop(0, "#08111f");
  background.addColorStop(0.42, "#101827");
  background.addColorStop(1, "#06130f");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  const wash = ctx.createRadialGradient(180, 80, 10, 180, 80, 520);
  wash.addColorStop(0, "rgba(56,189,248,0.34)");
  wash.addColorStop(0.48, "rgba(34,197,94,0.11)");
  wash.addColorStop(1, "rgba(56,189,248,0)");
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, width, height);

  const side = ctx.createRadialGradient(width - 180, height - 80, 10, width - 180, height - 80, 520);
  side.addColorStop(0, "rgba(244,63,94,0.24)");
  side.addColorStop(0.48, "rgba(167,139,250,0.08)");
  side.addColorStop(1, "rgba(244,63,94,0)");
  ctx.fillStyle = side;
  ctx.fillRect(0, 0, width, height);

  drawSoftNoise(ctx, width, height);
}

function drawProgress(ctx: CanvasContext, x: number, y: number, width: number, progress: number): void {
  fillRounded(ctx, x, y, width, 18, 9, "rgba(15,23,42,0.82)");
  fillRounded(ctx, x, y, Math.max(18, width * progress), 18, 9, progressGradient(ctx, x, width));

  ctx.fillStyle = "#f8fafc";
  ctx.beginPath();
  ctx.arc(x + width * progress, y + 9, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(56,189,248,0.5)";
  ctx.lineWidth = 5;
  ctx.stroke();
}

function progressGradient(ctx: CanvasContext, x: number, width: number): CanvasGradient {
  const gradient = ctx.createLinearGradient(x, 0, x + width, 0);
  gradient.addColorStop(0, "#22c55e");
  gradient.addColorStop(0.48, "#38bdf8");
  gradient.addColorStop(1, "#f43f5e");
  return gradient;
}

function seedFromText(text: string): number {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

function drawWaveform(ctx: CanvasContext, x: number, y: number, width: number, height: number, seed: number, activeRatio: number): void {
  const bars = 58;
  const gap = 5;
  const barWidth = (width - gap * (bars - 1)) / bars;

  for (let i = 0; i < bars; i += 1) {
    const phase = (seed % 97) / 11 + i * 0.54;
    const level = 0.26 + Math.abs(Math.sin(phase)) * 0.55 + Math.abs(Math.cos(phase * 0.37)) * 0.18;
    const barHeight = Math.max(8, Math.min(height, height * level));
    const bx = x + i * (barWidth + gap);
    const by = y + (height - barHeight) / 2;
    const lit = i / bars <= activeRatio;
    const gradient = ctx.createLinearGradient(bx, by, bx, by + barHeight);
    gradient.addColorStop(0, lit ? "#f43f5e" : "rgba(148,163,184,0.34)");
    gradient.addColorStop(0.5, lit ? "#38bdf8" : "rgba(100,116,139,0.28)");
    gradient.addColorStop(1, lit ? "#22c55e" : "rgba(51,65,85,0.22)");
    fillRounded(ctx, bx, by, barWidth, barHeight, 5, gradient);
  }
}

function drawChip(ctx: CanvasContext, x: number, y: number, text: string, color: string, maxWidth = 180): number {
  ctx.font = "800 17px Arial";
  const value = fitText(ctx, text.toUpperCase(), maxWidth - 32);
  const width = Math.min(maxWidth, Math.max(82, ctx.measureText(value).width + 32));
  fillRounded(ctx, x, y, width, 36, 18, "rgba(15,23,42,0.68)");
  strokeRounded(ctx, x, y, width, 36, 18, color, 1.4);
  ctx.fillStyle = color;
  ctx.fillText(value, x + 16, y + 24);
  return width;
}

async function drawAvatar(ctx: CanvasContext, avatar: string | null | undefined, x: number, y: number, size: number): Promise<void> {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
  ctx.clip();
  if (avatar) {
    try {
      const image = await loadImage(avatar);
      ctx.drawImage(image, x, y, size, size);
    } catch {
      fillRounded(ctx, x, y, size, size, size / 2, "rgba(56,189,248,0.3)");
    }
  } else {
    fillRounded(ctx, x, y, size, size, size / 2, "rgba(56,189,248,0.3)");
  }
  ctx.restore();
  strokeRounded(ctx, x, y, size, size, size / 2, "rgba(255,255,255,0.28)", 2);
}

function activeFilterLabel(filters: string[] | undefined): string {
  const active = (filters ?? []).filter((name) => name && name !== "clear");
  return active.length ? active.slice(0, 2).join(" + ") : "clean";
}

export async function createNowPlayingCard(
  track: any,
  position: number,
  upcoming: any[] = [],
  options: NowPlayingCardOptions = {}
): Promise<Buffer> {
  const width = 1000;
  const height = upcoming.length ? 640 : 450;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  drawBackground(ctx, width, height);
  fillRounded(ctx, 28, 28, width - 56, height - 56, 24, "rgba(15,23,42,0.72)");
  strokeRounded(ctx, 28, 28, width - 56, height - 56, 24, "rgba(148,163,184,0.22)");

  const title = String(track.title ?? "Bilinmeyen sarki");
  const author = String(track.author ?? "Bilinmeyen sanatci");
  const thumbnail = track.thumbnail || track.artworkUrl;
  const length = Number(track.length ?? 0);
  const safePosition = Math.min(Math.max(position, 0), length || position);
  const isLive = Boolean(options.radioStation || track.isStream || !length);
  const progress = isLive ? ((Date.now() / 1000) % 100) / 100 : length > 0 ? Math.min(1, safePosition / length) : 0;

  await drawCover(ctx, thumbnail, 66, 74, 238, title);

  ctx.fillStyle = options.radioStation?.accent ?? "#38bdf8";
  ctx.font = "800 21px Arial";
  ctx.fillText(isLive ? "CANLI RADYO" : "SIMDI CALIYOR", 342, 96);

  ctx.fillStyle = "#f8fafc";
  ctx.font = "800 44px Arial";
  ctx.fillText(fitText(ctx, title, 580), 342, 148);

  ctx.fillStyle = "#cbd5e1";
  ctx.font = "500 26px Arial";
  ctx.fillText(fitText(ctx, author, 580), 342, 188);

  const metaY = 238;
  fillRounded(ctx, 342, metaY - 28, 136, 42, 21, "rgba(56,189,248,0.14)");
  fillRounded(ctx, 494, metaY - 28, 136, 42, 21, "rgba(34,197,94,0.14)");
  fillRounded(ctx, 646, metaY - 28, 166, 42, 21, "rgba(244,63,94,0.13)");
  fillRounded(ctx, 828, metaY - 28, 94, 42, 21, "rgba(168,85,247,0.13)");

  ctx.font = "700 18px Arial";
  ctx.fillStyle = "#7dd3fc";
  ctx.fillText(isLive ? "LIVE" : "SURE", 368, metaY - 2);
  ctx.fillStyle = "#86efac";
  ctx.fillText(`${Math.max(0, Math.round(Number(options.volume ?? 0)))}%`, 535, metaY - 2);
  ctx.fillStyle = "#fda4af";
  ctx.fillText(upcoming.length ? `${upcoming.length} SIRADA` : "TEK PARCA", 674, metaY - 2);
  ctx.fillStyle = "#d8b4fe";
  ctx.fillText(String(options.loop ?? "off").toUpperCase(), 852, metaY - 2);

  drawWaveform(ctx, 342, 274, 580, 72, seedFromText(`${title}:${author}`), progress);
  drawProgress(ctx, 342, 368, 580, isLive ? 1 : progress);

  ctx.fillStyle = "#e2e8f0";
  ctx.font = "700 20px Arial";
  ctx.fillText(isLive ? "LIVE" : formatDuration(safePosition), 342, 420);
  ctx.textAlign = "right";
  ctx.fillText(isLive ? "Kesintisiz yayin" : formatDuration(length), 922, 420);
  ctx.textAlign = "start";

  await drawAvatar(ctx, options.requesterAvatar, 66, 330, 54);
  ctx.fillStyle = "#94a3b8";
  ctx.font = "700 17px Arial";
  ctx.fillText(fitText(ctx, options.guildName ?? "Discord Server", 210), 134, 352);
  ctx.fillStyle = "#e2e8f0";
  ctx.font = "800 19px Arial";
  ctx.fillText(fitText(ctx, options.requesterName ?? "Music Session", 210), 134, 378);

  let chipX = 342;
  chipX += drawChip(ctx, chipX, height - (upcoming.length ? 84 : 58), `vol ${Math.round(Number(options.volume ?? 0))}%`, "#38bdf8", 124) + 12;
  chipX += drawChip(ctx, chipX, height - (upcoming.length ? 84 : 58), activeFilterLabel(options.filters), "#22c55e", 170) + 12;
  if (options.radioStation) drawChip(ctx, chipX, height - (upcoming.length ? 84 : 58), options.radioStation.quality, options.radioStation.accent, 190);

  if (upcoming.length) {
    fillRounded(ctx, 66, 446, 868, 136, 22, "rgba(2,6,23,0.46)");
    ctx.fillStyle = "#f8fafc";
    ctx.font = "800 24px Arial";
    ctx.fillText("Siradakiler", 96, 488);

    ctx.font = "600 20px Arial";
    upcoming.slice(0, 4).forEach((nextTrack, index) => {
      const y = 522 + index * 26;
      const row = index % 2 === 0 ? "rgba(30,41,59,0.62)" : "rgba(15,23,42,0.62)";
      fillRounded(ctx, 96, y - 20, 808, 24, 8, row);

      ctx.fillStyle = "#38bdf8";
      ctx.fillText(String(index + 1).padStart(2, "0"), 114, y);
      ctx.fillStyle = "#f8fafc";
      ctx.fillText(fitText(ctx, String(nextTrack.title ?? "Bilinmeyen sarki"), 600), 158, y);
      ctx.fillStyle = "#94a3b8";
      ctx.textAlign = "right";
      ctx.fillText(formatDuration(Number(nextTrack.length ?? 0)), 884, y);
      ctx.textAlign = "start";
    });
  }

  return canvas.encode("png");
}

export async function createRadioCard(station: RadioStation, guildName?: string): Promise<Buffer> {
  const width = 1000;
  const height = 390;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  drawBackground(ctx, width, height);
  fillRounded(ctx, 28, 28, width - 56, height - 56, 26, "rgba(15,23,42,0.76)");
  strokeRounded(ctx, 28, 28, width - 56, height - 56, 26, station.accent, 2);
  await drawCover(ctx, station.logo, 70, 70, 220, station.name);

  ctx.fillStyle = station.accent;
  ctx.font = "800 22px Arial";
  ctx.fillText("LIVE RADIO", 328, 100);
  ctx.fillStyle = "#f8fafc";
  ctx.font = "900 48px Arial";
  ctx.fillText(fitText(ctx, station.name, 560), 328, 158);
  ctx.fillStyle = "#cbd5e1";
  ctx.font = "700 25px Arial";
  ctx.fillText(`${station.genre} | ${station.country}`, 328, 200);

  drawWaveform(ctx, 328, 232, 560, 52, seedFromText(station.id), 1);
  drawChip(ctx, 328, 306, station.category, "#38bdf8", 140);
  drawChip(ctx, 482, 306, station.quality, station.accent, 190);
  drawChip(ctx, 686, 306, guildName ?? "24/7 ready", "#22c55e", 220);

  return canvas.encode("png");
}

export async function createQueueCard(current: any, tracks: any[], page: number, pages: number): Promise<Buffer> {
  const width = 1000;
  const height = 580;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  drawBackground(ctx, width, height);
  fillRounded(ctx, 34, 34, width - 68, height - 68, 24, "rgba(15,23,42,0.78)");

  ctx.fillStyle = "#f8fafc";
  ctx.font = "800 42px Arial";
  ctx.fillText("Sira", 72, 96);
  ctx.fillStyle = "#94a3b8";
  ctx.font = "700 20px Arial";
  ctx.textAlign = "right";
  ctx.fillText(`Sayfa ${page}/${pages}`, 912, 92);
  ctx.textAlign = "start";

  ctx.fillStyle = "#cbd5e1";
  ctx.font = "600 22px Arial";
  ctx.fillText(`Calan: ${fitText(ctx, String(current?.title ?? "Calan parca yok"), 760)}`, 72, 138);

  tracks.slice(0, 10).forEach((track, index) => {
    const y = 190 + index * 34;
    fillRounded(ctx, 72, y - 24, 856, 30, 9, index % 2 === 0 ? "rgba(30,41,59,0.68)" : "rgba(15,23,42,0.68)");
    ctx.font = "700 19px Arial";
    ctx.fillStyle = "#38bdf8";
    ctx.fillText(String(index + 1).padStart(2, "0"), 92, y - 2);
    ctx.fillStyle = "#f8fafc";
    ctx.fillText(fitText(ctx, String(track.title ?? "Bilinmeyen sarki"), 660), 140, y - 2);
    ctx.fillStyle = "#94a3b8";
    ctx.textAlign = "right";
    ctx.fillText(formatDuration(Number(track.length ?? 0)), 900, y - 2);
    ctx.textAlign = "start";
  });

  if (!tracks.length) {
    ctx.fillStyle = "#94a3b8";
    ctx.font = "600 26px Arial";
    ctx.fillText("Sirada parca yok.", 72, 220);
  }

  return canvas.encode("png");
}

export async function createAddedCard(options: {
  title: string;
  subtitle: string;
  thumbnail?: string | null;
  label: string;
}): Promise<Buffer> {
  const width = 1000;
  const height = 330;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  drawBackground(ctx, width, height);
  fillRounded(ctx, 28, 28, width - 56, height - 56, 24, "rgba(15,23,42,0.74)");
  strokeRounded(ctx, 28, 28, width - 56, height - 56, 24, "rgba(148,163,184,0.22)");

  await drawCover(ctx, options.thumbnail ?? undefined, 70, 62, 206, options.title);

  ctx.fillStyle = "#22c55e";
  ctx.font = "800 23px Arial";
  ctx.fillText(options.label.toUpperCase(), 318, 98);

  ctx.fillStyle = "#f8fafc";
  ctx.font = "800 39px Arial";
  ctx.fillText(fitText(ctx, options.title, 600), 318, 150);

  ctx.fillStyle = "#cbd5e1";
  ctx.font = "600 25px Arial";
  ctx.fillText(fitText(ctx, options.subtitle, 600), 318, 192);

  fillRounded(ctx, 318, 238, 580, 15, 8, "rgba(51,65,85,0.95)");
  fillRounded(ctx, 318, 238, 420, 15, 8, progressGradient(ctx, 318, 580));

  return canvas.encode("png");
}
