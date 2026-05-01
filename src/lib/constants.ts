export const STORAGE_KEY = "myvidtv_library";
export const FEED_CACHE_KEY = "myvidtv_channel_feed_cache";

export const PREDEFINED_TAGS = [
  "music",
  "tech",
  "news",
  "comedy",
  "documentary",
  "sports",
  "education",
  "art",
  "gaming",
  "cooking",
  "fitness",
  "talk",
  "focus",
] as const;

export const DEFAULT_SETTINGS = {
  theme: "dark" as const,
  libraryCollapsed: false,
  listenMode: false,
  sortOrder: "addedAt_desc" as const,
  loopMode: "off" as const,
};
