export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
export type JsonObject = { [key: string]: JsonValue };

export type PageStatus = 'draft' | 'published';
export type MusicType = 'builtin' | 'file' | 'link';

export interface MusicSetting {
  type: MusicType;
  url: string;
  title: string;
}

export interface PageRow {
  id: string;
  slug: string;
  status: PageStatus;
  recipient_name: string;
  birthday_date: string | null; // 'YYYY-MM-DD'
  unlock_at: string | null; // ISO
  expires_at: string | null; // ISO
  has_pin: boolean;
  language: string;
  content: JsonObject;
  music: MusicSetting;
  view_count: number;
  first_opened_at: string | null;
  last_opened_at: string | null;
  created_at: string;
}

/** What the surprise page needs to show itself. */
export interface PageData {
  recipient_name: string;
  birthday_date: string | null;
  language: string;
  content: unknown;
  music: unknown;
}

export const MAX_PHOTOS = 12;
export const MAX_AUDIO_BYTES = 8 * 1024 * 1024;
export const BUCKET = 'birthday-media';
