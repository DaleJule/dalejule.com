import { XMLParser } from 'fast-xml-parser';
import type { PodcastMeta, Episode } from './types';

const RSS_URL = 'https://anchor.fm/s/9cd202e8/podcast/rss';

function formatDuration(duration: string | number): string {
  if (!duration) return '';

  const str = String(duration).trim();

  // Already in H:MM:SS or MM:SS format
  if (str.includes(':')) return str;

  // Pure seconds number
  const secs = parseInt(str, 10);
  if (isNaN(secs)) return str;

  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;

  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

function toText(val: unknown): string {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  if (typeof val === 'object') {
    const obj = val as Record<string, unknown>;
    if (obj.__cdata) return String(obj.__cdata);
    if (obj['#text']) return String(obj['#text']);
  }
  return String(val);
}

function stripHtml(html: unknown): string {
  return toText(html).replace(/<[^>]*>/g, '').trim();
}

function autoLink(text: string): string {
  return text.replace(
    /(https?:\/\/[^\s<>"]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
  );
}

function processDescriptionHtml(raw: unknown): string {
  const html = toText(raw);
  if (!html) return '';

  // Split by </p> to get individual block contents
  const blocks = html
    .split(/<\/p>/i)
    .map((b) => b.replace(/<p[^>]*>/i, '').trim())
    .filter(Boolean);

  const parts: string[] = [];
  const listItems: string[] = [];

  function flushList() {
    if (listItems.length > 0) {
      parts.push(`<ul>${listItems.map((li) => `<li>${li}</li>`).join('')}</ul>`);
      listItems.length = 0;
    }
  }

  for (const block of blocks) {
    // Skip empty blocks like <br> only
    const textOnly = block.replace(/<[^>]*>/g, '').trim();
    if (!textOnly) continue;

    if (textOnly.startsWith('## ')) {
      flushList();
      parts.push(`<h2>${autoLink(textOnly.slice(3))}</h2>`);
    } else if (textOnly.startsWith('### ')) {
      flushList();
      parts.push(`<h3>${autoLink(textOnly.slice(4))}</h3>`);
    } else if (textOnly.startsWith('- ')) {
      listItems.push(autoLink(textOnly.slice(2)));
    } else {
      flushList();
      // Preserve inline HTML (bold, etc.) but auto-link plain URLs not already in href
      const linkedBlock = block.replace(/(https?:\/\/[^\s<>"]+)(?![^<]*>)/g, (url) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
      });
      parts.push(`<p>${linkedBlock}</p>`);
    }
  }
  flushList();

  // If no blocks were parsed (plain text input), treat whole text as paragraphs
  if (parts.length === 0) {
    return html
      .split(/\n\n+/)
      .filter(Boolean)
      .map((p) => `<p>${autoLink(p.trim())}</p>`)
      .join('');
  }

  return parts.join('');
}

export async function getPodcastData(): Promise<{ meta: PodcastMeta; episodes: Episode[] }> {
  const response = await fetch(RSS_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch RSS feed: ${response.status}`);
  }
  const xml = await response.text();

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    cdataPropName: '__cdata',
    processEntities: { maxTotalExpansions: 10000 },
  });

  const result = parser.parse(xml);
  const channel = result.rss.channel;

  const meta: PodcastMeta = {
    title: toText(channel.title) || '달레줄레',
    description: stripHtml(channel.description),
    imageUrl: toText(channel?.image?.url) || toText(channel?.['itunes:image']?.['@_href']) || '',
    author: toText(channel?.['itunes:author']) || '',
  };

  const items: any[] = Array.isArray(channel.item) ? channel.item : [channel.item];
  const total = items.length;

  const episodes: Episode[] = items.map((item: any, index: number) => {
    const rawDesc = item?.['itunes:summary'] || item?.description || '';

    return {
      guid: toText(item?.guid) || String(index),
      episodeNumber: total - index,
      title: toText(item?.title),
      description: stripHtml(rawDesc),
      descriptionHtml: processDescriptionHtml(rawDesc),
      publishDate: toText(item?.pubDate),
      duration: formatDuration(item?.['itunes:duration'] || ''),
      audioUrl: item?.enclosure?.['@_url'] || '',
      listenUrl: toText(item?.link) || item?.enclosure?.['@_url'] || '',
    };
  });

  return { meta, episodes };
}
