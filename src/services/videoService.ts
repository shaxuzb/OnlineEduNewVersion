import { $axiosPrivate } from "./AxiosService";

export interface VideoMetadata {
  id: string;
  title: string;
  duration: number;
  size: number;
  format: string;
  quality: string;
  createdAt: string;
}

export interface VideoStreamResponse {
  streamUrl: string;
  metadata: VideoMetadata;
}

class VideoService {
  /**
   * Get video metadata by videoFileId
   */
  async getVideoMetadata(videoFileId: string): Promise<VideoMetadata> {
    try {
      const response = await $axiosPrivate.get(`/videos/${videoFileId}/metadata`);
      return response.data;
    } catch (error) {
      console.error("Error fetching video metadata:", error);
      throw error;
    }
  }

  /**
   * Get video stream URL with authentication
   * This method returns the authenticated URL for direct streaming
   */
  getVideoStreamUrl(videoFileId: string): string {
    // This will use the base URL from AxiosService and include authentication headers
    // through the interceptor when the video component makes the request
    return `/videos/${videoFileId}`;
  }

  /**
   * Check if video is available for streaming
   */
  async checkVideoAvailability(videoFileId: string): Promise<boolean> {
    try {
      const response = await $axiosPrivate.head(`/videos/${videoFileId}`);
      return response.status === 200;
    } catch (error) {
      console.error("Error checking video availability:", error);
      return false;
    }
  }

  /**
   * Get video analytics/progress data
   */
  async getVideoProgress(videoFileId: string): Promise<{
    watchedDuration: number;
    totalDuration: number;
    lastWatchedAt: string;
    completed: boolean;
  }> {
    try {
      const response = await $axiosPrivate.get(`/videos/${videoFileId}/progress`);
      return response.data;
    } catch (error) {
      console.error("Error fetching video progress:", error);
      throw error;
    }
  }

  /**
   * Update video watch progress
   */
  async updateVideoProgress(
    videoFileId: string,
    currentTime: number,
    duration: number
  ): Promise<void> {
    try {
      await $axiosPrivate.post(`/videos/${videoFileId}/progress`, {
        currentTime,
        duration,
        watchedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error updating video progress:", error);
      throw error;
    }
  }
}

export const videoService = new VideoService();
