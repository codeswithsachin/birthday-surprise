import { useState, type FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import PasswordInput from './PasswordInput';
import TwoStep from './TwoStep';
import { Modal, type Notify } from './ui';

export default function Account({ email, notify, onClose }: { email: string; notify: Notify; onClose: () => void }) {
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    if (pw.length < 10) return setError('Use at least 10 characters.');
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
      <TwoStep notify={notify} />
      <h3 className="adm-h3">Change password</h3>
      <form onSubmit={(e) => void submit(e)} className="adm-stack">
        <label className="adm-field">
          <span className="adm-label">New password (10+ characters)</span>
          <PasswordInput value={pw} onChange={setPw} autoComplete="new-password" />
        </label>
        <label className="adm-field">
          <span className="adm-label">Type it again</span>
          <PasswordInput value={pw2} onChange={setPw2} autoComplete="new-password" />
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
