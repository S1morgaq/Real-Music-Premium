import { AttachmentBuilder, SlashCommandBuilder } from "discord.js";
import type { Command } from "../../types/Command";
import { env } from "../../config/env";
import { errorEmbed } from "../../lib/embeds";
import { createQueueCard } from "../../music/nowPlayingCard";
import { filterMenu, playerControls, playerUtilityControls } from "../../music/playerUtils";

export default {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Dinamik sira ekranini gosterir.")
    .addIntegerOption((option) => option.setName("page").setDescription("Sayfa").setMinValue(1)),
  async execute(interaction, client) {
    const player = interaction.guildId ? client.kazagumo.players.get(interaction.guildId) : null;
    if (!player) return void interaction.reply({ embeds: [errorEmbed("Aktif oynatici yok.")], ephemeral: true });
    const page = interaction.options.getInteger("page") ?? 1;
    const tracks = Array.from(player.queue ?? []) as any[];
    const size = env.QUEUE_PAGE_SIZE;
    const pages = Math.max(1, Math.ceil(tracks.length / size));
    const start = (Math.min(page, pages) - 1) * size;
    const current = player.queue.current;
    const pageTracks = tracks.slice(start, start + size);
    const card = await createQueueCard(current, pageTracks, page, pages);
    await interaction.reply({
      files: [new AttachmentBuilder(card, { name: "queue.png" })],
      components: [playerControls(), playerUtilityControls(), filterMenu()]
    });
  }
} satisfies Command;
