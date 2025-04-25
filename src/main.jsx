// src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import { AnimalProvider } from './context/AnimalContext.js';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AnimalProvider>
        <App />
      </AnimalProvider>
    </BrowserRouter>
  </StrictMode>
);