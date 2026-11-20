import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// This finds the <div id="root"></div> in your public/index.html and mounts your App.js UI onto it
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
