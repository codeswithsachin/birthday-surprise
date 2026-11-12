const ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789'; // 31 letters, no look-alikes (i, l, o, 0, 1)

/** Random string using crypto.getRandomValues (no modulo bias). */
export function randomString(length: number, alphabet = ALPHABET): string {
  const limit = 256 - (256 % alphabet.length);
  let out = '';
  while (out.length < length) {
    const bytes = new Uint8Array(length * 2);
    crypto.getRandomValues(bytes);
    for (const b of bytes) {
      if (b < limit && out.length < length) out += alphabet[b % alphabet.length];
    }
  }
  return out;
}

export function slugBase(name: string): string {
  const s = name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24)
    .replace(/-+$/g, '');
  return s || 'surprise';
}

/** aanya-k7x2m  (name + 5 random characters) */
export function makeSlug(name: string): string {
  return `${slugBase(name)}-${randomString(5)}`;
}

export function randomFileId(): string {
  return randomString(14, 'abcdefghijklmnopqrstuvwxyz0123456789');
}

export function isValidSlug(s: string): boolean {
  return /^[a-z0-9][a-z0-9-]{2,59}$/.test(s);
}
