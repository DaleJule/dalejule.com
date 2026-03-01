export interface PodcastMeta {
  title: string;
  description: string;
  imageUrl: string;
  author: string;
}

export interface Episode {
  guid: string;
  episodeNumber: number;
  title: string;
  description: string;
  descriptionHtml: string;
  publishDate: string;
  duration: string;
  audioUrl: string;
  listenUrl: string;
}
