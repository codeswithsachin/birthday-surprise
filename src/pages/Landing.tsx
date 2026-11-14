import { Face } from '../components/mascot';
import './gate.css';

/** The "/" page: tiny, neutral, not indexed by search engines. */
export default function Landing() {
  return (
    <main className="gate">
      <div className="gate-card">
        <svg className="gate-face" viewBox="30 14 140 140" aria-hidden="true">
          <Face animal="teddy" />
        </svg>
        <h1>A little surprise, made with care.</h1>
        <p>If someone sent you a private link, open that link to see your surprise.</p>
        <p className="gate-foot">
          Made by{' '}
          <a href="https://github.com/sachinkrcodes" target="_blank" rel="noopener noreferrer">
            sachinkrcodes
          </a>
        </p>
      </div>
    </main>
  );
}
