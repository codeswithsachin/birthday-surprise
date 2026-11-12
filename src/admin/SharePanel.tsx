import { useEffect, useState } from 'react';
import type { PageStatus } from '../lib/types';
import { copyText, pageUrl, type Notify } from './ui';

export default function SharePanel({ slug, status, notify }: { slug: string; status: PageStatus; notify: Notify }) {
  const url = pageUrl(slug);
  const [qr, setQr] = useState('');

  useEffect(() => {
    let cancelled = false;
    void import('qrcode')
      .then((m) => m.toDataURL(url, { margin: 2, width: 320, color: { dark: '#542d40', light: '#ffffff' } }))
      .then((d) => {
        if (!cancelled) setQr(d);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [url]);

  const wa = `https://wa.me/?text=${encodeURIComponent(`I made a little surprise for you ♡ ${url}`)}`;

  return (
    <div className="adm-stack">
      {status !== 'published' && <p className="adm-warn">This page is a draft. The link will show “no longer here” until you publish it.</p>}
      <input className="adm-input" readOnly value={url} onFocus={(e) => e.currentTarget.select()} aria-label="Surprise link" />
      <div className="adm-actions adm-actions--left">
        <button
          type="button"
          className="adm-btn adm-btn--primary"
          onClick={() => void copyText(url).then((ok) => notify(ok ? 'Link copied.' : 'Could not copy. Select the link and copy it.', ok ? 'ok' : 'error'))}
        >
          Copy link
        </button>
        <a className="adm-btn" href={wa} target="_blank" rel="noopener noreferrer">
          Share on WhatsApp
        </a>
      </div>
      {qr ? (
        <div className="adm-qr">
          <img src={qr} alt="QR code for the surprise link" width={160} height={160} />
          <a className="adm-link" href={qr} download={`${slug}-qr.png`}>
            Download QR
          </a>
        </div>
      ) : null}
    </div>
  );
}
