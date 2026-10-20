import "dotenv/config";
import { REST, Routes } from "discord.js";
import { env } from "../src/config/env";
import { MusicClient } from "../src/client/MusicClient";
import { loadCommands } from "../src/handlers/commandLoader";
import { serializedSlashCommands } from "../src/services/slashCommandService";

async function main(): Promise<void> {
  const client = new MusicClient();
  await loadCommands(client);
  const body = serializedSlashCommands(client);
  const rest = new REST({ version: "10", timeout: 30_000 }).setToken(env.DISCORD_TOKEN);

  const guildIds = [
    env.DISCORD_GUILD_ID,
    ...env.DISCORD_GUILD_IDS.split(",")
  ]
    .map((id) => id.trim())
    .filter(Boolean);

  if (guildIds.length) {
    for (const guildId of guildIds) {
      await rest.put(Routes.applicationGuildCommands(env.DISCORD_CLIENT_ID, guildId), { body });
      console.log(`Deployed ${body.length} guild commands to ${guildId}.`);
    }
    return;
  }

  await rest.put(Routes.applicationCommands(env.DISCORD_CLIENT_ID), { body });
  console.log(`Deployed ${body.length} global commands.`);
}

void main().catch((error) => {
  console.error("Slash komutlari deploy edilemedi. Discord API'ye baglanti/token durumunu kontrol et.");
  console.error(error);
  process.exit(1);
});
