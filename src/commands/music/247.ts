import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../../types/Command";
import { errorEmbed, successEmbed } from "../../lib/embeds";
import { getVoiceChannel } from "../../music/playerUtils";
import { setGuildSetting } from "../../services/settingsService";

export default {
  data: new SlashCommandBuilder()
    .setName("247")
    .setDescription("24/7 ses kanalinda kalma modunu acar/kapatir.")
    .addBooleanOption((option) => option.setName("enabled").setDescription("Durum").setRequired(true)),
  premium: true,
  async execute(interaction, client) {
    if (!interaction.guildId || !interaction.channelId) return;
    const voice = getVoiceChannel(interaction);
    if (!voice) return void interaction.reply({ embeds: [errorEmbed("Bir ses kanalina katilmalisin.")], ephemeral: true });
    const enabled = interaction.options.getBoolean("enabled", true);
    const player = client.kazagumo.players.get(interaction.guildId);
    player?.data.set("twentyFourSeven", enabled);
    await setGuildSetting(interaction.guildId, {
      twentyFourSeven: enabled,
      voiceChannelId: enabled ? voice.id : undefined,
      textChannelId: enabled ? interaction.channelId : undefined
    });
    await interaction.reply({ embeds: [successEmbed(`24/7 modu **${enabled ? "acildi" : "kapatildi"}**.`)] });
  }
} satisfies Command;
