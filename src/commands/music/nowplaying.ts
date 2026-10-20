import { AttachmentBuilder, MessageFlags, SlashCommandBuilder } from "discord.js";
import type { Command } from "../../types/Command";
import { baseEmbed, errorEmbed } from "../../lib/embeds";
import { createNowPlayingCard } from "../../music/nowPlayingCard";
import { filterMenu, playerControls, playerUtilityControls } from "../../music/playerUtils";

export default {
  data: new SlashCommandBuilder().setName("nowplaying").setDescription("Calan sarkiyi progress bar ve kartla gosterir."),
  async execute(interaction, client) {
    const player = interaction.guildId ? client.kazagumo.players.get(interaction.guildId) : null;
    const track = player?.queue.current;
    if (!player || !track) return void interaction.reply({ embeds: [errorEmbed("Su anda muzik calmiyor.")], flags: MessageFlags.Ephemeral });
    await interaction.deferReply();
    const position = Number(player.position ?? 0);
    const upcoming = Array.from(player.queue ?? []).slice(0, 4);
    const card = await createNowPlayingCard(track, position, upcoming);
    const attachment = new AttachmentBuilder(card, { name: "now-playing.png" });
    await interaction.editReply({
      embeds: [
        baseEmbed()
          .setTitle("Simdi caliyor")
          .setImage("attachment://now-playing.png")
      ],
      files: [attachment],
      components: [playerControls(), playerUtilityControls(), filterMenu()]
    });
  }
} satisfies Command;
