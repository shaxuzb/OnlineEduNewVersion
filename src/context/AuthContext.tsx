import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import * as SecureStore from "expo-secure-store";
import { AuthToken, AuthUserData } from "../types";
import { $axiosBase, $axiosPrivate } from "../services/AxiosService";

interface AuthContextType {
  user: AuthUserData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoginLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const AUTH_TOKEN_SESSION = "session";

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [user, setUser] = useState<AuthUserData | null>(null);
  const isAuthenticated = !!user;

  // Check if user is already authenticated on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    setIsLoading(true);

    try {
      // Add a minimum loading time to show splash screen nicely
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const data = JSON.parse(
        String(await SecureStore.getItemAsync("session"))
      ) as AuthToken | null;
      await $axiosPrivate.get("/subjects")
      setUser(data?.user ?? null);
      setIsLoading(false);

      setIsLoading(false);
    } catch (error) {
      if((error as any).status === 401){
        logout()
      }
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoginLoading(true);

    try {
      const { data } = await $axiosBase.post<AuthToken>("/account/login", {
        userName: email,
        password,
      });

      if (data) {
        setIsLoginLoading(false);

        SecureStore.setItem("session", JSON.stringify(data));
        setUser(data.user); // faqat agar `data.user` mavjud bo‘lsa
      }
      return true;
    } catch (error) {
      setIsLoginLoading(false);
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync(AUTH_TOKEN_SESSION);
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    isLoginLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
