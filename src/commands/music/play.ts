import { AttachmentBuilder, SlashCommandBuilder } from "discord.js";
import type { Command } from "../../types/Command";
import { errorEmbed } from "../../lib/embeds";
import { normalizeMusicQuery } from "../../lib/sourceUrl";
import { createAddedCard } from "../../music/nowPlayingCard";
import { ensureSameVoice, getOrCreatePlayer, filterMenu, playerControls, playerUtilityControls } from "../../music/playerUtils";
import { addTracksToQueue, startPlayerIfIdle } from "../../music/queueUtils";
import { searchMusic, smartRankTracks } from "../../services/searchService";
import { successEmbed } from "../../lib/embeds";
import { env } from "../../config/env";

export default {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("YouTube, Spotify metadata veya SoundCloud uzerinden muzik calar.")
    .addStringOption((option) =>
      option.setName("query").setDescription("Sarki adi veya URL").setRequired(true).setAutocomplete(true)
    ),
  cooldown: 3,
  async autocomplete(interaction, client) {
    const focused = interaction.options.getFocused();
    if (!focused || focused.length < 3) {
      await interaction.respond([]);
      return;
    }
    const result = await searchMusic(client, focused, interaction.user).catch(() => null);
    const tracks = smartRankTracks(result?.tracks ?? [], focused).slice(0, 10);
    await interaction.respond(
      tracks.map((track: any) => ({
        name: `${sourceBadge(track)} ${track.title}`.slice(0, 100),
        value: track.uri ?? track.title
      }))
    );
  },
  async execute(interaction, client) {
    if (!(await ensureSameVoice(interaction))) return;
    await interaction.deferReply();

    const rawQuery = interaction.options.getString("query", true);
    const query = normalizeMusicQuery(rawQuery);
    const player = await getOrCreatePlayer(interaction, client);
    if (!player) {
      await interaction.editReply({ embeds: [errorEmbed("Oynatici olusturulamadi.")] });
      return;
    }

    const result = await searchMusic(client, query, interaction.user).catch(async () => {
      await interaction.editReply({ embeds: [errorEmbed("Arama zaman asimina ugradi. Biraz sonra tekrar dene.")] });
      return null;
    });
    if (!result) return;
    if (!result.tracks.length) {
      await interaction.editReply({ embeds: [errorEmbed("Sonuc bulunamadi.")] });
      return;
    }

    if (result.type === "PLAYLIST") {
      const queued = addTracksToQueue(player, result.tracks, { maxTracks: env.MAX_PLAYLIST_TRACKS });
      await startPlayerIfIdle(player);
      await interaction.editReply({ embeds: [successEmbed(playlistAddMessage(queued.added, queued.skipped))] });
      return;
    }

    const track = smartRankTracks(result.tracks, query)[0];
    const queued = addTracksToQueue(player, [track]);
    if (!queued.added) {
      try {
        player.queue.add(track);
      } catch {
        await interaction.editReply({ embeds: [errorEmbed("Sarki siraya eklenemedi. Biraz sonra tekrar dene.")] });
        return;
      }
    }

    const card = await createAddedCard({
      title: track.title,
      subtitle: track.author ?? "Siraya eklendi",
      thumbnail: (track as any).thumbnail ?? (track as any).artworkUrl ?? null,
      label: "Siraya eklendi"
    });
    const reply = await interaction.editReply({
      files: [new AttachmentBuilder(card, { name: "track-added.png" })],
      components: [playerControls(), playerUtilityControls(), filterMenu()]
    });
    player.data.set("pendingNowPlayingMessage", reply);
    await startPlayerIfIdle(player);
  }
} satisfies Command;

function sourceBadge(track: any): string {
  const source = String(track.sourceName ?? track.source ?? track.info?.sourceName ?? "").toLowerCase();
  if (source.includes("spotify")) return "[Spotify]";
  if (source.includes("deezer")) return "[Deezer]";
  if (source.includes("soundcloud")) return "[SC]";
  if (source.includes("youtube")) return "[YT]";
  return "[Music]";
}

function playlistAddMessage(added: number, skipped: number): string {
  if (!added) return "Kuyruk dolu oldugu icin playlist eklenemedi.";
  return skipped > 0
    ? `Playlist tek seferde siraya eklendi. **${added}** sarki eklendi, limit nedeniyle **${skipped}** sarki atlandi.`
    : `Playlist tek seferde siraya eklendi. **${added}** sarki.`;
}
