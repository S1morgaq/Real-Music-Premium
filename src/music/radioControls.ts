import { ActionRowBuilder, StringSelectMenuBuilder } from "discord.js";
import { radioStations, type RadioStation } from "../services/radioService";

export function radioSelectRows(stations: RadioStation[] = radioStations) {
  const chunks: RadioStation[][] = [];
  for (let index = 0; index < stations.length; index += 25) {
    chunks.push(stations.slice(index, index + 25));
  }

  return chunks
    .slice(0, 5)
    .map((stations, index) =>
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId(`radio:select:${index}`)
          .setPlaceholder(index === 0 ? "Radyo sec: Turkiye ve premium liste" : `Radyo sec: katalog ${index + 1}`)
          .addOptions(
            stations.map((station) => ({
              label: station.name.slice(0, 100),
              description: `${station.country} | ${station.genre} | ${station.quality}`.slice(0, 100),
              value: station.id
            }))
          )
      )
    );
}
