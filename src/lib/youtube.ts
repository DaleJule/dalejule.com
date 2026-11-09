import { YOUTUBE_API_KEY } from 'astro:env/server';

const PLAYLIST_ID = 'PLapoeRAdKitf4M7HOGIDzwNtsfo6ZqO8W';
export const YOUTUBE_PLAYLIST_URL = `https://www.youtube.com/playlist?list=${PLAYLIST_ID}`;

type PlaylistItemsResponse = {
  nextPageToken?: string;
  items: { snippet: { title: string; resourceId: { videoId: string } } }[];
};

// 재생 목록의 영상 제목이 RSS 에피소드 제목과 같으므로 제목을 키로 영상 URL을 돌려준다
export async function fetchYouTubeVideoUrls(): Promise<Map<string, string>> {
  const urls = new Map<string, string>();
  if (!YOUTUBE_API_KEY) {
    console.warn('YOUTUBE_API_KEY is not set. Episodes will link to the YouTube playlist.');
    return urls;
  }

  let pageToken: string | undefined;
  do {
    const params = new URLSearchParams({
      part: 'snippet',
      playlistId: PLAYLIST_ID,
      maxResults: '50',
      key: YOUTUBE_API_KEY,
    });
    if (pageToken) params.set('pageToken', pageToken);

    const response = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?${params}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch YouTube playlist: ${response.status}`);
    }
    const data: PlaylistItemsResponse = await response.json();
    for (const { snippet } of data.items) {
      urls.set(snippet.title, `https://www.youtube.com/watch?v=${snippet.resourceId.videoId}`);
    }
    pageToken = data.nextPageToken;
  } while (pageToken);

  return urls;
}
