import { AttachmentBuilder, type Message } from "discord.js";
import { baseEmbed } from "../lib/embeds";
import { createNowPlayingCard } from "./nowPlayingCard";
import { filterMenu, playerControls, playerUtilityControls } from "./playerUtils";

const UPDATE_INTERVAL_MS = 10_000;

async function nowPlayingPayload(player: any, track: any, position: number) {
  const upcoming = Array.from(player.queue ?? []).slice(0, 4);
  const fileName = `now-playing-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`;
  const requester = track.requester;
  const card = await createNowPlayingCard(track, position, upcoming, {
    volume: Number(player.volume ?? 0),
    loop: String(player.loop ?? "off"),
    filters: player.data?.get("activeFilters") ?? [],
    requesterName: requester?.username ?? requester?.tag,
    requesterAvatar: requester?.displayAvatarURL?.({ extension: "png", size: 128 }) ?? requester?.avatarURL?.(),
    guildName: player.data?.get("guildName") ?? player.guildId,
    radioStation: player.data?.get("radioStation") ?? track.radio ?? null
  });

  return {
    embeds: [
      baseEmbed()
        .setTitle(player.data?.get("radioStation") ? "Canli radyo" : "Simdi caliyor")
        .setImage(`attachment://${fileName}`)
    ],
    files: [new AttachmentBuilder(card, { name: fileName })],
    components: [playerControls(), playerUtilityControls(), filterMenu()]
  };
}

export function clearNowPlayingUpdater(player: any): void {
  const timer = player?.data?.get("nowPlayingTimer") as NodeJS.Timeout | undefined;
  if (timer) clearInterval(timer);
  player?.data?.delete("nowPlayingTimer");
  player?.data?.delete("nowPlayingMessage");
}

export async function sendLiveNowPlayingMessage(channel: any, player: any, track: any): Promise<void> {
  clearNowPlayingUpdater(player);
  if (channel.guild?.name) player.data.set("guildName", channel.guild.name);

  const pendingMessage = player.data.get("pendingNowPlayingMessage") as Message | undefined;
  player.data.delete("pendingNowPlayingMessage");

  const payload = await nowPlayingPayload(player, track, 0);
  const message = pendingMessage
    ? await pendingMessage.edit({ ...payload, attachments: [] })
    : ((await channel.send(payload)) as Message);
  player.data.set("nowPlayingMessage", message);

  const timer = setInterval(() => {
    const current = player.queue?.current;
    const trackedMessage = player.data.get("nowPlayingMessage") as Message | undefined;
    if (!trackedMessage || !current || current !== track || player.destroyed) {
      clearNowPlayingUpdater(player);
      return;
    }

    void nowPlayingPayload(player, current, Number(player.position ?? 0))
      .then((payload) => trackedMessage.edit({ ...payload, attachments: [] }))
      .catch(() => clearNowPlayingUpdater(player));
  }, UPDATE_INTERVAL_MS);

  timer.unref();
  player.data.set("nowPlayingTimer", timer);
}
