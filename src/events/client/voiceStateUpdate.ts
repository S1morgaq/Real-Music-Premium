import type { VoiceState } from "discord.js";
import type { MusicClient } from "../../client/MusicClient";
import { scheduleEmptyChannelDestroy } from "../../music/idle";

export default {
  name: "voiceStateUpdate",
  async execute(_oldState: VoiceState, newState: VoiceState, client: MusicClient) {
    if (!newState.guild.id || newState.member?.user.bot) return;
    const player = client.kazagumo.players.get(newState.guild.id);
    if (!player || player.data.get("twentyFourSeven")) return;
    if (!player.voiceId) return;
    const channel = newState.guild.channels.cache.get(player.voiceId);
    if (!channel?.isVoiceBased()) return;
    const humans = channel.members.filter((member) => !member.user.bot).size;
    if (humans === 0) {
      scheduleEmptyChannelDestroy(player, () => {
        const current = player.voiceId ? newState.guild.channels.cache.get(player.voiceId) : null;
        return current?.isVoiceBased() ? current.members.filter((member) => !member.user.bot).size : 0;
      });
    }
  }
};
