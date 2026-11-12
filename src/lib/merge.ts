import { isRecord, safeUrl } from './guards';
import { MAX_PHOTOS, type JsonObject, type JsonValue } from './types';

/* Checks stored overrides against the shape of the default content.ts.
   Anything with the wrong type, an unknown key or an unsafe link is dropped,
   so a broken or hostile JSON can never break the page. */

const BLOCKED_TOP = new Set(['recipientName', 'birthdayDate', 'creatorName', 'instagram', 'instagramUrl', 'music']);
const RELATIONSHIPS = ['partner', 'crush', 'best-friend', 'someone-special'];
const ANIMALS = ['teddy', 'bunny', 'cat', 'bear'];
const ART = ['teddy', 'sunflower', 'kitten', 'cocoa', 'moon', 'flowers', 'pocketStar', 'song', 'home'];
const MAX_TEXT = 6000;
const MAX_ITEMS = 60;

// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
export const cleanText = (s: string, max = MAX_TEXT): string => s.replace(CONTROL, '').slice(0, max);

type Rule = (v: unknown) => JsonValue | undefined;

const oneOf =
  (list: string[], fallback?: string): Rule =>
  (v) =>
    typeof v === 'string' && list.includes(v) ? v : fallback;

const urlOrEmpty: Rule = (v) => {
  if (v === '') return '';
  return safeUrl(v) ?? undefined;
};

const photosRule: Rule = (v) => {
  if (!Array.isArray(v)) return undefined;
  const out: JsonValue[] = [];
  for (const item of v.slice(0, MAX_PHOTOS)) {
    if (!isRecord(item)) continue;
    const src = safeUrl(item.src);
    if (!src) continue;
    const photo: JsonObject = { src, caption: typeof item.caption === 'string' ? cleanText(item.caption, 200) : '' };
    if (typeof item.alt === 'string' && item.alt) photo.alt = cleanText(item.alt, 200);
    out.push(photo);
  }
  return out;
};

const memoriesRule: Rule = (v) => {
  if (!Array.isArray(v)) return undefined;
  const out: JsonValue[] = [];
  for (const item of v.slice(0, MAX_PHOTOS)) {
    if (!isRecord(item)) continue;
    out.push({
      title: typeof item.title === 'string' ? cleanText(item.title, 120) : '',
      text: typeof item.text === 'string' ? cleanText(item.text, 600) : '',
    });
  }
  return out;
};

const RULES: Record<string, Rule> = {
  relationship: oneOf(RELATIONSHIPS),
  animal: oneOf(ANIMALS),
  accentColor: (v) => (typeof v === 'string' && (v === '' || /^#[0-9a-fA-F]{6}$/.test(v)) ? v : undefined),
  'gift.videoSrc': urlOrEmpty,
  'gift.songLink': urlOrEmpty,
  'scrapbook.photos': photosRule,
  'scrapbook.memories': memoriesRule,
  'comparisons.cards[].art': oneOf(ART, 'teddy'),
  chapterTitles: (v) =>
    Array.isArray(v) && v.length === 13 && v.every((x) => typeof x === 'string')
      ? (v as string[]).map((x) => cleanText(x, 80))
      : undefined,
};

function emptyLike(def: unknown): JsonValue {
  if (typeof def === 'string') return '';
  if (typeof def === 'number') return 0;
  if (typeof def === 'boolean') return false;
  if (Array.isArray(def)) return [];
  return {};
}

function sanitizeObject(def: Record<string, unknown>, raw: Record<string, unknown>, path: string, fill: boolean): JsonObject {
  const out: JsonObject = {};
  for (const key of Object.keys(def)) {
    if (path === '' && BLOCKED_TOP.has(key)) continue;
    const childPath = path === '' ? key : `${path}.${key}`;
    if (!Object.prototype.hasOwnProperty.call(raw, key)) {
      if (fill) out[key] = emptyLike(def[key]);
      continue;
    }
    const s = sanitizeValue(def[key], raw[key], childPath);
    if (s !== undefined) out[key] = s;
    else if (fill) out[key] = emptyLike(def[key]);
  }
  return out;
}

function sanitizeValue(def: unknown, val: unknown, path: string): JsonValue | undefined {
  const rule = RULES[path];
  if (rule) return rule(val);
  if (typeof def === 'string') return typeof val === 'string' ? cleanText(val) : undefined;
  if (typeof def === 'boolean') return typeof val === 'boolean' ? val : undefined;
  if (typeof def === 'number') return typeof val === 'number' && Number.isFinite(val) ? val : undefined;
  if (Array.isArray(def)) {
    if (def.length === 0 || !Array.isArray(val) || val.length > MAX_ITEMS) return undefined;
    const out: JsonValue[] = [];
    for (const item of val) {
      const proto: unknown = def[0];
      let s: JsonValue | undefined;
      if (isRecord(proto)) s = isRecord(item) ? sanitizeObject(proto, item, `${path}[]`, true) : undefined;
      else s = sanitizeValue(proto, item, `${path}[]`);
      if (s !== undefined) out.push(s);
    }
    return out.length > 0 ? out : undefined; // an empty list would break a chapter: keep the default
  }
  if (isRecord(def)) return isRecord(val) ? sanitizeObject(def, val, path, false) : undefined;
  return undefined;
}

/** Returns a clean copy of `raw`, containing only valid overrides of `defaults`. */
export function sanitizeOverrides(defaults: Record<string, unknown>, raw: unknown): JsonObject {
  return isRecord(raw) ? sanitizeObject(defaults, raw, '', false) : {};
}

/** Copies overrides over the target in place (objects merge, arrays and text are replaced). */
export function mergeInto(target: Record<string, unknown>, over: JsonObject): void {
  for (const key of Object.keys(over)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
    const o = over[key];
    const t = target[key];
    if (isRecord(t) && isRecord(o)) mergeInto(t, o as JsonObject);
    else target[key] = o;
  }
}
