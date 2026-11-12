import { useEffect, useRef, type ReactNode } from 'react';

export type Notify = (message: string, kind?: 'ok' | 'error') => void;

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    document.body.removeChild(ta);
    return ok;
  }
}

export function pageUrl(slug: string, preview = false): string {
  return `${window.location.origin}/w/${slug}${preview ? '?preview=1' : ''}`;
}

export function downloadFile(name: string, text: string, type: string): void {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose; // always the latest, without re-running the effect below
  useEffect(() => {
    // Runs ONCE when the popup opens. (It used to run on every key press and steal the cursor.)
    const prev = document.activeElement as HTMLElement | null;
    const first = ref.current?.querySelector<HTMLElement>('input, textarea, select, button');
    (first ?? ref.current)?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRef.current();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      prev?.focus();
    };
  }, []);
  return (
    <div className="adm-overlay" onMouseDown={(e) => e.target === e.currentTarget && closeRef.current()}>
      <div className="adm-modal" role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} ref={ref}>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}

export function Confirm({
  title,
  text,
  action,
  danger,
  busy,
  onYes,
  onNo,
}: {
  title: string;
  text: string;
  action: string;
  danger?: boolean;
  busy?: boolean;
  onYes: () => void;
  onNo: () => void;
}) {
  return (
    <Modal title={title} onClose={onNo}>
      <p>{text}</p>
      <div className="adm-actions">
        <button type="button" className="adm-btn" onClick={onNo} disabled={busy}>
          Cancel
        </button>
        <button type="button" className={`adm-btn ${danger ? 'adm-btn--danger' : 'adm-btn--primary'}`} onClick={onYes} disabled={busy}>
          {busy ? 'Please wait…' : action}
        </button>
      </div>
    </Modal>
  );
}
