import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// React starts here. Vite loads index.html, then this file mounts the app shell.
// Keeping this file small makes the app entry obvious to anyone opening the project for the first time.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
