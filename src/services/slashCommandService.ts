import { REST, Routes, type Guild } from "discord.js";
import type { MusicClient } from "../client/MusicClient";
import { env } from "../config/env";
import { applyTurkishSlashLocalizations } from "../lib/commandAliases";
import { logger } from "../lib/logger";

const rest = new REST({ version: "10", timeout: 30_000 }).setToken(env.DISCORD_TOKEN);
const deployingGuilds = new Set<string>();

export function serializedSlashCommands(client: MusicClient): unknown[] {
  return client.commands.map((command) => applyTurkishSlashLocalizations(command.data.toJSON()));
}

export async function deployGuildSlashCommands(client: MusicClient, guildId: string): Promise<void> {
  if (!env.AUTO_DEPLOY_GUILD_COMMANDS || deployingGuilds.has(guildId)) return;
  deployingGuilds.add(guildId);

  try {
    const body = serializedSlashCommands(client);
    await rest.put(Routes.applicationGuildCommands(env.DISCORD_CLIENT_ID, guildId), { body });
    logger.info({ guildId, count: body.length }, "Guild slash commands deployed");
  } catch (error) {
    logger.error({ guildId, error }, "Guild slash command deploy failed");
  } finally {
    deployingGuilds.delete(guildId);
  }
}

export async function deployAllGuildSlashCommands(client: MusicClient): Promise<void> {
  if (!env.AUTO_DEPLOY_GUILD_COMMANDS) return;

  const guilds = [...client.guilds.cache.values()];
  for (const guild of guilds) {
    await deployGuildSlashCommands(client, guild.id);
  }
}

export async function deployJoinedGuildSlashCommands(client: MusicClient, guild: Guild): Promise<void> {
  await deployGuildSlashCommands(client, guild.id);
}

