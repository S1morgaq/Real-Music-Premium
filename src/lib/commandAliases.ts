export const PREFIX_COMMAND_ALIASES = new Map<string, string>([
  ["cal", "play"],
  ["çal", "play"],
  ["oynat", "play"],
  ["katil", "join"],
  ["katıl", "join"],
  ["gir", "join"],
  ["ayril", "leave"],
  ["ayrıl", "leave"],
  ["cik", "leave"],
  ["çık", "leave"],
  ["durdur", "stop"],
  ["bitir", "stop"],
  ["gec", "skip"],
  ["geç", "skip"],
  ["atla", "skip"],
  ["onceki", "previous"],
  ["önceki", "previous"],
  ["geri", "previous"],
  ["duraklat", "pause"],
  ["beklet", "pause"],
  ["devam", "resume"],
  ["surdur", "resume"],
  ["sürdür", "resume"],
  ["sira", "queue"],
  ["sıra", "queue"],
  ["kuyruk", "queue"],
  ["calan", "nowplaying"],
  ["çalan", "nowplaying"],
  ["simdicalan", "nowplaying"],
  ["şimdiçalan", "nowplaying"],
  ["ses", "volume"],
  ["sesayarla", "volume"],
  ["karistir", "shuffle"],
  ["temizle", "clear"],
  ["sirayi-temizle", "clear"],
  ["sırayı-temizle", "clear"],
  ["kuyruk-temizle", "clear"],
  ["karıştır", "shuffle"],
  ["dongu", "loop"],
  ["döngü", "loop"],
  ["tekrar-modu", "loop"],
  ["sar", "seek"],
  ["ileri", "seek"],
  ["kaldir", "remove"],
  ["kaldır", "remove"],
  ["sil", "remove"],
  ["otomatik", "autoplay"],
  ["otoynat", "autoplay"],
  ["tekrar", "replay"],
  ["bastan", "replay"],
  ["baştan", "replay"],
  ["sozler", "lyrics"],
  ["sözler", "lyrics"],
  ["sarki-sozu", "lyrics"],
  ["şarkı-sözü", "lyrics"],
  ["liste", "playlist"],
  ["calma-listesi", "playlist"],
  ["çalma-listesi", "playlist"],
  ["bas", "bassboost"],
  ["basartir", "bassboost"],
  ["basartır", "bassboost"],
  ["filtre", "filter"],
  ["hiz", "speed"],
  ["hız", "speed"],
  ["perde", "pitch"],
  ["radyo", "radio"],
  ["abonelik", "premium"],
  ["uyelik", "premium"],
  ["üyelik", "premium"],
  ["ayarlar", "settings"],
  ["ayar", "settings"],
  ["yardim", "help"],
  ["yardım", "help"],
  ["komutlar", "help"],
  ["istatistik", "stats"],
  ["durum", "stats"],
  ["sirala", "top"],
  ["sırala", "top"],
  ["siralama", "top"],
  ["sıralama", "top"]
]);

export const PLAYLIST_SUBCOMMAND_ALIASES = new Map<string, string>([
  ["olustur", "create"],
  ["oluştur", "create"],
  ["ekle", "add-current"],
  ["calani-ekle", "add-current"],
  ["çalanı-ekle", "add-current"],
  ["calan-ekle", "add-current"],
  ["listele", "list"],
  ["yukle", "load"],
  ["yükle", "load"]
]);

export const PREMIUM_SUBCOMMAND_ALIASES = new Map<string, string>([
  ["bilgi", "info"],
  ["fiyat", "info"],
  ["fiyatlar", "info"],
  ["kod", "redeem"],
  ["kullan", "redeem"],
  ["ver", "grant"],
  ["tanimla", "grant"],
  ["tanımla", "grant"],
  ["kaldir", "revoke"],
  ["kaldır", "revoke"],
  ["sil", "revoke"]
]);

export const LOOP_MODE_ALIASES = new Map<string, "none" | "track" | "queue">([
  ["kapali", "none"],
  ["kapalı", "none"],
  ["yok", "none"],
  ["sarki", "track"],
  ["şarkı", "track"],
  ["parca", "track"],
  ["parça", "track"],
  ["sira", "queue"],
  ["sıra", "queue"],
  ["kuyruk", "queue"]
]);

export const FILTER_ALIASES = new Map<string, string>([
  ["temizle", "clear"],
  ["kapat", "clear"],
  ["bas", "bassboost"],
  ["basartir", "bassboost"],
  ["basartır", "bassboost"]
]);

export const TOP_TYPE_ALIASES = new Map<string, "tracks" | "users">([
  ["sarkilar", "tracks"],
  ["şarkılar", "tracks"],
  ["parcalar", "tracks"],
  ["parçalar", "tracks"],
  ["kullanicilar", "users"],
  ["kullanıcılar", "users"],
  ["uyeler", "users"],
  ["üyeler", "users"]
]);

export function resolvePrefixCommand(command: string): string {
  return PREFIX_COMMAND_ALIASES.get(command) ?? command;
}

export function resolvePlaylistSubcommand(subcommand = ""): string {
  return PLAYLIST_SUBCOMMAND_ALIASES.get(subcommand) ?? subcommand;
}

export function resolvePremiumSubcommand(subcommand = ""): string {
  return PREMIUM_SUBCOMMAND_ALIASES.get(subcommand) ?? subcommand;
}

export function resolveLoopMode(mode = "none"): "none" | "track" | "queue" {
  return LOOP_MODE_ALIASES.get(mode) ?? (["none", "track", "queue"].includes(mode) ? (mode as "none" | "track" | "queue") : "none");
}

export function resolveFilterName(name = "clear"): string {
  return FILTER_ALIASES.get(name) ?? name;
}

export function resolveTopType(type = "tracks"): "tracks" | "users" {
  return TOP_TYPE_ALIASES.get(type) ?? (type === "users" ? "users" : "tracks");
}

export const TURKISH_SLASH_NAMES: Record<string, string> = {
  "247": "247",
  autoplay: "otomatik",
  bassboost: "bas",
  clear: "temizle",
  filter: "filtre",
  help: "yardım",
  join: "katıl",
  leave: "ayrıl",
  loop: "döngü",
  lyrics: "sözler",
  nightcore: "nightcore",
  nowplaying: "çalan",
  pause: "duraklat",
  pitch: "perde",
  play: "çal",
  playlist: "çalma-listesi",
  premium: "premium",
  previous: "önceki",
  queue: "sıra",
  radio: "radyo",
  remove: "kaldır",
  replay: "tekrar",
  resume: "devam",
  seek: "sar",
  settings: "ayarlar",
  shuffle: "karıştır",
  skip: "geç",
  speed: "hız",
  stats: "istatistik",
  stop: "durdur",
  top: "sıralama",
  vaporwave: "vaporwave",
  volume: "ses"
};

export const TURKISH_SLASH_OPTION_NAMES: Record<string, string> = {
  "add-current": "çalanı-ekle",
  code: "kod",
  create: "oluştur",
  "default-volume": "varsayılan-ses",
  duration: "süre",
  enabled: "durum",
  grant: "ver",
  info: "bilgi",
  language: "dil",
  level: "seviye",
  list: "listele",
  load: "yükle",
  mode: "mod",
  name: "ad",
  page: "sayfa",
  position: "sıra",
  query: "arama",
  redeem: "kod-kullan",
  revoke: "kaldır",
  station: "istasyon",
  category: "kategori",
  target: "hedef",
  time: "zaman",
  type: "tip",
  value: "değer"
};

export function applyTurkishSlashLocalizations(command: any): any {
  const localized = { ...command };
  localizeName(localized);
  if (Array.isArray(localized.options)) {
    localized.options = localized.options.map((option: any) => localizeOption(option));
  }
  return localized;
}

function localizeOption(option: any): any {
  const localized = { ...option };
  localizeName(localized, TURKISH_SLASH_OPTION_NAMES);
  if (Array.isArray(localized.options)) {
    localized.options = localized.options.map((nested: any) => localizeOption(nested));
  }
  return localized;
}

function localizeName(target: any, source = TURKISH_SLASH_NAMES): void {
  const trName = source[target.name];
  if (!trName) return;
  target.name_localizations = { ...(target.name_localizations ?? {}), tr: trName };
}
