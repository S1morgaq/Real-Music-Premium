import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../../types/Command";
import { errorEmbed, successEmbed } from "../../lib/embeds";

export default {
  data: new SlashCommandBuilder().setName("leave").setDescription("Ses kanalindan ayrilir."),
  async execute(interaction, client) {
    const player = interaction.guildId ? client.kazagumo.players.get(interaction.guildId) : null;
    if (!player) return void interaction.reply({ embeds: [errorEmbed("Aktif oynatici yok.")], ephemeral: true });
    player.queue.clear();
    player.destroy();
    await interaction.reply({ embeds: [successEmbed("Ses kanalindan ayrildim.")] });
  }
} satisfies Command;
