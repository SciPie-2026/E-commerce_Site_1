import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getCurrentUserFn, loginFn, registerFn, logoutFn } from "./server/auth";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (data: Parameters<typeof loginFn>[0]["data"]) => Promise<AuthUser>;
  register: (data: Parameters<typeof registerFn>[0]["data"]) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await getCurrentUserFn();
      setUser(res.user);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (data: Parameters<typeof loginFn>[0]["data"]): Promise<AuthUser> => {
    const res = await loginFn({ data });
    setUser(res.user);
    return res.user;
  };

  const register = async (data: Parameters<typeof registerFn>[0]["data"]): Promise<AuthUser> => {
    const res = await registerFn({ data });
    setUser(res.user);
    return res.user;
  };

  const logout = async () => {
    await logoutFn();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAdmin: user?.role === "ADMIN",
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
