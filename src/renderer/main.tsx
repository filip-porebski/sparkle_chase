import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Harden: prevent drag & drop navigation of the webview
window.addEventListener('dragover', (e) => e.preventDefault());
window.addEventListener('drop', (e) => e.preventDefault());

// Disable context menu in production (keep for inputs)
if (import.meta.env.MODE !== 'development') {
  window.addEventListener('contextmenu', (e) => {
    const el = e.target as HTMLElement;
    if (el && (['INPUT','TEXTAREA','SELECT'].includes(el.tagName) || el.isContentEditable)) return;
    e.preventDefault();
  });
}
