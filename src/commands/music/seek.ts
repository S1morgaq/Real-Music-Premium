import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../../types/Command";
import { errorEmbed, successEmbed } from "../../lib/embeds";
import { parseTime } from "../../lib/time";
import { ensureSameVoice } from "../../music/playerUtils";

export default {
  data: new SlashCommandBuilder()
    .setName("seek")
    .setDescription("Sarkida belirtilen zamana gider.")
    .addStringOption((option) => option.setName("time").setDescription("90, 1m30s veya 1h2m").setRequired(true)),
  async execute(interaction, client) {
    const player = interaction.guildId ? client.kazagumo.players.get(interaction.guildId) : null;
    if (!(await ensureSameVoice(interaction, player))) return;
    const ms = parseTime(interaction.options.getString("time", true));
    if (!player || !ms) return void interaction.reply({ embeds: [errorEmbed("Gecerli bir zaman gir.")], ephemeral: true });
    player.seek(ms);
    await interaction.reply({ embeds: [successEmbed("Sarki konumu guncellendi.")] });
  }
} satisfies Command;
