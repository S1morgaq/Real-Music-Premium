import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import type { Command } from "../../types/Command";
import { successEmbed } from "../../lib/embeds";
import { setGuildSetting } from "../../services/settingsService";

export default {
  data: new SlashCommandBuilder()
    .setName("settings")
    .setDescription("Sunucu muzik ayarlarini duzenler.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addIntegerOption((option) => option.setName("default-volume").setDescription("Varsayilan ses").setMinValue(1).setMaxValue(150))
    .addRoleOption((option) => option.setName("dj-role").setDescription("DJ rolu"))
    .addStringOption((option) =>
      option
        .setName("language")
        .setDescription("Bot cevap dili")
        .addChoices({ name: "Turkce", value: "tr" }, { name: "English", value: "en" })
    ),
  async execute(interaction) {
    if (!interaction.guildId) return;
    const patch: Record<string, unknown> = {};
    const volume = interaction.options.getInteger("default-volume");
    const role = interaction.options.getRole("dj-role");
    const language = interaction.options.getString("language");
    if (volume) patch.defaultVolume = volume;
    if (role) patch.djRoleId = role.id;
    if (language) patch.language = language;
    await setGuildSetting(interaction.guildId, patch);
    await interaction.reply({ embeds: [successEmbed("Ayarlar guncellendi.")] });
  }
} satisfies Command;
