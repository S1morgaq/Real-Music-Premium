import {
  GuildMember,
  MessageFlags,
  PermissionFlagsBits,
  type ButtonInteraction,
  type ChatInputCommandInteraction,
  type Message,
  type StringSelectMenuInteraction
} from "discord.js";
import { errorEmbed } from "../lib/embeds";
import { getGuildSettings } from "./settingsService";

export const DJ_COMMANDS = new Set([
  "stop",
  "skip",
  "previous",
  "prev",
  "pause",
  "resume",
  "volume",
  "shuffle",
  "clear",
  "loop",
  "seek",
  "remove",
  "bassboost",
  "filter",
  "nightcore",
  "vaporwave",
  "speed",
  "pitch",
  "247",
  "radio",
  "leave",
  "disconnect",
  "dc"
]);

function memberHasDjAccess(member: GuildMember, djRoleId?: string): boolean {
  return (
    member.permissions.has(PermissionFlagsBits.ManageGuild) ||
    member.permissions.has(PermissionFlagsBits.ManageChannels) ||
    Boolean(djRoleId && member.roles.cache.has(djRoleId))
  );
}

export async function canUseDjCommand(message: Message, command: string): Promise<boolean> {
  if (!message.guildId || !DJ_COMMANDS.has(command)) return true;
  if (!(message.member instanceof GuildMember)) return true;

  const settings = await getGuildSettings(message.guildId);
  if (!settings.djRoleId || memberHasDjAccess(message.member, settings.djRoleId)) return true;

  await message.reply({ embeds: [errorEmbed("Bu komut DJ rolu gerektirir.")] });
  return false;
}

export async function canUseDjInteraction(
  interaction: ChatInputCommandInteraction | ButtonInteraction | StringSelectMenuInteraction,
  commandName?: string
): Promise<boolean> {
  if (!interaction.guildId) return true;
  const action = commandName ?? (interaction.isMessageComponent() ? interaction.customId.split(":")[1] : "");
  if (!DJ_COMMANDS.has(action)) return true;
  if (!(interaction.member instanceof GuildMember)) return true;

  const settings = await getGuildSettings(interaction.guildId);
  if (!settings.djRoleId || memberHasDjAccess(interaction.member, settings.djRoleId)) return true;

  await interaction.reply({ embeds: [errorEmbed("Bu kontrol DJ rolu gerektirir.")], flags: MessageFlags.Ephemeral });
  return false;
}
