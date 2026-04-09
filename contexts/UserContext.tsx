import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  onAuthChanged, 
  User, 
  login as authLogin, 
  logout as authLogout,
  loginWithEmail as authLoginWithEmail,
  registerWithEmail as authRegisterWithEmail
} from '../services/auth';

interface UserContextType {
  user: User | null;
  loading: boolean;
  isInitialized: boolean;
  login: (role: 'client' | 'associate') => Promise<User>;
  loginWithEmail: (email: string, password: string) => Promise<User>;
  registerWithEmail: (email: string, password: string, role?: 'client' | 'associate', name?: string) => Promise<User>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthChanged((user) => {
      setUser(user);
      setLoading(false);
      setIsInitialized(true);
    });
    return () => unsubscribe();
  }, []);

  const login = async (role: 'client' | 'associate'): Promise<User> => {
    try {
      const loggedInUser = await authLogin(role);
      setUser(loggedInUser);
      return loggedInUser;
    } catch (error) {
      console.error("Login failed in context:", error);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, password: string): Promise<User> => {
    try {
      const loggedInUser = await authLoginWithEmail(email, password);
      setUser(loggedInUser);
      return loggedInUser;
    } catch (error) {
      console.error("Email login failed in context:", error);
      throw error;
    }
  };

  const registerWithEmail = async (email: string, password: string, role: 'client' | 'associate' = 'client', name?: string): Promise<User> => {
    try {
      const loggedInUser = await authRegisterWithEmail(email, password, role, name);
      setUser(loggedInUser);
      return loggedInUser;
    } catch (error) {
      console.error("Email registration failed in context:", error);
      throw error;
    }
  };

  const logout = async () => {
    await authLogout();
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      loading, 
      isInitialized, 
      login, 
      loginWithEmail, 
      registerWithEmail, 
      logout 
    }}>
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
