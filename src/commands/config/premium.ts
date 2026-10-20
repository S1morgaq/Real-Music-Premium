import { SlashCommandBuilder } from "discord.js";
import ms from "ms";
import type { Command } from "../../types/Command";
import { ownerIds } from "../../config/env";
import { Premium } from "../../database/models/Premium";
import { baseEmbed, errorEmbed, successEmbed } from "../../lib/embeds";
import { redeemPremiumCode } from "../../services/premiumCodeService";

export default {
  data: new SlashCommandBuilder()
    .setName("premium")
    .setDescription("Premium yonetimi.")
    .addSubcommand((sub) => sub.setName("info").setDescription("Premium fiyatlarini gosterir"))
    .addSubcommand((sub) =>
      sub
        .setName("redeem")
        .setDescription("Premium kodu kullanir")
        .addStringOption((o) => o.setName("code").setDescription("Premium kodu").setRequired(true))
    )
    .addSubcommand((sub) =>
      sub
        .setName("grant")
        .setDescription("Premium verir")
        .addStringOption((o) => o.setName("target").setDescription("User veya guild id").setRequired(true))
        .addStringOption((o) => o.setName("type").setDescription("Tip").setRequired(true).addChoices({ name: "User", value: "user" }, { name: "Guild", value: "guild" }))
        .addStringOption((o) => o.setName("duration").setDescription("30d, 12h; bos olursa suresiz"))
    )
    .addSubcommand((sub) => sub.setName("revoke").setDescription("Premium kaldirir").addStringOption((o) => o.setName("target").setDescription("Id").setRequired(true))),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    if (subcommand === "info") {
      await interaction.reply({
        embeds: [
          baseEmbed()
            .setTitle("Premium")
            .setDescription("Kesintisiz muzik ve reklamsiz deneyim icin premium satin alabilirsin.")
            .addFields(
              { name: "30 Gunluk", value: "84 TL", inline: true },
              { name: "Infinity", value: "Suresiz premium", inline: true }
            )
        ],
        ephemeral: true
      });
      return;
    }

    if (subcommand === "redeem") {
      const code = interaction.options.getString("code", true);
      const status = await redeemPremiumCode(code, interaction.user.id, interaction.guildId);
      if (status === "invalid") {
        await interaction.reply({ embeds: [errorEmbed("Premium kodu gecersiz.")], ephemeral: true });
        return;
      }
      if (status === "used") {
        await interaction.reply({ embeds: [errorEmbed("Bu premium kodu daha once kullanilmis.")], ephemeral: true });
        return;
      }
      await interaction.reply({ embeds: [successEmbed("Premium kodu kullanildi. Artik reklamsiz dinleyebilirsin.")], ephemeral: true });
      return;
    }

    if (!ownerIds.includes(interaction.user.id)) {
      await interaction.reply({ embeds: [errorEmbed("Bu komut sadece bot sahibine aciktir.")], ephemeral: true });
      return;
    }

    const targetId = interaction.options.getString("target", true);
    if (subcommand === "revoke") {
      await Premium.deleteMany({ targetId });
      await interaction.reply({ embeds: [successEmbed("Premium kaldirildi.")] });
      return;
    }
    const type = interaction.options.getString("type", true) as "user" | "guild";
    const duration = interaction.options.getString("duration");
    const expiresAt = duration ? new Date(Date.now() + ms(duration)) : undefined;
    await Premium.findOneAndUpdate({ targetId, type }, { targetId, type, expiresAt }, { upsert: true });
    await interaction.reply({ embeds: [successEmbed("Premium tanimlandi.")] });
  }
} satisfies Command;
