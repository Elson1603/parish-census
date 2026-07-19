import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type AuthRole = "user" | "admin";

interface AuthContextValue {
  isReady: boolean;
  role: AuthRole | null;
  login: (role: AuthRole, username: string, password: string) => boolean;
  logout: () => void;
}

const STORAGE_KEY = "parish-census-auth-role";

const credentials: Record<AuthRole, { username: string; password: string }> = {
  user: {
    username: "Lourdes",
    password: "User@123",
  },
  admin: {
    username: "Lourdesadmin",
    password: "Lourdesadmin@1987",
  },
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [role, setRole] = useState<AuthRole | null>(null);

  useEffect(() => {
    const storedRole = window.localStorage.getItem(STORAGE_KEY);
    if (storedRole === "user" || storedRole === "admin") {
      setRole(storedRole);
    }
    setIsReady(true);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isReady,
      role,
      login(nextRole, username, password) {
        const expected = credentials[nextRole];
        const isValid = username === expected.username && password === expected.password;
        if (!isValid) return false;

        setRole(nextRole);
        window.localStorage.setItem(STORAGE_KEY, nextRole);
        return true;
      },
      logout() {
        setRole(null);
        window.localStorage.removeItem(STORAGE_KEY);
      },
    }),
    [isReady, role],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
