import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  ApiError,
  getMe,
  loadStoredUser,
  loginWithGoogle,
  logout,
  type AuthUser,
  type GoogleSignInInput,
} from '../lib/api';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signInWithGoogle: (input: GoogleSignInInput) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function restore() {
      try {
        const stored = await loadStoredUser();
        if (!stored) return;

        try {
          const fresh = await getMe();
          if (active) setUser(fresh);
        } catch (error) {
          const invalid =
            error instanceof ApiError && (error.status === 401 || error.status === 404);
          if (active) setUser(invalid ? null : stored);
        }
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    void restore();

    return () => {
      active = false;
    };
  }, []);

  const signInWithGoogle = useCallback(async (input: GoogleSignInInput) => {
    const nextUser = await loginWithGoogle(input);
    setUser(nextUser);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await logout();
    } catch {
      // `logout` clears local storage in its own `finally` block.
      // If the API does not respond, we still close the local session.
    } finally {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
