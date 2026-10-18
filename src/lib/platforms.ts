import applePodcasts from '../icons/apple-podcasts.svg?raw';
import spotify from '../icons/spotify.svg?raw';
import youtube from '../icons/youtube.svg?raw';
import podbbang from '../icons/podbbang.svg?raw';
import rss from '../icons/rss.svg?raw';
import { RSS_URL } from './rss';

// 아이콘은 fill="currentColor"라서 <img>가 아닌 인라인 SVG로 넣어야 글자색을 따른다
export const platforms = [
  { name: 'Apple Podcasts', shortName: 'Apple', url: 'https://dales.link/applepodcast', icon: applePodcasts },
  { name: 'Spotify', shortName: 'Spotify', url: 'https://open.spotify.com/show/0b6RO7JD2DgGxVGRHN701H', icon: spotify },
  { name: 'YouTube', shortName: 'YouTube', url: 'https://www.youtube.com/playlist?list=PLapoeRAdKitf4M7HOGIDzwNtsfo6ZqO8W', icon: youtube },
  { name: '팟빵', shortName: '팟빵', url: 'https://www.podbbang.com/channels/1784466/', icon: podbbang },
];

export const rssFeed = { name: 'RSS', url: RSS_URL, icon: rss };
