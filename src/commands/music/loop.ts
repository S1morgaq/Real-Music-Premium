import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../../types/Command";
import { errorEmbed, successEmbed } from "../../lib/embeds";

export default {
  data: new SlashCommandBuilder()
    .setName("loop")
    .setDescription("Loop modunu ayarlar.")
    .addStringOption((option) =>
      option
        .setName("mode")
        .setDescription("Loop modu")
        .setRequired(true)
        .addChoices({ name: "Kapali", value: "none" }, { name: "Sarki", value: "track" }, { name: "Sira", value: "queue" })
    ),
  async execute(interaction, client) {
    const player = interaction.guildId ? client.kazagumo.players.get(interaction.guildId) : null;
    if (!player) return void interaction.reply({ embeds: [errorEmbed("Aktif oynatici yok.")], ephemeral: true });
    const mode = interaction.options.getString("mode", true) as "none" | "track" | "queue";
    player.setLoop(mode === "none" ? "none" : mode);
    await interaction.reply({ embeds: [successEmbed(`Loop modu: **${mode}**`)] });
  }
} satisfies Command;
