export type Route =
  | { kind: 'home' }
  | { kind: 'admin' }
  | { kind: 'surprise'; slug: string; preview: boolean };

export function parseRoute(pathname: string, search: string): Route {
  const parts = pathname.split('/').filter(Boolean);
  if (parts[0] === 'admin') return { kind: 'admin' };
  if (parts[0] === 'w' && parts[1]) {
    let slug = parts[1];
    try {
      slug = decodeURIComponent(slug);
    } catch {
      /* keep raw */
    }
    return { kind: 'surprise', slug: slug.toLowerCase(), preview: new URLSearchParams(search).get('preview') === '1' };
  }
  return { kind: 'home' };
}
