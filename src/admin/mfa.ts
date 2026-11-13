import { supabase } from '../lib/supabase';

/** After the password step: does this login still need the 6-digit code? */
export async function getLevel(): Promise<'need-code' | 'ok'> {
  if (!supabase) return 'ok';
  const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (error || !data) return 'ok';
  return data.nextLevel === 'aal2' && data.currentLevel !== 'aal2' ? 'need-code' : 'ok';
}

/** Returns an error message, or null when the code was accepted. */
export async function verifyCode(code: string): Promise<string | null> {
  if (!supabase) return 'Not connected.';
  const { data, error } = await supabase.auth.mfa.listFactors();
  const factor = data?.totp[0];
  if (error || !factor) return 'No authenticator app is set up for this account.';
  const res = await supabase.auth.mfa.challengeAndVerify({ factorId: factor.id, code });
  if (res.error) {
    if (res.error.status === 429) return 'Too many tries. Wait a minute and try again.';
    return 'That code is wrong or old. Use the newest code from the app.';
  }
  return null;
}
