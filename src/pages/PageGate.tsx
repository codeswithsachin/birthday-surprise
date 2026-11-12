import { Suspense, lazy, useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { Face } from '../components/mascot';
import { content } from '../content';
import {
  applyPageData,
  loadPage,
  loadPreview,
  parsePreviewMessage,
  recordView,
  type LoadResult,
} from '../loadContent';
import './gate.css';

const App = lazy(() => import('../App'));

type View = { kind: 'loading' } | { kind: 'show' } | Exclude<LoadResult, { state: 'ok' }>;

function Card({ children, sleepy = false }: { children: React.ReactNode; sleepy?: boolean }) {
  return (
    <main className="gate">
      <div className="gate-card">
        <svg className="gate-face" viewBox="30 14 140 140" aria-hidden="true">
          <Face animal="teddy" sleepy={sleepy} />
        </svg>
        {children}
      </div>
    </main>
  );
}

function Loading() {
  return (
    <main className="gate" role="status" aria-label="Loading your surprise">
      <div className="gate-card">
        <p className="hand">one moment…</p>
        <div className="gate-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
      </div>
    </main>
  );
}

function Countdown({ result, onDone }: { result: Extract<LoadResult, { state: 'locked' }>; onDone: () => void }) {
  const [, tick] = useState(0);
  const doneRef = useRef(false);
  // Server time + time passed since it was received. The visitor's own clock is never used.
  const nowMs = result.serverNow + (performance.now() - result.fetchedAt);
  const left = Math.max(0, result.unlockAt - nowMs);

  useEffect(() => {
    const id = window.setInterval(() => tick((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, []);
  useEffect(() => {
    if (left <= 0 && !doneRef.current) {
      doneRef.current = true;
      const t = window.setTimeout(onDone, 800);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [left, onDone]);

  const s = Math.floor(left / 1000);
  const parts: [number, string][] = [
    [Math.floor(s / 86400), 'days'],
    [Math.floor((s % 86400) / 3600), 'hours'],
    [Math.floor((s % 3600) / 60), 'min'],
    [s % 60, 'sec'],
  ];
  return (
    <Card sleepy>
      <h1>Not quite yet…</h1>
      <p>Something sweet is being kept safe for you. It opens in</p>
      <div className="countdown" role="timer" aria-live="off">
        {parts.map(([n, label]) => (
          <div key={label}>
            <b>{String(n).padStart(2, '0')}</b>
            <small>{label}</small>
          </div>
        ))}
      </div>
      <p className="hand">come back soon ♡</p>
    </Card>
  );
}

function PinScreen({
  wrong,
  retryAfter,
  busy,
  onSubmit,
}: {
  wrong: boolean;
  retryAfter: number;
  busy: boolean;
  onSubmit: (pin: string) => void;
}) {
  const [pin, setPin] = useState('');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (/^[0-9]{4,8}$/.test(pin)) onSubmit(pin);
  };
  const message = wrong
    ? retryAfter > 0
      ? `Too many tries. Please wait ${Math.ceil(retryAfter / 60)} minute(s) and try again.`
      : 'That is not the right PIN. Try again.'
    : '';
  return (
    <Card>
      <h1>This surprise has a secret PIN</h1>
      <p>Type the PIN you were given to open it.</p>
      <form onSubmit={submit}>
        <input
          className="gate-input"
          type="password"
          inputMode="numeric"
          autoComplete="off"
          maxLength={8}
          value={pin}
          aria-label="PIN"
          aria-invalid={wrong}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
        />
        <p className="gate-error" role="alert">
          {message}
        </p>
        <button className="gate-btn" type="submit" disabled={busy || pin.length < 4}>
          {busy ? 'Checking…' : 'Open ♡'}
        </button>
      </form>
    </Card>
  );
}

export default function PageGate({ slug, preview }: { slug: string; preview: boolean }) {
  const [view, setView] = useState<View>({ kind: 'loading' });
  const [busy, setBusy] = useState(false);
  const [appKey, setAppKey] = useState(0);
  const chapterRef = useRef(0);
  const onIndex = useCallback((i: number) => {
    chapterRef.current = i;
  }, []);

  const handle = useCallback(
    (r: LoadResult) => {
      if (r.state === 'ok') {
        const first = content.scrapbook.photos[0];
        if (first) new Image().src = first.src; // start loading the first photo early
        if (!preview) recordView(slug);
        setView({ kind: 'show' });
      } else {
        setView(r);
      }
    },
    [slug, preview],
  );

  const load = useCallback(
    async (pin?: string) => {
      try {
        handle(preview ? await loadPreview(slug) : await loadPage(slug, pin));
      } catch {
        setView({ state: 'error', message: 'Network problem.' });
      } finally {
        setBusy(false);
      }
    },
    [slug, preview, handle],
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const r = preview ? await loadPreview(slug) : await loadPage(slug);
        if (!cancelled) handle(r);
      } catch {
        if (!cancelled) setView({ state: 'error', message: 'Network problem.' });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, preview, handle]);

  /* admin live preview: the editor sends the unsaved draft */
  useEffect(() => {
    if (!preview) return undefined;
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.source !== window.parent) return;
      const data = parsePreviewMessage(e.data);
      if (!data) return;
      applyPageData(data);
      setAppKey((k) => k + 1);
      setView({ kind: 'show' });
    };
    window.addEventListener('message', onMsg);
    if (window.parent !== window) window.parent.postMessage({ type: 'lw-preview-ready' }, window.location.origin);
    return () => window.removeEventListener('message', onMsg);
  }, [preview]);

  const retry = () => {
    setView({ kind: 'loading' });
    void load();
  };

  if ('kind' in view) {
    if (view.kind === 'loading') return <Loading />;
    return (
      <Suspense fallback={<Loading />}>
        <App key={appKey} startAt={preview ? chapterRef.current : 0} onIndexChange={onIndex} />
      </Suspense>
    );
  }

  switch (view.state) {
    case 'locked':
      return <Countdown result={view} onDone={retry} />;
    case 'pin_required':
    case 'pin_wrong':
      return (
        <PinScreen
          wrong={view.state === 'pin_wrong'}
          retryAfter={view.state === 'pin_wrong' ? view.retryAfter : 0}
          busy={busy}
          onSubmit={(pin) => {
            setBusy(true);
            void load(pin);
          }}
        />
      );
    case 'unconfigured':
      return (
        <Card>
          <h1>Almost ready</h1>
          <p>This site is not connected to its database yet. If you built it, add the two Supabase settings (see README).</p>
        </Card>
      );
    case 'error':
      return (
        <Card>
          <h1>Oops, we could not reach the surprise</h1>
          <p>Please check your internet and try again.</p>
          <button className="gate-btn" type="button" onClick={retry}>
            Try again
          </button>
        </Card>
      );
    case 'gone':
    default:
      return (
        <Card sleepy>
          <h1>This surprise is no longer here</h1>
          <p>The link may have ended, or it is not ready yet. If you think this is a mistake, ask the person who sent it.</p>
          <p className="hand">with love, always ♡</p>
        </Card>
      );
  }
}
