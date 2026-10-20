import type { User } from "discord.js";
import type { MusicClient } from "../client/MusicClient";
import { env } from "../config/env";

const inflightSearches = new Map<string, Promise<any>>();
const playableTrackCache = new Map<string, Promise<any>>();
const noisyTitlePattern = /\b(cover|karaoke|remix|sped up|slowed|nightcore|8d|instrumental|reaction|lyrics only)\b/i;
const fakeUploadPattern = /\b(reupload|tiktok version|bass boosted|extended loop|one hour|1 hour)\b/i;

export async function searchMusic(client: MusicClient, query: string, requester: User): Promise<any> {
  const key = query.trim().toLowerCase();
  const existing = inflightSearches.get(key);
  if (existing) return existing;

  const task = searchWithFallback(client, query, requester).finally(() => {
    setTimeout(() => inflightSearches.delete(key), 10_000).unref();
  });

  inflightSearches.set(key, task);
  return task;
}

export function smartRankTracks(tracks: any[], query: string): any[] {
  const seen = new Set<string>();
  return tracks
    .map((track) => ({ track, score: scoreTrack(track, query) }))
    .filter(({ track }) => {
      const key = `${String(track.title ?? "").toLowerCase()}|${String(track.author ?? "").toLowerCase()}|${Number(track.length ?? 0)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => b.score - a.score)
    .map(({ track }) => track);
}

function scoreTrack(track: any, query: string): number {
  const title = String(track.title ?? track.info?.title ?? "");
  const author = String(track.author ?? track.info?.author ?? "");
  const haystack = `${title} ${author}`.toLowerCase();
  const tokens = query
    .toLowerCase()
    .split(/\s+/)
    .filter((token) => token.length > 2);
  let score = 40;

  for (const token of tokens) {
    if (haystack.includes(token)) score += 8;
  }

  if (noisyTitlePattern.test(title)) score -= 18;
  if (fakeUploadPattern.test(title)) score -= 24;
  if (/\b(official|audio|video|topic)\b/i.test(title) || /\bvevo|topic\b/i.test(author)) score += 10;
  if (Number(track.length ?? 0) > 0 && Number(track.length ?? 0) < 12 * 60 * 1000) score += 6;
  if (Number(track.length ?? 0) > 20 * 60 * 1000) score -= 28;

  return score;
}

async function searchWithFallback(client: MusicClient, query: string, requester: User): Promise<any> {
  if (/^[a-z]+search:/i.test(query) || /^https?:\/\//i.test(query)) {
    return withTimeout(client.kazagumo.search(query, { requester }), env.SEARCH_TIMEOUT_MS, "Music search timed out");
  }

  for (const prefix of ["ytmsearch:", "ytsearch:", "scsearch:"]) {
    const result = await withTimeout(
      client.kazagumo.search(`${prefix}${query}`, { requester }),
      env.SEARCH_TIMEOUT_MS,
      "Music search timed out"
    ).catch(() => null);
    if (result?.tracks?.length) return result;
  }

  return withTimeout(client.kazagumo.search(query, { requester }), env.SEARCH_TIMEOUT_MS, "Music search timed out");
}

function isYouTubeTrack(track: any): boolean {
  const source = String(track?.sourceName ?? track?.source ?? track?.info?.sourceName ?? "").toLowerCase();
  const uri = String(track?.uri ?? track?.realUri ?? track?.info?.uri ?? "");
  return source === "youtube" || /youtu\.be|youtube\.com/i.test(uri);
}

function trackMirrorQuery(track: any): string {
  const title = String(track?.title ?? track?.info?.title ?? "").replace(/\s+/g, " ").trim();
  const author = String(track?.author ?? track?.info?.author ?? "").replace(/\s+/g, " ").trim();
  return [author, title].filter(Boolean).join(" ");
}

export async function resolvePlayableTrack(client: MusicClient, track: any, requester: User): Promise<any> {
  if (!isYouTubeTrack(track)) return track;

  const query = trackMirrorQuery(track);
  if (!query) return track;

  const cacheKey = query.toLowerCase();
  const existing = playableTrackCache.get(cacheKey);
  if (existing) return existing;

  const task = withTimeout(
    client.kazagumo.search(`scsearch:${query}`, { requester }),
    env.SEARCH_TIMEOUT_MS,
    "Music search timed out"
  )
    .then((result: any) => result?.tracks?.[0] ?? track)
    .catch(() => track)
    .finally(() => {
      setTimeout(() => playableTrackCache.delete(cacheKey), 60_000).unref();
    });

  playableTrackCache.set(cacheKey, task);
  return task;
}

export async function resolvePlayableTracks(client: MusicClient, tracks: any[], requester: User): Promise<any[]> {
  const resolved: any[] = [];

  for (const track of tracks) {
    resolved.push(await resolvePlayableTrack(client, track, requester));
  }

  return resolved;
}

export async function findAlternateTrack(client: MusicClient, track: any, requester: User): Promise<any | null> {
  const query = trackMirrorQuery(track);
  if (!query) return null;

  const source = String(track?.sourceName ?? track?.source ?? track?.info?.sourceName ?? "").toLowerCase();
  const prefixes = source === "soundcloud" ? ["ytmsearch:", "ytsearch:"] : ["scsearch:", "ytmsearch:", "ytsearch:"];
  const currentUri = String(track?.uri ?? track?.realUri ?? track?.info?.uri ?? "");

  for (const prefix of prefixes) {
    const result = await withTimeout(
      client.kazagumo.search(`${prefix}${query}`, { requester }),
      env.SEARCH_TIMEOUT_MS,
      "Music search timed out"
    ).catch(() => null);
    const alternate = result?.tracks?.find((candidate: any) => {
      const candidateUri = String(candidate?.uri ?? candidate?.realUri ?? candidate?.info?.uri ?? "");
      return candidateUri && candidateUri !== currentUri;
    });

    if (alternate) return alternate;
  }

  return null;
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
