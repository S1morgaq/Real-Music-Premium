declare module "lyrics-finder" {
  export default function lyricsFinder(artist: string, title: string): Promise<string | null>;
}
