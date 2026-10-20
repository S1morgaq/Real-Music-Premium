import { env } from "../config/env";
import { GuildSettings } from "../database/models/GuildSettings";

export async function getGuildSettings(guildId: string) {
  return GuildSettings.findOneAndUpdate(
    { guildId },
    { $setOnInsert: { guildId, defaultVolume: env.DEFAULT_VOLUME } },
    { new: true, upsert: true }
  );
}

export async function setGuildSetting(guildId: string, patch: Record<string, unknown>) {
  return GuildSettings.findOneAndUpdate({ guildId }, { $set: patch }, { new: true, upsert: true });
}

export async function clearGuildVoiceSession(guildId: string) {
  return GuildSettings.findOneAndUpdate(
    { guildId },
    {
      $set: { twentyFourSeven: false },
      $unset: { voiceChannelId: "", textChannelId: "" }
    },
    { new: true }
  );
}
