import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../../types/Command";
import { applyFilter } from "../../music/filters";
import { errorEmbed, successEmbed } from "../../lib/embeds";
import { ensureSameVoice } from "../../music/playerUtils";

export default {
  data: new SlashCommandBuilder().setName("nightcore").setDescription("Nightcore filtresini uygular."),
  async execute(interaction, client) {
    const player = interaction.guildId ? client.kazagumo.players.get(interaction.guildId) : null;
    if (!(await ensureSameVoice(interaction, player))) return;
    if (!player) return void interaction.reply({ embeds: [errorEmbed("Aktif oynatici yok.")], ephemeral: true });
    applyFilter(player, "nightcore");
    await interaction.reply({ embeds: [successEmbed("Nightcore aktif.")] });
  }
} satisfies Command;
