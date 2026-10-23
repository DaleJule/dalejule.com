export interface PodcastMeta {
  title: string;
  description: string;
  imageUrl: string;
  author: string;
}

export interface Chapter {
  /** 시작 시각(초) */
  start: number;
  /** 피드에 적힌 그대로의 표기 (예: 00:18:04) */
  time: string;
  title: string;
}

export interface Episode {
  guid: string;
  episodeNumber: number;
  title: string;
  description: string;
  descriptionHtml: string;
  publishDate: string;
  duration: string;
  imageUrl: string;
  audioUrl: string;
  listenUrl: string;
  chapters: Chapter[];
}
