import type { MusicClient } from "../../client/MusicClient";
import { clearIdleTimer } from "../../music/idle";
import { isAdPlaying, scheduleAdTimer } from "../../music/ads";
import { recordTrackPlay } from "../../services/statsService";
import { sendLiveNowPlayingMessage } from "../../music/nowPlayingMessage";

export default {
  name: "playerStart",
  async execute(player: any, track: any, client: MusicClient) {
    clearIdleTimer(player);

    if (isAdPlaying(player)) return;
    if (!player.data.get("adTimer")) scheduleAdTimer(player, client);

    const channel = client.channels.cache.get(player.textId);
    if (!channel?.isTextBased() || !("send" in channel)) return;

    player.data.set("previous", player.data.get("current"));
    player.data.set("current", track);
    await recordTrackPlay(player.guildId, track).catch((error) => client.emit("error", error as Error));

    await sendLiveNowPlayingMessage(channel, player, track);
  }
};
