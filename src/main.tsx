import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './styles/index.css';
import { validateEnv } from './env';

// Run startup environment telemetry check
validateEnv();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root DOM element #root not found.');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
