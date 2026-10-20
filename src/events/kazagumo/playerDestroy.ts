import { clearAdTimer } from "../../music/ads";
import { clearNowPlayingUpdater } from "../../music/nowPlayingMessage";
import { logger } from "../../lib/logger";
import { clearGuildVoiceSession } from "../../services/settingsService";

export default {
  name: "playerDestroy",
  async execute(player: any) {
    clearNowPlayingUpdater(player);
    clearAdTimer(player);
    const guildId = player?.guildId;
    if (!guildId) return;

    try {
      await clearGuildVoiceSession(guildId);
    } catch (error) {
      logger.warn({ error, guildId }, "Failed to clear guild voice session");
    }
  }
};
