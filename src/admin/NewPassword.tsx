import { useState, type FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import PasswordInput from './PasswordInput';

/** Shown after the person opens the reset link (and passed the code step, if two-step is on). */
export default function NewPassword({ onDone }: { onDone: () => void }) {
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
    onDone();
  };

  return (
    <div className="adm-page adm-page--narrow">
      <form className="adm-card adm-login" onSubmit={(e) => void submit(e)}>
        <h1 className="adm-title">Set a new password</h1>
        <label className="adm-field">
          <span className="adm-label">New password (10+ characters)</span>
          <PasswordInput value={pw} onChange={setPw} autoComplete="new-password" autoFocus />
        </label>
        <label className="adm-field">
          <span className="adm-label">Type it again</span>
          <PasswordInput value={pw2} onChange={setPw2} autoComplete="new-password" />
        </label>
        {error && <p className="adm-error" role="alert">{error}</p>}
        <button className="adm-btn adm-btn--primary adm-btn--block" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save new password'}</button>
      </form>
    </div>
  );
}
