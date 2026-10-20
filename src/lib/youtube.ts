export function extractYouTubePlaylistUrl(input: string): string | null {
  try {
    const url = new URL(input);
    const host = url.hostname.replace(/^www\./, "");
    if (!["youtube.com", "music.youtube.com", "m.youtube.com", "youtu.be"].includes(host)) return null;
    const playlistId = url.searchParams.get("list");
    if (!playlistId) return null;
    return `https://www.youtube.com/playlist?list=${playlistId}`;
  } catch {
    return null;
  }
}
