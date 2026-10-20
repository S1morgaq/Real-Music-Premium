import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../../types/Command";
import { applyTimescale } from "../../music/filters";
import { errorEmbed, successEmbed } from "../../lib/embeds";
import { ensureSameVoice } from "../../music/playerUtils";

export default {
  data: new SlashCommandBuilder()
    .setName("speed")
    .setDescription("Oynatma hizini ayarlar.")
    .addNumberOption((option) => option.setName("value").setDescription("0.5 - 2.0").setRequired(true).setMinValue(0.5).setMaxValue(2)),
  async execute(interaction, client) {
    const player = interaction.guildId ? client.kazagumo.players.get(interaction.guildId) : null;
    if (!(await ensureSameVoice(interaction, player))) return;
    if (!player) return void interaction.reply({ embeds: [errorEmbed("Aktif oynatici yok.")], ephemeral: true });
    const value = interaction.options.getNumber("value", true);
    applyTimescale(player, { speed: value, pitch: 1, rate: 1 });
    await interaction.reply({ embeds: [successEmbed(`Hiz **${value}x** yapildi.`)] });
  }
} satisfies Command;
