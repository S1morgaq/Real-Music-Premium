import { AttachmentBuilder, SlashCommandBuilder } from "discord.js";
import type { Command } from "../../types/Command";
import { baseEmbed, errorEmbed, successEmbed } from "../../lib/embeds";
import { createRadioCard } from "../../music/nowPlayingCard";
import { radioSelectRows } from "../../music/radioControls";
import { ensureSameVoice, filterMenu, getOrCreatePlayer, playerControls, playerUtilityControls } from "../../music/playerUtils";
import {
  getRadioStation,
  getStationsByCategory,
  radioCategories,
  radioStations,
  searchRadioStations,
  startLiveRadioStation,
  type RadioCategory
} from "../../services/radioService";

export default {
  data: new SlashCommandBuilder()
    .setName("radio")
    .setDescription("Gercek internet radyosu baslatir.")
    .addStringOption((option) =>
      option
        .setName("station")
        .setDescription("Canli radyo istasyonu")
        .setRequired(false)
        .setAutocomplete(true)
    )
    .addStringOption((option) =>
      option
        .setName("category")
        .setDescription("Istersen katalog kategorisi")
        .addChoices(...radioCategories.map((category) => ({ name: category, value: category })))
    ),
  cooldown: 8,
  async autocomplete(interaction) {
    const focused = interaction.options.getFocused();
    await interaction.respond(
      searchRadioStations(focused, 25).map((station) => ({
        name: `${station.name} | ${station.genre} | ${station.country}`.slice(0, 100),
        value: station.id
      }))
    );
  },
  async execute(interaction, client) {
    const category = interaction.options.getString("category") as RadioCategory | null;
    const stationId = interaction.options.getString("station");
    if (!stationId) {
      const stations = category ? getStationsByCategory(category) : radioStations;
      await interaction.reply({
        embeds: [
          baseEmbed()
            .setTitle("Canli Radyo Kontrol Merkezi")
            .setDescription(
              `Katalogda **${radioStations.length}** istasyon var. Combobox uzerinden ara veya asagidaki listeden sec.\n` +
                (category ? `Filtre: **${category}** | Bu kategoride **${stations.length}** istasyon.` : "Turkce, global, lo-fi, jazz, rock, pop, haber ve oyun radyolari hazir.")
            )
        ],
        components: radioSelectRows(stations)
      });
      return;
    }

    if (!(await ensureSameVoice(interaction))) return;
    await interaction.deferReply();

    const station = getRadioStation(stationId);
    if (!station) {
      await interaction.editReply({ embeds: [errorEmbed("Gecersiz radyo istasyonu.")] });
      return;
    }
    if (category && !getStationsByCategory(category).some((candidate) => candidate.id === station.id)) {
      await interaction.editReply({ embeds: [errorEmbed(`Bu istasyon **${category}** kategorisinde degil.`)] });
      return;
    }

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
  }
} satisfies Command;
