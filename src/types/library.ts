export type VideoItem = {
  type: "video";
  ytId: string;
  title: string;
  channelName: string;
  thumbnail: string;
  tags: string[];
  addedAt: number; // unix ms
  lastPosition?: number; // seconds
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

export type LibraryItem = VideoItem | PlaylistChannel;

export type LibrarySettings = {
  theme: "dark" | "light";
  libraryCollapsed: boolean;
  listenMode: boolean;
  sortOrder: "addedAt_desc";
};

export type LibraryData = {
  items: LibraryItem[];
  archivedItems: LibraryItem[];
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
