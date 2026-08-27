import './style.css'
import './setupLoaders'
import { createRoot } from 'react-dom/client'
import App from './app/App'
import { StrictMode } from 'react'
import { bindGameAnalytics, initAnalytics } from './core/analytics'

initAnalytics()
bindGameAnalytics()

createRoot(document.querySelector('#root')).render(<StrictMode><App /></StrictMode>)