import { createContext, useContext, useState } from 'react';
import { isRecord, str } from '../lib/guards';
import type { JsonObject, JsonValue } from '../lib/types';
import { defaultAt, getAt } from './paths';

interface EditorCtx {
  over: JsonObject;
  setPath: (path: string, value: JsonValue | undefined) => void;
}
export const EditorContext = createContext<EditorCtx>({ over: {}, setPath: () => undefined });
export const useEditor = () => useContext(EditorContext);

function ResetBtn({ show, onClick }: { show: boolean; onClick: () => void }) {
  if (!show) return null;
  return (
    <button type="button" className="adm-link" onClick={onClick}>
      Reset to default
    </button>
  );
}

function Row({ label, help, reset, children }: { label: string; help?: string; reset?: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="adm-field">
      <span className="adm-label">
        {label}
        {reset}
      </span>
      {children}
      {help ? <small className="adm-help">{help}</small> : null}
    </label>
  );
}

export function TextField({
  path,
  label,
  help,
  multiline,
  rows = 4,
  maxLength = 2000,
  placeholder,
}: {
  path: string;
  label: string;
  help?: string;
  multiline?: boolean;
  rows?: number;
  maxLength?: number;
  placeholder?: string;
}) {
  const { over, setPath } = useEditor();
  const def = str(defaultAt(path));
  const o = getAt(over, path);
  const overridden = typeof o === 'string';
  const value = overridden ? o : def;
  const change = (v: string) => setPath(path, v === def ? undefined : v);
  const reset = <ResetBtn show={overridden} onClick={() => setPath(path, undefined)} />;
  return (
    <Row label={label} help={help} reset={reset}>
      {multiline ? (
        <textarea className="adm-input" rows={rows} maxLength={maxLength} value={value} placeholder={placeholder} onChange={(e) => change(e.target.value)} />
      ) : (
        <input className="adm-input" type="text" maxLength={maxLength} value={value} placeholder={placeholder} onChange={(e) => change(e.target.value)} />
      )}
    </Row>
  );
}

export function UrlField({ path, label, help, placeholder }: { path: string; label: string; help?: string; placeholder?: string }) {
  const { over, setPath } = useEditor();
  const def = str(defaultAt(path));
  const o = getAt(over, path);
  const overridden = typeof o === 'string';
  const value = overridden ? o : def;
  const bad = value.trim() !== '' && !/^https:\/\/\S+$/i.test(value.trim());
  return (
    <Row label={label} help={bad ? 'The link must start with https://' : help} reset={<ResetBtn show={overridden} onClick={() => setPath(path, undefined)} />}>
      <input
        className={`adm-input ${bad ? 'is-bad' : ''}`}
        type="url"
        inputMode="url"
        maxLength={500}
        value={value}
        placeholder={placeholder ?? 'https://…'}
        onChange={(e) => setPath(path, e.target.value.trim() === def ? undefined : e.target.value.trim())}
      />
    </Row>
  );
}

function listFrom(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
}

export function ListField({
  path,
  label,
  help,
  paragraphs,
  rows = 8,
}: {
  path: string;
  label: string;
  help?: string;
  paragraphs?: boolean; // paragraphs are separated by a blank line, otherwise one per line
  rows?: number;
}) {
  const { over, setPath } = useEditor();
  const defList = listFrom(defaultAt(path));
  const sep = paragraphs ? '\n\n' : '\n';
  const o = getAt(over, path);
  const overridden = Array.isArray(o);
  const [text, setText] = useState(() => (Array.isArray(o) ? listFrom(o) : defList).join(sep));
  const parse = (t: string): string[] =>
    (paragraphs ? t.split(/\n\s*\n/) : t.split('\n')).map((x) => x.trim()).filter((x) => x.length > 0).slice(0, 60);
  const change = (t: string) => {
    setText(t);
    const items = parse(t);
    if (items.length === 0 || items.join(sep) === defList.join(sep)) setPath(path, undefined);
    else setPath(path, items);
  };
  const reset = (
    <ResetBtn
      show={overridden}
      onClick={() => {
        setText(defList.join(sep));
        setPath(path, undefined);
      }}
    />
  );
  return (
    <Row label={label} help={help ?? (paragraphs ? 'Leave a blank line between paragraphs.' : 'One item per line.')} reset={reset}>
      <textarea className="adm-input" rows={rows} value={text} onChange={(e) => change(e.target.value)} />
    </Row>
  );
}

export function SelectField({ path, label, options }: { path: string; label: string; options: { value: string; label: string }[] }) {
  const { over, setPath } = useEditor();
  const def = str(defaultAt(path));
  const o = getAt(over, path);
  const overridden = typeof o === 'string';
  return (
    <Row label={label} reset={<ResetBtn show={overridden} onClick={() => setPath(path, undefined)} />}>
      <select className="adm-input" value={overridden ? o : def} onChange={(e) => setPath(path, e.target.value === def ? undefined : e.target.value)}>
        {options.map((op) => (
          <option key={op.value} value={op.value}>
            {op.label}
          </option>
        ))}
      </select>
    </Row>
  );
}

export function ColorField({ path, label }: { path: string; label: string }) {
  const { over, setPath } = useEditor();
  const o = getAt(over, path);
  const value = typeof o === 'string' && /^#[0-9a-fA-F]{6}$/.test(o) ? o : '';
  return (
    <Row label={label} help="Leave on the default dusty rose, or pick her/his favourite colour." reset={<ResetBtn show={value !== ''} onClick={() => setPath(path, undefined)} />}>
      <input className="adm-color" type="color" value={value || '#d995aa'} onChange={(e) => setPath(path, e.target.value)} />
    </Row>
  );
}

export interface OpenLetter {
  label: string;
  short: string;
  title: string;
  body: string;
}

function lettersFrom(v: unknown): OpenLetter[] {
  if (!Array.isArray(v)) return [];
  const out: OpenLetter[] = [];
  for (const x of v) {
    if (isRecord(x)) out.push({ label: str(x.label), short: str(x.short), title: str(x.title), body: str(x.body) });
  }
  return out;
}

export function OpenWhenEditor() {
  const { over, setPath } = useEditor();
  const path = 'openWhen.letters';
  const o = getAt(over, path);
  const overridden = Array.isArray(o);
  const letters = overridden ? lettersFrom(o) : lettersFrom(defaultAt(path));
  const save = (next: OpenLetter[]) => setPath(path, next.map((l) => ({ ...l })));
  const edit = (i: number, key: keyof OpenLetter, v: string) => save(letters.map((l, j) => (j === i ? { ...l, [key]: v } : l)));
  return (
    <div className="adm-stack">
      <div className="adm-row-between">
        <strong>{letters.length} letters</strong>
        <ResetBtn show={overridden} onClick={() => setPath(path, undefined)} />
      </div>
      {letters.map((l, i) => (
        <fieldset className="adm-sub" key={i}>
          <legend>Letter {i + 1}</legend>
          <label className="adm-field">
            <span className="adm-label">Button text</span>
            <input className="adm-input" maxLength={120} value={l.label} onChange={(e) => edit(i, 'label', e.target.value)} />
          </label>
          <label className="adm-field">
            <span className="adm-label">Short name</span>
            <input className="adm-input" maxLength={40} value={l.short} onChange={(e) => edit(i, 'short', e.target.value)} />
          </label>
          <label className="adm-field">
            <span className="adm-label">Title</span>
            <input className="adm-input" maxLength={120} value={l.title} onChange={(e) => edit(i, 'title', e.target.value)} />
          </label>
          <label className="adm-field">
            <span className="adm-label">Letter</span>
            <textarea className="adm-input" rows={5} maxLength={2000} value={l.body} onChange={(e) => edit(i, 'body', e.target.value)} />
          </label>
          {letters.length > 1 && (
            <button type="button" className="adm-link adm-link--danger" onClick={() => save(letters.filter((_, j) => j !== i))}>
              Remove this letter
            </button>
          )}
        </fieldset>
      ))}
      {letters.length < 8 && (
        <button type="button" className="adm-btn" onClick={() => save([...letters, { label: 'Open when…', short: 'a note', title: 'A little note', body: '' }])}>
          + Add a letter
        </button>
      )}
    </div>
  );
}
