import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './styles/responsive.css'
import { GoogleOAuthProvider } from '@react-oauth/google';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* This is the "Socket" we were missing. 
        For now, I've put a fake 'clientId'. 
        You can get a real one from Google later. */}
    <GoogleOAuthProvider clientId="403590939187-4kvh12e1t8iuep8ddev97rj4h3a5dddr.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
)