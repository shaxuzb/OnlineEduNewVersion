import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { AuthToken } from "../types";

export const useSession = () => {
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const loadSession = async () => {
      const session = await SecureStore.getItemAsync("session");
      if (session) {
        const userData = JSON.parse(session) as AuthToken;
        setIsSuperAdmin(userData.user.role === "superadmin");
      }
    };

    loadSession();
  }, []);

  return { isSuperAdmin };
};
