import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../../types/Command";
import { errorEmbed, successEmbed } from "../../lib/embeds";
import { ensureSameVoice } from "../../music/playerUtils";

export default {
  data: new SlashCommandBuilder().setName("replay").setDescription("Calan sarkiyi bastan baslatir."),
  async execute(interaction, client) {
    const player = interaction.guildId ? client.kazagumo.players.get(interaction.guildId) : null;
    if (!(await ensureSameVoice(interaction, player))) return;
    if (!player?.queue.current) return void interaction.reply({ embeds: [errorEmbed("Calan sarki yok.")], ephemeral: true });
    player.seek(0);
    await interaction.reply({ embeds: [successEmbed("Sarki bastan baslatildi.")] });
  }
} satisfies Command;
