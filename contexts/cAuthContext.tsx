import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "expo-router";
import {
  login as apiLogin,
  logout as apiLogout,
  AuthResponse,
} from "./api/auth";
import { getToken } from "./cTokenStorage";
import { getStaffDetails, Staff } from "./api/staff";

interface AuthContextType {
  user: Staff | null;
  login: (username: string, pass: string) => Promise<AuthResponse>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkToken = async () => {
      const token = await getToken();
      if (token) {
        // If you have a way to get staff_id from token, you can fetch user details here
        // For now, we'll just assume a logged in state
        // setUser(await getStaffDetails(staffId));
      }
      setLoading(false);
    };
    checkToken();
  }, []);

  const login = async (username: string, pass: string) => {
    try {
      const response = await apiLogin({ username, password: pass });
      if (response.status === "success" && response.staff_id) {
        const staffDetails = await getStaffDetails(response.staff_id);
        setUser(staffDetails);
      }
      return response;
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return context;
};
