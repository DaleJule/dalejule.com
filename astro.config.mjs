import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  adapter: cloudflare(),
  session: false,
  image: {
    // RSS 피드의 에피소드 아트가 호스팅되는 도메인
    remotePatterns: [{ protocol: 'https', hostname: 'd3t3ozftmdmh3i.cloudfront.net' }],
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
