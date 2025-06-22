import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './authenticate/authContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider> {/* 🔹 Aqui garante que o contexto está dentro do BrowserRouter */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
