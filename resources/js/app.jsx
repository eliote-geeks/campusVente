import './bootstrap.js';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './MainApp.jsx';

const container = document.getElementById('app');
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}