import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../../types/Command";
import { baseEmbed } from "../../lib/embeds";

function mb(bytes: number): string {
  return `${Math.round(bytes / 1024 / 1024)} MB`;
}

export default {
  data: new SlashCommandBuilder().setName("stats").setDescription("Bot performans bilgilerini gosterir."),
  async execute(interaction, client) {
    const memory = process.memoryUsage();
    const uptime = Math.floor(process.uptime());
    await interaction.reply({
      embeds: [
        baseEmbed()
          .setTitle("Bot Durumu")
          .addFields(
            { name: "Sunucu", value: String(client.guilds.cache.size), inline: true },
            { name: "Player", value: String(client.kazagumo.players.size), inline: true },
            { name: "Ping", value: `${Math.round(client.ws.ping)}ms`, inline: true },
            { name: "RAM", value: `${mb(memory.rss)} RSS / ${mb(memory.heapUsed)} heap`, inline: true },
            { name: "Uptime", value: `${Math.floor(uptime / 3600)}s ${Math.floor((uptime % 3600) / 60)}d`, inline: true }
          )
      ],
      ephemeral: true
    });
  }
} satisfies Command;
