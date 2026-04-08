export const STORAGE_KEY = "myvidtv_library";

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
