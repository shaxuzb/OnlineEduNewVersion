import { useQuery } from "@tanstack/react-query";
import { newsService } from "../services/newsService";

export const newsKeys = {
  all: ["news"] as const,
};

export function useNews() {
  return useQuery({
    queryKey: newsKeys.all,
    queryFn: newsService.getNews,
  });
}
