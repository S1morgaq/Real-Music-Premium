import { extractYouTubePlaylistUrl } from "./youtube";

export function extractSpotifyPlaylistUrl(input: string): string | null {
  try {
    const url = new URL(input);
    const host = url.hostname.replace(/^www\./, "");
    const isSpotify = host === "open.spotify.com" || host.endsWith(".open.spotify.com");
    if (!isSpotify) return null;

    const parts = url.pathname.split("/").filter(Boolean);
    const playlistIndex = parts.indexOf("playlist");
    const playlistId = playlistIndex >= 0 ? parts[playlistIndex + 1] : null;
    if (!playlistId) return null;

    return `https://open.spotify.com/playlist/${playlistId}`;
  } catch {
    return null;
  }
}

export function normalizeMusicQuery(input: string): string {
  return extractYouTubePlaylistUrl(input) ?? extractSpotifyPlaylistUrl(input) ?? input;
}
