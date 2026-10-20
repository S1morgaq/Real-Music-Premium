import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../../types/Command";
import { errorEmbed, successEmbed } from "../../lib/embeds";
import { getOrCreatePlayer, getVoiceChannel } from "../../music/playerUtils";

export default {
  data: new SlashCommandBuilder().setName("join").setDescription("Ses kanalina katilir."),
  async execute(interaction, client) {
    if (!getVoiceChannel(interaction)) return void interaction.reply({ embeds: [errorEmbed("Bir ses kanalina katilmalisin.")], ephemeral: true });
    await getOrCreatePlayer(interaction, client);
    await interaction.reply({ embeds: [successEmbed("Ses kanalina katildim.")] });
  }
} satisfies Command;
