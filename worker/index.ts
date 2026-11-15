// 사이트는 정적 파일만 내보낸다. 이 Worker는 GitHub 예약 실행이 몇 시간씩 밀리는 문제를 피하려고
// Cron Trigger로 새 에피소드 검사 워크플로(rebuild.yml)를 정해진 시간마다 실행한다
export default {
  fetch(request, env) {
    return env.ASSETS.fetch(request);
  },

  async scheduled(_controller, env) {
    const response = await fetch(
      'https://api.github.com/repos/DaleJule/dalejule.com/actions/workflows/rebuild.yml/dispatches',
      {
        method: 'POST',
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${env.GITHUB_TOKEN}`,
          'User-Agent': 'dalejule-cron',
          'X-GitHub-Api-Version': '2022-11-28',
        },
        body: JSON.stringify({ ref: 'main' }),
      },
    );
    if (!response.ok) {
      throw new Error(`rebuild.yml dispatch failed: ${response.status} ${await response.text()}`);
    }
  },
} satisfies ExportedHandler<Env>;
