import type { MusicClient } from "../client/MusicClient";
import { env } from "../config/env";
import { logger } from "../lib/logger";
import { hasPremiumByIds } from "../services/premiumService";

const AD_INTERVAL_MS = 30 * 60 * 1000;
const AD_REPEAT_COUNT = 2;
export const DEFAULT_AD_TEXTS = [
  "Müzik keyfin bölünmesin. Premium ile reklamları kapat, ritmi kesilmeden dinlemeye devam et. Detaylar için r premium yaz.",
  "Daha temiz ve kesintisiz bir müzik deneyimi ister misin? Premium seni bekliyor. Reklamsız dinlemek için r premium yaz."
];

export const DEFAULT_AD_AUDIO_URLS = DEFAULT_AD_TEXTS.map(
  (_, index) => `${env.AD_AUDIO_PUBLIC_BASE_URL}/ad-audio/premium-${index + 1}.mp3`
);

type AdResumeState = {
  track: any;
  position: number;
};

export function scheduleAdTimer(player: any, client: MusicClient): void {
  clearAdTimer(player);
  const timer = setTimeout(() => void playAdBreak(player, client), AD_INTERVAL_MS);
  timer.unref();
  player.data.set("adTimer", timer);
}

export function clearAdTimer(player: any): void {
  const timer = player.data.get("adTimer") as NodeJS.Timeout | undefined;
  if (timer) clearTimeout(timer);
  player.data.delete("adTimer");
}

export function isAdPlaying(player: any): boolean {
  return Boolean(player.data.get("adPlaying"));
}

export async function handleAdTrackEnd(player: any, client: MusicClient): Promise<boolean> {
  if (!isAdPlaying(player)) return false;

  const remaining = Number(player.data.get("adRemaining") ?? 0);
  const adTrack = player.data.get("adTrack");
  if (remaining > 1 && adTrack) {
    player.data.set("adRemaining", remaining - 1);
    await player.play(adTrack, { replaceCurrent: true });
    return true;
  }

  player.data.delete("adPlaying");
  player.data.delete("adRemaining");
  player.data.delete("adTrack");

  const resume = player.data.get("adResume") as AdResumeState | undefined;
  player.data.delete("adResume");
  scheduleAdTimer(player, client);

  if (resume?.track) {
    await player.play(resume.track, { replaceCurrent: true, position: resume.position });
  } else if (player.queue.length && !player.playing && !player.paused) {
    await player.play();
  }

  return true;
}

function getAdAudioUrls(): string[] {
  const configuredUrls = [env.AD_AUDIO_URL, ...env.AD_AUDIO_URLS.split(",")]
    .map((url) => url.trim())
    .filter(Boolean);

  return configuredUrls.length ? configuredUrls : DEFAULT_AD_AUDIO_URLS;
}

async function playAdBreak(player: any, client: MusicClient): Promise<void> {
  player.data.delete("adTimer");
  if (!player.queue.current || player.paused || isAdPlaying(player)) {
    scheduleAdTimer(player, client);
    return;
  }

  const requesterId = String(player.queue.current.requester?.id ?? "");
  if (await hasPremiumByIds(requesterId, player.guildId)) {
    scheduleAdTimer(player, client);
    return;
  }

  const adUrls = getAdAudioUrls();
  const adIndex = Number(player.data.get("adIndex") ?? 0);
  const adUrl = adUrls[adIndex % adUrls.length];
  player.data.set("adIndex", adIndex + 1);

  const result = await client.kazagumo.search(adUrl, {
    requester: player.queue.current.requester ?? client.user
  });
  const adTrack = result.tracks[0];
  if (!adTrack) {
    logger.warn({ guildId: player.guildId }, "Premium ad track could not be resolved");
    scheduleAdTimer(player, client);
    return;
  }

  player.data.set("adPlaying", true);
  player.data.set("adRemaining", AD_REPEAT_COUNT);
  player.data.set("adTrack", adTrack);
  player.data.set("adResume", {
    track: player.queue.current,
    position: Number(player.position ?? 0)
  } satisfies AdResumeState);

  await player.play(adTrack, { replaceCurrent: true });
}
