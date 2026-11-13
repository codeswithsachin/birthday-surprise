import { useState, type FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import PasswordInput from './PasswordInput';

type Mode = 'login' | 'forgot' | 'sent';

export default function Login({ notice }: { notice?: string }) {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const login = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setError('');
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (err) setError(err.status === 429 ? 'Too many tries. Wait a minute and try again.' : 'Wrong email or password.');
    setBusy(false);
  };

  const forgot = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setError('');
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/admin` });
    setBusy(false);
    if (err) {
      setError(err.status === 429 ? 'Too many emails. The limit is 2 per hour. Try again later.' : 'Could not send the email. Try again later.');
      return;
    }
    setMode('sent');
  };

  if (mode === 'sent') {
    return (
      <div className="adm-page adm-page--narrow">
        <div className="adm-card adm-login">
          <h1 className="adm-title">Check your email</h1>
          <p>If that email is the admin account, a reset link is on its way. It can take a minute. Look in Spam too, and open the link in this same browser.</p>
          <button className="adm-btn adm-btn--block" type="button" onClick={() => setMode('login')}>Back to login</button>
        </div>
      </div>
    );
  }

  if (mode === 'forgot') {
    return (
      <div className="adm-page adm-page--narrow">
        <form className="adm-card adm-login" onSubmit={(e) => void forgot(e)}>
          <h1 className="adm-title">Forgot password</h1>
          <p className="adm-help">Type your admin email. We will send a link to set a new password.</p>
          <label className="adm-field">
            <span className="adm-label">Email</span>
            <input className="adm-input" type="email" autoComplete="username" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          {error && <p className="adm-error" role="alert">{error}</p>}
          <button className="adm-btn adm-btn--primary adm-btn--block" type="submit" disabled={busy}>{busy ? 'Sending…' : 'Send reset link'}</button>
          <button className="adm-btn adm-btn--block" type="button" onClick={() => { setMode('login'); setError(''); }}>Back to login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="adm-page adm-page--narrow">
      <form className="adm-card adm-login" onSubmit={(e) => void login(e)}>
        <h1 className="adm-title">Admin login</h1>
        {notice && <p className="adm-ok" role="status">{notice}</p>}
        <label className="adm-field">
          <span className="adm-label">Email</span>
          <input className="adm-input" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="adm-field">
          <span className="adm-label">Password</span>
          <PasswordInput value={password} onChange={setPassword} autoComplete="current-password" required />
        </label>
        {error && <p className="adm-error" role="alert">{error}</p>}
        <button className="adm-btn adm-btn--primary adm-btn--block" type="submit" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
        <button className="adm-link adm-link--center" type="button" onClick={() => { setMode('forgot'); setError(''); }}>Forgot password?</button>
      </form>
    </div>
  );
}
