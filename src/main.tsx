import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { PrefsProvider } from './prefs';
import { parseRoute } from './router';
import Landing from './pages/Landing';
import PageGate from './pages/PageGate';
import './styles.css';
import './anim.css';
import './chapters.css';
import './theme.css';

/* The admin panel is a separate chunk, so visitors of a surprise never download it. */
const AdminApp = lazy(() => import('./admin/AdminApp'));

const initialRoute = parseRoute(window.location.pathname, window.location.search);

/* Inside the admin live preview, the page must never take the keyboard focus,
   otherwise the admin loses the cursor while typing. */
if (initialRoute.kind === 'surprise' && initialRoute.preview && window.parent !== window) {
  HTMLElement.prototype.focus = function noFocus(): void {
    /* disabled in preview */
  };
}

function Root() {
  const route = initialRoute;
  if (route.kind === 'admin') {
    return (
      <Suspense fallback={null}>
        <AdminApp />
      </Suspense>
    );
  }
  if (route.kind === 'surprise') {
    return (
      <PrefsProvider>
        <PageGate slug={route.slug} preview={route.preview} />
      </PrefsProvider>
    );
  }
  return <Landing />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
