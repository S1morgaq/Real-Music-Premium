import {
  AttachmentBuilder,
  Collection,
  Interaction,
  MessageFlags,
  type ButtonInteraction,
  type StringSelectMenuInteraction
} from "discord.js";
import type { MusicClient } from "../../client/MusicClient";
import { baseEmbed, errorEmbed, successEmbed } from "../../lib/embeds";
import { formatDuration } from "../../lib/time";
import { hasPremium } from "../../services/premiumService";
import { applyFilter, type FilterName } from "../../music/filters";
import { createQueueCard, createRadioCard } from "../../music/nowPlayingCard";
import { ensureSameVoice, filterMenu, getOrCreatePlayer, playerControls, playerUtilityControls } from "../../music/playerUtils";
import { canUseDjInteraction } from "../../services/djService";
import { findLyrics } from "../../services/lyricsService";
import { getRadioStation, playerHasLiveRadio, startLiveRadioStation } from "../../services/radioService";

export default {
  name: "interactionCreate",
  async execute(interaction: Interaction, client: MusicClient) {
    try {
      if (interaction.isAutocomplete()) {
        const command = client.commands.get(interaction.commandName);
        if (command?.autocomplete) await command.autocomplete(interaction, client);
        return;
      }

      if (interaction.isButton()) {
        if (!(await canUseDjInteraction(interaction))) return;
        await handleButton(interaction, client);
        return;
      }

      if (interaction.isStringSelectMenu()) {
        if (!(await canUseDjInteraction(interaction, interaction.customId.startsWith("radio:") ? "radio" : "filter"))) return;
        await handleSelect(interaction, client);
        return;
      }

      if (!interaction.isChatInputCommand()) return;
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      if (!(await canUseDjInteraction(interaction, interaction.commandName))) return;

      if (command.premium && !(await hasPremium(interaction))) {
        await interaction.reply({ embeds: [errorEmbed("Bu komut premium uyelik gerektirir.")], flags: MessageFlags.Ephemeral });
        return;
      }

      const now = Date.now();
      const bucket = client.cooldowns.ensure(command.data.name, () => new Collection<string, number>());
      const cooldown = command.cooldown ?? 3;
      const cooldownKey = `${interaction.guildId ?? "dm"}:${interaction.user.id}`;
      const expires = bucket.get(cooldownKey) ?? 0;
      if (expires > now) {
        await interaction.reply({
          embeds: [errorEmbed(`Lutfen ${Math.ceil((expires - now) / 1000)} saniye bekle.`)],
          flags: MessageFlags.Ephemeral
        });
        return;
      }

      bucket.set(cooldownKey, now + cooldown * 1000);
      setTimeout(() => bucket.delete(cooldownKey), cooldown * 1000).unref();

      await command.execute(interaction, client);
    } catch (error) {
      const embeds = [errorEmbed("Komut calistirilirken beklenmeyen bir hata olustu.")];
      if (interaction.isRepliable()) {
        if (interaction.deferred || interaction.replied) await interaction.editReply({ embeds }).catch(() => null);
        else await interaction.reply({ embeds, flags: MessageFlags.Ephemeral }).catch(() => null);
      }
      client.emit("error", error as Error);
    }
  }
};

async function handleButton(interaction: ButtonInteraction, client: MusicClient): Promise<void> {
  if (!interaction.guildId || !interaction.customId.startsWith("music:")) return;
  const player = client.kazagumo.players.get(interaction.guildId);
  if (!player) {
    await interaction.reply({ embeds: [errorEmbed("Aktif oynatici yok.")], flags: MessageFlags.Ephemeral });
    return;
  }

  const action = interaction.customId.split(":")[1];
  if (action === "pause") player.paused ? player.pause(false) : player.pause(true);
  if (action === "skip") {
    if (playerHasLiveRadio(player) && !player.queue.length) {
      player.queue.clear();
      player.destroy();
      await interaction.reply({
        embeds: [successEmbed("Canli radyo durduruldu. Yeni yayin secerek tekrar baslatabilirsin.")],
        flags: MessageFlags.Ephemeral
      });
      return;
    }
    player.skip();
  }
  if (action === "replay") player.seek(0);
  if (action === "shuffle") player.queue.shuffle();
  if (action === "queue") {
    const tracks = Array.from(player.queue ?? []) as any[];
    const card = await createQueueCard(player.queue.current, tracks.slice(0, 10), 1, Math.max(1, Math.ceil(tracks.length / 10)));
    await interaction.reply({
      files: [new AttachmentBuilder(card, { name: "queue.png" })],
      components: [playerControls(), playerUtilityControls(), filterMenu()],
      flags: MessageFlags.Ephemeral
    });
    return;
  }
  if (action === "lyrics") {
    const current = player.queue.current;
    const title = current?.title;
    if (!title) {
      await interaction.reply({ embeds: [errorEmbed("Calan sarki yok.")], flags: MessageFlags.Ephemeral });
      return;
    }
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const lyrics = await findLyrics(title, current);
    await interaction.editReply({
      embeds: [
        lyrics
          ? baseEmbed().setTitle(`Lyrics: ${lyrics.title}`).setFooter({ text: lyrics.source }).setDescription(lyrics.lyrics.slice(0, 3900))
          : errorEmbed("Sarki sozu bulunamadi.")
      ]
    });
    return;
  }
  if (action === "previous") {
    const previous = player.data.get("previous");
    if (previous) player.queue.unshift(previous);
    player.skip();
  }
  if (action === "stop") {
    player.queue.clear();
    player.destroy();
  }

  await interaction.reply({
    embeds: [successEmbed("Kontrol uygulandi.")],
    flags: MessageFlags.Ephemeral
  });
}

async function handleSelect(interaction: StringSelectMenuInteraction, client: MusicClient): Promise<void> {
  if (!interaction.guildId) return;
  if (interaction.customId.startsWith("radio:select")) {
    const station = getRadioStation(interaction.values[0]);
    if (!station) {
      await interaction.reply({ embeds: [errorEmbed("Radyo istasyonu bulunamadi.")], flags: MessageFlags.Ephemeral });
      return;
    }
    if (!(await ensureSameVoice(interaction))) return;
    await interaction.deferReply();
    const player = await getOrCreatePlayer(interaction, client);
    if (!player) {
      await interaction.editReply({ embeds: [errorEmbed("Oynatici olusturulamadi.")] });
      return;
    }
    const track = await startLiveRadioStation(client, player, station, interaction.user);
    if (!track) {
      await interaction.editReply({ embeds: [errorEmbed("Radyo yayini acilamadi. Stream su anda cevap vermiyor olabilir.")] });
      return;
    }
    const card = await createRadioCard(station, interaction.guild?.name);
    await interaction.editReply({
      embeds: [successEmbed(`**${station.name}** canli yayini baslatildi.`)],
      files: [new AttachmentBuilder(card, { name: "live-radio.png" })],
      components: [playerControls(), playerUtilityControls(), filterMenu()]
    });
    return;
  }

  if (interaction.customId !== "music:filter") return;
  const player = client.kazagumo.players.get(interaction.guildId);
  if (!player) {
    await interaction.reply({ embeds: [errorEmbed("Aktif oynatici yok.")], flags: MessageFlags.Ephemeral });
    return;
  }
  applyFilter(player, interaction.values[0] as FilterName);
  await interaction.reply({ embeds: [successEmbed("Filtre uygulandi.")], flags: MessageFlags.Ephemeral });
}
