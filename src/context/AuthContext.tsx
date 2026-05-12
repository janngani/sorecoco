import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '@/src/lib/api';

interface AuthContextType {
  user: any | null;
  userData: any | null;
  loading: boolean;
  isAdmin: boolean;
  login: (credentials: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  isAdmin: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const data = await api.auth.me();
      setUser(data);
    } catch (error) {
      console.error("Error fetching user:", error);
      localStorage.removeItem('auth_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (credentials: any) => {
    const data = await api.auth.login(credentials);
    localStorage.setItem('auth_token', data.token);
    setUser(data.user);
  };

  const register = async (formData: any) => {
    const data = await api.auth.register(formData);
    localStorage.setItem('auth_token', data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ 
      user, 
      userData: user, // In this new setup, user and userData are the same
      loading, 
      isAdmin,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};
