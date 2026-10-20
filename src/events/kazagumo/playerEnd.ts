import type { MusicClient } from "../../client/MusicClient";
import { handleAdTrackEnd } from "../../music/ads";
import { clearNowPlayingUpdater } from "../../music/nowPlayingMessage";

export default {
  name: "playerEnd",
  async execute(player: any, client: MusicClient) {
    clearNowPlayingUpdater(player);
    await handleAdTrackEnd(player, client);
  }
};
