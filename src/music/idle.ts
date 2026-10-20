const IDLE_TIMEOUT_MS = 5 * 60 * 1000;

export function clearIdleTimer(player: any): void {
  const timer = player?.data?.get("idleTimer") as NodeJS.Timeout | undefined;
  if (timer) clearTimeout(timer);
  player?.data?.delete("idleTimer");
}

export function scheduleEmptyChannelDestroy(player: any, getHumanCount: () => number): void {
  if (!player || player.data.get("twentyFourSeven")) return;
  clearIdleTimer(player);
  const timer = setTimeout(() => {
    if (!player.destroyed && !player.data.get("twentyFourSeven") && getHumanCount() === 0) {
      player.destroy();
    }
  }, IDLE_TIMEOUT_MS);
  timer.unref();
  player.data.set("idleTimer", timer);
}

export function scheduleIdlePlayerDestroy(player: any): void {
  if (!player || player.data.get("twentyFourSeven")) return;
  clearIdleTimer(player);
  const timer = setTimeout(() => {
    const hasQueue = Boolean(player.queue?.current || player.queue?.length);
    if (!player.destroyed && !player.data.get("twentyFourSeven") && !hasQueue && !player.playing) {
      player.destroy();
    }
  }, IDLE_TIMEOUT_MS);
  timer.unref();
  player.data.set("idleTimer", timer);
}
