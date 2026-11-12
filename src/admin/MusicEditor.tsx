import { useRef, useState } from 'react';
import { MAX_AUDIO_BYTES, type MusicSetting } from '../lib/types';
import { pathFromUrl, uploadMedia } from './api';
import type { Notify } from './ui';

export default function MusicEditor({
  pageId,
  music,
  onChange,
  onRemoved,
  notify,
}: {
  pageId: string;
  music: MusicSetting;
  onChange: (m: MusicSetting) => void;
  onRemoved: (path: string) => void;
  notify: Notify;
}) {
  const [rights, setRights] = useState(false);
  const [pct, setPct] = useState<number | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const dropOldFile = () => {
    const old = music.type === 'file' ? pathFromUrl(music.url) : null;
    if (old) onRemoved(old);
  };

  const upload = async (file: File | undefined) => {
    if (!file) return;
    if (!/\.mp3$/i.test(file.name) && file.type !== 'audio/mpeg') {
      notify('Please choose an MP3 file.', 'error');
      return;
    }
    if (file.size > MAX_AUDIO_BYTES) {
      notify('This file is bigger than 8 MB.', 'error');
      return;
    }
    setPct(0);
    try {
      const up = await uploadMedia(pageId, file, 'mp3', 'audio/mpeg', (f) => setPct(Math.round(f * 100)));
      dropOldFile();
      onChange({ type: 'file', url: up.url, title: music.title || file.name.replace(/\.mp3$/i, '').slice(0, 80) });
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Upload failed.', 'error');
    } finally {
      setPct(null);
      if (input.current) input.current.value = '';
    }
  };

  const choose = (type: MusicSetting['type']) => {
    if (type === music.type) return;
    if (music.type === 'file') dropOldFile();
    onChange({ type, url: type === 'builtin' ? '' : type === 'link' ? '' : '', title: type === 'builtin' ? '' : music.title });
  };

  const linkBad = music.type === 'link' && music.url !== '' && !/^https:\/\/\S+$/i.test(music.url);

  return (
    <div className="adm-stack">
      <p className="adm-help">Music never plays by itself. The visitor taps the sound button to start it.</p>
      <div className="adm-radios" role="radiogroup" aria-label="Music">
        {(
          [
            ['builtin', 'Built-in music box'],
            ['file', 'Upload an MP3'],
            ['link', 'Paste a link'],
          ] as const
        ).map(([v, l]) => (
          <label key={v} className={music.type === v ? 'is-on' : ''}>
            <input type="radio" name="music" checked={music.type === v} onChange={() => choose(v)} /> {l}
          </label>
        ))}
      </div>

      {music.type === 'file' && (
        <div className="adm-stack">
          <label className="adm-check">
            <input type="checkbox" checked={rights} onChange={(e) => setRights(e.target.checked)} />I have the right to use this song
          </label>
          <input ref={input} type="file" accept="audio/mpeg,.mp3" hidden onChange={(e) => void upload(e.target.files?.[0])} />
          <button type="button" className="adm-btn" disabled={!rights || pct !== null} onClick={() => input.current?.click()}>
            {music.url ? 'Replace MP3' : 'Choose MP3 (max 8 MB)'}
          </button>
          {pct !== null && (
            <div className="adm-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
              <div style={{ width: `${pct}%` }} />
              <span>Uploading · {pct}%</span>
            </div>
          )}
          {music.url && pct === null && <audio controls preload="none" src={music.url} className="adm-audio" />}
        </div>
      )}

      {music.type === 'link' && (
        <label className="adm-field">
          <span className="adm-label">Direct link to an audio file</span>
          <input
            className={`adm-input ${linkBad ? 'is-bad' : ''}`}
            type="url"
            maxLength={500}
            placeholder="https://example.com/song.mp3"
            value={music.url}
            onChange={(e) => onChange({ ...music, url: e.target.value.trim() })}
          />
          <small className="adm-help">{linkBad ? 'The link must start with https://' : 'It must open an audio file (like .mp3) directly. YouTube or Spotify links cannot play here; use the Gift song link for those.'}</small>
        </label>
      )}

      {music.type !== 'builtin' && (
        <label className="adm-field">
          <span className="adm-label">Song title (shown on the sound button)</span>
          <input className="adm-input" maxLength={80} value={music.title} onChange={(e) => onChange({ ...music, title: e.target.value })} />
        </label>
      )}
    </div>
  );
}
