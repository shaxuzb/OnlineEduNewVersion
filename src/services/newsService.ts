import { NewsResponse } from "../types";

class NewsService {
  // Based on the existing pattern from versionService, I'll use a similar base URL structure
  // Since there's no explicit base URL in the codebase, I'll create a configurable one
  private static readonly BASE_URL = "https://api.onlineedu.uz"; // Replace with actual base URL

  /**
   * Fetch news from the API
   */
  static async fetchNews(): Promise<NewsResponse> {
    try {
      const response = await fetch(`${this.BASE_URL}/news`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: NewsResponse = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to fetch news:", error);
      throw error;
    }
  }

  /**
   * Mock data for development/testing
   */
  static async fetchNewsMock(): Promise<NewsResponse> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      items: [
        {
          id: 2,
          title: "Hammaga",
          body: "Bugun katta malumotlar qo'shiladi",
          newsType: 2,
          scopeType: 0,
          isPinned: true,
          isPublished: false,
          createdAt: "2025-09-10T15:00:54.216146",
          publishedAt: null,
        },
        {
          id: 1,
          title: "Ogohlantirish",
          body: "Tizimdan to'g'ri foydalaning",
          newsType: 1,
          scopeType: 0,
          isPinned: true,
          isPublished: false,
          createdAt: "2025-09-10T10:34:35.279942",
          publishedAt: null,
        },
        {
          id: 4,
          title: "Korinish",
          body: "Elon bugungi malumotlar",
          newsType: 3,
          scopeType: 0,
          isPinned: false,
          isPublished: false,
          createdAt: "2025-09-10T16:10:11.782413",
          publishedAt: null,
        },
        {
          id: 3,
          title: "Salom",
          body: "Bugun yangiliklarni dodasi bor",
          newsType: 3,
          scopeType: 0,
          isPinned: false,
          isPublished: true,
          createdAt: "2025-09-10T15:10:10.894656",
          publishedAt: "2025-09-10T15:32:57.445571",
        },
      ],
      total: 4,
    };
  }
}

export default NewsService;
