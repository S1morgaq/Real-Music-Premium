import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../../types/Command";
import { errorEmbed, successEmbed } from "../../lib/embeds";
import { ensureSameVoice } from "../../music/playerUtils";

export default {
  data: new SlashCommandBuilder().setName("clear").setDescription("Siradaki bekleyen sarkilari temizler."),
  async execute(interaction, client) {
    const player = interaction.guildId ? client.kazagumo.players.get(interaction.guildId) : null;
    if (!(await ensureSameVoice(interaction, player))) return;
    if (!player) return void interaction.reply({ embeds: [errorEmbed("Aktif oynatici yok.")], ephemeral: true });
    if (!player.queue.length) return void interaction.reply({ embeds: [errorEmbed("Temizlenecek sarki yok.")], ephemeral: true });

    const removed = player.queue.length;
    player.queue.clear();
    await interaction.reply({ embeds: [successEmbed(`Sira temizlendi. **${removed}** sarki kaldirildi.`)] });
  }
} satisfies Command;
