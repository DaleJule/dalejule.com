// 빌드 서버의 시간대와 무관하게 한국 날짜로 표시한다 (예: 2026.10.18)
const dateFormat = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' });

export function formatDate(publishDate: string): string {
  if (!publishDate) return '';
  return dateFormat.format(new Date(publishDate)).replaceAll('-', '.');
}

// "01:32:18" 또는 "32:18" → 초
export function toSeconds(timestamp: string): number {
  return timestamp.split(':').reduce((total, part) => total * 60 + Number(part), 0);
}

// 초 → "01:32:18" (withHours가 false면 "32:18")
export function formatTime(seconds: number, withHours: boolean): string {
  const s = Math.max(0, Math.floor(seconds));
  const pad = (n: number) => String(n).padStart(2, '0');
  const mmss = `${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
  return withHours ? `${pad(Math.floor(s / 3600))}:${mmss}` : mmss;
}
