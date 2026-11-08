import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { PrefsProvider } from './prefs';
import './styles.css';
import './anim.css';
import './chapters.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PrefsProvider>
      <App />
    </PrefsProvider>
  </StrictMode>,
);
