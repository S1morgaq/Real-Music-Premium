import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../../types/Command";
import { env } from "../../config/env";
import { baseEmbed } from "../../lib/embeds";

export default {
  data: new SlashCommandBuilder().setName("help").setDescription("Komut listesini gosterir."),
  async execute(interaction) {
    await interaction.reply({
      embeds: [
        baseEmbed()
          .setTitle("Muzik Bot Yardim")
          .setDescription(`Prefix: \`${env.BOT_PREFIX}\`\nOrnek: \`${env.BOT_PREFIX}play sarki adi\``)
          .addFields(
            {
              name: "Temel",
              value: "`play`, `pause`, `resume`, `skip`, `previous`, `stop`, `join`, `leave`"
            },
            {
              name: "Sira",
              value: "`queue`, `nowplaying`, `shuffle`, `clear`, `loop`, `seek`, `remove`, `replay`, `volume`"
            },
            {
              name: "Kalite",
              value: "`bassboost`, `filter`, `nightcore`, `vaporwave`, `speed`, `pitch`, `lyrics`"
            },
            {
              name: "Sistem",
              value: "`playlist`, `autoplay`, `247`, `radio`, `top`, `stats`, `settings`, `premium`"
            }
          )
      ],
      ephemeral: true
    });
  }
} satisfies Command;
