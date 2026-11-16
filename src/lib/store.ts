import { env } from 'cloudflare:workers';
import { fetchPodcastData, type PodcastData } from './rss';

const KEY = 'podcast';

// 페이지는 Cron이 KV에 저장해 둔 피드를 읽는다. 첫 배포 직후처럼 비어 있으면 바로 받아 채운다
export async function getPodcastData(): Promise<PodcastData> {
  return (await env.PODCAST.get<PodcastData>(KEY, 'json')) ?? refreshPodcastData();
}

export async function refreshPodcastData(): Promise<PodcastData> {
  const [fresh, current] = await Promise.all([
    fetchPodcastData(env.YOUTUBE_API_KEY),
    env.PODCAST.get<PodcastData>(KEY, 'json'),
  ]);
  const json = JSON.stringify(fresh);
  if (json !== JSON.stringify(current)) {
    await env.PODCAST.put(KEY, json);
  }
  return fresh;
}
