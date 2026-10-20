import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../../types/Command";
import { errorEmbed, successEmbed } from "../../lib/embeds";
import { ensureSameVoice } from "../../music/playerUtils";

export default {
  data: new SlashCommandBuilder().setName("shuffle").setDescription("Sirayi karistirir."),
  async execute(interaction, client) {
    const player = interaction.guildId ? client.kazagumo.players.get(interaction.guildId) : null;
    if (!(await ensureSameVoice(interaction, player))) return;
    if (!player || !player.queue.length) return void interaction.reply({ embeds: [errorEmbed("Karistirilacak sarki yok.")], ephemeral: true });
    player.queue.shuffle();
    await interaction.reply({ embeds: [successEmbed("Sira karistirildi.")] });
  }
} satisfies Command;
