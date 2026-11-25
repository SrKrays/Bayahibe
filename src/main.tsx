import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
// fuentes servidas desde nuestro dominio (sin depender de Google Fonts)
import '@fontsource/kaushan-script/latin-400.css';
import '@fontsource-variable/plus-jakarta-sans/wght.css';
import './styles/global.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
