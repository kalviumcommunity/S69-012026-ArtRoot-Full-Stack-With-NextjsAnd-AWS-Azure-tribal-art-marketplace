'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Role } from '@/lib/rbac';
import { getUserSession, clearUserSession } from '@/lib/auth';

interface User {
  userId: string;
  email: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  hasRole: (role: Role) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const session = getUserSession();
      if (session) {
        return {
          userId: session.userId,
          email: session.email,
          role: session.role,
        };
      }
    }
    return null;
  });

  const login = (token: string) => {
    localStorage.setItem('token', token);
    const session = getUserSession();
    if (session) {
      setUser({
        userId: session.userId,
        email: session.email,
        role: session.role,
      });
    }
  };

  const logout = () => {
    clearUserSession();
    setUser(null);
  };

  const hasRole = (role: Role) => {
    return user?.role === role;
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
