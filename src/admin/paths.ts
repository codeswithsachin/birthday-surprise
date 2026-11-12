import { content as defaults } from '../content';
import { isRecord } from '../lib/guards';
import type { JsonObject, JsonValue } from '../lib/types';

export function getAt(obj: unknown, path: string): unknown {
  let cur: unknown = obj;
  for (const key of path.split('.')) {
    if (!isRecord(cur)) return undefined;
    cur = cur[key];
  }
  return cur;
}

export const defaultAt = (path: string): unknown => getAt(defaults, path);

/** Returns a new object with `path` set. A value of undefined removes it (and tidies empty parents). */
export function setAt(obj: JsonObject, path: string, value: JsonValue | undefined): JsonObject {
  const [head, ...rest] = path.split('.');
  if (!head) return obj;
  const out: JsonObject = { ...obj };
  if (rest.length === 0) {
    if (value === undefined) delete out[head];
    else out[head] = value;
    return out;
  }
  const child = out[head];
  const next = setAt(isRecord(child) ? (child as JsonObject) : {}, rest.join('.'), value);
  if (Object.keys(next).length === 0) delete out[head];
  else out[head] = next;
  return out;
}

export function toLocalInput(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function fromLocalInput(s: string): string | null {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}
