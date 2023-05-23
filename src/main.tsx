import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource/inter';
import App from './App.tsx';
import "./styles/globals.css";

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
