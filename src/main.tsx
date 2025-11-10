import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import TypeBoxDemo from './TypeBoxDemo.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TypeBoxDemo />
  </StrictMode>
);
