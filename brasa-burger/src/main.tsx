import '@fontsource/anton/400.css';
import '@fontsource-variable/inter';
import '@fontsource-variable/montserrat';
import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { App } from './App';
import './index.css';

const container = document.getElementById('root');
if (container) {
  const app = (
    <StrictMode>
      <App />
    </StrictMode>
  );
  // O build já entrega o HTML pronto (SEO); em dev o contêiner está vazio.
  if (container.firstElementChild) hydrateRoot(container, app);
  else createRoot(container).render(app);
}
