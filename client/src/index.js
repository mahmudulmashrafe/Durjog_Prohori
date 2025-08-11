import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './components/authority/AuthorityLayout.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { NGOAuthProvider } from './context/NGOAuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <NGOAuthProvider>
        <LanguageProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </LanguageProvider>
      </NGOAuthProvider>
    </AuthProvider>
  </React.StrictMode>
); 