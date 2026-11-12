import type { Session } from '@supabase/supabase-js';
import { useCallback, useEffect, useRef, useState } from 'react';
import { isConfigured, supabase } from '../lib/supabase';
import { isAdmin } from './api';
import Dashboard from './Dashboard';
import Editor from './Editor';
import Login from './Login';
import type { Notify } from './ui';
import './admin.css';

function readHash(): string | null {
  const m = /^#\/edit\/([0-9a-f-]{36})$/.exec(window.location.hash);
  return m?.[1] ?? null;
}

export default function AdminApp() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [admin, setAdmin] = useState<boolean | undefined>(undefined);
  const [editId, setEditId] = useState<string | null>(readHash);
  const [toast, setToast] = useState<{ text: string; kind: 'ok' | 'error' } | null>(null);
  const timer = useRef<number>(0);

  useEffect(() => {
    document.title = 'Admin';
  }, []);

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

  let body: React.ReactNode;
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
    body = <div className="adm-page"><p>Loading…</p></div>;
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
    body = (
      <>
        <div className="adm-top">
          <span>Little World admin</span>
          <button className="adm-btn adm-btn--small" onClick={() => void supabase?.auth.signOut()}>Log out</button>
        </div>
        {editId ? <Editor key={editId} id={editId} notify={notify} onBack={() => go(null)} /> : <Dashboard notify={notify} onEdit={go} />}
      </>
    );
  }

  return (
    <div className="adm">
      {body}
      {toast && <div className={`adm-toast adm-toast--${toast.kind}`} role="status">{toast.text}</div>}
    </div>
  );
}
