import { useRef, useState, type FormEvent } from 'react';
import { verifyCode } from './mfa';

export default function VerifyCode({ title = 'Two-step check', onDone, onCancel }: { title?: string; onDone: () => void; onCancel: () => void }) {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const running = useRef(false);

  const run = async (c: string) => {
    if (running.current || c.length !== 6) return;
    running.current = true;
    setBusy(true);
    setError('');
    const err = await verifyCode(c);
    running.current = false;
    setBusy(false);
    if (err) {
      setError(err);
      setCode('');
      return;
    }
    onDone();
  };

  const change = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 6);
    setCode(digits);
    if (digits.length === 6) void run(digits);
  };

  return (
    <div className="adm-page adm-page--narrow">
      <form className="adm-card adm-login" onSubmit={(e: FormEvent) => { e.preventDefault(); void run(code); }}>
        <h1 className="adm-title">{title}</h1>
        <p className="adm-help">Open your authenticator app and type the 6-digit code shown for “Little World”. It changes every 30 seconds.</p>
        <label className="adm-field">
          <span className="adm-label">6-digit code</span>
          <input
            className="adm-input adm-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={(e) => change(e.target.value)}
          />
        </label>
        {error && <p className="adm-error" role="alert">{error}</p>}
        <button className="adm-btn adm-btn--primary adm-btn--block" type="submit" disabled={busy || code.length !== 6}>{busy ? 'Checking…' : 'Verify'}</button>
        <button type="button" className="adm-btn adm-btn--block" onClick={onCancel}>Cancel and log out</button>
      </form>
    </div>
  );
}
