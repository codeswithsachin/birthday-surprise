import type { SupabaseClient } from '@supabase/supabase-js';
import { content as defaults } from '../content';
import { isRecord, parseMusic, parsePageRow, safeUrl, str } from '../lib/guards';
import { sanitizeOverrides } from '../lib/merge';
import { makeSlug, randomFileId } from '../lib/slug';
import { supabase, supabaseAnonKey, supabaseUrl } from '../lib/supabase';
import { BUCKET, type JsonObject, type JsonValue, type MusicSetting, type PageRow, type PageStatus } from '../lib/types';

const COLS =
  'id,slug,status,recipient_name,birthday_date,unlock_at,expires_at,has_pin,language,content,music,view_count,first_opened_at,last_opened_at,created_at';

function sb(): SupabaseClient {
  if (!supabase) throw new Error('Supabase is not configured.');
  return supabase;
}

/** Fields the editor can change. */
export interface PagePatch {
  status: PageStatus;
  recipient_name: string;
  birthday_date: string | null;
  unlock_at: string | null;
  expires_at: string | null;
  language: string;
  content: JsonObject;
  music: MusicSetting;
}

export async function isAdmin(): Promise<boolean> {
  const { data, error } = await sb().rpc('is_admin');
  if (error) return false;
  return data === true;
}

function rowOrThrow(data: unknown): PageRow {
  const row = parsePageRow(data);
  if (!row) throw new Error('Unexpected answer from the database.');
  return row;
}

export async function listPages(): Promise<PageRow[]> {
  const { data, error } = await sb().from('pages').select(COLS).order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  const list: unknown = data;
  if (!Array.isArray(list)) return [];
  const rows: PageRow[] = [];
  for (const item of list) {
    const r = parsePageRow(item);
    if (r) rows.push(r);
  }
  return rows;
}

export async function getPageById(id: string): Promise<PageRow | null> {
  const { data, error } = await sb().from('pages').select(COLS).eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return parsePageRow(data);
}

export async function createPage(name: string, initial?: Partial<PagePatch>): Promise<PageRow> {
  for (let attempt = 0; attempt < 6; attempt++) {
    const slug = makeSlug(name);
    const { data, error } = await sb()
      .from('pages')
      .insert({
        slug,
        status: 'draft',
        recipient_name: name.trim().slice(0, 80),
        birthday_date: initial?.birthday_date ?? null,
        unlock_at: initial?.unlock_at ?? null,
        expires_at: initial?.expires_at ?? null,
        language: initial?.language ?? 'en',
        content: initial?.content ?? {},
        music: initial?.music ?? { type: 'builtin', url: '', title: '' },
      })
      .select(COLS)
      .single();
    if (!error) return rowOrThrow(data);
    if (error.code !== '23505') throw new Error(error.message); // 23505 = slug already used, try another
  }
  throw new Error('Could not find a free link. Please try again.');
}

export async function savePage(id: string, patch: PagePatch): Promise<PageRow> {
  const { data, error } = await sb().from('pages').update(patch).eq('id', id).select(COLS).single();
  if (error) throw new Error(error.message);
  return rowOrThrow(data);
}

/** Gives the page a brand new random link. The old link stops working. */
export async function changeSlug(id: string, name: string): Promise<string> {
  for (let attempt = 0; attempt < 6; attempt++) {
    const slug = makeSlug(name || 'surprise');
    const { error } = await sb().from('pages').update({ slug }).eq('id', id);
    if (!error) return slug;
    if (error.code !== '23505') throw new Error(error.message);
  }
  throw new Error('Could not find a free link. Please try again.');
}

export async function setStatus(id: string, status: PageStatus): Promise<void> {
  const { error } = await sb().from('pages').update({ status }).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function setPin(id: string, pin: string | null): Promise<void> {
  const { error } = await sb().rpc('set_page_pin', { p_page_id: id, p_pin: pin });
  if (error) throw new Error(error.message);
}

/* ------------------------------------------------------------------ media */

export function publicUrl(path: string): string {
  return sb().storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Turns a public file link back into its storage path, or null if it is not one of ours. */
export function pathFromUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const i = url.indexOf(marker);
  if (i < 0) return null;
  try {
    return decodeURIComponent(url.slice(i + marker.length).split('?')[0] ?? '') || null;
  } catch {
    return null;
  }
}

export async function removeMedia(paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  const { error } = await sb().storage.from(BUCKET).remove(paths);
  if (error) throw new Error(error.message);
}

/** Uploads one file with a real progress callback (0 to 1). Falls back to the library upload if needed. */
export async function uploadMedia(
  pageId: string,
  blob: Blob,
  ext: 'webp' | 'jpg' | 'mp3',
  contentType: string,
  onProgress: (fraction: number) => void,
): Promise<{ path: string; url: string }> {
  const client = sb();
  const path = `${pageId}/${randomFileId()}.${ext}`;
  const { data: sess } = await client.auth.getSession();
  const token = sess.session?.access_token;
  if (!token) throw new Error('You are logged out. Please log in again.');

  const viaXhr = (): Promise<boolean> =>
    new Promise((resolve) => {
      const form = new FormData();
      form.append('cacheControl', '31536000');
      form.append('', blob);
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${supabaseUrl}/storage/v1/object/${BUCKET}/${path}`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.setRequestHeader('apikey', supabaseAnonKey);
      xhr.setRequestHeader('x-upsert', 'false');
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(e.loaded / e.total);
      };
      xhr.onload = () => resolve(xhr.status >= 200 && xhr.status < 300);
      xhr.onerror = () => resolve(false);
      xhr.send(form);
    });

  if (!(await viaXhr())) {
    const { error } = await client.storage.from(BUCKET).upload(path, blob, { contentType, cacheControl: '31536000', upsert: false });
    if (error) throw new Error(error.message);
  }
  onProgress(1);
  return { path, url: publicUrl(path) };
}

async function removeFolder(pageId: string): Promise<void> {
  const store = sb().storage.from(BUCKET);
  const { data, error } = await store.list(pageId, { limit: 1000 });
  if (error) throw new Error(error.message);
  const names = (data ?? []).map((f) => `${pageId}/${f.name}`);
  if (names.length) await removeMedia(names);
}

export async function deletePage(row: PageRow): Promise<void> {
  await removeFolder(row.id); // photos and music first
  const { error } = await sb().from('pages').delete().eq('id', row.id);
  if (error) throw new Error(error.message);
}

/* ------------------------------------------------------------------ duplicate */

function collectUrls(v: JsonValue, out: Set<string>): void {
  if (typeof v === 'string') {
    if (v.startsWith('http')) out.add(v);
  } else if (Array.isArray(v)) v.forEach((x) => collectUrls(x, out));
  else if (v && typeof v === 'object') Object.values(v).forEach((x) => collectUrls(x, out));
}

function replaceUrls(v: JsonValue, map: Map<string, string>): JsonValue {
  if (typeof v === 'string') return map.get(v) ?? v;
  if (Array.isArray(v)) return v.map((x) => replaceUrls(x, map));
  if (v && typeof v === 'object') {
    const out: JsonObject = {};
    for (const [k, x] of Object.entries(v)) out[k] = replaceUrls(x, map);
    return out;
  }
  return v;
}

/** New draft with a new link. Photos and music are COPIED, so deleting one page never breaks the other. */
export async function duplicatePage(row: PageRow): Promise<PageRow> {
  const copy = await createPage(row.recipient_name || 'surprise', {
    birthday_date: row.birthday_date,
    unlock_at: row.unlock_at,
    expires_at: row.expires_at,
    language: row.language,
  });
  const urls = new Set<string>();
  collectUrls(row.content, urls);
  if (row.music.url) urls.add(row.music.url);
  const map = new Map<string, string>();
  for (const url of urls) {
    const path = pathFromUrl(url);
    if (!path || !path.startsWith(`${row.id}/`)) continue;
    const target = `${copy.id}/${path.slice(row.id.length + 1)}`;
    const { error } = await sb().storage.from(BUCKET).copy(path, target);
    if (!error) map.set(url, publicUrl(target));
  }
  return savePage(copy.id, {
    status: 'draft',
    recipient_name: row.recipient_name,
    birthday_date: row.birthday_date,
    unlock_at: row.unlock_at,
    expires_at: row.expires_at,
    language: row.language,
    content: replaceUrls(row.content, map) as JsonObject,
    music: { ...row.music, url: map.get(row.music.url) ?? row.music.url },
  });
}

/* ------------------------------------------------------------------ export / import */

export function exportJson(row: PagePatch & { slug?: string }): string {
  return JSON.stringify(
    {
      app: 'little-world-birthday',
      version: 1,
      page: {
        recipient_name: row.recipient_name,
        birthday_date: row.birthday_date,
        unlock_at: row.unlock_at,
        expires_at: row.expires_at,
        language: row.language,
        content: row.content,
        music: row.music,
      },
    },
    null,
    2,
  );
}

const ISO = /^\d{4}-\d{2}-\d{2}/;
const optDate = (v: unknown): string | null => (typeof v === 'string' && ISO.test(v) && !Number.isNaN(Date.parse(v)) ? v : null);

/** Reads a backup file. Everything is checked; unknown or unsafe parts are dropped. */
export function parseImport(text: string): Partial<PagePatch> & { recipient_name: string } {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error('This file is not valid JSON.');
  }
  if (!isRecord(raw) || raw.app !== 'little-world-birthday' || !isRecord(raw.page)) {
    throw new Error('This is not a backup from this app.');
  }
  const p = raw.page;
  const music = parseMusic(p.music);
  const mUrl = safeUrl(music.url);
  const lang = str(p.language, 'en');
  return {
    recipient_name: str(p.recipient_name).trim().slice(0, 80) || 'surprise',
    birthday_date: optDate(p.birthday_date)?.slice(0, 10) ?? null,
    unlock_at: optDate(p.unlock_at),
    expires_at: optDate(p.expires_at),
    language: /^[a-z]{2,3}(-[A-Za-z]{2,4})?$/.test(lang) ? lang : 'en',
    content: sanitizeOverrides(defaults as unknown as Record<string, unknown>, p.content),
    music: mUrl ? { ...music, url: mUrl } : { type: 'builtin', url: '', title: '' },
  };
}
