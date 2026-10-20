import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../../types/Command";
import { applyFilter } from "../../music/filters";
import { errorEmbed, successEmbed } from "../../lib/embeds";
import { ensureSameVoice } from "../../music/playerUtils";

export default {
  data: new SlashCommandBuilder()
    .setName("bassboost")
    .setDescription("Bassboost filtresini ayarlar.")
    .addIntegerOption((option) => option.setName("level").setDescription("1-5").setMinValue(1).setMaxValue(5)),
  async execute(interaction, client) {
    const player = interaction.guildId ? client.kazagumo.players.get(interaction.guildId) : null;
    if (!(await ensureSameVoice(interaction, player))) return;
    if (!player) return void interaction.reply({ embeds: [errorEmbed("Aktif oynatici yok.")], ephemeral: true });
    applyFilter(player, "bassboost", interaction.options.getInteger("level") ?? 2);
    await interaction.reply({ embeds: [successEmbed("Bassboost uygulandi.")] });
  }
} satisfies Command;
