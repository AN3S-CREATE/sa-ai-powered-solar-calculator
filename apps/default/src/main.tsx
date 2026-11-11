import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.jsx';
import StandaloneControlPanel from './components/StandaloneControlPanel.jsx';
import { APP_BRANDING } from './config/branding';
import { GenesisAuthProvider } from './lib/genesis-auth.jsx';
import { GenesisRoot } from './lib/genesis.jsx';

document.title = APP_BRANDING.pageTitle;
document
  .querySelector('meta[name="description"]')
  ?.setAttribute('content', APP_BRANDING.description);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GenesisRoot>
      <GenesisAuthProvider>
        <App />
        <StandaloneControlPanel />
      </GenesisAuthProvider>
    </GenesisRoot>
  </StrictMode>,
);
