import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../../types/Command";
import { errorEmbed, successEmbed } from "../../lib/embeds";
import { ensureSameVoice } from "../../music/playerUtils";
import { playerHasLiveRadio } from "../../services/radioService";

export default {
  data: new SlashCommandBuilder().setName("skip").setDescription("Siradaki sarkiya gecer."),
  async execute(interaction, client) {
    const player = interaction.guildId ? client.kazagumo.players.get(interaction.guildId) : null;
    if (!(await ensureSameVoice(interaction, player))) return;
    if (!player) return void interaction.reply({ embeds: [errorEmbed("Aktif oynatici yok.")], ephemeral: true });
    if (playerHasLiveRadio(player) && !player.queue.length) {
      player.queue.clear();
      player.destroy();
      await interaction.reply({ embeds: [successEmbed("Canli radyo durduruldu. Yeni yayin secerek tekrar baslatabilirsin.")] });
      return;
    }
    player.skip();
    await interaction.reply({ embeds: [successEmbed("Siradaki sarkiya gecildi.")] });
  }
} satisfies Command;
