export type FilterName =
  | "clear"
  | "bassboost"
  | "nightcore"
  | "vaporwave"
  | "karaoke"
  | "tremolo"
  | "vibrato";

export function applyFilter(player: any, filter: FilterName, value = 1): void {
  if (!player?.shoukaku?.setFilters) return;

  if (filter === "clear") {
    player.shoukaku.clearFilters();
    player.data?.set("activeFilters", []);
    return;
  }

  const filters: Record<FilterName, Record<string, unknown>> = {
    clear: {},
    bassboost: {
      equalizer: [
        { band: 0, gain: 0.15 * value },
        { band: 1, gain: 0.18 * value },
        { band: 2, gain: 0.12 * value }
      ]
    },
    nightcore: { timescale: { speed: 1.18, pitch: 1.18, rate: 1.0 } },
    vaporwave: { timescale: { speed: 0.82, pitch: 0.82, rate: 1.0 } },
    karaoke: { karaoke: { level: 1.0, monoLevel: 1.0, filterBand: 220.0, filterWidth: 100.0 } },
    tremolo: { tremolo: { frequency: 4.0, depth: 0.75 } },
    vibrato: { vibrato: { frequency: 4.0, depth: 0.75 } }
  };

  player.shoukaku.setFilters(filters[filter]);
  player.data?.set("activeFilters", [filter]);
}

export function applyTimescale(player: any, patch: Record<string, number>): void {
  if (!player?.shoukaku?.setFilters) return;
  player.shoukaku.setFilters({ timescale: patch });
  player.data?.set("activeFilters", ["timescale"]);
}
