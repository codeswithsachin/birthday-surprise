import type { JsonObject, JsonValue, MusicSetting, PageRow } from './types';

export function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}
export const str = (v: unknown, fallback = ''): string => (typeof v === 'string' ? v : fallback);
export const strOrNull = (v: unknown): string | null => (typeof v === 'string' && v ? v : null);
export const num = (v: unknown, fallback = 0): number => (typeof v === 'number' && Number.isFinite(v) ? v : fallback);

export function isJsonObject(v: unknown): v is JsonObject {
  return isRecord(v);
}
export function toJsonObject(v: unknown): JsonObject {
  return isRecord(v) ? (v as JsonObject) : {};
}
export function cloneJson<T extends JsonValue>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

/** Only https links (or a site-relative path) are allowed for media and links. */
export function safeUrl(u: unknown): string | null {
  if (typeof u !== 'string') return null;
  const s = u.trim();
  if (!s || s.length > 1000) return null;
  if (s.startsWith('/') && !s.startsWith('//')) return s;
  try {
    const url = new URL(s);
    return url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
}

export function parseMusic(v: unknown): MusicSetting {
  if (!isRecord(v)) return { type: 'builtin', url: '', title: '' };
  const type = v.type === 'file' || v.type === 'link' ? v.type : 'builtin';
  const url = type === 'builtin' ? '' : (safeUrl(v.url) ?? '');
  return { type: url ? type : 'builtin', url, title: str(v.title).slice(0, 120) };
}

export function parsePageRow(u: unknown): PageRow | null {
  if (!isRecord(u)) return null;
  const id = str(u.id);
  const slug = str(u.slug);
  if (!id || !slug) return null;
  return {
    id,
    slug,
    status: u.status === 'published' ? 'published' : 'draft',
    recipient_name: str(u.recipient_name),
    birthday_date: strOrNull(u.birthday_date),
    unlock_at: strOrNull(u.unlock_at),
    expires_at: strOrNull(u.expires_at),
    has_pin: u.has_pin === true,
    language: str(u.language, 'en'),
    content: toJsonObject(u.content),
    music: parseMusic(u.music),
    view_count: num(u.view_count),
    first_opened_at: strOrNull(u.first_opened_at),
    last_opened_at: strOrNull(u.last_opened_at),
    created_at: str(u.created_at),
  };
}
