import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

/* Renders overlays on document.body so they are never clipped or offset
   by transformed ancestors (like the animated chapter container). */
export function Portal({ children }: { children: ReactNode }) {
  if (typeof document === 'undefined') return null;
  return createPortal(children, document.body);
}
