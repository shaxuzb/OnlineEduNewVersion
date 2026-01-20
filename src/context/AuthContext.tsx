import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import * as SecureStore from "expo-secure-store";
import { AuthToken, AuthUserData, UserSubscription } from "../types";
import { $axiosBase, $axiosPrivate } from "../services/AxiosService";
import DeviceInfo from "react-native-device-info";
import { queryClient } from "../utils/helpers/queryClient";
import { useQuery } from "@tanstack/react-query";
interface AuthContextType {
  user: AuthUserData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoginLoading: boolean;
  refetchPlan: () => void;
  plan: UserSubscription | null;
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
  const { data: plan, refetch } = useQuery<UserSubscription>({
    queryKey: ["current-plan"],
    queryFn: async () => {
      const response = await $axiosPrivate.get<UserSubscription>(
        "subscription-plan/current-plan",
      );
      return response.data;
    },
    enabled: !!user,
  });

  const isAuthenticated = !!user;
  useEffect(() => {
    checkAuthStatus();
  }, []);
  useEffect(() => {
    if (isAuthenticated) {
      refetch();
    }
  }, [isAuthenticated]);
  // const checkPlan = async () => {
  //   try {
  //     const planData = await $axiosPrivate.get(
  //       "subscription-plan/current-plan",
  //     );
  //     setPlan(planData.data);
  //   } catch (error) {
  //     console.error("Error fetching subscription plan:", error);
  //   }
  // };

  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      // Add a minimum loading time to show splash screen nicely
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const data = JSON.parse(
        String(await SecureStore.getItemAsync("session")),
      ) as AuthToken | null;

      // Debug: saqlangan session ma'lumotlarini ko'rish (development uchun)
      // console.log("Stored session data:", data);
      // console.log("Stored user data:", data?.user);

      await $axiosPrivate.get("subscription-plan/current-plan");
      setUser(data?.user ?? null);
      setIsLoading(false);

      setIsLoading(false);
    } catch (error) {
      if ((error as any).status === 401) {
        logout();
      }
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<any> => {
    setIsLoginLoading(true);
    try {
      const { data } = await $axiosBase.post<AuthToken>("/account/login", {
        userName: email,
        password,
        uniqueId: (await DeviceInfo.getUniqueId()).toString(),
      });
      if (data) {
        setIsLoginLoading(false);

        // Debug: login qilganda qanday ma'lumotlar kelayotganini ko'rish (development uchun)
        // console.log("Login response data:", data);
        // console.log("Login user data:", data.user);

        SecureStore.setItem("session", JSON.stringify(data));
        setUser(data.user); // faqat agar `data.user` mavjud bo'lsa
      }
      return true;
    } catch (error) {
      setIsLoginLoading(false);
      return error;
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync(AUTH_TOKEN_SESSION);
      queryClient.clear();
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    plan: plan || null,
    isLoginLoading,
    login,
    logout,
    refetchPlan: refetch,
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
