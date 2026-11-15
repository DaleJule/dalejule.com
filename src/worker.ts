import { handle } from '@astrojs/cloudflare/handler';
import { refreshPodcastData } from './lib/store';

export default {
  fetch: handle,
  // 새 에피소드, 쇼노트 수정, YouTube 영상을 빌드 없이 반영하도록 피드를 주기적으로 다시 받는다
  async scheduled() {
    await refreshPodcastData();
  },
} satisfies ExportedHandler<Env>;
