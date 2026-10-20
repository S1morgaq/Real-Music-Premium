import { env } from "../config/env";

interface AddTracksOptions {
  maxTracks?: number;
  enforceQueueLimit?: boolean;
}

export interface AddTracksResult {
  added: number;
  skipped: number;
  queueFull: boolean;
}

export function addTracksToQueue(player: any, tracks: any[], options: AddTracksOptions = {}): AddTracksResult {
  const limit = options.maxTracks ?? tracks.length;
  const safeTracks = tracks.filter(Boolean).slice(0, limit);
  if (!safeTracks.length) return { added: 0, skipped: tracks.length, queueFull: false };

  const enforceQueueLimit = options.enforceQueueLimit ?? Boolean(options.maxTracks || safeTracks.length > 1);
  if (!enforceQueueLimit) {
    addAcceptedTracks(player, safeTracks);
    return {
      added: safeTracks.length,
      skipped: Math.max(tracks.length - safeTracks.length, 0),
      queueFull: false
    };
  }

  const queuedSize = Number.isFinite(Number(player.queue?.length)) ? Number(player.queue.length) : Array.from(player.queue ?? []).length;
  const currentSize = queuedSize + (player.queue?.current ? 1 : 0);
  const remainingSlots = Math.max(env.MAX_QUEUE_SIZE - currentSize, 0);
  const acceptedTracks = safeTracks.slice(0, remainingSlots);
  const skipped = Math.max(tracks.length - acceptedTracks.length, 0);

  if (!acceptedTracks.length) {
    return { added: 0, skipped, queueFull: true };
  }

  addAcceptedTracks(player, acceptedTracks);

  return {
    added: acceptedTracks.length,
    skipped,
    queueFull: remainingSlots <= acceptedTracks.length && skipped > 0
  };
}

function addAcceptedTracks(player: any, tracks: any[]): void {
  try {
    player.queue.add(tracks);
  } catch {
    for (const track of tracks) {
      player.queue.add(track);
    }
  }
}

export async function startPlayerIfIdle(player: any): Promise<void> {
  if (!player || player.playing || player.paused) return;
  await player.play();
}
