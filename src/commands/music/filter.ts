import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../../types/Command";
import { applyFilter, type FilterName } from "../../music/filters";
import { errorEmbed, successEmbed } from "../../lib/embeds";
import { ensureSameVoice } from "../../music/playerUtils";

export default {
  data: new SlashCommandBuilder()
    .setName("filter")
    .setDescription("Ses filtresi uygular.")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("Filtre")
        .setRequired(true)
        .addChoices(
          { name: "Temizle", value: "clear" },
          { name: "Karaoke", value: "karaoke" },
          { name: "Tremolo", value: "tremolo" },
          { name: "Vibrato", value: "vibrato" },
          { name: "Nightcore", value: "nightcore" },
          { name: "Vaporwave", value: "vaporwave" },
          { name: "Bassboost", value: "bassboost" }
        )
    ),
  async execute(interaction, client) {
    const player = interaction.guildId ? client.kazagumo.players.get(interaction.guildId) : null;
    if (!(await ensureSameVoice(interaction, player))) return;
    if (!player) return void interaction.reply({ embeds: [errorEmbed("Aktif oynatici yok.")], ephemeral: true });
    const name = interaction.options.getString("name", true) as FilterName;
    applyFilter(player, name);
    await interaction.reply({ embeds: [successEmbed(`Filtre uygulandi: **${name}**`)] });
  }
} satisfies Command;
