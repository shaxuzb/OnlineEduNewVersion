// queryClient.js
import { isServer, QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

let browserQueryClient: QueryClient | undefined;

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {},
  });
}

export default function getQueryClient() {
  if (isServer) {
    // Server: har request uchun yangi client
    return makeQueryClient();
  }

  // Browser: singleton
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }

  return browserQueryClient;
}
