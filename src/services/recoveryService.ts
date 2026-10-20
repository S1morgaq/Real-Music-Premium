import type { MusicClient } from "../client/MusicClient";
import { GuildSettings } from "../database/models/GuildSettings";
import { logger } from "../lib/logger";

export async function recover247Players(client: MusicClient): Promise<void> {
  const settings = await GuildSettings.find({ twentyFourSeven: true, voiceChannelId: { $exists: true } }).lean();
  for (const guild of settings) {
    if (!guild.voiceChannelId || !guild.textChannelId) continue;
    try {
      await client.kazagumo.createPlayer({
        guildId: guild.guildId,
        voiceId: guild.voiceChannelId,
        textId: guild.textChannelId,
        deaf: true,
        volume: guild.defaultVolume
      });
    } catch (error) {
      logger.warn({ error, guildId: guild.guildId }, "Failed to recover 24/7 player");
    }
  }
}
