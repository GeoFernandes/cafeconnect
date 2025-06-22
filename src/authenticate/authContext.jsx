import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Criando contexto de autenticação
export const AuthContext = createContext();

// eslint-disable-next-line react/prop-types
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const navigate = useNavigate();

  const login = (receivedToken) => {
    setToken(receivedToken);
    localStorage.setItem('token', receivedToken); // Salva apenas o token
    navigate('/'); // Redireciona após login
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token'); // Remove o token
    navigate('/login'); // Redireciona após logout
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom Hook para acessar o contexto
export function useAuth() {
  return useContext(AuthContext);
}
