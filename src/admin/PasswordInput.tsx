import { useState } from 'react';

type Props = {
  value: string;
  onChange: (v: string) => void;
  autoComplete: 'current-password' | 'new-password';
  autoFocus?: boolean;
  required?: boolean;
};

/** Password box with a Show / Hide button. */
export default function PasswordInput({ value, onChange, autoComplete, autoFocus, required }: Props) {
  const [show, setShow] = useState(false);
  return (
    <div className="adm-pw">
      <input
        className="adm-input"
        type={show ? 'text' : 'password'}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button type="button" className="adm-pw-toggle" aria-pressed={show} aria-label="Show password" onClick={() => setShow((s) => !s)}>
        {show ? 'Hide' : 'Show'}
      </button>
    </div>
  );
}
