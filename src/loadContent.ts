import { content } from './content';
import { isRecord, num, parseMusic, str, strOrNull } from './lib/guards';
import { mergeInto, sanitizeOverrides } from './lib/merge';
import { isConfigured, supabase } from './lib/supabase';
import { isValidSlug } from './lib/slug';
import type { PageData } from './lib/types';

/* The default template (content.ts) is copied once, before anything changes it.
   Loading a page = reset to the defaults, then merge that page's stored text over them,
   by changing the exported `content` object in place. This happens BEFORE <App/> is shown. */

const contentRec = content as unknown as Record<string, unknown>;
const DEFAULTS: Record<string, unknown> = JSON.parse(JSON.stringify(content)) as Record<string, unknown>;

export function resetContent(): void {
  for (const key of Object.keys(DEFAULTS)) {
    contentRec[key] = JSON.parse(JSON.stringify(DEFAULTS[key])) as unknown;
  }
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function formatBirthday(iso: string | null): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso ?? '');
  if (!m) return '';
  const month = MONTHS[Number(m[2]) - 1];
  return month ? `${Number(m[3])} ${month}` : '';
}

export function applyPageData(data: PageData): void {
  resetContent();
  mergeInto(contentRec, sanitizeOverrides(DEFAULTS, data.content));
  const name = data.recipient_name.trim().slice(0, 80);
  if (name) content.recipientName = name;
  const bd = formatBirthday(data.birthday_date);
  if (bd) content.birthdayDate = bd;
  const music = parseMusic(data.music);
  if (music.type !== 'builtin' && music.url) {
    content.music.src = music.url;
    content.music.title = music.title;
  }
  if (/^[a-z]{2,3}(-[A-Za-z]{2,4})?$/.test(data.language)) document.documentElement.lang = data.language;
}

export type LoadResult =
  | { state: 'ok' }
  | { state: 'locked'; unlockAt: number; serverNow: number; fetchedAt: number }
  | { state: 'pin_required' }
  | { state: 'pin_wrong'; retryAfter: number }
  | { state: 'gone' }
  | { state: 'unconfigured' }
  | { state: 'error'; message: string };

function toPageData(r: Record<string, unknown>): PageData {
  return {
    recipient_name: str(r.recipient_name),
    birthday_date: strOrNull(r.birthday_date),
    language: str(r.language, 'en'),
    content: r.content,
    music: r.music,
  };
}

/** Public visitors: asks the get_page() function (PIN, unlock time and expiry are checked on the server). */
export async function loadPage(slug: string, pin?: string): Promise<LoadResult> {
  if (!supabase || !isConfigured) return { state: 'unconfigured' };
  if (!isValidSlug(slug)) return { state: 'gone' };
  const { data, error } = await supabase.rpc('get_page', { p_slug: slug, p_pin: pin ?? null });
  if (error) return { state: 'error', message: error.message };
  const raw: unknown = data;
  if (!isRecord(raw)) return { state: 'error', message: 'Unexpected answer from the server.' };
  switch (raw.state) {
    case 'ok':
      applyPageData(toPageData(raw));
      return { state: 'ok' };
    case 'locked':
      return {
        state: 'locked',
        unlockAt: Date.parse(str(raw.unlock_at)) || 0,
        serverNow: num(raw.server_time, Date.now()),
        fetchedAt: performance.now(),
      };
    case 'pin_required':
      return { state: 'pin_required' };
    case 'pin_wrong':
      return { state: 'pin_wrong', retryAfter: num(raw.retry_after) };
    case 'gone':
      return { state: 'gone' };
    default:
      return { state: 'error', message: 'Unexpected answer from the server.' };
  }
}

/** Logged-in admin only: reads the row directly (works for drafts, ignores lock and PIN). */
export async function loadPreview(slug: string): Promise<LoadResult> {
  if (!supabase) return { state: 'unconfigured' };
  const { data, error } = await supabase
    .from('pages')
    .select('recipient_name,birthday_date,language,content,music')
    .eq('slug', slug)
    .maybeSingle();
  if (error) return { state: 'error', message: error.message };
  const raw: unknown = data;
  if (!isRecord(raw)) return { state: 'gone' };
  applyPageData(toPageData(raw));
  return { state: 'ok' };
}

const counted = new Set<string>();
export function recordView(slug: string): void {
  if (!supabase || counted.has(slug)) return;
  counted.add(slug);
  void supabase.rpc('record_view', { p_slug: slug }).then(
    () => undefined,
    () => undefined,
  );
}

/** Used by the live preview in the admin panel (draft sent by postMessage). */
export function parsePreviewMessage(d: unknown): PageData | null {
  if (!isRecord(d) || d.type !== 'lw-preview' || !isRecord(d.page)) return null;
  return toPageData(d.page);
}
