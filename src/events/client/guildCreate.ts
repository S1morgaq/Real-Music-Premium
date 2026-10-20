import { Events, type Guild } from "discord.js";
import type { MusicClient } from "../../client/MusicClient";
import { logger } from "../../lib/logger";
import { deployJoinedGuildSlashCommands } from "../../services/slashCommandService";

export default {
  name: Events.GuildCreate,
  async execute(guild: Guild, client: MusicClient) {
    logger.info({ guildId: guild.id, guildName: guild.name }, "Bot joined guild");
    await deployJoinedGuildSlashCommands(client, guild);
  }
};

