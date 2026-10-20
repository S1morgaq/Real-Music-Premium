import type { User } from "discord.js";
import type { MusicClient } from "../client/MusicClient";

export type RadioCategory = "turkce" | "global" | "lofi" | "jazz" | "rock" | "pop" | "haber" | "oyun";

export interface RadioStation {
  id: string;
  name: string;
  category: RadioCategory;
  country: string;
  genre: string;
  streamUrl: string;
  homepage?: string;
  logo?: string;
  quality: string;
  accent: string;
}

export const radioStations: RadioStation[] = [
  {
    id: "powerturk",
    name: "PowerTurk",
    category: "turkce",
    country: "TR",
    genre: "Turkce Pop",
    streamUrl: "https://listen.powerapp.com.tr/powerturk/mpeg/icecast.audio",
    homepage: "https://www.powerapp.com.tr/powerturk",
    quality: "AAC/MP3 HQ",
    accent: "#22c55e"
  },
  {
    id: "kral-pop",
    name: "Kral Pop",
    category: "turkce",
    country: "TR",
    genre: "Turkce Pop",
    streamUrl: "https://stream.rcast.net/6405",
    homepage: "https://www.kralmuzik.com.tr/radyo/kral-pop",
    quality: "64 kbps AAC",
    accent: "#f43f5e"
  },
  {
    id: "slowturk",
    name: "SlowTurk",
    category: "turkce",
    country: "TR",
    genre: "Turkce Slow",
    streamUrl: "https://radyo.duhnet.tv/slowturk",
    homepage: "https://slowturk.com.tr",
    quality: "Live",
    accent: "#38bdf8"
  },
  {
    id: "metro-fm",
    name: "Metro FM",
    category: "global",
    country: "TR",
    genre: "Pop / Top 40",
    streamUrl: "https://playerservices.streamtheworld.com/api/livestream-redirect/METRO_FMAAC.aac",
    homepage: "https://karnaval.com/radyolar/metrofm",
    quality: "64 kbps AAC",
    accent: "#a855f7"
  },
  {
    id: "virgin-radio",
    name: "Virgin Radio Turkiye",
    category: "global",
    country: "TR",
    genre: "Pop / Dance",
    streamUrl: "https://playerservices.streamtheworld.com/api/livestream-redirect/VIRGIN_RADIOAAC_SC",
    homepage: "https://karnaval.com/radyolar/virginradio",
    quality: "64 kbps AAC",
    accent: "#ef4444"
  },
  {
    id: "joyturk",
    name: "JoyTurk",
    category: "turkce",
    country: "TR",
    genre: "Turkce Slow",
    streamUrl: "https://playerservices.streamtheworld.com/api/livestream-redirect/JOYTURKAAC.aac",
    homepage: "https://karnaval.com/radyolar/joyturk",
    quality: "64 kbps AAC",
    accent: "#06b6d4"
  },
  {
    id: "alem-fm",
    name: "Alem FM",
    category: "pop",
    country: "TR",
    genre: "Pop / Talk",
    streamUrl: "https://playerservices.streamtheworld.com/api/livestream-redirect/ALEM_FMAAC.aac",
    homepage: "https://alemfm.com",
    quality: "64 kbps AAC",
    accent: "#f59e0b"
  },
  {
    id: "number-one",
    name: "Number One FM",
    category: "global",
    country: "TR",
    genre: "Hit Music",
    streamUrl: "https://n10101m.mediatriple.net/numberone",
    homepage: "https://www.numberone.com.tr",
    quality: "Live",
    accent: "#84cc16"
  },
  {
    id: "lofi-girl",
    name: "LoFi Girl",
    category: "lofi",
    country: "FR",
    genre: "LoFi / Chill",
    streamUrl: "https://play.streamafrica.net/lofiradio",
    homepage: "https://lofigirl.com",
    quality: "MP3 HQ",
    accent: "#14b8a6"
  },
  {
    id: "jazz-groove",
    name: "The Jazz Groove",
    category: "jazz",
    country: "US",
    genre: "Jazz",
    streamUrl: "https://west-mp3-128.streamthejazzgroove.com/stream",
    homepage: "https://jazzgroove.org",
    quality: "128 kbps MP3",
    accent: "#f97316"
  },
  {
    id: "rock-radio",
    name: "Rock Radio",
    category: "rock",
    country: "US",
    genre: "Rock",
    streamUrl: "https://ais-sa2.cdnstream1.com/1986_128.mp3",
    quality: "128 kbps MP3",
    accent: "#e11d48"
  },
  {
    id: "bbc-world",
    name: "BBC World Service",
    category: "haber",
    country: "UK",
    genre: "News",
    streamUrl: "https://stream.live.vc.bbcmedia.co.uk/bbc_world_service",
    homepage: "https://www.bbc.co.uk/worldserviceradio",
    quality: "Live",
    accent: "#60a5fa"
  },
  {
    id: "game-chops",
    name: "GameChops",
    category: "oyun",
    country: "US",
    genre: "Game Music",
    streamUrl: "https://radio.gamechops.com/radio/8000/radio.mp3",
    homepage: "https://gamechops.com",
    quality: "MP3 HQ",
    accent: "#c084fc"
  },
  {
    id: "trt-fm",
    name: "TRT FM",
    category: "turkce",
    country: "TR",
    genre: "Turkce Pop / Kultur",
    streamUrl: "https://radio-trtfm.live.trt.com.tr/master.m3u8",
    homepage: "https://www.trtdinle.com/radyolar/trt-fm",
    quality: "HLS",
    accent: "#22c55e"
  },
  {
    id: "trt-nagme",
    name: "TRT Nagme",
    category: "turkce",
    country: "TR",
    genre: "Turk Sanat Muzigi",
    streamUrl: "https://radio-trtnagme.live.trt.com.tr/master.m3u8",
    homepage: "https://www.trtdinle.com/radyolar/trt-nagme",
    quality: "HLS",
    accent: "#06b6d4"
  },
  {
    id: "trt-turku",
    name: "TRT Turku",
    category: "turkce",
    country: "TR",
    genre: "Turku",
    streamUrl: "https://radio-trtturku.live.trt.com.tr/master.m3u8",
    homepage: "https://www.trtdinle.com/radyolar/trt-turku",
    quality: "HLS",
    accent: "#84cc16"
  },
  {
    id: "trt-haber",
    name: "TRT Haber Radyo",
    category: "haber",
    country: "TR",
    genre: "Haber",
    streamUrl: "https://radio-trthaber.live.trt.com.tr/master.m3u8",
    homepage: "https://www.trtdinle.com/radyolar/trt-haber-radyo",
    quality: "HLS",
    accent: "#60a5fa"
  },
  {
    id: "trt-radyo1",
    name: "TRT Radyo 1",
    category: "haber",
    country: "TR",
    genre: "Haber / Kultur",
    streamUrl: "https://radio-trtradyo1.live.trt.com.tr/master.m3u8",
    homepage: "https://www.trtdinle.com/radyolar/radyo-1",
    quality: "HLS",
    accent: "#38bdf8"
  },
  {
    id: "best-fm",
    name: "Best FM",
    category: "pop",
    country: "TR",
    genre: "Turkce Pop",
    streamUrl: "https://bestfm.turkhosted.com/bestfm",
    homepage: "https://www.bestfm.com.tr",
    quality: "MP3",
    accent: "#f97316"
  },
  {
    id: "super-fm",
    name: "Super FM",
    category: "pop",
    country: "TR",
    genre: "Turkce Pop",
    streamUrl: "https://playerservices.streamtheworld.com/api/livestream-redirect/SUPER_FMAAC.aac",
    homepage: "https://karnaval.com/radyolar/superfm",
    quality: "64 kbps AAC",
    accent: "#f59e0b"
  },
  {
    id: "joy-fm",
    name: "Joy FM",
    category: "global",
    country: "TR",
    genre: "Soft Pop",
    streamUrl: "https://playerservices.streamtheworld.com/api/livestream-redirect/JOY_FMAAC.aac",
    homepage: "https://karnaval.com/radyolar/joyfm",
    quality: "64 kbps AAC",
    accent: "#38bdf8"
  },
  {
    id: "fenomen",
    name: "Radyo Fenomen",
    category: "global",
    country: "TR",
    genre: "Dance / Hit",
    streamUrl: "https://live.radyofenomen.com/fenomen/128/icecast.audio",
    homepage: "https://www.radyofenomen.com",
    quality: "128 kbps MP3",
    accent: "#a855f7"
  },
  {
    id: "fenomen-turk",
    name: "Fenomen Turk",
    category: "turkce",
    country: "TR",
    genre: "Turkce Pop",
    streamUrl: "https://live.radyofenomen.com/fenomenturk/128/icecast.audio",
    homepage: "https://www.radyofenomen.com",
    quality: "128 kbps MP3",
    accent: "#ef4444"
  },
  {
    id: "power-fm",
    name: "Power FM",
    category: "global",
    country: "TR",
    genre: "Hit Music",
    streamUrl: "https://listen.powerapp.com.tr/powerfm/mpeg/icecast.audio",
    homepage: "https://www.powerapp.com.tr/powerfm",
    quality: "AAC/MP3 HQ",
    accent: "#f43f5e"
  },
  {
    id: "power-love",
    name: "Power Love",
    category: "global",
    country: "TR",
    genre: "Love Songs",
    streamUrl: "https://listen.powerapp.com.tr/powerlove/mpeg/icecast.audio",
    homepage: "https://www.powerapp.com.tr/powerlove",
    quality: "AAC/MP3 HQ",
    accent: "#fb7185"
  },
  {
    id: "power-dance",
    name: "Power Dance",
    category: "global",
    country: "TR",
    genre: "Dance",
    streamUrl: "https://listen.powerapp.com.tr/powerdance/mpeg/icecast.audio",
    homepage: "https://www.powerapp.com.tr/powerdance",
    quality: "AAC/MP3 HQ",
    accent: "#22d3ee"
  },
  {
    id: "number-one-turk",
    name: "Number One Turk",
    category: "turkce",
    country: "TR",
    genre: "Turkce Hit",
    streamUrl: "https://n10101m.mediatriple.net/numberoneturk",
    homepage: "https://www.numberone.com.tr",
    quality: "Live",
    accent: "#22c55e"
  },
  {
    id: "number-one-dance",
    name: "Number One Dance",
    category: "global",
    country: "TR",
    genre: "Dance",
    streamUrl: "https://n10101m.mediatriple.net/numberonedance",
    homepage: "https://www.numberone.com.tr",
    quality: "Live",
    accent: "#c084fc"
  },
  {
    id: "number-one-ask",
    name: "Number One Ask",
    category: "pop",
    country: "TR",
    genre: "Love Songs",
    streamUrl: "https://n10101m.mediatriple.net/numberoneask",
    homepage: "https://www.numberone.com.tr",
    quality: "Live",
    accent: "#f472b6"
  },
  {
    id: "radyo-d",
    name: "Radyo D",
    category: "pop",
    country: "TR",
    genre: "Turkce Pop",
    streamUrl: "https://radyo.duhnet.tv/radyod",
    homepage: "https://www.radyod.com.tr",
    quality: "Live",
    accent: "#facc15"
  },
  {
    id: "show-radyo",
    name: "Show Radyo",
    category: "pop",
    country: "TR",
    genre: "Turkce Pop",
    streamUrl: "https://radyo.duhnet.tv/showradyo",
    homepage: "https://www.showradyo.com.tr",
    quality: "Live",
    accent: "#f97316"
  },
  {
    id: "pal-station",
    name: "Pal Station",
    category: "global",
    country: "TR",
    genre: "Dance / Pop",
    streamUrl: "https://shoutcast.radyogrup.com:1030/stream",
    homepage: "https://www.palstation.com.tr",
    quality: "MP3",
    accent: "#38bdf8"
  },
  {
    id: "pal-fm",
    name: "Pal FM",
    category: "pop",
    country: "TR",
    genre: "Turkce Pop",
    streamUrl: "https://shoutcast.radyogrup.com:1010/stream",
    homepage: "https://www.palfm.com.tr",
    quality: "MP3",
    accent: "#f59e0b"
  },
  {
    id: "radyo-voyage",
    name: "Radyo Voyage",
    category: "jazz",
    country: "TR",
    genre: "Lounge / Jazz",
    streamUrl: "https://voyagewmp.radyotvonline.net/voyage",
    homepage: "https://www.radyovoyage.com",
    quality: "MP3",
    accent: "#14b8a6"
  },
  {
    id: "capital-fm",
    name: "Capital FM UK",
    category: "global",
    country: "UK",
    genre: "Top 40",
    streamUrl: "https://media-ssl.musicradio.com/Capital",
    homepage: "https://www.capitalfm.com",
    quality: "MP3",
    accent: "#ef4444"
  },
  {
    id: "heart-uk",
    name: "Heart UK",
    category: "global",
    country: "UK",
    genre: "Pop",
    streamUrl: "https://media-ssl.musicradio.com/HeartUK",
    homepage: "https://www.heart.co.uk",
    quality: "MP3",
    accent: "#f43f5e"
  },
  {
    id: "classic-fm",
    name: "Classic FM",
    category: "jazz",
    country: "UK",
    genre: "Classical",
    streamUrl: "https://media-ssl.musicradio.com/ClassicFM",
    homepage: "https://www.classicfm.com",
    quality: "MP3",
    accent: "#60a5fa"
  },
  {
    id: "smooth-jazz",
    name: "Smooth Jazz Florida",
    category: "jazz",
    country: "US",
    genre: "Smooth Jazz",
    streamUrl: "https://us2.internet-radio.com/proxy/wsjf?mp=/stream",
    homepage: "https://www.smoothjazzflorida.com",
    quality: "128 kbps MP3",
    accent: "#f97316"
  },
  {
    id: "jazz24",
    name: "Jazz24",
    category: "jazz",
    country: "US",
    genre: "Jazz",
    streamUrl: "https://live.wostreaming.net/direct/ppm-jazz24mp3-ibc1",
    homepage: "https://www.jazz24.org",
    quality: "MP3",
    accent: "#f59e0b"
  },
  {
    id: "somafm-groove",
    name: "SomaFM Groove Salad",
    category: "lofi",
    country: "US",
    genre: "Ambient / Chill",
    streamUrl: "https://ice1.somafm.com/groovesalad-128-mp3",
    homepage: "https://somafm.com/groovesalad",
    quality: "128 kbps MP3",
    accent: "#22c55e"
  },
  {
    id: "somafm-drone",
    name: "SomaFM Drone Zone",
    category: "lofi",
    country: "US",
    genre: "Ambient",
    streamUrl: "https://ice1.somafm.com/dronezone-128-mp3",
    homepage: "https://somafm.com/dronezone",
    quality: "128 kbps MP3",
    accent: "#38bdf8"
  },
  {
    id: "somafm-illstreet",
    name: "SomaFM Illinois Street",
    category: "lofi",
    country: "US",
    genre: "Downtempo",
    streamUrl: "https://ice1.somafm.com/illstreet-128-mp3",
    homepage: "https://somafm.com/illstreet",
    quality: "128 kbps MP3",
    accent: "#a855f7"
  },
  {
    id: "nightride",
    name: "Nightride FM",
    category: "oyun",
    country: "US",
    genre: "Synthwave",
    streamUrl: "https://stream.nightride.fm/nightride.m4a",
    homepage: "https://nightride.fm",
    quality: "AAC",
    accent: "#c084fc"
  },
  {
    id: "datafruits",
    name: "Datafruits FM",
    category: "oyun",
    country: "JP",
    genre: "Electronic / Game",
    streamUrl: "https://streampusher-relay.club/datafruits.mp3",
    homepage: "https://datafruits.fm",
    quality: "MP3",
    accent: "#22d3ee"
  },
  {
    id: "radio-paradise",
    name: "Radio Paradise",
    category: "rock",
    country: "US",
    genre: "Eclectic Rock",
    streamUrl: "https://stream.radioparadise.com/mp3-128",
    homepage: "https://radioparadise.com",
    quality: "128 kbps MP3",
    accent: "#84cc16"
  },
  {
    id: "kexp",
    name: "KEXP",
    category: "rock",
    country: "US",
    genre: "Alternative",
    streamUrl: "https://kexp-mp3-128.streamguys1.com/kexp128.mp3",
    homepage: "https://www.kexp.org",
    quality: "128 kbps MP3",
    accent: "#f97316"
  },
  {
    id: "kcrw",
    name: "KCRW Eclectic24",
    category: "rock",
    country: "US",
    genre: "Eclectic",
    streamUrl: "https://kcrw.streamguys1.com/kcrw_192k_mp3_e24",
    homepage: "https://www.kcrw.com",
    quality: "192 kbps MP3",
    accent: "#38bdf8"
  },
  {
    id: "absolute-radio",
    name: "Absolute Radio",
    category: "rock",
    country: "UK",
    genre: "Rock",
    streamUrl: "https://edge-bauerall-01-gos2.sharp-stream.com/absolute.mp3",
    homepage: "https://planetradio.co.uk/absolute-radio",
    quality: "MP3",
    accent: "#ef4444"
  },
  {
    id: "bbc-radio1",
    name: "BBC Radio 1",
    category: "global",
    country: "UK",
    genre: "Pop / Dance",
    streamUrl: "https://stream.live.vc.bbcmedia.co.uk/bbc_radio_one",
    homepage: "https://www.bbc.co.uk/radio1",
    quality: "Live",
    accent: "#22c55e"
  },
  {
    id: "bbc-radio2",
    name: "BBC Radio 2",
    category: "global",
    country: "UK",
    genre: "Pop Classics",
    streamUrl: "https://stream.live.vc.bbcmedia.co.uk/bbc_radio_two",
    homepage: "https://www.bbc.co.uk/radio2",
    quality: "Live",
    accent: "#60a5fa"
  },
  {
    id: "cnn-radio",
    name: "CNN Radio",
    category: "haber",
    country: "US",
    genre: "News",
    streamUrl: "https://tunein.cdnstream1.com/3511_96.mp3",
    homepage: "https://www.cnn.com/audio",
    quality: "96 kbps MP3",
    accent: "#ef4444"
  },
  {
    id: "npr-news",
    name: "NPR News",
    category: "haber",
    country: "US",
    genre: "News",
    streamUrl: "https://npr-ice.streamguys1.com/live.mp3",
    homepage: "https://www.npr.org",
    quality: "MP3",
    accent: "#38bdf8"
  },
  {
    id: "france-info",
    name: "Franceinfo",
    category: "haber",
    country: "FR",
    genre: "News",
    streamUrl: "https://icecast.radiofrance.fr/franceinfo-midfi.mp3",
    homepage: "https://www.francetvinfo.fr/replay-radio/direct-franceinfo",
    quality: "MP3",
    accent: "#60a5fa"
  },
  {
    id: "fip",
    name: "FIP",
    category: "jazz",
    country: "FR",
    genre: "Jazz / Eclectic",
    streamUrl: "https://icecast.radiofrance.fr/fip-midfi.mp3",
    homepage: "https://www.radiofrance.fr/fip",
    quality: "MP3",
    accent: "#f97316"
  },
  {
    id: "radio-swiss-jazz",
    name: "Radio Swiss Jazz",
    category: "jazz",
    country: "CH",
    genre: "Jazz",
    streamUrl: "https://stream.srg-ssr.ch/m/rsj/mp3_128",
    homepage: "https://www.radioswissjazz.ch",
    quality: "128 kbps MP3",
    accent: "#f59e0b"
  },
  {
    id: "radio-swiss-pop",
    name: "Radio Swiss Pop",
    category: "pop",
    country: "CH",
    genre: "Pop",
    streamUrl: "https://stream.srg-ssr.ch/m/rsp/mp3_128",
    homepage: "https://www.radioswisspop.ch",
    quality: "128 kbps MP3",
    accent: "#22c55e"
  },
  {
    id: "dance-wave",
    name: "Dance Wave",
    category: "global",
    country: "HU",
    genre: "Dance",
    streamUrl: "https://dancewave.online/dance.mp3",
    homepage: "https://dancewave.online",
    quality: "MP3",
    accent: "#a855f7"
  },
  {
    id: "energy-de",
    name: "NRJ Germany",
    category: "global",
    country: "DE",
    genre: "Hit Music",
    streamUrl: "https://scdn.nrjaudio.fm/adwz1/de/33001/mp3_128.mp3",
    homepage: "https://www.energy.de",
    quality: "128 kbps MP3",
    accent: "#ef4444"
  }
];

export const radioCategories: RadioCategory[] = ["turkce", "global", "lofi", "jazz", "rock", "pop", "haber", "oyun"];

export function getRadioStation(id: string): RadioStation | undefined {
  return radioStations.find((station) => station.id === id);
}

export function searchRadioStations(query: string, limit = 25): RadioStation[] {
  const normalized = query.trim().toLowerCase();
  const stations = normalized
    ? radioStations.filter((station) =>
        [station.id, station.name, station.genre, station.country, station.category].some((value) =>
          value.toLowerCase().includes(normalized)
        )
      )
    : radioStations;
  return stations.slice(0, limit);
}

export function getStationsByCategory(category: RadioCategory): RadioStation[] {
  return radioStations.filter((station) => station.category === category);
}

export function radioStationChunks(size = 25): RadioStation[][] {
  const chunks: RadioStation[][] = [];
  for (let index = 0; index < radioStations.length; index += size) {
    chunks.push(radioStations.slice(index, index + size));
  }
  return chunks;
}

export async function queueLiveRadioStation(
  client: MusicClient,
  player: any,
  station: RadioStation,
  requester: User
): Promise<any | null> {
  const result = await client.kazagumo.search(station.streamUrl, { requester }).catch(() => null);
  const track = result?.tracks?.[0];
  if (!track) return null;

  decorateRadioTrack(track, station);
  player.queue.add(track);
  player.data.set("radioStation", station);
  player.data.set("radioStartedAt", Date.now());
  return track;
}

export async function startLiveRadioStation(
  client: MusicClient,
  player: any,
  station: RadioStation,
  requester: User
): Promise<any | null> {
  const result = await client.kazagumo.search(station.streamUrl, { requester }).catch(() => null);
  const track = result?.tracks?.[0];
  if (!track) return null;

  decorateRadioTrack(track, station);
  player.queue.clear();
  player.queue.add(track);
  player.data.set("radioStation", station);
  player.data.set("radioStartedAt", Date.now());

  if (player.paused) player.pause(false);
  if (player.playing || player.queue.current) player.skip();
  else await player.play();

  return track;
}

export function isLiveRadioTrack(track: any): boolean {
  return Boolean(track?.radio || track?.isStream);
}

export function playerHasLiveRadio(player: any): boolean {
  return Boolean(player?.data?.get("radioStation") || isLiveRadioTrack(player?.queue?.current));
}

export function clearLiveRadioState(player: any): void {
  player?.data?.delete?.("radioStation");
  player?.data?.delete?.("radioStartedAt");
}

export function decorateRadioTrack(track: any, station: RadioStation): void {
  track.title = station.name;
  track.author = `${station.genre} Radio`;
  track.uri = station.homepage ?? station.streamUrl;
  track.isStream = true;
  track.thumbnail = station.logo;
  track.artworkUrl = station.logo;
  track.radio = station;
}
