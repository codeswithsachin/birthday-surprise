import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { copyText, type Notify } from './ui';

type View =
  | { k: 'loading' }
  | { k: 'fail' }
  | { k: 'off' }
  | { k: 'on' }
  | { k: 'setup'; factorId: string; qr: string; secret: string };

/** Turn the authenticator-app code on or off (inside the Account window). */
export default function TwoStep({ notify }: { notify: Notify }) {
  const [view, setView] = useState<View>({ k: 'loading' });
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmOff, setConfirmOff] = useState(false);

  const refresh = useCallback(async () => {
    if (!supabase) return;
    const { data, error: err } = await supabase.auth.mfa.listFactors();
    if (err || !data) return setView({ k: 'fail' });
    setView(data.totp.length > 0 ? { k: 'on' } : { k: 'off' });
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const start = async () => {
    if (!supabase) return;
    setBusy(true);
    setError('');
    const { data: list } = await supabase.auth.mfa.listFactors();
    for (const f of list?.all ?? []) {
      if (f.factor_type === 'totp' && f.status === 'unverified') await supabase.auth.mfa.unenroll({ factorId: f.id });
    }
    const { data, error: err } = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: `Authenticator ${Date.now()}`, issuer: 'Little World' });
    setBusy(false);
    if (err || !data) {
      setError(`${err?.message ?? 'Could not start.'} If it says MFA is disabled: Supabase, Authentication, Multi-Factor, turn TOTP on.`);
      return;
    }
    setCode('');
    setView({ k: 'setup', factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
  };

  const confirm = async (factorId: string) => {
    if (!supabase || code.length !== 6) return;
    setBusy(true);
    setError('');
    const { error: err } = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
    setBusy(false);
    if (err) {
      setCode('');
      return setError('That code is wrong or old. Use the newest code from the app.');
    }
    notify('Two-step verification is ON.');
    await refresh();
  };

  const cancelSetup = async (factorId: string) => {
    if (!supabase) return;
    await supabase.auth.mfa.unenroll({ factorId });
    setError('');
    setView({ k: 'off' });
  };

  const turnOff = async () => {
    if (!supabase) return;
    setBusy(true);
    setError('');
    const { data } = await supabase.auth.mfa.listFactors();
    for (const f of data?.totp ?? []) {
      const { error: err } = await supabase.auth.mfa.unenroll({ factorId: f.id });
      if (err) {
        setBusy(false);
        return setError(err.message);
      }
    }
    setBusy(false);
    setConfirmOff(false);
    notify('Two-step verification is OFF.');
    await refresh();
  };

  return (
    <section className="adm-sec2" aria-label="Two-step verification">
      <h3 className="adm-h3">Two-step verification</h3>
      {view.k === 'loading' && <p className="adm-help">Checking…</p>}
      {view.k === 'fail' && <p className="adm-error">Could not check. Close this window and open it again.</p>}

      {view.k === 'off' && (
        <>
          <p className="adm-help"><strong>Status: OFF.</strong> Right now only your password protects the admin. Turn this on to also need a 6-digit code from an app on your phone.</p>
          <button type="button" className="adm-btn adm-btn--primary" disabled={busy} onClick={() => void start()}>{busy ? 'Starting…' : 'Turn on'}</button>
        </>
      )}

      {view.k === 'setup' && (
        <div className="adm-stack">
          <p className="adm-help">1. Install Google Authenticator or Microsoft Authenticator on your phone.<br />2. Add an account and scan this QR code.<br />3. Type the 6-digit code it shows.</p>
          <img className="adm-qr" src={view.qr} alt="QR code to scan with your authenticator app" width={180} height={180} />
          <p className="adm-help">Cannot scan? Type this key in the app instead. Also save it somewhere safe, it is your backup:</p>
          <div className="adm-inline">
            <code className="adm-secret">{view.secret}</code>
            <button type="button" className="adm-btn" onClick={() => void copyText(view.secret).then((ok) => notify(ok ? 'Key copied.' : 'Could not copy.', ok ? 'ok' : 'error'))}>Copy</button>
          </div>
          <label className="adm-field">
            <span className="adm-label">6-digit code</span>
            <input className="adm-input adm-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="000000" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} />
          </label>
          {error && <p className="adm-error" role="alert">{error}</p>}
          <div className="adm-actions">
            <button type="button" className="adm-btn" onClick={() => void cancelSetup(view.factorId)}>Cancel</button>
            <button type="button" className="adm-btn adm-btn--primary" disabled={busy || code.length !== 6} onClick={() => void confirm(view.factorId)}>{busy ? 'Checking…' : 'Turn on'}</button>
          </div>
        </div>
      )}

      {view.k === 'on' && (
        <>
          <p className="adm-help"><strong>Status: ON.</strong> Every login needs your password and a code from your phone.</p>
          {!confirmOff ? (
            <button type="button" className="adm-btn" onClick={() => setConfirmOff(true)}>Turn off</button>
          ) : (
            <div className="adm-stack">
              <p className="adm-error">Turn off? Then only your password protects the admin.</p>
              <div className="adm-actions">
                <button type="button" className="adm-btn" onClick={() => setConfirmOff(false)}>Keep it on</button>
                <button type="button" className="adm-btn adm-btn--primary" disabled={busy} onClick={() => void turnOff()}>{busy ? 'Working…' : 'Yes, turn off'}</button>
              </div>
            </div>
          )}
        </>
      )}
      {view.k !== 'setup' && error && <p className="adm-error" role="alert">{error}</p>}
    </section>
  );
}
