import lyricsFinder from "lyrics-finder";
import { env } from "../config/env";

interface TrackLike {
  title?: string | null;
  author?: string | null;
  length?: number | null;
  encoded?: string | null;
}

interface LrcLibLyrics {
  id?: number;
  trackName?: string;
  artistName?: string;
  plainLyrics?: string | null;
  syncedLyrics?: string | null;
}

export interface LyricsResult {
  title: string;
  lyrics: string;
  source: "LavaLyrics" | "LRCLIB" | "lyrics.ovh" | "lyrics-finder";
}

const noisePatterns = [
  /\bofficial\b/gi,
  /\bofficial music video\b/gi,
  /\bofficial video\b/gi,
  /\blyric video\b/gi,
  /\blyrics?\b/gi,
  /\bvideo klip\b/gi,
  /\bklip\b/gi,
  /\bhd\b/gi,
  /\b4k\b/gi,
  /\bremastered\b/gi,
  /\bfeat\.?\b/gi,
  /\bft\.?\b/gi
];

function cleanText(value: string): string {
  let cleaned = value
    .replace(/\[[^\]]*]/g, " ")
    .replace(/\([^)]*\)/g, " ")
    .replace(/[|•]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  for (const pattern of noisePatterns) cleaned = cleaned.replace(pattern, " ");
  return cleaned.replace(/\s+/g, " ").trim();
}

function splitArtistTitle(query: string, fallbackArtist?: string | null): { artist: string; title: string } {
  const cleaned = cleanText(query);
  const parts = cleaned.split(/\s+-\s+|\s+–\s+|\s+—\s+/).map((part) => part.trim()).filter(Boolean);

  if (parts.length >= 2) {
    return {
      artist: cleanText(parts[0]),
      title: cleanText(parts.slice(1).join(" - "))
    };
  }

  return {
    artist: cleanText(fallbackArtist ?? ""),
    title: cleaned
  };
}

function unique(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function stripSyncedTimestamps(lyrics: string): string {
  return lyrics
    .split("\n")
    .map((line) => line.replace(/^\[\d{2}:\d{2}(?:\.\d{2,3})?]\s*/, "").trimEnd())
    .join("\n")
    .trim();
}

function lavalinkBaseUrl(): string {
  const protocol = env.LAVALINK_SECURE ? "https" : "http";
  return `${protocol}://${env.LAVALINK_URL.replace(/^https?:\/\//, "")}`;
}

function formatLavaLyrics(data: unknown): string {
  const payload = data as { text?: string | null; lines?: Array<{ line?: string | null }> };
  if (payload.text?.trim()) return payload.text.trim();
  return (payload.lines ?? [])
    .map((line) => line.line ?? "")
    .join("\n")
    .trim();
}

async function searchLavaLyrics(track?: TrackLike): Promise<LyricsResult | null> {
  if (!track?.encoded) return null;

  const params = new URLSearchParams({ track: track.encoded, skipTrackSource: "false" });
  const response = await fetch(`${lavalinkBaseUrl()}/v4/lyrics?${params.toString()}`, {
    headers: { Authorization: env.LAVALINK_AUTH }
  }).catch(() => null);

  if (!response?.ok) return null;
  const lyrics = formatLavaLyrics(await response.json().catch(() => null));
  if (!lyrics) return null;

  return { title: track.title ?? "Calan sarki", lyrics, source: "LavaLyrics" };
}

async function searchLrcLib(query: string, track?: TrackLike): Promise<LyricsResult | null> {
  const { artist, title } = splitArtistTitle(query, track?.author);
  const searches = [
    { track_name: title, artist_name: artist, duration: track?.length ? Math.round(track.length / 1000) : undefined },
    { q: artist ? `${artist} ${title}` : title },
    { q: cleanText(query) }
  ];

  for (const search of searches) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(search)) {
      if (value !== undefined && value !== "") params.set(key, String(value));
    }

    const response = await fetch(`https://lrclib.net/api/search?${params.toString()}`, {
      headers: { "User-Agent": "advanced-discord-music-bot/1.0.0" }
    }).catch(() => null);

    if (!response?.ok) continue;
    const results = (await response.json().catch(() => [])) as LrcLibLyrics[];
    const match = results.find((result) => result.plainLyrics || result.syncedLyrics);
    const lyrics = match?.plainLyrics ?? (match?.syncedLyrics ? stripSyncedTimestamps(match.syncedLyrics) : "");

    if (match && lyrics) {
      return {
        title: `${match.artistName ?? artist} - ${match.trackName ?? title}`.replace(/^\s+-\s+/, ""),
        lyrics,
        source: "LRCLIB"
      };
    }
  }

  return null;
}

async function searchLyricsFinder(query: string, track?: TrackLike): Promise<LyricsResult | null> {
  const { artist, title } = splitArtistTitle(query, track?.author);
  const searches = unique([title, cleanText(query), artist ? `${artist} ${title}` : ""]);

  for (const search of searches) {
    const lyrics = await lyricsFinder(artist, search).catch(() => null);
    if (lyrics) return { title: artist ? `${artist} - ${title}` : search, lyrics: String(lyrics), source: "lyrics-finder" };
  }

  return null;
}

async function searchLyricsOvh(query: string, track?: TrackLike): Promise<LyricsResult | null> {
  const { artist, title } = splitArtistTitle(query, track?.author);
  if (!artist || !title) return null;

  const response = await fetch(
    `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`
  ).catch(() => null);
  if (!response?.ok) return null;

  const data = (await response.json().catch(() => null)) as { lyrics?: string } | null;
  const lyrics = data?.lyrics?.trim();
  if (!lyrics) return null;

  return { title: `${artist} - ${title}`, lyrics, source: "lyrics.ovh" };
}

export async function findLyrics(query: string, track?: TrackLike): Promise<LyricsResult | null> {
  const cleaned = cleanText(query);
  if (!cleaned) return null;
  return (
    (await searchLavaLyrics(track)) ??
    (await searchLrcLib(cleaned, track)) ??
    (await searchLyricsOvh(cleaned, track)) ??
    (await searchLyricsFinder(cleaned, track))
  );
}
