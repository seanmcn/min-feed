import type { Handler } from 'aws-lambda';

interface PreviewItem {
  title: string;
  url: string;
  publishedAt: string;
  content: string;
}

interface PreviewResponse {
  success: boolean;
  items?: PreviewItem[];
  error?: string;
  itemCount?: number;
}

export const handler: Handler = async (event): Promise<PreviewResponse> => {
  try {
    // Parse the feed URL from the event
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event;
    const feedUrl = body.feedUrl || body.url;

    if (!feedUrl) {
      return {
        success: false,
        error: 'Missing feedUrl parameter',
      };
    }

    // Fetch and parse the RSS feed
    const items = await fetchAndParseRSS(feedUrl);

    return {
      success: true,
      items: items.slice(0, 20), // Limit to 20 items for preview
      itemCount: items.length,
    };
  } catch (error) {
    console.error('Feed preview error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch feed',
    };
  }
};

// ============ RSS Parsing (copied from rss-poll/rss-parser.ts) ============

async function fetchAndParseRSS(feedUrl: string): Promise<PreviewItem[]> {
  const response = await fetch(feedUrl, {
    headers: {
      'User-Agent': 'NoiseGate/1.0 (RSS Aggregator)',
      Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const text = await response.text();

  // Auto-detect format: Atom feeds have <feed> root, RSS has <rss> or <channel>
  if (text.includes('<feed') && text.includes('<entry')) {
    return parseAtomFeed(text);
  }
  return parseStandardRSS(text);
}

function parseAtomFeed(xml: string): PreviewItem[] {
  const items: PreviewItem[] = [];
  const entryMatches = xml.matchAll(/<entry[^>]*>([\s\S]*?)<\/entry>/gi);

  for (const match of entryMatches) {
    const entry = match[1];
    const title = decodeHtmlEntities(extractTag(entry, 'title') || '');
    const link = extractAtomLink(entry);
    const content = decodeHtmlEntities(extractTag(entry, 'content') || extractTag(entry, 'summary') || '');
    const updated = extractTag(entry, 'updated') || extractTag(entry, 'published') || '';

    if (title && link) {
      items.push({
        title: cleanTitle(title),
        url: link,
        content: stripHtml(content).slice(0, 200),
        publishedAt: parseDate(updated),
      });
    }
  }

  return items;
}

function parseStandardRSS(xml: string): PreviewItem[] {
  const items: PreviewItem[] = [];
  const itemMatches = xml.matchAll(/<item[^>]*>([\s\S]*?)<\/item>/gi);

  for (const match of itemMatches) {
    const item = match[1];
    const title = decodeHtmlEntities(extractTag(item, 'title') || '');
    const link = extractTag(item, 'link') || '';
    const description = decodeHtmlEntities(extractTag(item, 'description') || '');
    const pubDate = extractTag(item, 'pubDate') || '';

    if (title && link) {
      items.push({
        title: cleanTitle(title),
        url: link,
        content: stripHtml(description).slice(0, 200),
        publishedAt: parseDate(pubDate),
      });
    }
  }

  return items;
}

function extractTag(xml: string, tagName: string): string | null {
  const cdataMatch = xml.match(
    new RegExp(`<${tagName}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tagName}>`, 'i')
  );
  if (cdataMatch) {
    return cdataMatch[1].trim();
  }
  const match = xml.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i'));
  return match ? match[1].trim() : null;
}

function extractAtomLink(entry: string): string {
  const alternateMatch = entry.match(/<link[^>]*rel=["']alternate["'][^>]*href=["']([^"']+)["']/i);
  if (alternateMatch) return alternateMatch[1];
  const hrefMatch = entry.match(/<link[^>]*href=["']([^"']+)["']/i);
  if (hrefMatch) return hrefMatch[1];
  return extractTag(entry, 'link') || '';
}

function decodeHtmlEntities(text: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"',
    '&#39;': "'", '&apos;': "'", '&nbsp;': ' ',
  };
  let result = text;
  for (const [entity, char] of Object.entries(entities)) {
    result = result.replace(new RegExp(entity, 'gi'), char);
  }
  result = result.replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)));
  result = result.replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  return result;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function cleanTitle(title: string): string {
  return title.replace(/^\[.*?\]\s*/, '').replace(/^\/r\/\w+\s*[-–—]\s*/, '').trim();
}

function parseDate(dateStr: string): string {
  if (!dateStr) return new Date().toISOString();
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return new Date().toISOString();
    return date.toISOString();
  } catch {
    return new Date().toISOString();
  }
}
