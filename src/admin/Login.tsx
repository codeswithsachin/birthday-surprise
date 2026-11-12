import { useState, type FormEvent } from 'react';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setError('');
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (err) setError('Wrong email or password.');
    setBusy(false);
  };

  return (
    <div className="adm-page adm-page--narrow">
      <form className="adm-card adm-login" onSubmit={(e) => void submit(e)}>
        <h1 className="adm-title">Admin login</h1>
        <label className="adm-field">
          <span className="adm-label">Email</span>
          <input className="adm-input" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="adm-field">
          <span className="adm-label">Password</span>
          <input className="adm-input" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <p className="adm-error" role="alert">{error}</p>}
        <button className="adm-btn adm-btn--primary adm-btn--block" type="submit" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
        <p className="adm-help">
          Security note: in the Supabase dashboard go to Authentication, then Sign In / Providers, and switch OFF “Allow new users to sign up”. Only your own account should exist.
        </p>
      </form>
    </div>
  );
}
