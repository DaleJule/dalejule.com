// 빌드 서버의 시간대와 무관하게 한국 날짜로 표시한다 (예: 2026.10.18)
const dateFormat = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' });

export function formatDate(publishDate: string): string {
  if (!publishDate) return '';
  return dateFormat.format(new Date(publishDate)).replaceAll('-', '.');
}
