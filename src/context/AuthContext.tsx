import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
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
  login: (
    email: string,
    password: string,
  ) => Promise<boolean | { status: number }>;
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

  const { data: plan, refetch } = useQuery<UserSubscription>({
    queryKey: ["current-plan", user?.id],
    queryFn: async () => {
      const response = await $axiosPrivate.get<UserSubscription>(
        "subscription-plan/current-plan",
      );
      return response.data;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const checkAuthStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const session = await SecureStore.getItemAsync(AUTH_TOKEN_SESSION);
      if (!session) {
        setUser(null);
        return;
      }
      const data = JSON.parse(session) as AuthToken | null;
      setUser(data?.user ?? null);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = useCallback(
    async (
      email: string,
      password: string,
    ): Promise<boolean | { status: number }> => {
      setIsLoginLoading(true);
      try {
        const { data } = await $axiosBase.post<AuthToken>("/account/login", {
          userName: email,
          password,
          uniqueId: (await DeviceInfo.getUniqueId()).toString(),
        });
        if (data) {
          await SecureStore.setItemAsync(
            AUTH_TOKEN_SESSION,
            JSON.stringify(data),
          );
          setUser(data.user);
          return true;
        }
        return false;
      } catch (error) {
        const status =
          (error as any)?.response?.status ?? (error as any)?.status;
        if (typeof status === "number") {
          return { status };
        }
        return false;
      } finally {
        setIsLoginLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await SecureStore.deleteItemAsync(AUTH_TOKEN_SESSION);
      queryClient.clear();
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  }, []);

  const value: AuthContextType = useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      plan: plan || null,
      isLoginLoading,
      login,
      logout,
      refetchPlan: () => {
        void refetch();
      },
    }),
    [
      isAuthenticated,
      isLoading,
      isLoginLoading,
      login,
      logout,
      plan,
      refetch,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
