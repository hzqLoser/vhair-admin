import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('HM_ADMIN_TOKEN'));

  const login = (newToken: string) => {
    localStorage.setItem('HM_ADMIN_TOKEN', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('HM_ADMIN_TOKEN');
    setToken(null);
  };

  // Sync with local storage changes if needed, mainly for initial load
  useEffect(() => {
    const storedToken = localStorage.getItem('HM_ADMIN_TOKEN');
    if (storedToken && storedToken !== token) {
      setToken(storedToken);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ token, login, logout, isAuthenticated: !!token }}>
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
