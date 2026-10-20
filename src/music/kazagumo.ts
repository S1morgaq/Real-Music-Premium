import type { MusicClient } from "../client/MusicClient";
import { env } from "../config/env";
import { logger } from "../lib/logger";
import { Kazagumo } from "kazagumo";
import { Connectors } from "shoukaku";
import { clearIdleTimer, scheduleIdlePlayerDestroy } from "./idle";
import { findAlternateTrack } from "../services/searchService";
import { clearLiveRadioState, isLiveRadioTrack } from "../services/radioService";

export function createKazagumo(client: MusicClient): Kazagumo {
  const kazagumo = new Kazagumo(
    {
      defaultSearchEngine: "soundcloud",
      send: (guildId, payload) => {
        const guild = client.guilds.cache.get(guildId);
        if (guild) guild.shard.send(payload);
      }
    },
    new Connectors.DiscordJS(client),
    [
      {
        name: env.LAVALINK_NAME,
        url: env.LAVALINK_URL,
        auth: env.LAVALINK_AUTH,
        secure: env.LAVALINK_SECURE
      }
    ],
    {
      moveOnDisconnect: true,
      resume: true,
      resumeTimeout: 120,
      reconnectTries: 10,
      restTimeout: 15_000
    }
  );

  kazagumo.shoukaku.on("ready", (name) => logger.info({ node: name }, "Lavalink node ready"));
  kazagumo.shoukaku.on("error", (name, error) => logger.error({ node: name, error }, "Lavalink node error"));
  kazagumo.shoukaku.on("close", (name, code, reason) =>
    logger.warn({ node: name, code, reason }, "Lavalink node closed")
  );

  kazagumo.on("playerStart", (player: any, track: any) => {
    clearIdleTimer(player);
    if (!isLiveRadioTrack(track)) clearLiveRadioState(player);
    logger.info({ guildId: player.guildId, title: track.title }, "Track started");
  });
  kazagumo.on("playerEmpty", (player: any) => {
    logger.info({ guildId: player.guildId }, "Queue ended");
    clearLiveRadioState(player);
    scheduleIdlePlayerDestroy(player);
  });
  kazagumo.on("playerException", async (player: any, data: any) => {
    logger.error({ guildId: player.guildId, data }, "Player exception");
    const failedTrack = data?.track ?? player.queue.current;
    if (isLiveRadioTrack(failedTrack)) {
      clearLiveRadioState(player);
      if (player.queue.length) player.skip();
      return;
    }
    const key = String(failedTrack?.encoded ?? failedTrack?.info?.uri ?? failedTrack?.uri ?? failedTrack?.title ?? "");
    const attempts = (player.data.get("fallbackAttempts") as Map<string, number> | undefined) ?? new Map<string, number>();
    const attemptCount = attempts.get(key) ?? 0;
    player.data.set("fallbackAttempts", attempts);

    if (failedTrack && attemptCount < 2) {
      attempts.set(key, attemptCount + 1);
      const requester =
        failedTrack.requester ??
        failedTrack.userData ??
        failedTrack.info?.requester ??
        player.queue.current?.requester ??
        client.user;
      const alternate = await findAlternateTrack(client, failedTrack.info ?? failedTrack, requester).catch(() => null);
      if (alternate) {
        logger.warn(
          { guildId: player.guildId, title: alternate.title, source: alternate.sourceName },
          "Retrying failed track with alternate source"
        );
        player.queue.unshift(alternate);
      }
    }

    if (player.queue.length) player.skip();
  });
  kazagumo.on("playerStuck", (player: any, data: unknown) => {
    logger.warn({ guildId: player.guildId, data }, "Player stuck, skipping track");
    if (player.queue.length) player.skip();
  });

  return kazagumo;
}
