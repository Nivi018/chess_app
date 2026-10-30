import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { PrimeProvider } from './providers/prime-provider'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PrimeProvider>
      <App />
    </PrimeProvider>
  </React.StrictMode>,
)
