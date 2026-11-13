import { useState } from 'react';
import type { ThemePack } from '../content';
import { PACKS } from '../themes';
import { isRecord, str } from '../lib/guards';
import type { JsonValue } from '../lib/types';
import { MOODS, PIECES, type Mood } from './library';
import { defaultAt, getAt } from './paths';
import { useEditor } from './fields';

/* ---------------------------------------------------------------- theme picker */
export function ThemePicker() {
  const { over, setPath } = useEditor();
  const def = str(defaultAt('theme.pack'));
  const o = getAt(over, 'theme.pack');
  const current = typeof o === 'string' ? o : def;
  const pick = (key: ThemePack) => {
    setPath('theme.pack', key === def ? undefined : key);
    const info = PACKS.find((p) => p.key === key);
    if (info?.animal) setPath('animal', info.animal === str(defaultAt('animal')) ? undefined : info.animal);
  };
  return (
    <div className="adm-field">
      <span className="adm-label">Theme (colours and floating animation)</span>
      <div className="adm-themes" role="radiogroup" aria-label="Theme">
        {PACKS.map((p) => (
          <button
            key={p.key}
            type="button"
            role="radio"
            aria-checked={current === p.key}
            className={`adm-theme ${current === p.key ? 'is-on' : ''}`}
            onClick={() => pick(p.key)}
          >
            <span className="adm-theme-emoji" aria-hidden="true">{p.emoji}</span>
            <span className="adm-theme-name">{p.label}</span>
            <span className="adm-theme-dots" aria-hidden="true">
              {p.swatch.map((c) => <i key={c} style={{ background: c }} />)}
            </span>
            {current === p.key && <span className="adm-theme-tick">Selected</span>}
          </button>
        ))}
      </div>
      <small className="adm-help">{PACKS.find((p) => p.key === current)?.blurb}. Pick Cat or Dog and the mascot changes too. Look at the live preview to see it.</small>
    </div>
  );
}

export function CheckField({ path, label, help }: { path: string; label: string; help?: string }) {
  const { over, setPath } = useEditor();
  const def = defaultAt(path) === true;
  const o = getAt(over, path);
  const value = typeof o === 'boolean' ? o : def;
  return (
    <label className="adm-check">
      <input type="checkbox" checked={value} onChange={(e) => setPath(path, e.target.checked === def ? undefined : e.target.checked)} />
      <span>
        {label}
        {help && <small className="adm-help"> {help}</small>}
      </span>
    </label>
  );
}

/* ---------------------------------------------------------------- add ready-made lines to a simple list */
export function QuickAdd({ path, label, lines, onAdded }: { path: string; label: string; lines: string[]; onAdded: () => void }) {
  const { over, setPath } = useEditor();
  const current = (): string[] => {
    const o = getAt(over, path);
    const src = Array.isArray(o) ? o : defaultAt(path);
    return Array.isArray(src) ? src.filter((x): x is string => typeof x === 'string') : [];
  };
  const have = new Set(current());
  const add = (line: string) => {
    const next = [...current(), line].slice(0, 60);
    setPath(path, next);
    onAdded();
  };
  return (
    <details className="adm-lib">
      <summary>{label}</summary>
      <ul className="adm-lib-list">
        {lines.map((l) => (
          <li key={l}>
            <span>{l}</span>
            <button type="button" className="adm-btn adm-btn--small" disabled={have.has(l)} onClick={() => add(l)}>
              {have.has(l) ? 'Added' : 'Add'}
            </button>
          </li>
        ))}
      </ul>
    </details>
  );
}

/* ---------------------------------------------------------------- poems and lines editor */
interface Item {
  kind: 'poem' | 'quote' | 'wish';
  title: string;
  text: string;
  by: string;
}
const KINDS: { value: Item['kind']; label: string }[] = [
  { value: 'poem', label: 'Poem' },
  { value: 'quote', label: 'Line / quote' },
  { value: 'wish', label: 'Wish' },
];

function itemsFrom(v: unknown): Item[] {
  if (!Array.isArray(v)) return [];
  const out: Item[] = [];
  for (const x of v) {
    if (!isRecord(x)) continue;
    const k = str(x.kind);
    out.push({ kind: k === 'quote' || k === 'wish' ? k : 'poem', title: str(x.title), text: str(x.text), by: str(x.by) });
  }
  return out;
}

export function PoemsEditor() {
  const { over, setPath } = useEditor();
  const path = 'poems.items';
  const o = getAt(over, path);
  const overridden = Array.isArray(o);
  const items = overridden ? itemsFrom(o) : itemsFrom(defaultAt(path));
  const [mood, setMood] = useState<Mood | 'all'>('all');
  const [kind, setKind] = useState<'all' | Item['kind']>('all');
  const save = (next: Item[]): void => {
    const clean = next.slice(0, 60).map((i): JsonValue => ({ ...i }));
    setPath(path, clean.length === 0 ? undefined : clean);
  };
  const edit = (i: number, key: keyof Item, v: string) => save(items.map((it, j) => (j === i ? { ...it, [key]: v } : it)));
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    const a = next[i] as Item;
    next[i] = next[j] as Item;
    next[j] = a;
    save(next);
  };
  const shown = PIECES.filter((p) => (mood === 'all' || p.mood === mood) && (kind === 'all' || p.kind === kind));
  const has = new Set(items.map((i) => i.text));
  return (
    <div className="adm-stack">
      <div className="adm-row-between">
        <strong>{items.length} pieces</strong>
        {overridden && (
          <button type="button" className="adm-link" onClick={() => setPath(path, undefined)}>
            Reset to default
          </button>
        )}
      </div>

      {items.map((it, i) => (
        <fieldset className="adm-sub" key={i}>
          <legend>Piece {i + 1}</legend>
          <label className="adm-field">
            <span className="adm-label">Type</span>
            <select className="adm-input" value={it.kind} onChange={(e) => edit(i, 'kind', e.target.value)}>
              {KINDS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
            </select>
          </label>
          <label className="adm-field">
            <span className="adm-label">Title (optional)</span>
            <input className="adm-input" maxLength={80} value={it.title} onChange={(e) => edit(i, 'title', e.target.value)} />
          </label>
          <label className="adm-field">
            <span className="adm-label">Text</span>
            <textarea className="adm-input" rows={6} maxLength={1200} value={it.text} onChange={(e) => edit(i, 'text', e.target.value)} />
            <small className="adm-help">Each new line shows one after another. A blank line makes a gap. You can use {'{name}'}.</small>
          </label>
          <label className="adm-field">
            <span className="adm-label">Signature (optional)</span>
            <input className="adm-input" maxLength={80} value={it.by} placeholder="for example: with love, {creator}" onChange={(e) => edit(i, 'by', e.target.value)} />
          </label>
          <div className="adm-actions">
            <button type="button" className="adm-btn adm-btn--small" disabled={i === 0} onClick={() => move(i, -1)}>Move up</button>
            <button type="button" className="adm-btn adm-btn--small" disabled={i === items.length - 1} onClick={() => move(i, 1)}>Move down</button>
            <button type="button" className="adm-btn adm-btn--small" disabled={items.length <= 1} onClick={() => save(items.filter((_, j) => j !== i))}>Remove</button>
          </div>
        </fieldset>
      ))}

      <button type="button" className="adm-btn" disabled={items.length >= 60} onClick={() => save([...items, { kind: 'poem', title: '', text: '', by: '' }])}>
        Add my own piece
      </button>

      <details className="adm-lib">
        <summary>Add ready-made poems and lines (English)</summary>
        <div className="adm-inline">
          <select className="adm-input" aria-label="Mood" value={mood} onChange={(e) => setMood(e.target.value as Mood | 'all')}>
            {MOODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <select className="adm-input" aria-label="Type" value={kind} onChange={(e) => setKind(e.target.value as 'all' | Item['kind'])}>
            <option value="all">All types</option>
            {KINDS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
          </select>
        </div>
        <ul className="adm-lib-list">
          {shown.map((p) => (
            <li key={p.text}>
              <span>
                <strong>{p.title || (p.kind === 'quote' ? 'Line' : 'Piece')}</strong>
                <br />
                {p.text.split('\n').filter(Boolean).slice(0, 2).join(' / ')}…
              </span>
              <button
                type="button"
                className="adm-btn adm-btn--small"
                disabled={has.has(p.text) || items.length >= 60}
                onClick={() => save([...items, { kind: p.kind, title: p.title, text: p.text, by: '' }])}
              >
                {has.has(p.text) ? 'Added' : 'Add'}
              </button>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
