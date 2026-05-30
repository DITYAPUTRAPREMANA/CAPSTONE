/**
 * Konteks autentikasi untuk SODALIS
 * Menyimpan data user yang sedang login
 */
import { type ReactNode, createContext, useContext, useState } from "react";

export interface AuthUser {
  userId: string;
  role: string; // "Investor" | "Borrower"
  name: string;
}

const STORAGE_KEY = "sodalis_user";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const parsed = stored ? (JSON.parse(stored) as AuthUser) : null;
      // Mark loading as done after synchronous read
      setTimeout(() => setIsLoading(false), 0);
      return parsed;
    } catch {
      setTimeout(() => setIsLoading(false), 0);
      return null;
    }
  });

  const login = (userData: AuthUser) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus digunakan di dalam AuthProvider");
  return ctx;
}
