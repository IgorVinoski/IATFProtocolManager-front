import { createContext, useState, useContext, ReactNode, useEffect } from 'react';

// Define a URL base da API usando a variável de ambiente.
// Inclua um fallback para desenvolvimento local se a variável não estiver definida.
const API_BASE_URL = import.meta.env.VITE_ENDERECO_API || 'http://localhost:3000';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'Veterinário' | 'Técnico' | 'Produtor Rural';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: { name: string; email: string; password: string; role: 'Veterinário' | 'Técnico' | 'Produtor Rural' }) => Promise<boolean>;
  logout: () => void;
  getUserRole: () => 'Veterinário' | 'Técnico' | 'Produtor Rural' | null;
  // Nova função para atualizar os dados do usuário no contexto e localStorage
  updateUser: (updatedUserData: Partial<User>) => void;
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
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({ id: data.id, name: data.name, email: data.email, role: data.role }));
        setToken(data.token);
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
      return false;
    }
  };

  const register = async (userData: { name: string; email: string; password: string; role: 'Veterinário' | 'Técnico' | 'Produtor Rural' }): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({ id: data.id, name: data.name, email: data.email, role: data.role }));
        setToken(data.token);
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

  // Nova função para atualizar os dados do usuário no contexto e localStorage
  const updateUser = (updatedUserData: Partial<User>) => {
    setUser((prevUser) => {
      if (prevUser) {
        const newUser = { ...prevUser, ...updatedUserData };
        localStorage.setItem('user', JSON.stringify(newUser)); // Atualiza no localStorage
        return newUser;
      }
      return null;
    });
  };

  const getUserRole = () => {
    return user ? user.role : null;
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, register, logout, getUserRole, updateUser }}>
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
