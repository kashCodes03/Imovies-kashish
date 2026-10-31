import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';
import type { User } from '../types/cinema';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  guestId: string;
  isAuthModalOpen: boolean;
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  authModalMode: 'login' | 'register';
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string, phone?: string) => Promise<void>;
  quickDemoLogin: (role: 'user' | 'admin') => Promise<void>;
  logout: () => void;
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('imovies_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Guest session ID
  const guestId = (() => {
    let id = localStorage.getItem('imovies_guest_id');
    if (!id) {
      id = `guest_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('imovies_guest_id', id);
    }
    return id;
  })();

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const res = await api.getMe();
          setUser(res.user);
        } catch (err) {
          console.warn('Session expired, clearing token');
          localStorage.removeItem('imovies_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    }
    loadUser();
  }, [token]);

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = async (email: string, pass: string) => {
    const res = await api.login(email, pass);
    localStorage.setItem('imovies_token', res.token);
    setToken(res.token);
    setUser(res.user);
    closeAuthModal();
    showToast(`Welcome back, ${res.user.name}!`, 'success');
  };

  const register = async (name: string, email: string, pass: string, phone?: string) => {
    const res = await api.register({ name, email, password: pass, phone });
    localStorage.setItem('imovies_token', res.token);
    setToken(res.token);
    setUser(res.user);
    closeAuthModal();
    showToast(`Account created successfully! Welcome to IMovies, ${res.user.name}.`, 'success');
  };

  const quickDemoLogin = async (role: 'user' | 'admin') => {
    const res = await api.quickDemo(role);
    localStorage.setItem('imovies_token', res.token);
    setToken(res.token);
    setUser(res.user);
    closeAuthModal();
    showToast(`Signed in as ${role === 'admin' ? 'Cinema Director (Admin)' : 'Sarah Jenkins (User)'}`, 'success');
  };

  const logout = () => {
    localStorage.removeItem('imovies_token');
    setToken(null);
    setUser(null);
    showToast('Signed out of IMovies.', 'info');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        guestId,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        authModalMode,
        login,
        register,
        quickDemoLogin,
        logout,
        toasts,
        showToast,
        removeToast
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
