/**
 * Konteks autentikasi untuk SODALIS berbasis Internet Identity.
 */
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { User } from "../backend";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export interface AuthUser {
  userId: string;
  role: string; // "Investor" | "Peminjam"
  name: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  setFromUserRecord: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { actor } = useActor();
  const { identity, clear } = useInternetIdentity();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setFromUserRecord = (userRecord: User) => {
    setUser({
      userId: String(userRecord.id),
      role: userRecord.role,
      name: userRecord.name,
    });
  };

  const refreshUser = useCallback(async () => {
    if (!identity || !actor) {
      setUser(null);
      return;
    }

    try {
      const currentUser = await actor.getCurrentUser();
      if (!currentUser) {
        setUser(null);
      } else {
        setFromUserRecord(currentUser);
      }
    } catch {
      setUser(null);
    }
  }, [actor, identity]);

  const logout = () => {
    setUser(null);
    clear();
  };

  useEffect(() => {
    setIsLoading(true);
    void refreshUser().finally(() => setIsLoading(false));
  }, [refreshUser]);

  return (
    <AuthContext.Provider value={{ user, isLoading, refreshUser, setFromUserRecord, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus digunakan di dalam AuthProvider");
  return ctx;
}
