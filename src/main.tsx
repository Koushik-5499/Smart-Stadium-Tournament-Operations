import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

/**
 * Application entry point.
 *
 * Initializes axe-core for automated accessibility auditing in development
 * (FIX #2: verifiable a11y check), wraps the app in BrowserRouter for
 * client-side routing.
 */

// Automated accessibility check (FIX #2) — runs only in development
if (import.meta.env.DEV) {
  import('@axe-core/react').then((axe) => {
    axe.default(React, ReactDOM, 1000);
  });
}

const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>,
  );
}
