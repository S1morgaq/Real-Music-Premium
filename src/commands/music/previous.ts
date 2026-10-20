import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../../types/Command";
import { errorEmbed, successEmbed } from "../../lib/embeds";
import { ensureSameVoice } from "../../music/playerUtils";

export default {
  data: new SlashCommandBuilder().setName("previous").setDescription("Onceki sarkiyi yeniden calar."),
  async execute(interaction, client) {
    const player = interaction.guildId ? client.kazagumo.players.get(interaction.guildId) : null;
    if (!(await ensureSameVoice(interaction, player))) return;
    const previous = player?.data.get("previous");
    if (!player || !previous) return void interaction.reply({ embeds: [errorEmbed("Onceki sarki bulunamadi.")], ephemeral: true });
    player.queue.unshift(previous);
    player.skip();
    await interaction.reply({ embeds: [successEmbed("Onceki sarkiya gecildi.")] });
  }
} satisfies Command;
