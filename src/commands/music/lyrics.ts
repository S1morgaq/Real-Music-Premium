import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../../types/Command";
import { baseEmbed, errorEmbed } from "../../lib/embeds";
import { findLyrics } from "../../services/lyricsService";

export default {
  data: new SlashCommandBuilder()
    .setName("lyrics")
    .setDescription("Sarki sozlerini gosterir.")
    .addStringOption((option) => option.setName("query").setDescription("Bos birakilirsa calan sarki kullanilir.")),
  cooldown: 8,
  async execute(interaction, client) {
    await interaction.deferReply();
    const player = interaction.guildId ? client.kazagumo.players.get(interaction.guildId) : null;
    const current = player?.queue.current;
    const query = interaction.options.getString("query") ?? current?.title;
    if (!query) return void interaction.editReply({ embeds: [errorEmbed("Aranacak sarki bulunamadi.")] });
    const result = await findLyrics(query, current ?? undefined);
    if (!result) return void interaction.editReply({ embeds: [errorEmbed("Sarki sozu bulunamadi.")] });
    await interaction.editReply({
      embeds: [baseEmbed().setTitle(`Lyrics: ${result.title}`).setFooter({ text: result.source }).setDescription(result.lyrics.slice(0, 3900))]
    });
  }
} satisfies Command;
