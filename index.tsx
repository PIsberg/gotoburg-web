import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/**
 * The site used to run on HashRouter, so every article link that was ever shared
 * or bookmarked looks like https://www.gotoburg.se/#/some-slug. The fragment is
 * never sent to the server, so those URLs now land on the home page. Rewrite
 * them to the real path before React mounts, so old links keep working.
 */
const legacyHash = window.location.hash;
if (legacyHash.startsWith('#/')) {
  const target = legacyHash.slice(1);
  if (target !== '/') {
    window.history.replaceState(null, '', target + window.location.search);
  } else {
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
