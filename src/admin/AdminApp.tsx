import type { Session } from '@supabase/supabase-js';
import { useCallback, useEffect, useRef, useState } from 'react';
import { isConfigured, supabase } from '../lib/supabase';
import { isAdmin } from './api';
import Account from './Account';
import Dashboard from './Dashboard';
import Editor from './Editor';
import Login from './Login';
import type { Notify } from './ui';
import './admin.css';

const FONTS =
  'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Figtree:wght@400;500;600;700&display=swap';

function readHash(): string | null {
  const m = /^#\/edit\/([0-9a-f-]{36})$/.exec(window.location.hash);
  return m?.[1] ?? null;
}

type Theme = 'light' | 'dark';
function initialTheme(): Theme {
  try {
    const t = localStorage.getItem('adm-theme');
    if (t === 'light' || t === 'dark') return t;
  } catch {
    /* ignore */
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

export default function AdminApp() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [admin, setAdmin] = useState<boolean | undefined>(undefined);
  const [editId, setEditId] = useState<string | null>(readHash);
  const [toast, setToast] = useState<{ text: string; kind: 'ok' | 'error' } | null>(null);
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [account, setAccount] = useState(false);
  const [newTick, setNewTick] = useState(0);
  const timer = useRef<number>(0);

  useEffect(() => {
    document.title = 'Admin';
    if (!document.getElementById('adm-fonts')) {
      const l = document.createElement('link');
      l.id = 'adm-fonts';
      l.rel = 'stylesheet';
      l.href = FONTS;
      document.head.appendChild(l);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('adm-theme', theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  useEffect(() => {
    if (!supabase) return undefined;
    void supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setAdmin(undefined);
      return;
    }
    let cancelled = false;
    void isAdmin().then((ok) => !cancelled && setAdmin(ok));
    return () => {
      cancelled = true;
    };
  }, [session]);

  useEffect(() => {
    const h = () => setEditId(readHash());
    window.addEventListener('hashchange', h);
    return () => window.removeEventListener('hashchange', h);
  }, []);

  const notify: Notify = useCallback((text, kind = 'ok') => {
    setToast({ text, kind });
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(null), 4500);
  }, []);

  const go = (id: string | null) => {
    window.location.hash = id ? `/edit/${id}` : '';
    setEditId(id);
  };

  const themeBtn = (
    <button type="button" className="adm-icon-btn" onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))} aria-label="Switch light or dark theme">
      {theme === 'dark' ? '☀' : '☾'}
    </button>
  );

  let body: React.ReactNode;
  let showDock = false;
  if (!isConfigured || !supabase) {
    body = (
      <div className="adm-page adm-page--narrow">
        <div className="adm-card">
          <h1 className="adm-title">Setup needed</h1>
          <p>The two Supabase settings are missing. Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> (see README, step 3), then reload.</p>
        </div>
      </div>
    );
  } else if (session === undefined) {
    body = <div className="adm-page"><div className="adm-loading"><div className="adm-sk" /></div></div>;
  } else if (session === null) {
    body = <Login />;
  } else if (admin === undefined) {
    body = <div className="adm-page"><p>Checking access…</p></div>;
  } else if (!admin) {
    body = (
      <div className="adm-page adm-page--narrow">
        <div className="adm-card">
          <h1 className="adm-title">No access</h1>
          <p>This account is not the admin. The admin email is set in <code>supabase/schema.sql</code>.</p>
          <button className="adm-btn" onClick={() => void supabase?.auth.signOut()}>Log out</button>
        </div>
      </div>
    );
  } else {
    showDock = editId === null;
    const email = session.user.email ?? '';
    body = (
      <>
        <header className="adm-top">
          <span className="adm-brand">Little World</span>
          <div className="adm-top-right">
            {themeBtn}
            <button type="button" className="adm-who" onClick={() => setAccount(true)} aria-label="My account">
              <span className="adm-avatar">{(email[0] ?? 'A').toUpperCase()}</span>
              <span className="adm-who-text">{email}</span>
            </button>
          </div>
        </header>
        {editId ? <Editor key={editId} id={editId} notify={notify} onBack={() => go(null)} /> : <Dashboard notify={notify} onEdit={go} newTick={newTick} />}
        {account && <Account email={email} notify={notify} onClose={() => setAccount(false)} />}
      </>
    );
  }

  return (
    <div className="adm" data-theme={theme}>
      {session === null && <div className="adm-theme-float">{themeBtn}</div>}
      {body}
      {showDock && (
        <nav className="adm-dock" aria-label="Main">
          <a href="#" aria-current="page" onClick={(e) => { e.preventDefault(); go(null); }}>
            <Icon d="M4 11l8-7 8 7v9H4z" />
            <span>Pages</span>
          </a>
          <a href="#new" onClick={(e) => { e.preventDefault(); setNewTick((n) => n + 1); }}>
            <Icon d="M12 5v14M5 12h14" />
            <span>New</span>
          </a>
          <a href="#account" onClick={(e) => { e.preventDefault(); setAccount(true); }}>
            <Icon d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1-4 4-6 8-6s7 2 8 6" />
            <span>Account</span>
          </a>
        </nav>
      )}
      {toast && <div className={`adm-toast adm-toast--${toast.kind}`} role="status">{toast.text}</div>}
    </div>
  );
}
