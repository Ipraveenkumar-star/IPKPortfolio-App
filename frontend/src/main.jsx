import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './styles/globals.css'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } }
})

// Remove initial loader after React mounts
const removeLoader = () => {
  const loader = document.getElementById('root-loader')
  if (loader) { loader.style.opacity = '0'; loader.style.transition = 'opacity 0.5s'; setTimeout(() => loader.remove(), 500) }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App onMount={removeLoader} />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1e1e2e', color: '#e8e4d8', border: '1px solid rgba(201,168,76,0.2)', fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem' },
            success: { iconTheme: { primary: '#00ff87', secondary: '#060608' } },
            error: { iconTheme: { primary: '#e85d26', secondary: '#060608' } },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
)
