import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  GuildMember,
  MessageFlags,
  StringSelectMenuInteraction,
  StringSelectMenuBuilder
} from "discord.js";
import { env } from "../config/env";
import { errorEmbed } from "../lib/embeds";
import { getGuildSettings } from "../services/settingsService";

type MusicInteraction = ChatInputCommandInteraction | StringSelectMenuInteraction;

export function getVoiceChannel(interaction: MusicInteraction) {
  const member = interaction.member;
  if (!(member instanceof GuildMember)) return null;
  return member.voice.channel;
}

export async function ensureSameVoice(interaction: MusicInteraction, player?: any): Promise<boolean> {
  const channel = getVoiceChannel(interaction);
  if (!channel) {
    await interaction.reply({ embeds: [errorEmbed("Bir ses kanalina katilmalisin.")], flags: MessageFlags.Ephemeral });
    return false;
  }
  if (player?.voiceId && player.voiceId !== channel.id) {
    await interaction.reply({ embeds: [errorEmbed("Bu komut icin botla ayni ses kanalinda olmalisin.")], flags: MessageFlags.Ephemeral });
    return false;
  }
  return true;
}

export async function getOrCreatePlayer(interaction: MusicInteraction, client: any) {
  const voice = getVoiceChannel(interaction);
  if (!voice || !interaction.guildId || !interaction.channelId) return null;

  const existing = client.kazagumo.players.get(interaction.guildId);
  if (existing) {
    existing.textId = interaction.channelId;
    return existing;
  }

  const settings = await getGuildSettings(interaction.guildId);
  const player = await client.kazagumo.createPlayer({
    guildId: interaction.guildId,
    textId: interaction.channelId,
    voiceId: voice.id,
    volume: settings.defaultVolume ?? env.DEFAULT_VOLUME,
    deaf: true
  });
  player.data.set("twentyFourSeven", settings.twentyFourSeven);
  player.data.set("autoplay", settings.autoplay);
  return player;
}

export function playerControls(disabled = false) {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId("music:previous").setStyle(ButtonStyle.Secondary).setLabel("Prev").setDisabled(disabled),
    new ButtonBuilder().setCustomId("music:pause").setStyle(ButtonStyle.Primary).setLabel("Pause").setDisabled(disabled),
    new ButtonBuilder().setCustomId("music:skip").setStyle(ButtonStyle.Primary).setLabel("Skip").setDisabled(disabled),
    new ButtonBuilder().setCustomId("music:replay").setStyle(ButtonStyle.Secondary).setLabel("Replay").setDisabled(disabled),
    new ButtonBuilder().setCustomId("music:stop").setStyle(ButtonStyle.Danger).setLabel("Durdur").setDisabled(disabled)
  );
}

export function playerUtilityControls(disabled = false) {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId("music:queue").setStyle(ButtonStyle.Secondary).setLabel("Queue").setDisabled(disabled),
    new ButtonBuilder().setCustomId("music:shuffle").setStyle(ButtonStyle.Secondary).setLabel("Shuffle").setDisabled(disabled),
    new ButtonBuilder().setCustomId("music:lyrics").setStyle(ButtonStyle.Success).setLabel("Lyrics").setDisabled(disabled)
  );
}

export function filterMenu() {
  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("music:filter")
      .setPlaceholder("Filtre sec")
      .addOptions(
        { label: "Temizle", value: "clear" },
        { label: "Bassboost", value: "bassboost" },
        { label: "Nightcore", value: "nightcore" },
        { label: "Vaporwave", value: "vaporwave" },
        { label: "Karaoke", value: "karaoke" },
        { label: "Tremolo", value: "tremolo" },
        { label: "Vibrato", value: "vibrato" }
      )
  );
}
