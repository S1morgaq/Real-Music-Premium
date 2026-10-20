import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../../types/Command";
import { env } from "../../config/env";
import { errorEmbed, successEmbed } from "../../lib/embeds";
import { ensureSameVoice } from "../../music/playerUtils";

export default {
  data: new SlashCommandBuilder()
    .setName("volume")
    .setDescription("Ses seviyesini ayarlar.")
    .addIntegerOption((option) => option.setName("level").setDescription("1-150").setMinValue(1).setMaxValue(env.MAX_VOLUME)),
  async execute(interaction, client) {
    const player = interaction.guildId ? client.kazagumo.players.get(interaction.guildId) : null;
    if (!(await ensureSameVoice(interaction, player))) return;
    if (!player) return void interaction.reply({ embeds: [errorEmbed("Aktif oynatici yok.")], ephemeral: true });
    const level = interaction.options.getInteger("level");
    if (!level) return void interaction.reply({ embeds: [successEmbed(`Ses seviyesi: **${player.volume}%**`)] });
    player.setVolume(level);
    await interaction.reply({ embeds: [successEmbed(`Ses seviyesi **${level}%** yapildi.`)] });
  }
} satisfies Command;
