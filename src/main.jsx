import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'

// CSS global
import './index.css'

const basename = import.meta.env.VITE_BASE_PATH || '/'
const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('#root não encontrado')

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
