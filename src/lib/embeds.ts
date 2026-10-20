import { EmbedBuilder, type ColorResolvable } from "discord.js";

export const premiumColors = {
  base: 0x111827 as ColorResolvable,
  success: 0x22c55e as ColorResolvable,
  error: 0xf43f5e as ColorResolvable,
  accent: 0x38bdf8 as ColorResolvable,
  neon: 0xa855f7 as ColorResolvable
};

export function baseEmbed() {
  return new EmbedBuilder()
    .setColor(premiumColors.accent)
    .setTimestamp()
    .setFooter({ text: "Ardmetra Music | premium player" });
}

export function successEmbed(description: string) {
  return baseEmbed().setColor(premiumColors.success).setDescription(description);
}

export function errorEmbed(description: string) {
  return new EmbedBuilder()
    .setColor(premiumColors.error)
    .setDescription(description)
    .setFooter({ text: "Ardmetra Music | control center" });
}
