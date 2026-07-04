import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { LangProvider } from './context/LangContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

// Initialize Sentry if DSN is provided (guarded)
if (import.meta.env.VITE_SENTRY_DSN) {
  import('./design/sentry');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <LangProvider>
        <App />
      </LangProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);

// Register service worker for offline app-shell caching (PWA)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('Service worker registration failed:', err);
    });
  });
}
