import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import type { PageRow } from '../lib/types';
import { createPage, deletePage, duplicatePage, exportJson, listPages, parseImport, setStatus } from './api';
import { Confirm, Modal, copyText, downloadFile, fmtDate, pageUrl, type Notify } from './ui';

export default function Dashboard({ notify, onEdit }: { notify: Notify; onEdit: (id: string) => void }) {
  const [rows, setRows] = useState<PageRow[] | null>(null);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');
  const [toDelete, setToDelete] = useState<PageRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
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

  const create = async (e: FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setBusyId('new');
    try {
      const r = await createPage(name);
      onEdit(r.id);
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Could not create the page.', 'error');
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

  return (
    <div className="adm-page adm-page--wide">
      <div className="adm-row-between">
        <h1 className="adm-title">Birthday pages</h1>
        <div className="adm-actions adm-actions--left">
          <button type="button" className="adm-btn adm-btn--primary" onClick={() => setCreating(true)}>+ New page</button>
          <input ref={fileInput} type="file" accept="application/json,.json" hidden onChange={(e) => void importFile(e.target.files?.[0])} />
          <button type="button" className="adm-btn" disabled={busyId === 'new'} onClick={() => fileInput.current?.click()}>Import JSON</button>
        </div>
      </div>

      {error && (
        <p className="adm-error" role="alert">
          {error} <button type="button" className="adm-link" onClick={() => void reload()}>Try again</button>
        </p>
      )}
      {rows === null && !error && <p>Loading…</p>}
      {rows !== null && rows.length === 0 && (
        <div className="adm-empty">
          <p>No pages yet.</p>
          <p className="adm-help">Press “New page”, type the name, and start making a surprise.</p>
        </div>
      )}

      <ul className="adm-list">
        {rows?.map((r) => {
          const busy = busyId === r.id;
          return (
            <li key={r.id} className="adm-card">
              <div className="adm-card-head">
                <div>
                  <strong className="adm-name">{r.recipient_name || '(no name)'}</strong>
                  <div className="adm-help">{r.birthday_date ?? 'no date'} · /w/{r.slug}</div>
                </div>
                <span className={`adm-chip adm-chip--${r.status}`}>{r.status}</span>
              </div>
              <dl className="adm-stats">
                <div><dt>Views</dt><dd>{r.view_count}</dd></div>
                <div><dt>First opened</dt><dd>{fmtDate(r.first_opened_at)}</dd></div>
                <div><dt>Unlocks</dt><dd>{r.unlock_at ? fmtDate(r.unlock_at) : 'now'}</dd></div>
              </dl>
              <div className="adm-actions adm-actions--left">
                <button type="button" className="adm-btn adm-btn--small adm-btn--primary" onClick={() => onEdit(r.id)}>Edit</button>
                <button
                  type="button"
                  className="adm-btn adm-btn--small"
                  onClick={() => void copyText(pageUrl(r.slug)).then((ok) => notify(ok ? 'Link copied.' : 'Could not copy.', ok ? 'ok' : 'error'))}
                >
                  Copy link
                </button>
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
          <form onSubmit={(e) => void create(e)}>
            <label className="adm-field">
              <span className="adm-label">Name of the person</span>
              <input className="adm-input" autoFocus maxLength={80} value={newName} onChange={(e) => setNewName(e.target.value)} />
              <small className="adm-help">The link will look like /w/aanya-k7x2m (name + random letters, so it cannot be guessed).</small>
            </label>
            <div className="adm-actions">
              <button type="button" className="adm-btn" onClick={() => setCreating(false)}>Cancel</button>
              <button type="submit" className="adm-btn adm-btn--primary" disabled={!newName.trim() || busyId === 'new'}>{busyId === 'new' ? 'Creating…' : 'Create draft'}</button>
            </div>
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
