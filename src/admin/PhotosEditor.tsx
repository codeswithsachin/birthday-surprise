import { useRef, useState } from 'react';
import { isRecord, str } from '../lib/guards';
import { MAX_PHOTOS, type JsonValue } from '../lib/types';
import { pathFromUrl, uploadMedia } from './api';
import { resizeImage } from './image';
import { getAt } from './paths';
import type { Notify } from './ui';
import { useEditor } from './fields';

export interface PhotoItem {
  src: string;
  caption: string;
}

export function readPhotos(over: unknown): PhotoItem[] {
  const v = getAt(over, 'scrapbook.photos');
  if (!Array.isArray(v)) return [];
  const out: PhotoItem[] = [];
  for (const x of v) if (isRecord(x) && str(x.src)) out.push({ src: str(x.src), caption: str(x.caption) });
  return out;
}

export default function PhotosEditor({
  pageId,
  notify,
  onRemoved,
}: {
  pageId: string;
  notify: Notify;
  /** storage paths to delete after the next successful save */
  onRemoved: (path: string) => void;
}) {
  const { over, setPath } = useEditor();
  const photos = readPhotos(over);
  const [progress, setProgress] = useState<{ done: number; total: number; current: number } | null>(null);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const commit = (list: PhotoItem[]) => setPath('scrapbook.photos', list.map((p) => ({ ...p })) as JsonValue);

  const addFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const room = MAX_PHOTOS - photos.length;
    const chosen = Array.from(files).slice(0, Math.max(0, room));
    if (files.length > room) notify(`Only ${MAX_PHOTOS} photos are allowed. ${files.length - chosen.length} skipped.`, 'error');
    let list = photos;
    let done = 0;
    for (const file of chosen) {
      setProgress({ done, total: chosen.length, current: 0 });
      try {
        const img = await resizeImage(file);
        const up = await uploadMedia(pageId, img.blob, img.ext, img.contentType, (f) => setProgress({ done, total: chosen.length, current: f }));
        list = [...list, { src: up.url, caption: '' }];
        commit(list);
      } catch (e) {
        notify(e instanceof Error ? e.message : 'Upload failed.', 'error');
      }
      done += 1;
    }
    setProgress(null);
    if (input.current) input.current.value = '';
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= photos.length || from === to) return;
    const list = [...photos];
    const [item] = list.splice(from, 1);
    if (item) list.splice(to, 0, item);
    commit(list);
  };

  const remove = (i: number) => {
    const p = photos[i];
    if (!p) return;
    const path = pathFromUrl(p.src);
    if (path) onRemoved(path);
    commit(photos.filter((_, j) => j !== i));
  };

  const pct = progress ? Math.round(((progress.done + progress.current) / progress.total) * 100) : 0;

  return (
    <div className="adm-stack">
      <p className="adm-help">
        Up to {MAX_PHOTOS} photos. They are shrunk to 1400 px and saved as WebP before upload. Drag to reorder, or use the arrows.
        {photos.length === 0 && ' With no photos, the cute illustrated placeholders are shown.'}
      </p>
      <ul className="adm-photos">
        {photos.map((p, i) => (
          <li
            key={p.src}
            className={`adm-photo ${dragFrom === i ? 'is-drag' : ''}`}
            draggable
            onDragStart={() => setDragFrom(i)}
            onDragEnd={() => setDragFrom(null)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (dragFrom !== null) move(dragFrom, i);
              setDragFrom(null);
            }}
          >
            <img src={p.src} alt="" loading="lazy" />
            <div className="adm-photo-side">
              <input
                className="adm-input"
                maxLength={200}
                value={p.caption}
                placeholder="Caption (optional)"
                aria-label={`Caption for photo ${i + 1}`}
                onChange={(e) => commit(photos.map((x, j) => (j === i ? { ...x, caption: e.target.value } : x)))}
              />
              <div className="adm-photo-btns">
                <button type="button" className="adm-btn adm-btn--small" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label="Move earlier">
                  ↑
                </button>
                <button type="button" className="adm-btn adm-btn--small" onClick={() => move(i, i + 1)} disabled={i === photos.length - 1} aria-label="Move later">
                  ↓
                </button>
                <button type="button" className="adm-btn adm-btn--small adm-btn--danger" onClick={() => remove(i)}>
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {progress && (
        <div className="adm-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
          <div style={{ width: `${pct}%` }} />
          <span>
            Uploading {Math.min(progress.done + 1, progress.total)} of {progress.total} · {pct}%
          </span>
        </div>
      )}
      <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => void addFiles(e.target.files)} />
      <button type="button" className="adm-btn" disabled={progress !== null || photos.length >= MAX_PHOTOS} onClick={() => input.current?.click()}>
        + Add photos ({photos.length}/{MAX_PHOTOS})
      </button>
    </div>
  );
}
