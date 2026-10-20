import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../../types/Command";
import { Playlist } from "../../database/models/Playlist";
import { baseEmbed, errorEmbed, successEmbed } from "../../lib/embeds";
import { addTracksToQueue, startPlayerIfIdle } from "../../music/queueUtils";
import { env } from "../../config/env";

export default {
  data: new SlashCommandBuilder()
    .setName("playlist")
    .setDescription("Kisisel playlist sistemi.")
    .addSubcommand((sub) => sub.setName("create").setDescription("Playlist olusturur").addStringOption((o) => o.setName("name").setDescription("Ad").setRequired(true)))
    .addSubcommand((sub) => sub.setName("add-current").setDescription("Calan sarkiyi ekler").addStringOption((o) => o.setName("name").setDescription("Ad").setRequired(true)))
    .addSubcommand((sub) => sub.setName("list").setDescription("Playlistlerini listeler"))
    .addSubcommand((sub) => sub.setName("load").setDescription("Playlisti siraya ekler").addStringOption((o) => o.setName("name").setDescription("Ad").setRequired(true))),
  async execute(interaction, client) {
    const sub = interaction.options.getSubcommand();
    const name = interaction.options.getString("name")?.toLowerCase();

    if (sub === "create" && name) {
      await Playlist.create({ userId: interaction.user.id, name, tracks: [] });
      await interaction.reply({ embeds: [successEmbed(`Playlist olusturuldu: **${name}**`)] });
      return;
    }

    if (sub === "list") {
      const lists = await Playlist.find({ userId: interaction.user.id }).lean();
      await interaction.reply({ embeds: [baseEmbed().setTitle("Playlistlerin").setDescription(lists.map((p) => `**${p.name}** - ${p.tracks.length} sarki`).join("\n") || "Playlist yok.")] });
      return;
    }

    const playlist = name ? await Playlist.findOne({ userId: interaction.user.id, name }) : null;
    if (!playlist) return void interaction.reply({ embeds: [errorEmbed("Playlist bulunamadi.")], ephemeral: true });

    if (sub === "add-current") {
      const player = interaction.guildId ? client.kazagumo.players.get(interaction.guildId) : null;
      const track = player?.queue.current;
      if (!track) return void interaction.reply({ embeds: [errorEmbed("Calan sarki yok.")], ephemeral: true });
      playlist.tracks.push({ title: track.title, uri: track.uri ?? track.realUri ?? track.title, author: track.author, length: track.length, thumbnail: track.thumbnail });
      await playlist.save();
      await interaction.reply({ embeds: [successEmbed(`**${track.title}** playlist'e eklendi.`)] });
      return;
    }

    if (sub === "load") {
      const player = interaction.guildId ? client.kazagumo.players.get(interaction.guildId) : null;
      if (!player) return void interaction.reply({ embeds: [errorEmbed("Once /play veya /join kullanarak oynatici olustur.")], ephemeral: true });
      await interaction.deferReply();
      const tracks = [];
      for (const saved of playlist.tracks) {
        const result = await client.kazagumo.search(saved.uri, { requester: interaction.user }).catch(() => null);
        if (result?.tracks[0]) tracks.push(result.tracks[0]);
      }
      const queued = addTracksToQueue(player, tracks, { maxTracks: env.MAX_PLAYLIST_TRACKS });
      await startPlayerIfIdle(player);
      await interaction.editReply({ embeds: [successEmbed(playlistAddMessage(queued.added, queued.skipped))] });
    }
  }
} satisfies Command;

function playlistAddMessage(added: number, skipped: number): string {
  if (!added) return "Kuyruk dolu oldugu icin playlist eklenemedi.";
  return skipped > 0
    ? `Playlist tek seferde siraya eklendi. **${added}** sarki eklendi, limit nedeniyle **${skipped}** sarki atlandi.`
    : `Playlist tek seferde siraya eklendi. **${added}** sarki.`;
}
