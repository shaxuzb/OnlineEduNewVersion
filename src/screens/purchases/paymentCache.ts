import { QueryClient } from "@tanstack/react-query";

export const invalidateAfterSuccessfulPayment = async (
  queryClient: Pick<QueryClient, "invalidateQueries">,
) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ["purchases"] }),
    queryClient.invalidateQueries({ queryKey: ["orders"] }),
    queryClient.invalidateQueries({ queryKey: ["current-plan"] }),
  ]);
};
