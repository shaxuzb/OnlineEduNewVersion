import { useQuery } from "@tanstack/react-query";
import { userService } from "../services/userService";

export const userKeys = {
  all: ["user"] as const,
  profile: ["user", "profile"] as const,
};

export function useUser() {
  return useQuery({
    queryKey: userKeys.profile,
    queryFn: userService.getUser,
  });
}
