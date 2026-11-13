import '@fontsource-variable/inter';
import '@fontsource-variable/unbounded';
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
