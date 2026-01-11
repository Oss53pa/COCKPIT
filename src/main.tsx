import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import * as serviceWorkerRegistration from './utils/serviceWorkerRegistration';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Enregistrer le Service Worker pour le mode offline
serviceWorkerRegistration.register({
  onSuccess: () => {
    console.log('Application disponible hors ligne');
  },
  onUpdate: () => {
    console.log('Nouvelle version disponible');
  },
  onOffline: () => {
    console.log('Application en mode hors ligne');
  },
  onOnline: () => {
    console.log('Connexion rétablie');
  },
});
