import { useMemo } from "react";
import { useAuth } from "../context/AuthContext";

export const useSession = () => {
  const { user } = useAuth();
  const isSuperAdmin = useMemo(() => user?.role === "superadmin", [user?.role]);

  return { isSuperAdmin };
};
