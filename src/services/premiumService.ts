import type { ChatInputCommandInteraction } from "discord.js";
import { Premium } from "../database/models/Premium";

export async function hasPremium(interaction: ChatInputCommandInteraction): Promise<boolean> {
  return hasPremiumByIds(interaction.user.id, interaction.guildId);
}

export async function hasPremiumByIds(userId: string, guildId?: string | null): Promise<boolean> {
  const now = new Date();
  const [user, guild] = await Promise.all([
    Premium.findOne({
      targetId: userId,
      type: "user",
      $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: now } }]
    }).lean(),
    guildId
      ? Premium.findOne({
          targetId: guildId,
          type: "guild",
          $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: now } }]
        }).lean()
      : null
  ]);

  return Boolean(user || guild);
}
