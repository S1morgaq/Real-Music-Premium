import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../../types/Command";
import { errorEmbed, successEmbed } from "../../lib/embeds";
import { ensureSameVoice } from "../../music/playerUtils";

export default {
  data: new SlashCommandBuilder()
    .setName("remove")
    .setDescription("Siradan sarki kaldirir.")
    .addIntegerOption((option) => option.setName("position").setDescription("Sira numarasi").setRequired(true).setMinValue(1)),
  async execute(interaction, client) {
    const player = interaction.guildId ? client.kazagumo.players.get(interaction.guildId) : null;
    if (!(await ensureSameVoice(interaction, player))) return;
    const position = interaction.options.getInteger("position", true) - 1;
    if (!player || position < 0 || position >= player.queue.length) {
      return void interaction.reply({ embeds: [errorEmbed("Gecerli bir sira numarasi gir.")], ephemeral: true });
    }
    const [removed] = player.queue.splice(position, 1);
    await interaction.reply({ embeds: [successEmbed(`Kaldirildi: **${removed.title}**`)] });
  }
} satisfies Command;
