import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  login as apiLogin,
  logout as apiLogout,
  AuthResponse,
} from "./api/auth";
import { getToken } from "./cTokenStorage";

export type AuthContextType = {
  isAuthenticated: boolean;
  login: (username: string, pass: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const boot = async () => {
      const token = await getToken();
      setIsAuthenticated(!!token);
      setLoading(false);
    };
    boot();
  }, []);

  const login = async (username: string, pass: string) => {
    const res = await apiLogin({ username, password: pass });
    if (res.status === "success") setIsAuthenticated(true);
    return res;
  };

  const logout = async () => {
    await apiLogout();
    setIsAuthenticated(false);
  };

  const value: AuthContextType = { isAuthenticated, login, logout, loading };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within a AuthProvider");
  return ctx;
}
