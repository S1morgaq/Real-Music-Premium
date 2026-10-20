import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../../types/Command";
import { errorEmbed, successEmbed } from "../../lib/embeds";
import { setGuildSetting } from "../../services/settingsService";
import { ensureSameVoice } from "../../music/playerUtils";

export default {
  data: new SlashCommandBuilder()
    .setName("autoplay")
    .setDescription("Otomatik benzer sarki oynatmayi acar/kapatir.")
    .addBooleanOption((option) => option.setName("enabled").setDescription("Durum").setRequired(true)),
  async execute(interaction, client) {
    if (!interaction.guildId) return;
    const player = client.kazagumo.players.get(interaction.guildId);
    if (!(await ensureSameVoice(interaction, player))) return;
    if (!player) return void interaction.reply({ embeds: [errorEmbed("Aktif oynatici yok.")], ephemeral: true });
    const enabled = interaction.options.getBoolean("enabled", true);
    player.data.set("autoplay", enabled);
    await setGuildSetting(interaction.guildId, { autoplay: enabled });
    await interaction.reply({ embeds: [successEmbed(`Autoplay **${enabled ? "acildi" : "kapatildi"}**.`)] });
  }
} satisfies Command;
