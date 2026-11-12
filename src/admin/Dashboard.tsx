import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import type { PageRow } from '../lib/types';
import { createPage, deletePage, duplicatePage, exportJson, listPages, parseImport, setStatus } from './api';
import { Confirm, Modal, copyText, downloadFile, fmtDate, pageUrl, type Notify } from './ui';

type Filter = 'all' | 'published' | 'draft';
type Sort = 'new' | 'views' | 'name';

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="adm-stat">
      <b>{value}</b>
      <span>{label}</span>
    </div>
  );
}

export default function Dashboard({ notify, onEdit, newTick }: { notify: Notify; onEdit: (id: string) => void; newTick: number }) {
  const [rows, setRows] = useState<PageRow[] | null>(null);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');
  const [toDelete, setToDelete] = useState<PageRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<Sort>('new');
  const fileInput = useRef<HTMLInputElement>(null);

  const reload = useCallback(async () => {
    try {
      setRows(await listPages());
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load pages.');
    }
  }, []);
  useEffect(() => {
    void reload();
  }, [reload]);
  useEffect(() => {
    if (newTick > 0) setCreating(true);
  }, [newTick]);

  const run = async (id: string, fn: () => Promise<void>, okMsg: string) => {
    setBusyId(id);
    try {
      await fn();
      notify(okMsg);
      await reload();
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Something went wrong.', 'error');
    } finally {
      setBusyId('');
    }
  };

  const create = async (publish: boolean) => {
    const name = newName.trim();
    if (!name) return;
    setBusyId('new');
    try {
      const r = await createPage(name);
      if (publish) {
        await setStatus(r.id, 'published');
        const ok = await copyText(pageUrl(r.slug));
        notify(ok ? 'Published. Link copied.' : 'Published.');
        setCreating(false);
        setNewName('');
        await reload();
      } else {
        onEdit(r.id);
      }
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Could not create the page.', 'error');
    } finally {
      setBusyId('');
    }
  };

  const importFile = async (file: File | undefined) => {
    if (!file) return;
    setBusyId('new');
    try {
      if (file.size > 500_000) throw new Error('This file is too big for a backup.');
      const data = parseImport(await file.text());
      const r = await createPage(data.recipient_name, data);
      notify('Imported as a new draft.');
      onEdit(r.id);
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Import failed.', 'error');
    } finally {
      setBusyId('');
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  const stats = useMemo(() => {
    const list = rows ?? [];
    return {
      total: list.length,
      published: list.filter((r) => r.status === 'published').length,
      views: list.reduce((n, r) => n + r.view_count, 0),
      opened: list.filter((r) => r.first_opened_at).length,
    };
  }, [rows]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = (rows ?? []).filter(
      (r) => (filter === 'all' || r.status === filter) && (q === '' || r.recipient_name.toLowerCase().includes(q) || r.slug.includes(q)),
    );
    if (sort === 'views') list.sort((a, b) => b.view_count - a.view_count);
    else if (sort === 'name') list.sort((a, b) => a.recipient_name.localeCompare(b.recipient_name));
    return list;
  }, [rows, query, filter, sort]);

  const now = Date.now();

  return (
    <div className="adm-page adm-page--wide">
      <div className="adm-head">
        <div>
          <h1 className="adm-title adm-title--big">Birthday pages</h1>
          <p className="adm-help">One page for each person. Each has its own secret link.</p>
        </div>
        <div className="adm-actions adm-actions--left">
          <button type="button" className="adm-btn adm-btn--primary" onClick={() => setCreating(true)}>+ New page</button>
          <input ref={fileInput} type="file" accept="application/json,.json" hidden onChange={(e) => void importFile(e.target.files?.[0])} />
          <button type="button" className="adm-btn" disabled={busyId === 'new'} onClick={() => fileInput.current?.click()}>Import JSON</button>
        </div>
      </div>

      <div className="adm-stats-row">
        <Stat label="Pages" value={stats.total} />
        <Stat label="Published" value={stats.published} />
        <Stat label="Opened by someone" value={stats.opened} />
        <Stat label="Total views" value={stats.views} />
      </div>

      <div className="adm-toolbar adm-toolbar--filters">
        <input className="adm-input adm-search" type="search" placeholder="Search by name…" aria-label="Search pages" value={query} onChange={(e) => setQuery(e.target.value)} />
        <div className="adm-tabs" role="tablist" aria-label="Filter">
          {(['all', 'published', 'draft'] as const).map((f) => (
            <button key={f} type="button" role="tab" aria-selected={filter === f} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : f === 'published' ? 'Published' : 'Drafts'}
            </button>
          ))}
        </div>
        <select className="adm-input adm-sort" aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
          <option value="new">Newest first</option>
          <option value="views">Most views</option>
          <option value="name">Name A to Z</option>
        </select>
      </div>

      {error && (
        <p className="adm-error" role="alert">
          {error} <button type="button" className="adm-link" onClick={() => void reload()}>Try again</button>
        </p>
      )}
      {rows === null && !error && (
        <div className="adm-loading" aria-label="Loading">
          <div className="adm-sk" />
          <div className="adm-sk" />
        </div>
      )}
      {rows !== null && rows.length === 0 && (
        <div className="adm-empty">
          <h3>No pages yet</h3>
          <p className="adm-help">Press “New page”, type the name, and make your first surprise.</p>
          <button type="button" className="adm-btn adm-btn--primary" onClick={() => setCreating(true)}>+ New page</button>
        </div>
      )}
      {rows !== null && rows.length > 0 && shown.length === 0 && (
        <div className="adm-empty">
          <h3>Nothing found</h3>
          <p className="adm-help">Try a different search or filter.</p>
        </div>
      )}

      <ul className="adm-list">
        {shown.map((r) => {
          const busy = busyId === r.id;
          const locked = r.unlock_at !== null && Date.parse(r.unlock_at) > now;
          const expired = r.expires_at !== null && Date.parse(r.expires_at) <= now;
          const wa = `https://wa.me/?text=${encodeURIComponent(`I made a little surprise for you ♡ ${pageUrl(r.slug)}`)}`;
          return (
            <li key={r.id} className="adm-card">
              <div className="adm-card-head">
                <div className="adm-grow">
                  <strong className="adm-name">{r.recipient_name || '(no name)'}</strong>
                  <div className="adm-help">{r.birthday_date ?? 'no date'} · /w/{r.slug}</div>
                </div>
                <div className="adm-chips">
                  <span className={`adm-chip ${r.status === 'published' ? 'good' : 'none'}`}>{r.status === 'published' ? 'Published' : 'Draft'}</span>
                  {locked && <span className="adm-chip warn">Locked</span>}
                  {expired && <span className="adm-chip bad"><span>Expired</span></span>}
                  {r.has_pin && <span className="adm-chip none">PIN</span>}
                </div>
              </div>
              <dl className="adm-stats">
                <div><dt>Views</dt><dd>{r.view_count}</dd></div>
                <div><dt>First opened</dt><dd>{fmtDate(r.first_opened_at)}</dd></div>
                <div><dt>Last opened</dt><dd>{fmtDate(r.last_opened_at)}</dd></div>
                <div><dt>Unlocks</dt><dd>{r.unlock_at ? fmtDate(r.unlock_at) : 'now'}</dd></div>
              </dl>
              <div className="adm-actions adm-actions--left">
                <button type="button" className="adm-btn adm-btn--small adm-btn--primary" onClick={() => onEdit(r.id)}>Edit</button>
                <button type="button" className="adm-btn adm-btn--small" onClick={() => void copyText(pageUrl(r.slug)).then((ok) => notify(ok ? 'Link copied.' : 'Could not copy.', ok ? 'ok' : 'error'))}>Copy link</button>
                <a className="adm-btn adm-btn--small" href={wa} target="_blank" rel="noopener noreferrer">WhatsApp</a>
                <a className="adm-btn adm-btn--small" href={pageUrl(r.slug, r.status !== 'published')} target="_blank" rel="noopener noreferrer">Open</a>
                <button type="button" className="adm-btn adm-btn--small" disabled={busy} onClick={() => void run(r.id, async () => void (await duplicatePage(r)), 'Duplicated as a new draft.')}>Duplicate</button>
                <button
                  type="button"
                  className="adm-btn adm-btn--small"
                  disabled={busy}
                  onClick={() => void run(r.id, () => setStatus(r.id, r.status === 'published' ? 'draft' : 'published'), r.status === 'published' ? 'Unpublished.' : 'Published.')}
                >
                  {r.status === 'published' ? 'Unpublish' : 'Publish'}
                </button>
                <button type="button" className="adm-btn adm-btn--small" onClick={() => downloadFile(`${r.slug}.json`, exportJson({ ...r, status: r.status }), 'application/json')}>Export</button>
                <button type="button" className="adm-btn adm-btn--small adm-btn--danger" disabled={busy} onClick={() => setToDelete(r)}>Delete</button>
              </div>
            </li>
          );
        })}
      </ul>

      {creating && (
        <Modal title="New surprise page" onClose={() => setCreating(false)}>
          <form onSubmit={(e: FormEvent) => { e.preventDefault(); void create(false); }}>
            <label className="adm-field">
              <span className="adm-label">Name of the person</span>
              <input className="adm-input" maxLength={80} value={newName} onChange={(e) => setNewName(e.target.value)} />
              <small className="adm-help">The link will look like /w/aanya-k7x2m (name + random letters, so it cannot be guessed).</small>
            </label>
            <div className="adm-actions">
              <button type="button" className="adm-btn" onClick={() => setCreating(false)}>Cancel</button>
              <button type="button" className="adm-btn" disabled={!newName.trim() || busyId === 'new'} onClick={() => void create(true)}>Quick: create and publish</button>
              <button type="submit" className="adm-btn adm-btn--primary" disabled={!newName.trim() || busyId === 'new'}>{busyId === 'new' ? 'Creating…' : 'Create and edit'}</button>
            </div>
            <p className="adm-help">“Quick” uses the default text and copies the link for you. You can edit the page later.</p>
          </form>
        </Modal>
      )}
      {toDelete && (
        <Confirm
          title="Delete this page?"
          text={`“${toDelete.recipient_name || toDelete.slug}” will be removed for good, together with its photos and music. This cannot be undone.`}
          action="Delete for good"
          danger
          busy={busyId === toDelete.id}
          onNo={() => setToDelete(null)}
          onYes={() => {
            const r = toDelete;
            void run(r.id, () => deletePage(r), 'Deleted.').then(() => setToDelete(null));
          }}
        />
      )}
    </div>
  );
}
