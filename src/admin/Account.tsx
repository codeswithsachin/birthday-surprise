import { useState, type FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { Modal, type Notify } from './ui';

export default function Account({ email, notify, onClose }: { email: string; notify: Notify; onClose: () => void }) {
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    if (pw.length < 8) return setError('Use at least 8 characters.');
    if (pw !== pw2) return setError('The two passwords are not the same.');
    setBusy(true);
    setError('');
    const { error: err } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (err) return setError(err.message);
    notify('Password changed.');
    onClose();
  };

  return (
    <Modal title="My account" onClose={onClose}>
      <p className="adm-help">Logged in as</p>
      <p className="adm-strong">{email}</p>
      <form onSubmit={(e) => void submit(e)} className="adm-stack">
        <label className="adm-field">
          <span className="adm-label">New password</span>
          <input className="adm-input" type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} />
        </label>
        <label className="adm-field">
          <span className="adm-label">Type it again</span>
          <input className="adm-input" type="password" autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} />
        </label>
        {error && <p className="adm-error" role="alert">{error}</p>}
        <div className="adm-actions">
          <button type="button" className="adm-btn" onClick={onClose}>Close</button>
          <button type="submit" className="adm-btn adm-btn--primary" disabled={busy || pw.length === 0}>{busy ? 'Saving…' : 'Change password'}</button>
        </div>
      </form>
      <button type="button" className="adm-btn adm-btn--block" onClick={() => void supabase?.auth.signOut()}>Log out</button>
    </Modal>
  );
}
