import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { content as defaults } from '../content';
import { sanitizeOverrides } from '../lib/merge';
import type { JsonObject, JsonValue, MusicSetting, PageRow, PageStatus } from '../lib/types';
import { changeSlug, exportJson, getPageById, removeMedia, savePage, setPin, type PagePatch } from './api';
import { ColorField, EditorContext, ListField, OpenWhenEditor, SelectField, TextField, UrlField } from './fields';
import MusicEditor from './MusicEditor';
import { fromLocalInput, getAt, setAt, toLocalInput } from './paths';
import PhotosEditor, { readPhotos } from './PhotosEditor';
import SharePanel from './SharePanel';
import { Confirm, downloadFile, pageUrl, type Notify } from './ui';

interface Draft {
  status: PageStatus;
  name: string;
  birthday: string;
  language: string;
  unlock: string;
  expires: string;
  over: JsonObject;
  music: MusicSetting;
}

const fromRow = (r: PageRow): Draft => ({
  status: r.status,
  name: r.recipient_name,
  birthday: r.birthday_date ?? '',
  language: r.language,
  unlock: toLocalInput(r.unlock_at),
  expires: toLocalInput(r.expires_at),
  over: r.content,
  music: r.music,
});

const LANGS: [string, string][] = [
  ['en', 'English'], ['hi', 'Hindi'], ['bn', 'Bengali'], ['gu', 'Gujarati'], ['ta', 'Tamil'],
  ['es', 'Spanish'], ['fr', 'French'], ['de', 'German'], ['pt', 'Portuguese'], ['ar', 'Arabic'],
];

function Section({ title, open, children }: { title: string; open?: boolean; children: React.ReactNode }) {
  return (
    <details className="adm-sec" open={open}>
      <summary>{title}</summary>
      <div className="adm-sec-body">{children}</div>
    </details>
  );
}

export default function Editor({ id, notify, onBack }: { id: string; notify: Notify; onBack: () => void }) {
  const [row, setRow] = useState<PageRow | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saved, setSaved] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [pin, setPinText] = useState('');
  const [hasPin, setHasPin] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [wide, setWide] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [confirmSlug, setConfirmSlug] = useState(false);
  const pending = useRef<Set<string>>(new Set());
  const iframe = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    let cancelled = false;
    getPageById(id)
      .then((r) => {
        if (cancelled) return;
        if (!r) {
          setError('This page was not found.');
          return;
        }
        setRow(r);
        const d = fromRow(r);
        setDraft(d);
        setSaved(JSON.stringify(d));
        setHasPin(r.has_pin);
      })
      .catch((e: unknown) => !cancelled && setError(e instanceof Error ? e.message : 'Could not load the page.'));
    return () => {
      cancelled = true;
    };
  }, [id]);

  const dirty = draft !== null && JSON.stringify(draft) !== saved;
  useEffect(() => {
    if (!dirty) return undefined;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirty]);

  const patchOf = useCallback((d: Draft): PagePatch => ({
    status: d.status,
    recipient_name: d.name.trim(),
    birthday_date: d.birthday || null,
    unlock_at: fromLocalInput(d.unlock),
    expires_at: fromLocalInput(d.expires),
    language: d.language,
    content: sanitizeOverrides(defaults as unknown as Record<string, unknown>, d.over),
    music: d.music,
  }), []);

  /* live preview: send the (unsaved) draft to the iframe */
  const post = useCallback(() => {
    if (!draft || !iframe.current?.contentWindow) return;
    const p = patchOf(draft);
    iframe.current.contentWindow.postMessage(
      { type: 'lw-preview', page: { recipient_name: p.recipient_name, birthday_date: p.birthday_date, language: p.language, content: p.content, music: p.music } },
      window.location.origin,
    );
  }, [draft, patchOf]);
  useEffect(() => {
    if (!showPreview) return undefined;
    const t = window.setTimeout(post, 600);
    return () => window.clearTimeout(t);
  }, [post, showPreview]);
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.origin === window.location.origin && e.source === iframe.current?.contentWindow && isReady(e.data)) post();
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [post]);

  const ctx = useMemo(
    () => ({
      over: draft?.over ?? {},
      setPath: (path: string, value: JsonValue | undefined) => setDraft((d) => (d ? { ...d, over: setAt(d.over, path, value) } : d)),
    }),
    [draft?.over],
  );

  if (error) {
    return (
      <div className="adm-page">
        <p className="adm-error">{error}</p>
        <button className="adm-btn" onClick={onBack}>← Back</button>
      </div>
    );
  }
  if (!row || !draft) return <div className="adm-page"><p>Loading…</p></div>;

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => (d ? { ...d, [k]: v } : d));
  const partner = ((draft.over.relationship as string | undefined) ?? defaults.relationship) === 'partner' || ((draft.over.relationship as string | undefined) ?? defaults.relationship) === 'crush';

  const save = async (status?: PageStatus): Promise<boolean> => {
    if (draft.name.trim() === '') {
      notify('Please type the name first.', 'error');
      return false;
    }
    const u = fromLocalInput(draft.unlock);
    const x = fromLocalInput(draft.expires);
    if (u && x && Date.parse(x) <= Date.parse(u)) {
      notify('The end date must be after the unlock date.', 'error');
      return false;
    }
    setBusy(true);
    try {
      const next: Draft = { ...draft, status: status ?? draft.status };
      const r = await savePage(id, patchOf(next));
      const paths = [...pending.current];
      if (paths.length) {
        try {
          await removeMedia(paths);
          pending.current.clear();
        } catch {
          /* leftover files are cleaned up when the page is deleted */
        }
      }
      setRow(r);
      const d = { ...next, over: r.content };
      setDraft(d);
      setSaved(JSON.stringify(d));
      notify(status === 'published' ? 'Published. The link is live.' : status === 'draft' ? 'Moved back to draft.' : 'Saved.');
      return true;
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Could not save.', 'error');
      return false;
    } finally {
      setBusy(false);
    }
  };

  const doPin = async (value: string | null) => {
    if (value !== null && !/^[0-9]{4,8}$/.test(value)) {
      notify('The PIN must be 4 to 8 digits.', 'error');
      return;
    }
    try {
      await setPin(id, value);
      setHasPin(value !== null);
      setPinText('');
      notify(value ? 'PIN set.' : 'PIN removed.');
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Could not change the PIN.', 'error');
    }
  };

  return (
    <EditorContext.Provider value={ctx}>
      <div className="adm-page adm-page--wide">
        <header className="adm-bar">
          <button type="button" className="adm-btn adm-btn--small" onClick={() => (dirty ? setConfirmLeave(true) : onBack())}>← Pages</button>
          <h1 className="adm-title">{draft.name || 'New page'}</h1>
          <span className={`adm-chip adm-chip--${draft.status}`}>{draft.status}</span>
        </header>

        <div className="adm-toolbar">
          <button type="button" className="adm-btn adm-btn--primary" disabled={busy || !dirty} onClick={() => void save()}>
            {busy ? 'Saving…' : dirty ? 'Save changes' : 'Saved'}
          </button>
          {draft.status === 'published' ? (
            <button type="button" className="adm-btn" disabled={busy} onClick={() => void save('draft')}>Unpublish</button>
          ) : (
            <button type="button" className="adm-btn" disabled={busy} onClick={() => void save('published')}>Publish</button>
          )}
          <button type="button" className="adm-btn" onClick={() => setShowPreview((s) => !s)} aria-pressed={showPreview}>
            {showPreview ? 'Hide preview' : 'Live preview'}
          </button>
          <button type="button" className="adm-btn" onClick={() => downloadFile(`${row.slug}.json`, exportJson(patchOf(draft)), 'application/json')}>Export JSON</button>
        </div>
        {dirty && <p className="adm-warn">You have unsaved changes.</p>}
        <ul className="adm-checks" aria-label="Checklist">
          {([
            ['Name', draft.name.trim() !== ''],
            ['Photos', readPhotos(draft.over).length > 0],
            ['Personal paragraph', typeof getAt(draft.over, 'letter.personalParagraph') === 'string' && String(getAt(draft.over, 'letter.personalParagraph')).trim() !== ''],
            ['Own music', draft.music.type !== 'builtin'],
            ['Saved', !dirty],
            ['Published', draft.status === 'published'],
          ] as [string, boolean][]).map(([label, ok]) => (
            <li key={label} className={ok ? 'is-ok' : ''}>{ok ? '✓' : '○'} {label}</li>
          ))}
        </ul>

        <div className={`adm-editor ${showPreview ? 'has-preview' : ''}`}>
          <div className="adm-forms">
            <Section title="1. Basics" open>
              <label className="adm-field">
                <span className="adm-label">Name of the person</span>
                <input className="adm-input" maxLength={80} value={draft.name} onChange={(e) => set('name', e.target.value)} />
              </label>
              <TextField path="nickname" label="Nickname (optional)" maxLength={40} />
              <label className="adm-field">
                <span className="adm-label">Birthday date</span>
                <input className="adm-input" type="date" value={draft.birthday} onChange={(e) => set('birthday', e.target.value)} />
                <small className="adm-help">Shown as “18 October”. Leave empty to hide it.</small>
              </label>
              <SelectField
                path="relationship"
                label="Relationship"
                options={[
                  { value: 'someone-special', label: 'Someone special' },
                  { value: 'best-friend', label: 'Best friend' },
                  { value: 'partner', label: 'Partner' },
                  { value: 'crush', label: 'Crush' },
                ]}
              />
              <SelectField
                path="animal"
                label="Mascot"
                options={[
                  { value: 'teddy', label: 'Teddy bear' },
                  { value: 'bear', label: 'Little bear' },
                  { value: 'bunny', label: 'Bunny' },
                  { value: 'cat', label: 'Kitten' },
                ]}
              />
              <ColorField path="accentColor" label="Accent colour" />
              <label className="adm-field">
                <span className="adm-label">Language of the page</span>
                <select className="adm-input" value={draft.language} onChange={(e) => set('language', e.target.value)}>
                  {LANGS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
                <small className="adm-help">Used for screen readers and the browser. The text itself is whatever you write.</small>
              </label>
            </Section>

            <Section title="2. Letter">
              <TextField path="letter.personalParagraph" label="Your personal paragraph" multiline rows={5} help="A real memory makes the letter yours." />
              {partner ? (
                <TextField path="letter.romanticParagraph" label="Romantic paragraph" multiline rows={5} help="Shown only for partner or crush. Keep it free of pressure." />
              ) : (
                <p className="adm-help">The romantic paragraph appears only when the relationship is Partner or Crush.</p>
              )}
            </Section>

            <Section title="3. Wishes">
              <ListField path="wishes.items" label="Little things I wish for you" rows={10} />
              <ListField path="sky.wishes" label="Wishes in the starry sky" rows={8} />
            </Section>

            <Section title="4. Open-when letters">
              <OpenWhenEditor />
            </Section>

            <Section title="5. Final note">
              <ListField path="final.paragraphs" label="Final paragraphs" paragraphs rows={10} />
              <TextField path="final.finalNoteTop" label="Small line (top)" multiline rows={2} />
              <TextField path="final.finalNoteBottom" label="Small line (bottom)" multiline rows={2} />
              <TextField path="final.signature" label="Signature line" multiline rows={2} />
            </Section>

            <Section title="6. Gift">
              <UrlField path="gift.songLink" label="Song link" help="YouTube, Spotify or any https link." />
              <TextField path="gift.songLabel" label="Song button text" maxLength={80} />
              <UrlField path="gift.videoSrc" label="Video link" help="A direct link to a video file (like .mp4)." />
              <TextField path="gift.videoCaption" label="Video caption" maxLength={120} />
              <TextField path="gift.secret" label="Secret message" multiline rows={3} />
            </Section>

            <Section title="7. Photos">
              <PhotosEditor pageId={id} notify={notify} onRemoved={(p) => pending.current.add(p)} />
            </Section>

            <Section title="8. Music">
              <MusicEditor pageId={id} music={draft.music} onChange={(m) => set('music', m)} onRemoved={(p) => pending.current.add(p)} notify={notify} />
            </Section>

            <Section title="9. Settings">
              <label className="adm-field">
                <span className="adm-label">Unlock date and time (optional)</span>
                <input className="adm-input" type="datetime-local" value={draft.unlock} onChange={(e) => set('unlock', e.target.value)} />
                <small className="adm-help">Before this time the visitor sees a countdown. Your local time zone is used.</small>
              </label>
              <label className="adm-field">
                <span className="adm-label">Expiry date and time (optional)</span>
                <input className="adm-input" type="datetime-local" value={draft.expires} onChange={(e) => set('expires', e.target.value)} />
                <small className="adm-help">After this time the page shows “no longer here”.</small>
              </label>
              <div className="adm-field">
                <span className="adm-label">Secret PIN (optional) — {hasPin ? 'a PIN is set' : 'no PIN'}</span>
                <div className="adm-inline">
                  <input className="adm-input" inputMode="numeric" autoComplete="off" maxLength={8} placeholder="4 to 8 digits" value={pin} onChange={(e) => setPinText(e.target.value.replace(/\D/g, ''))} />
                  <button type="button" className="adm-btn" onClick={() => void doPin(pin)}>{hasPin ? 'Change PIN' : 'Set PIN'}</button>
                  {hasPin && <button type="button" className="adm-btn adm-btn--danger" onClick={() => void doPin(null)}>Remove</button>}
                </div>
                <small className="adm-help">The PIN is checked on the server and saved in scrambled form. It takes effect straight away (no need to press Save).</small>
              </div>
            </Section>

            <Section title="10. Share">
              <SharePanel slug={row.slug} status={draft.status} notify={notify} />
              <button type="button" className="adm-btn adm-btn--danger" onClick={() => setConfirmSlug(true)}>Make a new link (old link stops working)</button>
            </Section>
          </div>

          {showPreview && (
            <aside className="adm-preview" aria-label="Live preview">
              <div className="adm-actions adm-actions--left">
                <button type="button" className={`adm-btn adm-btn--small ${!wide ? 'adm-btn--primary' : ''}`} onClick={() => setWide(false)}>Phone</button>
                <button type="button" className={`adm-btn adm-btn--small ${wide ? 'adm-btn--primary' : ''}`} onClick={() => setWide(true)}>Desktop</button>
                <a className="adm-btn adm-btn--small" href={pageUrl(row.slug, true)} target="_blank" rel="noopener noreferrer">Open</a>
              </div>
              <div className={`adm-frame ${wide ? 'is-wide' : ''}`}>
                <iframe ref={iframe} title="Preview" src={pageUrl(row.slug, true)} onLoad={post} />
              </div>
              <p className="adm-help">Shows your unsaved changes. It does not count as a view.</p>
            </aside>
          )}
        </div>
      </div>
      {confirmSlug && (
        <Confirm
          title="Make a new link?"
          text="The current link will stop working at once. Use this only if the link leaked or you sent it to the wrong person. Then send the new link."
          action="Make new link"
          danger
          onNo={() => setConfirmSlug(false)}
          onYes={() => {
            setConfirmSlug(false);
            void changeSlug(id, draft.name).then(
              (slug) => {
                setRow((r) => (r ? { ...r, slug } : r));
                notify('New link ready. The old one is gone.');
              },
              (e: unknown) => notify(e instanceof Error ? e.message : 'Could not change the link.', 'error'),
            );
          }}
        />
      )}
      {confirmLeave && (
        <Confirm title="Leave without saving?" text="Your unsaved changes will be lost." action="Leave" danger onYes={onBack} onNo={() => setConfirmLeave(false)} />
      )}
    </EditorContext.Provider>
  );
}

function isReady(d: unknown): boolean {
  return typeof d === 'object' && d !== null && (d as { type?: unknown }).type === 'lw-preview-ready';
}
