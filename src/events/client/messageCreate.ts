import { AttachmentBuilder, type Message } from "discord.js";
import { PermissionFlagsBits } from "discord.js";
import type { MusicClient } from "../../client/MusicClient";
import { env, ownerIds } from "../../config/env";
import { Playlist } from "../../database/models/Playlist";
import { Premium } from "../../database/models/Premium";
import { baseEmbed, errorEmbed, successEmbed } from "../../lib/embeds";
import { parseTime } from "../../lib/time";
import { normalizeMusicQuery } from "../../lib/sourceUrl";
import { applyFilter, applyTimescale, type FilterName } from "../../music/filters";
import { createAddedCard, createNowPlayingCard, createQueueCard, createRadioCard } from "../../music/nowPlayingCard";
import { radioSelectRows } from "../../music/radioControls";
import { filterMenu, playerControls, playerUtilityControls } from "../../music/playerUtils";
import { addTracksToQueue, startPlayerIfIdle } from "../../music/queueUtils";
import { hasPremiumByIds } from "../../services/premiumService";
import { redeemPremiumCode } from "../../services/premiumCodeService";
import { searchMusic, smartRankTracks } from "../../services/searchService";
import { getGuildSettings, setGuildSetting } from "../../services/settingsService";
import { canUseDjCommand } from "../../services/djService";
import { getTopTracks, getTopUsers } from "../../services/statsService";
import { getRadioStation, getStationsByCategory, playerHasLiveRadio, radioCategories, radioStations, startLiveRadioStation, type RadioCategory } from "../../services/radioService";
import { findLyrics } from "../../services/lyricsService";
import {
  resolveFilterName,
  resolveLoopMode,
  resolvePlaylistSubcommand,
  resolvePrefixCommand,
  resolvePremiumSubcommand,
  resolveTopType
} from "../../lib/commandAliases";

export default {
  name: "messageCreate",
  async execute(message: Message, client: MusicClient) {
    if (!message.guild || message.author.bot || !message.content.startsWith(env.BOT_PREFIX)) return;

    const input = message.content.slice(env.BOT_PREFIX.length).trim();
    if (!input) return;

    const [rawCommand, ...args] = input.split(/\s+/);
    const command = resolvePrefixCommand(rawCommand.toLowerCase());
    const query = args.join(" ");
    if (!(await canUseDjCommand(message, command))) return;

    try {
      if (["play", "p"].includes(command)) return play(message, client, query);
      if (command === "join") return join(message, client);
      if (["leave", "disconnect", "dc"].includes(command)) return leave(message, client);
      if (command === "stop") return stop(message, client);
      if (["skip", "s"].includes(command)) return skip(message, client);
      if (["previous", "prev"].includes(command)) return previous(message, client);
      if (command === "pause") return pause(message, client);
      if (command === "resume") return resume(message, client);
      if (["queue", "q"].includes(command)) return queue(message, client, Number(args[0] ?? 1));
      if (["nowplaying", "np"].includes(command)) return nowplaying(message, client);
      if (command === "volume") return volume(message, client, Number(args[0]));
      if (command === "shuffle") return shuffle(message, client);
      if (command === "clear") return clearQueue(message, client);
      if (command === "loop") return loop(message, client, args[0]);
      if (command === "seek") return seek(message, client, args[0]);
      if (command === "remove") return remove(message, client, Number(args[0]));
      if (command === "autoplay") return autoplay(message, client, args[0]);
      if (command === "replay") return replay(message, client);
      if (command === "lyrics") return lyrics(message, client, query);
      if (command === "playlist") return playlist(message, client, args);
      if (command === "bassboost") return bassboost(message, client, Number(args[0] ?? 2));
      if (command === "filter") return filter(message, client, args[0] as FilterName);
      if (command === "nightcore") return filter(message, client, "nightcore");
      if (command === "vaporwave") return filter(message, client, "vaporwave");
      if (command === "speed") return speed(message, client, Number(args[0]));
      if (command === "pitch") return pitch(message, client, Number(args[0]));
      if (command === "247") return twentyFourSeven(message, client, args[0]);
      if (command === "radio") return radio(message, client, args[0]);
      if (command === "premium") return premium(message, args);
      if (command === "settings") return settings(message, args);
      if (["help", "yardim", "yardım"].includes(command)) return help(message, client);
      if (["stats", "istatistik"].includes(command)) return stats(message, client);
      if (["top", "sirala"].includes(command)) return top(message, args[0]);
    } catch (error) {
      client.emit("error", error as Error);
      await message.reply({ embeds: [errorEmbed("Komut calistirilirken beklenmeyen bir hata olustu.")] });
    }
  }
};

function voiceId(message: Message): string | null {
  return message.member?.voice.channelId ?? null;
}

function player(message: Message, client: MusicClient) {
  return client.kazagumo.players.get(message.guildId!);
}

async function sameVoice(message: Message, current?: any): Promise<boolean> {
  const voice = voiceId(message);
  if (!voice) {
    await message.reply({ embeds: [errorEmbed("Bir ses kanalina katilmalisin.")] });
    return false;
  }
  if (current?.voiceId && current.voiceId !== voice) {
    await message.reply({ embeds: [errorEmbed("Botla ayni ses kanalinda olmalisin.")] });
    return false;
  }
  return true;
}

async function getOrCreate(message: Message, client: MusicClient) {
  const existing = player(message, client);
  if (existing) {
    existing.textId = message.channelId;
    return existing;
  }

  const settings = await getGuildSettings(message.guildId!);
  const created = await client.kazagumo.createPlayer({
    guildId: message.guildId!,
    textId: message.channelId,
    voiceId: voiceId(message)!,
    volume: settings.defaultVolume ?? env.DEFAULT_VOLUME,
    deaf: true
  });
  created.data.set("twentyFourSeven", settings.twentyFourSeven);
  created.data.set("autoplay", settings.autoplay);
  return created;
}

async function play(message: Message, client: MusicClient, query: string) {
  if (!query) return message.reply({ embeds: [errorEmbed(`Kullanim: \`${env.BOT_PREFIX}play sarki adi veya URL\``)] });
  if (!(await sameVoice(message, player(message, client)))) return;
  const current = await getOrCreate(message, client);
  const result = await searchMusic(client, normalizeMusicQuery(query), message.author).catch(() => null);
  if (!result) return message.reply({ embeds: [errorEmbed("Arama zaman asimina ugradi. Biraz sonra tekrar dene.")] });
  if (!result.tracks.length) return message.reply({ embeds: [errorEmbed("Sonuc bulunamadi.")] });
  if (result.type === "PLAYLIST") {
    const queued = addTracksToQueue(current, result.tracks, { maxTracks: env.MAX_PLAYLIST_TRACKS });
    await startPlayerIfIdle(current);
    return message.reply({ embeds: [successEmbed(playlistAddMessage(queued.added, queued.skipped))] });
  }
  const track = smartRankTracks(result.tracks, query)[0];
  const queued = addTracksToQueue(current, [track]);
  if (!queued.added) {
    try {
      current.queue.add(track);
    } catch {
      return message.reply({ embeds: [errorEmbed("Sarki siraya eklenemedi. Biraz sonra tekrar dene.")] });
    }
  }
  const card = await createAddedCard({
    title: track.title,
    subtitle: track.author ?? "Siraya eklendi",
    thumbnail: (track as any).thumbnail ?? (track as any).artworkUrl ?? null,
    label: "Siraya eklendi"
  });
  const reply = await message.reply({
    files: [new AttachmentBuilder(card, { name: "track-added.png" })],
    components: [playerControls(), playerUtilityControls(), filterMenu()]
  });
  current.data.set("pendingNowPlayingMessage", reply);
  await startPlayerIfIdle(current);
  return reply;
}

async function join(message: Message, client: MusicClient) {
  if (!(await sameVoice(message))) return;
  await getOrCreate(message, client);
  return message.reply({ embeds: [successEmbed("Ses kanalina katildim.")] });
}

async function leave(message: Message, client: MusicClient) {
  const current = player(message, client);
  if (!current) return message.reply({ embeds: [errorEmbed("Aktif oynatici yok.")] });
  current.queue.clear();
  current.destroy();
  return message.reply({ embeds: [successEmbed("Ses kanalindan ayrildim.")] });
}

async function stop(message: Message, client: MusicClient) {
  const current = player(message, client);
  if (!(await sameVoice(message, current))) return;
  if (!current) return message.reply({ embeds: [errorEmbed("Aktif oynatici yok.")] });
  current.queue.clear();
  current.destroy();
  return message.reply({ embeds: [successEmbed("Muzik durduruldu ve sira temizlendi.")] });
}

async function skip(message: Message, client: MusicClient) {
  const current = player(message, client);
  if (!(await sameVoice(message, current))) return;
  if (!current) return message.reply({ embeds: [errorEmbed("Aktif oynatici yok.")] });
  if (playerHasLiveRadio(current) && !current.queue.length) {
    current.queue.clear();
    current.destroy();
    return message.reply({ embeds: [successEmbed("Canli radyo durduruldu. Yeni yayin secerek tekrar baslatabilirsin.")] });
  }
  current.skip();
  return message.reply({ embeds: [successEmbed("Siradaki sarkiya gecildi.")] });
}

async function previous(message: Message, client: MusicClient) {
  const current = player(message, client);
  if (!(await sameVoice(message, current))) return;
  const previousTrack = current?.data.get("previous");
  if (!current || !previousTrack) return message.reply({ embeds: [errorEmbed("Onceki sarki bulunamadi.")] });
  current.queue.unshift(previousTrack);
  current.skip();
  return message.reply({ embeds: [successEmbed("Onceki sarkiya gecildi.")] });
}

async function pause(message: Message, client: MusicClient) {
  const current = player(message, client);
  if (!current) return message.reply({ embeds: [errorEmbed("Aktif oynatici yok.")] });
  current.pause(true);
  return message.reply({ embeds: [successEmbed("Muzik duraklatildi.")] });
}

async function resume(message: Message, client: MusicClient) {
  const current = player(message, client);
  if (!current) return message.reply({ embeds: [errorEmbed("Aktif oynatici yok.")] });
  current.pause(false);
  return message.reply({ embeds: [successEmbed("Muzik devam ediyor.")] });
}

async function queue(message: Message, client: MusicClient, page: number) {
  const current = player(message, client);
  if (!current) return message.reply({ embeds: [errorEmbed("Aktif oynatici yok.")] });
  const tracks = Array.from(current.queue ?? []) as any[];
  const size = env.QUEUE_PAGE_SIZE;
  const pages = Math.max(1, Math.ceil(tracks.length / size));
  const safePage = Number.isFinite(page) ? Math.min(Math.max(page, 1), pages) : 1;
  const start = (safePage - 1) * size;
  const card = await createQueueCard(current.queue.current, tracks.slice(start, start + size), safePage, pages);
  return message.reply({
    files: [new AttachmentBuilder(card, { name: "queue.png" })],
    components: [playerControls(), playerUtilityControls(), filterMenu()]
  });
}

async function nowplaying(message: Message, client: MusicClient) {
  const current = player(message, client);
  const track = current?.queue.current;
  if (!current || !track) return message.reply({ embeds: [errorEmbed("Su anda muzik calmiyor.")] });
  const position = Number(current.position ?? 0);
  const length = Number(track.length ?? 0);
  const upcoming = Array.from(current.queue ?? []).slice(0, 4);
  const requester = track.requester as any;
  const card = await createNowPlayingCard(track, position, upcoming, {
    volume: Number(current.volume ?? 0),
    loop: String(current.loop ?? "off"),
    filters: current.data?.get("activeFilters") ?? [],
    requesterName: requester?.username ?? requester?.tag ?? message.author.username,
    requesterAvatar: requester?.displayAvatarURL?.({ extension: "png", size: 128 }) ?? message.author.displayAvatarURL({ extension: "png", size: 128 }),
    guildName: message.guild?.name,
    radioStation: current.data?.get("radioStation") ?? (track as any).radio ?? null
  });
  const attachment = new AttachmentBuilder(card, { name: "now-playing.png" });
  return message.reply({
    embeds: [baseEmbed().setTitle("Simdi caliyor").setImage("attachment://now-playing.png")],
    files: [attachment],
    components: [playerControls(), playerUtilityControls(), filterMenu()]
  });
}

async function volume(message: Message, client: MusicClient, level: number) {
  const current = player(message, client);
  if (!current) return message.reply({ embeds: [errorEmbed("Aktif oynatici yok.")] });
  if (!Number.isFinite(level)) return message.reply({ embeds: [successEmbed(`Ses seviyesi: **${current.volume}%**`)] });
  const safeLevel = Math.min(Math.max(Math.trunc(level), 1), env.MAX_VOLUME);
  current.setVolume(safeLevel);
  return message.reply({ embeds: [successEmbed(`Ses seviyesi **${safeLevel}%** yapildi.`)] });
}

async function shuffle(message: Message, client: MusicClient) {
  const current = player(message, client);
  if (!current?.queue.length) return message.reply({ embeds: [errorEmbed("Karistirilacak sarki yok.")] });
  current.queue.shuffle();
  return message.reply({ embeds: [successEmbed("Sira karistirildi.")] });
}

async function clearQueue(message: Message, client: MusicClient) {
  const current = player(message, client);
  if (!(await sameVoice(message, current))) return;
  if (!current) return message.reply({ embeds: [errorEmbed("Aktif oynatici yok.")] });
  if (!current.queue.length) return message.reply({ embeds: [errorEmbed("Temizlenecek sarki yok.")] });
  const removed = current.queue.length;
  current.queue.clear();
  return message.reply({ embeds: [successEmbed(`Sira temizlendi. **${removed}** sarki kaldirildi.`)] });
}

async function loop(message: Message, client: MusicClient, mode = "none") {
  const current = player(message, client);
  if (!current) return message.reply({ embeds: [errorEmbed("Aktif oynatici yok.")] });
  const safeMode = resolveLoopMode(mode.toLowerCase());
  current.setLoop(safeMode);
  return message.reply({ embeds: [successEmbed(`Loop modu: **${safeMode}**`)] });
}

async function seek(message: Message, client: MusicClient, input?: string) {
  const current = player(message, client);
  const ms = input ? parseTime(input) : null;
  if (!current || !ms) return message.reply({ embeds: [errorEmbed(`Kullanim: \`${env.BOT_PREFIX}seek 1m30s\``)] });
  current.seek(ms);
  return message.reply({ embeds: [successEmbed("Sarki konumu guncellendi.")] });
}

async function remove(message: Message, client: MusicClient, position: number) {
  const current = player(message, client);
  const index = position - 1;
  if (!current || !Number.isInteger(index) || index < 0 || index >= current.queue.length) {
    return message.reply({ embeds: [errorEmbed("Gecerli bir sira numarasi gir.")] });
  }
  const [removed] = current.queue.splice(index, 1);
  return message.reply({ embeds: [successEmbed(`Kaldirildi: **${removed.title}**`)] });
}

async function autoplay(message: Message, client: MusicClient, input = "") {
  const current = player(message, client);
  if (!current) return message.reply({ embeds: [errorEmbed("Aktif oynatici yok.")] });
  const enabled = ["on", "ac", "aç", "true", "1"].includes(input.toLowerCase());
  current.data.set("autoplay", enabled);
  await setGuildSetting(message.guildId!, { autoplay: enabled });
  return message.reply({ embeds: [successEmbed(`Autoplay **${enabled ? "acildi" : "kapatildi"}**.`)] });
}

async function replay(message: Message, client: MusicClient) {
  const current = player(message, client);
  if (!current?.queue.current) return message.reply({ embeds: [errorEmbed("Calan sarki yok.")] });
  current.seek(0);
  return message.reply({ embeds: [successEmbed("Sarki bastan baslatildi.")] });
}

async function lyrics(message: Message, client: MusicClient, query: string) {
  const current = player(message, client);
  const search = query || current?.queue.current?.title;
  if (!search) return message.reply({ embeds: [errorEmbed("Aranacak sarki bulunamadi.")] });
  const found = await findLyrics(search, current?.queue.current ?? undefined);
  if (!found) return message.reply({ embeds: [errorEmbed("Sarki sozu bulunamadi.")] });
  return message.reply({
    embeds: [baseEmbed().setTitle(`Lyrics: ${found.title}`).setFooter({ text: found.source }).setDescription(found.lyrics.slice(0, 3900))]
  });
}

async function playlist(message: Message, client: MusicClient, args: string[]) {
  const sub = resolvePlaylistSubcommand(args[0]?.toLowerCase());
  const name = args[1]?.toLowerCase();
  if (sub === "create" && name) {
    await Playlist.create({ userId: message.author.id, name, tracks: [] });
    return message.reply({ embeds: [successEmbed(`Playlist olusturuldu: **${name}**`)] });
  }
  if (sub === "list") {
    const lists = await Playlist.find({ userId: message.author.id }).lean();
    return message.reply({ embeds: [baseEmbed().setTitle("Playlistlerin").setDescription(lists.map((p) => `**${p.name}** - ${p.tracks.length} sarki`).join("\n") || "Playlist yok.")] });
  }
  const saved = name ? await Playlist.findOne({ userId: message.author.id, name }) : null;
  if (!saved) return message.reply({ embeds: [errorEmbed(`Kullanim: \`${env.BOT_PREFIX}playlist create|add-current|list|load isim\``)] });
  if (sub === "add-current") {
    const track = player(message, client)?.queue.current;
    if (!track) return message.reply({ embeds: [errorEmbed("Calan sarki yok.")] });
    saved.tracks.push({ title: track.title, uri: track.uri ?? track.realUri ?? track.title, author: track.author, length: track.length, thumbnail: track.thumbnail });
    await saved.save();
    return message.reply({ embeds: [successEmbed(`**${track.title}** playlist'e eklendi.`)] });
  }
  if (sub === "load") {
    const current = player(message, client) ?? (voiceId(message) ? await getOrCreate(message, client) : null);
    if (!current) return message.reply({ embeds: [errorEmbed("Bir ses kanalina katilmalisin.")] });
    const tracks = [];
    for (const track of saved.tracks) {
      const result = await client.kazagumo.search(track.uri, { requester: message.author }).catch(() => null);
      if (result?.tracks[0]) tracks.push(result.tracks[0]);
    }
    const queued = addTracksToQueue(current, tracks, { maxTracks: env.MAX_PLAYLIST_TRACKS });
    await startPlayerIfIdle(current);
    return message.reply({ embeds: [successEmbed(playlistAddMessage(queued.added, queued.skipped))] });
  }
  return message.reply({ embeds: [errorEmbed(`Kullanim: \`${env.BOT_PREFIX}playlist create|add-current|list|load isim\``)] });
}

async function bassboost(message: Message, client: MusicClient, level: number) {
  const current = player(message, client);
  if (!current) return message.reply({ embeds: [errorEmbed("Aktif oynatici yok.")] });
  applyFilter(current, "bassboost", Number.isFinite(level) ? Math.min(Math.max(level, 1), 5) : 2);
  return message.reply({ embeds: [successEmbed("Bassboost uygulandi.")] });
}

async function filter(message: Message, client: MusicClient, name: FilterName = "clear") {
  const current = player(message, client);
  if (!current) return message.reply({ embeds: [errorEmbed("Aktif oynatici yok.")] });
  const resolved = resolveFilterName(name.toLowerCase());
  const safe = ["clear", "bassboost", "nightcore", "vaporwave", "karaoke", "tremolo", "vibrato"].includes(resolved) ? resolved : "clear";
  applyFilter(current, safe as FilterName);
  return message.reply({ embeds: [successEmbed(`Filtre uygulandi: **${safe}**`)] });
}

async function speed(message: Message, client: MusicClient, value: number) {
  const current = player(message, client);
  if (!current || !Number.isFinite(value)) return message.reply({ embeds: [errorEmbed(`Kullanim: \`${env.BOT_PREFIX}speed 1.2\``)] });
  const safe = Math.min(Math.max(value, 0.5), 2);
  applyTimescale(current, { speed: safe, pitch: 1, rate: 1 });
  return message.reply({ embeds: [successEmbed(`Hiz **${safe}x** yapildi.`)] });
}

async function pitch(message: Message, client: MusicClient, value: number) {
  const current = player(message, client);
  if (!current || !Number.isFinite(value)) return message.reply({ embeds: [errorEmbed(`Kullanim: \`${env.BOT_PREFIX}pitch 1.2\``)] });
  const safe = Math.min(Math.max(value, 0.5), 2);
  applyTimescale(current, { speed: 1, pitch: safe, rate: 1 });
  return message.reply({ embeds: [successEmbed(`Pitch **${safe}x** yapildi.`)] });
}

async function twentyFourSeven(message: Message, client: MusicClient, input = "") {
  if (!(await hasPremiumByIds(message.author.id, message.guildId))) {
    return message.reply({ embeds: [errorEmbed("Bu komut premium uyelik gerektirir.")] });
  }
  if (!voiceId(message)) return message.reply({ embeds: [errorEmbed("Bir ses kanalina katilmalisin.")] });
  const enabled = ["on", "ac", "aç", "true", "1"].includes(input.toLowerCase());
  const current = player(message, client);
  current?.data.set("twentyFourSeven", enabled);
  await setGuildSetting(message.guildId!, {
    twentyFourSeven: enabled,
    voiceChannelId: enabled ? voiceId(message) : undefined,
    textChannelId: enabled ? message.channelId : undefined
  });
  return message.reply({ embeds: [successEmbed(`24/7 modu **${enabled ? "acildi" : "kapatildi"}**.`)] });
}

async function radio(message: Message, client: MusicClient, input = "") {
  const value = input.toLowerCase();
  const category = radioCategories.includes(value as RadioCategory) ? (value as RadioCategory) : null;
  if (!value || category) {
    const stations = category ? getStationsByCategory(category) : radioStations;
    return message.reply({
      embeds: [
        baseEmbed()
          .setTitle("Canli Radyo Kontrol Merkezi")
          .setDescription(
            `Katalogda **${radioStations.length}** istasyon var. Asagidaki combobox listesinden sec.\n` +
              (category ? `Filtre: **${category}** | Bu kategoride **${stations.length}** istasyon.` : `Kategori: ${radioCategories.map((item) => `\`${item}\``).join(", ")}`)
          )
      ],
      components: radioSelectRows(stations)
    });
  }

  const station = getRadioStation(value);
  if (!station) {
    return message.reply({
      embeds: [
        errorEmbed(`Radyo bulunamadi. Listeyi acmak icin \`${env.BOT_PREFIX}radyo\`, kategori icin \`${env.BOT_PREFIX}radyo turkce\` yaz.`)
      ]
    });
  }
  if (!(await sameVoice(message, player(message, client)))) return;
  const current = await getOrCreate(message, client);
  const track = await startLiveRadioStation(client, current, station, message.author);
  if (!track) return message.reply({ embeds: [errorEmbed("Radyo yayini acilamadi. Stream su anda cevap vermiyor olabilir.")] });
  const card = await createRadioCard(station, message.guild?.name);
  return message.reply({
    embeds: [successEmbed(`**${station.name}** canli yayini baslatildi.`)],
    files: [new AttachmentBuilder(card, { name: "live-radio.png" })],
    components: [playerControls(), playerUtilityControls(), filterMenu()]
  });
}

async function premium(message: Message, args: string[]) {
  const sub = resolvePremiumSubcommand(args[0]?.toLowerCase());

  if (!sub || sub === "info" || sub === "fiyat" || sub === "prices") {
    return message.reply({
      embeds: [
        baseEmbed()
          .setTitle("Premium")
          .setDescription("Kesintisiz muzik ve reklamsiz deneyim icin premium satin alabilirsin.")
          .addFields(
            { name: "30 Gunluk", value: "84 TL", inline: true },
            { name: "Infinity", value: "Suresiz premium", inline: true }
          )
      ]
    });
  }

  if (sub === "redeem" || sub === "kod") {
    const code = args[1];
    if (!code) return message.reply({ embeds: [errorEmbed(`Kullanim: \`${env.BOT_PREFIX}premium redeem KOD\``)] });
    const status = await redeemPremiumCode(code, message.author.id, message.guildId);
    if (status === "invalid") return message.reply({ embeds: [errorEmbed("Premium kodu gecersiz.")] });
    if (status === "used") return message.reply({ embeds: [errorEmbed("Bu premium kodu daha once kullanilmis.")] });
    return message.reply({ embeds: [successEmbed("Premium kodu kullanildi. Artik reklamsiz dinleyebilirsin.")] });
  }

  if (!ownerIds.includes(message.author.id)) return message.reply({ embeds: [errorEmbed("Bu komut sadece bot sahibine aciktir.")] });
  const targetId = args[1];
  const type = args[2] as "user" | "guild" | undefined;
  if (!targetId) return message.reply({ embeds: [errorEmbed(`Kullanim: \`${env.BOT_PREFIX}premium grant|revoke id user|guild\``)] });
  if (sub === "revoke") {
    await Premium.deleteMany({ targetId });
    return message.reply({ embeds: [successEmbed("Premium kaldirildi.")] });
  }
  if (sub === "grant" && (type === "user" || type === "guild")) {
    await Premium.findOneAndUpdate({ targetId, type }, { targetId, type }, { upsert: true });
    return message.reply({ embeds: [successEmbed("Premium tanimlandi.")] });
  }
  return message.reply({ embeds: [errorEmbed(`Kullanim: \`${env.BOT_PREFIX}premium grant|revoke id user|guild\``)] });
}

async function settings(message: Message, args: string[]) {
  if (!message.member?.permissions.has(PermissionFlagsBits.ManageGuild)) {
    return message.reply({ embeds: [errorEmbed("Bu komut Sunucuyu Yonet yetkisi gerektirir.")] });
  }

  const key = args[0]?.toLowerCase();
  const value = args.slice(1).join(" ");
  const patch: Record<string, unknown> = {};

  if (["default-volume", "varsayilan-ses", "varsayılan-ses", "ses"].includes(key)) {
    const volume = Number(args[1]);
    if (!Number.isFinite(volume) || volume < 1 || volume > env.MAX_VOLUME) {
      return message.reply({ embeds: [errorEmbed(`Kullanim: \`${env.BOT_PREFIX}ayarlar varsayilan-ses 70\``)] });
    }
    patch.defaultVolume = Math.trunc(volume);
  } else if (["dj-role", "dj-rol", "dj-rolu", "dj-rolü"].includes(key)) {
    const role = message.mentions.roles.first() ?? message.guild?.roles.cache.get(args[1]);
    if (!role) return message.reply({ embeds: [errorEmbed(`Kullanim: \`${env.BOT_PREFIX}ayarlar dj-rol @Rol\``)] });
    patch.djRoleId = role.id;
  } else if (["language", "dil"].includes(key)) {
    const language = value.toLowerCase();
    if (!["tr", "en", "turkce", "türkçe", "english"].includes(language)) {
      return message.reply({ embeds: [errorEmbed(`Kullanim: \`${env.BOT_PREFIX}ayarlar dil tr\``)] });
    }
    patch.language = language === "en" || language === "english" ? "en" : "tr";
  } else {
    return message.reply({
      embeds: [errorEmbed(`Kullanim: \`${env.BOT_PREFIX}ayarlar varsayilan-ses 70\`, \`${env.BOT_PREFIX}ayarlar dj-rol @Rol\`, \`${env.BOT_PREFIX}ayarlar dil tr\``)]
    });
  }

  await setGuildSetting(message.guildId!, patch);
  return message.reply({ embeds: [successEmbed("Ayarlar guncellendi.")] });
}

async function help(message: Message, client: MusicClient) {
  return message.reply({
    embeds: [
      baseEmbed()
        .setTitle("Muzik Bot Yardim")
        .setDescription(`Prefix: \`${env.BOT_PREFIX}\`\nAktif player: **${client.kazagumo.players.size}**`)
        .addFields(
          { name: "Kuyruk", value: "`clear/temizle`" },
          { name: "Temel", value: "`play/çal`, `pause/duraklat`, `resume/devam`, `skip/geç`, `previous/önceki`, `stop/durdur`, `join/katıl`, `leave/ayrıl`" },
          { name: "Sira", value: "`queue/sıra`, `nowplaying/çalan`, `shuffle/karıştır`, `loop/döngü`, `seek/sar`, `remove/kaldır`, `replay/tekrar`, `volume/ses`" },
          { name: "Kalite", value: "`bassboost/bas`, `filter/filtre`, `nightcore`, `vaporwave`, `speed/hız`, `pitch/perde`, `lyrics/sözler`" },
          { name: "Sistem", value: "`playlist/çalma-listesi`, `autoplay/otomatik`, `247`, `radio/radyo`, `top/sıralama`, `stats/istatistik`, `settings/ayarlar`" }
        )
    ]
  });
}

async function stats(message: Message, client: MusicClient) {
  const memory = process.memoryUsage();
  const uptime = Math.floor(process.uptime());
  return message.reply({
    embeds: [
      baseEmbed()
        .setTitle("Bot Durumu")
        .addFields(
          { name: "Sunucu", value: String(client.guilds.cache.size), inline: true },
          { name: "Player", value: String(client.kazagumo.players.size), inline: true },
          { name: "Ping", value: `${Math.round(client.ws.ping)}ms`, inline: true },
          { name: "RAM", value: `${Math.round(memory.rss / 1024 / 1024)} MB`, inline: true },
          { name: "Uptime", value: `${Math.floor(uptime / 3600)}s ${Math.floor((uptime % 3600) / 60)}d`, inline: true }
        )
    ]
  });
}

async function top(message: Message, type = "tracks") {
  const safeType = resolveTopType(type.toLowerCase());
  const rows = safeType === "users" ? await getTopUsers(message.guildId!) : await getTopTracks(message.guildId!);
  if (!rows.length) return message.reply({ embeds: [errorEmbed("Henuz istatistik yok.")] });

  const description = rows
    .map((row, index) => {
      if (safeType === "users") return `**${index + 1}.** <@${row._id}> - ${row.plays} dinleme`;
      return `**${index + 1}.** ${row.title} - ${row.plays} dinleme`;
    })
    .join("\n");

  return message.reply({
    embeds: [baseEmbed().setTitle(safeType === "users" ? "En Aktif Dinleyiciler" : "En Cok Dinlenenler").setDescription(description)]
  });
}

function playlistAddMessage(added: number, skipped: number): string {
  if (!added) return "Kuyruk dolu oldugu icin playlist eklenemedi.";
  return skipped > 0
    ? `Playlist tek seferde siraya eklendi. **${added}** sarki eklendi, limit nedeniyle **${skipped}** sarki atlandi.`
    : `Playlist tek seferde siraya eklendi. **${added}** sarki.`;
}
