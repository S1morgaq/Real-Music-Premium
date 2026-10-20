import { Client, Collection, GatewayIntentBits, Partials } from "discord.js";
import type { Kazagumo } from "kazagumo";
import type { Command } from "../types/Command";

export class MusicClient extends Client {
  public readonly commands = new Collection<string, Command>();
  public readonly cooldowns = new Collection<string, Collection<string, number>>();
  public kazagumo!: Kazagumo;

  public constructor() {
    super({
      shards: "auto",
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
      ],
      partials: [Partials.Channel],
      allowedMentions: { parse: ["users"], repliedUser: false },
      failIfNotExists: false
    });
  }
}
