import { Platform } from "react-native";
import * as Application from "expo-application";

export interface VersionInfo {
  currentVersion: string;
  storeVersion: string;
  updateAvailable: boolean;
  storeUrl: string;
  forceUpdate: boolean;
}

interface RemoteVersionData {
  latestVersion: string;
  updateUrlAndroid: string;
  updateUrlIos: string;
  forceUpdate: boolean;
}

class VersionService {
  private static readonly VERSION_URL =
    "https://raw.githubusercontent.com/shaxuzb/OnlineEduNewVersion/main/version.json";
  private static readonly CDN_URL =
    "https://cdn.jsdelivr.net/gh/shaxuzb/OnlineEduNewVersion@main/version.json";

  static getCurrentVersion(): string {
    return Application.nativeApplicationVersion || "1.0.3";
  }

  private static isNewerVersion(current: string, remote: string): boolean {
    const currentParts = current.split(".").map(Number);
    const remoteParts = remote.split(".").map(Number);

    for (let i = 0; i < Math.max(currentParts.length, remoteParts.length); i++) {
      const currentPart = currentParts[i] || 0;
      const remotePart = remoteParts[i] || 0;

      if (remotePart > currentPart) return true;
      if (remotePart < currentPart) return false;
    }

    return false;
  }

  private static isValidVersion(version: string): boolean {
    return /^\d+\.\d+\.\d+$/.test(version);
  }

  private static async tryFetch(baseUrl: string): Promise<RemoteVersionData> {
    const urlWithCacheBuster = `${baseUrl}?nocache=${Date.now()}`;
    const response = await fetch(urlWithCacheBuster, {
      method: "GET",
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
        Pragma: "no-cache",
        Expires: "0",
        "If-Modified-Since": "0",
        "If-None-Match": "",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = JSON.parse(await response.text()) as RemoteVersionData;
    if (!data.latestVersion || !this.isValidVersion(data.latestVersion)) {
      throw new Error(`Invalid version format: ${data.latestVersion}`);
    }
    if (
      typeof data.updateUrlAndroid !== "string" ||
      typeof data.updateUrlIos !== "string" ||
      typeof data.forceUpdate !== "boolean"
    ) {
      throw new Error("Invalid remote version payload");
    }

    return data;
  }

  private static async fetchRemoteVersion(): Promise<RemoteVersionData> {
    const urls = [this.VERSION_URL, this.CDN_URL];
    let lastError: Error | null = null;

    for (let i = 0; i < urls.length; i++) {
      try {
        return await this.tryFetch(urls[i]);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (i < urls.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    }

    throw lastError || new Error("All version fetch attempts failed");
  }

  static async checkForUpdates(): Promise<VersionInfo> {
    const currentVersion = this.getCurrentVersion();
    const remoteData = await this.fetchRemoteVersion();
    const updateAvailable = this.isNewerVersion(
      currentVersion,
      remoteData.latestVersion,
    );
    const storeUrl =
      Platform.OS === "ios"
        ? remoteData.updateUrlIos
        : remoteData.updateUrlAndroid;

    return {
      currentVersion,
      storeVersion: remoteData.latestVersion,
      updateAvailable,
      storeUrl,
      forceUpdate: remoteData.forceUpdate,
    };
  }

  static async checkForUpdatesMock(): Promise<VersionInfo> {
    const currentVersion = this.getCurrentVersion();
    const hasUpdate = Math.random() > 0.5;

    return {
      currentVersion,
      storeVersion: hasUpdate ? "1.0.5" : currentVersion,
      updateAvailable: hasUpdate,
      storeUrl:
        Platform.OS === "ios"
          ? "https://apps.apple.com/us/app/onlineedu/id1234567890"
          : "https://play.google.com/store/apps/details?id=com.anonymous.onlineedu",
      forceUpdate: false,
    };
  }
}

export default VersionService;
