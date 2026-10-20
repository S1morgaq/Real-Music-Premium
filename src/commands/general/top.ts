import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../../types/Command";
import { baseEmbed, errorEmbed } from "../../lib/embeds";
import { getTopTracks, getTopUsers } from "../../services/statsService";

export default {
  data: new SlashCommandBuilder()
    .setName("top")
    .setDescription("Sunucunun muzik istatistiklerini gosterir.")
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("Liste turu")
        .addChoices({ name: "Sarkilar", value: "tracks" }, { name: "Kullanicilar", value: "users" })
    ),
  async execute(interaction) {
    if (!interaction.guildId) return;
    const type = interaction.options.getString("type") ?? "tracks";
    const rows = type === "users" ? await getTopUsers(interaction.guildId) : await getTopTracks(interaction.guildId);
    if (!rows.length) {
      await interaction.reply({ embeds: [errorEmbed("Henuz istatistik yok.")], ephemeral: true });
      return;
    }

    const description = rows
      .map((row, index) => {
        if (type === "users") return `**${index + 1}.** <@${row._id}> - ${row.plays} dinleme`;
        return `**${index + 1}.** ${row.title} - ${row.plays} dinleme`;
      })
      .join("\n");

    await interaction.reply({ embeds: [baseEmbed().setTitle(type === "users" ? "En Aktif Dinleyiciler" : "En Cok Dinlenenler").setDescription(description)] });
  }
} satisfies Command;
