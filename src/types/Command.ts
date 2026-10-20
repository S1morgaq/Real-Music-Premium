import type {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder
} from "discord.js";
import type { MusicClient } from "../client/MusicClient";

export interface Command {
  data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder;
  cooldown?: number;
  premium?: boolean;
  execute(interaction: ChatInputCommandInteraction, client: MusicClient): Promise<void>;
  autocomplete?(interaction: AutocompleteInteraction, client: MusicClient): Promise<void>;
}
