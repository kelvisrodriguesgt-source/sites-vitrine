import '@fontsource/cormorant-garamond/latin-600-italic.css';
import '@fontsource/cormorant-garamond/latin-500.css';
import '@fontsource/cormorant-garamond/latin-600.css';
import '@fontsource-variable/jost';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AdminApp } from './AdminApp';
import './admin.css';

const container = document.getElementById('admin-root');
if (container) {
  createRoot(container).render(
    <StrictMode>
      <AdminApp />
    </StrictMode>
  );
}
