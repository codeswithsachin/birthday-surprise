import type { CSSProperties, ReactNode } from 'react';
import { Heart } from './art';

/* A CSS envelope. Toggle `open` to flip the flap, fade the seal and
   slide the paper (children) upward. */
export function Envelope({
  open,
  children,
  className = '',
  style,
  seal = true,
}: {
  open: boolean;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  seal?: boolean;
}) {
  return (
    <div className={`env ${open ? 'is-open' : ''} ${className}`} style={style} aria-hidden="true">
      <div className="env-back" />
      <div className="env-paper">{children}</div>
      <div className="env-front" />
      <div className="env-flap" />
      {seal && (
        <div className="env-seal">
          <Heart width="18" height="17" color="#fff" />
        </div>
      )}
    </div>
  );
}
