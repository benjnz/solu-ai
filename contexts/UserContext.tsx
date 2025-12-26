import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, onAuthChanged, login as authLogin, logout as authLogout } from '../services/auth';

interface UserContextType {
  user: User | null;
  loading: boolean;
  login: (role: 'client' | 'associate') => Promise<void>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChanged((user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (role: 'client' | 'associate') => {
    const loggedInUser = await authLogin(role);
    setUser(loggedInUser);
  };

  const logout = async () => {
    await authLogout();
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
