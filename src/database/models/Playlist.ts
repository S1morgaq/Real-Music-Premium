import { Schema, model } from "mongoose";

export interface PlaylistTrack {
  title: string;
  uri: string;
  author?: string;
  length?: number;
  thumbnail?: string;
}

export interface PlaylistDocument {
  userId: string;
  name: string;
  tracks: PlaylistTrack[];
}

const playlistTrackSchema = new Schema<PlaylistTrack>(
  {
    title: { type: String, required: true },
    uri: { type: String, required: true },
    author: String,
    length: Number,
    thumbnail: String
  },
  { _id: false }
);

const playlistSchema = new Schema<PlaylistDocument>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    tracks: { type: [playlistTrackSchema], default: [] }
  },
  { timestamps: true }
);

playlistSchema.index({ userId: 1, name: 1 }, { unique: true });

export const Playlist = model<PlaylistDocument>("Playlist", playlistSchema);
