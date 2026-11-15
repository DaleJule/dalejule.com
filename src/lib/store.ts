import { env } from 'cloudflare:workers';
import { fetchPodcastData, type PodcastData } from './rss';

const KEY = 'podcast';

// 페이지는 Cron이 KV에 저장해 둔 피드를 읽는다. 첫 배포 직후처럼 비어 있으면 바로 받아 채운다
export async function getPodcastData(): Promise<PodcastData> {
  return (await env.PODCAST.get<PodcastData>(KEY, 'json')) ?? refreshPodcastData();
}

// 피드 CDN은 엣지마다 최대 7일간 캐시되어 최신 에피소드가 빠진 스냅샷을 줄 때가 있다.
// 에피소드가 줄어든 피드는 저장하지 않고 지금 데이터를 유지한다
export async function refreshPodcastData(): Promise<PodcastData> {
  const [fresh, current] = await Promise.all([
    fetchPodcastData(env.YOUTUBE_API_KEY),
    env.PODCAST.get<PodcastData>(KEY, 'json'),
  ]);
  if (current && fresh.episodes.length < current.episodes.length) {
    console.warn(`Ignoring a stale feed: ${fresh.episodes.length} episodes, ${current.episodes.length} stored`);
    return current;
  }
  const json = JSON.stringify(fresh);
  if (json !== JSON.stringify(current)) {
    await env.PODCAST.put(KEY, json);
  }
  return fresh;
}
