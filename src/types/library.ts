export type WatchHistorySource = {
  type: "library" | "channel" | "history" | "unknown";
  channelId?: string;
};

export type VideoItem = {
  type: "video";
  ytId: string;
  title: string;
  channelName: string;
  thumbnail: string;
  tags: string[];
  addedAt: number; // unix ms
  lastPosition?: number; // seconds
  lastWatchedRatio?: number; // 0–1, saved at playback time
  watchSource?: WatchHistorySource;
};

export type PlaylistChannel = {
  type: "playlist-channel";
  ytPlaylistId: string;
  title: string;
  channelName: string;
  thumbnail: string;
  videoCount: number;
  tags: string[];
  addedAt: number;
};

export type ChannelItem = {
  type: "channel";
  channelId: string;
  title: string;
  thumbnail: string;
  tags: string[];
  addedAt: number;
};

export type LibraryItem = VideoItem | PlaylistChannel | ChannelItem;

export type WatchHistoryItem = {
  ytId: string;
  title: string;
  channelName: string;
  thumbnail: string;
  lastPosition: number;
  lastWatchedRatio: number;
  firstWatchedAt: number;
  lastWatchedAt: number;
  source?: WatchHistorySource;
};

export type WatchProgressInput = {
  ytId: string;
  title: string;
  channelName: string;
  thumbnail: string;
  position: number;
  duration: number;
  lastWatchedRatio?: number;
  preferInputProgress?: boolean;
  source?: WatchHistorySource;
};

export type LoopMode = "off" | "one" | "all";

export type LibrarySettings = {
  theme: "dark" | "light";
  libraryCollapsed: boolean;
  listenMode: boolean;
  sortOrder: "addedAt_desc";
  loopMode: LoopMode;
};

export type LibraryData = {
  items: LibraryItem[];
  archivedItems: LibraryItem[];
  watchHistory: WatchHistoryItem[];
  customTags: string[];
  settings: LibrarySettings;
};

// oEmbed response shape
export type YouTubeOEmbedResult = {
  title: string;
  author_name: string;
  thumbnail_url: string;
};

// Normalized result returned from fetchVideoOEmbed
export type VideoMeta = {
  type: "video";
  ytId: string;
  title: string;
  channelName: string;
  thumbnail: string;
};
