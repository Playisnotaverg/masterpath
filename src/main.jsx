import React from 'react'
import ReactDOM from 'react-dom/client'
import { AuthProvider } from './context/AuthContext'
import App from './App'
import EnvBanner from './components/EnvBanner'
import './stripeConfig'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><AuthProvider><EnvBanner /><App /></AuthProvider></React.StrictMode>
)
