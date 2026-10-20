import { TrackStat } from "../database/models/TrackStat";

export async function recordTrackPlay(guildId: string, track: any): Promise<void> {
  const requesterId = String(track?.requester?.id ?? "unknown");
  const title = String(track?.title ?? "Bilinmeyen sarki");
  const uri = String(track?.uri ?? track?.realUri ?? title);

  await TrackStat.findOneAndUpdate(
    { guildId, userId: requesterId, uri },
    {
      $set: {
        guildId,
        userId: requesterId,
        title,
        uri,
        author: track?.author,
        lastPlayedAt: new Date()
      },
      $inc: { plays: 1 }
    },
    { upsert: true, new: true }
  );
}

export async function getTopTracks(guildId: string, limit = 10) {
  return TrackStat.aggregate([
    { $match: { guildId } },
    {
      $group: {
        _id: "$uri",
        title: { $first: "$title" },
        author: { $first: "$author" },
        plays: { $sum: "$plays" },
        lastPlayedAt: { $max: "$lastPlayedAt" }
      }
    },
    { $sort: { plays: -1, lastPlayedAt: -1 } },
    { $limit: limit }
  ]);
}

export async function getTopUsers(guildId: string, limit = 10) {
  return TrackStat.aggregate([
    { $match: { guildId } },
    { $group: { _id: "$userId", plays: { $sum: "$plays" }, lastPlayedAt: { $max: "$lastPlayedAt" } } },
    { $sort: { plays: -1, lastPlayedAt: -1 } },
    { $limit: limit }
  ]);
}
