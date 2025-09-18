
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { login as apiLogin, logout as apiLogout, AuthResponse } from "./auth";
import { getToken } from "./tokenStorage";
import { getSelfDetails, Staff } from "./api/staff";

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

  useEffect(() => {
    const checkTokenAndFetchUser = async () => {
      const token = await getToken();
      if (token) {
        try {
          const staffDetails = await getSelfDetails();
          setUser(staffDetails);
        } catch (error) {
          console.error("Failed to fetch user on load", error);
        }
      }
      setLoading(false);
    };
    checkTokenAndFetchUser();
  }, []);

  const login = async (username: string, pass: string) => {
    const response = await apiLogin({ username, password: pass });
    if (response.status === "success") {
      try {
        const staffDetails = await getSelfDetails();
        setUser(staffDetails);
      } catch (error) {
        console.error("Failed to fetch user after login", error);
      }
    }
    return response;
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
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
