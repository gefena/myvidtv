export type WatchHistorySource = {
  type: "library" | "channel" | "podcast" | "history" | "unknown";
  channelId?: string;
  feedUrl?: string;
  audioUrl?: string;
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

export type PodcastItem = {
  type: "podcast";
  feedUrl: string;
  title: string;
  author: string;
  thumbnail: string;
  episodeCount: number;
  tags: string[];
  addedAt: number;
};

export type PodcastEpisodeItem = {
  type: "podcast-episode";
  episodeId: string;
  podcastFeedUrl: string;
  title: string;
  podcastTitle: string;
  audioUrl: string;
  thumbnail: string;
  publishedAt: string;
  duration?: string;
  tags: string[];
  addedAt: number;
  lastPosition?: number;
  lastWatchedRatio?: number;
  watchSource?: WatchHistorySource;
};

export type LibraryItem = VideoItem | PlaylistChannel | ChannelItem | PodcastItem | PodcastEpisodeItem;

export type WatchHistoryItem = {
  mediaType?: "youtube" | "podcast";
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
  mediaType?: "youtube" | "podcast";
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
