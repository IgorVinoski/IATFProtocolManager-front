// src/context/AuthContext.tsx
import { createContext, useState, useContext, ReactNode, useEffect } from 'react';

// Define a URL base da API usando a variável de ambiente.
// Inclua um fallback para desenvolvimento local se a variável não estiver definida.
// IMPORTANTE: Certifique-se de que VITE_ENDERECO_API no seu .env do frontend
// seja, por exemplo, http://localhost:3000
const API_BASE_URL = import.meta.env.VITE_ENDERECO_API || 'http://localhost:3000';

interface User {
  id: string; // Mudado de _id para id para coincidir com o backend
  name: string;
  email: string;
  role: 'Veterinarian' | 'Technician' | 'Rural Producer';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: { name: string; email: string; password: string; role: 'Veterinarian' | 'Technician' | 'Rural Producer' }) => Promise<boolean>;
  logout: () => void;
  getUserRole: () => 'Veterinarian' | 'Technician' | 'Rural Producer' | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Tenta carregar o token e o usuário do localStorage ao iniciar
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Falha ao analisar usuário do localStorage. Limpando dados:", error);
        logout(); // Limpa dados inválidos que podem estar corrompidos
      }
    }
  }, []); // O array de dependências vazio garante que isso execute apenas uma vez ao montar

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, { // Usa API_BASE_URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        // Salva o ID como 'id' (UUID)
        localStorage.setItem('user', JSON.stringify({ id: data.id, name: data.name, email: data.email, role: data.role }));
        setToken(data.token);
        // Define o estado do usuário com 'id'
        setUser({ id: data.id, name: data.name, email: data.email, role: data.role });
        setIsAuthenticated(true);
        return true;
      } else {
        const errorData = await response.json();
        console.error('Login falhou:', errorData.message);
        return false;
      }
    } catch (error) {
      console.error('Erro durante o login:', error);
      // Retorna false para indicar falha na autenticação
      return false;
    }
  };

  const register = async (userData: { name: string; email: string; password: string; role: 'Veterinarian' | 'Technician' | 'Rural Producer' }): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, { // Usa API_BASE_URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        // Salva o ID como 'id' (UUID)
        localStorage.setItem('user', JSON.stringify({ id: data.id, name: data.name, email: data.email, role: data.role }));
        setToken(data.token);
        // Define o estado do usuário com 'id'
        setUser({ id: data.id, name: data.name, email: data.email, role: data.role });
        setIsAuthenticated(true);
        return true;
      } else {
        const errorData = await response.json();
        console.error('Registro falhou:', errorData.message);
        return false;
      }
    } catch (error) {
      console.error('Erro durante o registro:', error);
      // Retorna false para indicar falha no registro
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const getUserRole = () => {
    return user ? user.role : null;
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, register, logout, getUserRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};