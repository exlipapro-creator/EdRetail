import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './AppRouter';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);

// PWA service worker is production-only: registering it in dev would let it
// cache Vite's un-hashed /src/** modules and serve stale code after edits.
// Production caching behavior is unchanged.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('Service worker registration failed:', err);
    });
  });
}
