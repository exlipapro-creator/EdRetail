import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import { AdminApp } from './admin/AdminApp';
import { LangProvider } from './context/LangContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Storefront */}
          <Route path="/" element={
            <LangProvider>
              <App />
            </LangProvider>
          } />
          {/* Admin — all /admin/* routes */}
          <Route path="/admin/*" element={<AdminApp />} />
        </Routes>
      </BrowserRouter>
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
