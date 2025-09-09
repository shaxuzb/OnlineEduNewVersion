import { Platform } from 'react-native';
import * as Application from 'expo-application';

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
  private static readonly VERSION_URL = 'https://raw.githubusercontent.com/shaxuzb/OnlineEduNewVersion/main/version.json';

  /**
   * Get current app version
   */
  static getCurrentVersion(): string {
    return Application.nativeApplicationVersion || '1.0.3';
  }

  /**
   * Compare two version strings
   */
  private static isNewerVersion(current: string, remote: string): boolean {
    const currentParts = current.split('.').map(Number);
    const remoteParts = remote.split('.').map(Number);
    
    for (let i = 0; i < Math.max(currentParts.length, remoteParts.length); i++) {
      const currentPart = currentParts[i] || 0;
      const remotePart = remoteParts[i] || 0;
      
      if (remotePart > currentPart) return true;
      if (remotePart < currentPart) return false;
    }
    
    return false;
  }

  /**
   * Validate version format
   */
  private static isValidVersion(version: string): boolean {
    // Check if version matches pattern like 1.0.5, 2.1.0, etc.
    const versionPattern = /^\d+\.\d+\.\d+$/;
    return versionPattern.test(version);
  }

  /**
   * Fetch remote version data
   */
  private static async fetchRemoteVersion(): Promise<RemoteVersionData> {
    const response = await fetch(this.VERSION_URL, {
      headers: { 'Cache-Control': 'no-cache' }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Validate the received data
    if (!data.latestVersion || !this.isValidVersion(data.latestVersion)) {
      throw new Error(`Invalid version format: ${data.latestVersion}`);
    }
    
    console.log('Raw GitHub data:', data);
    return data;
  }

  /**
   * Check for updates
   */
  static async checkForUpdates(): Promise<VersionInfo> {
    try {
      const currentVersion = this.getCurrentVersion();
      console.log('Fetching version from GitHub...', this.VERSION_URL);
      
      const remoteData = await this.fetchRemoteVersion();
      console.log('Remote data received:', remoteData);
      
      const updateAvailable = this.isNewerVersion(currentVersion, remoteData.latestVersion);
      const storeUrl = Platform.OS === 'ios' 
        ? remoteData.updateUrlIos 
        : remoteData.updateUrlAndroid;

      console.log('Version comparison result:', {
        current: currentVersion,
        remote: remoteData.latestVersion,
        updateAvailable,
        platform: Platform.OS,
        storeUrl
      });

      return {
        currentVersion,
        storeVersion: remoteData.latestVersion,
        updateAvailable,
        storeUrl,
        forceUpdate: remoteData.forceUpdate
      };
    } catch (error) {
      console.error('Version check failed:', error);
      
      // Fallback
      const currentVersion = this.getCurrentVersion();
      return {
        currentVersion,
        storeVersion: currentVersion,
        updateAvailable: false,
        storeUrl: '',
        forceUpdate: false
      };
    }
  }

  /**
   * Mock for development
   */
  static async checkForUpdatesMock(): Promise<VersionInfo> {
    const currentVersion = this.getCurrentVersion();
    const hasUpdate = Math.random() > 0.5;
    
    return {
      currentVersion,
      storeVersion: hasUpdate ? '1.0.5' : currentVersion,
      updateAvailable: hasUpdate,
      storeUrl: Platform.OS === 'ios' 
        ? 'https://apps.apple.com/us/app/onlineedu/id1234567890'
        : 'https://play.google.com/store/apps/details?id=com.anonymous.onlineedu',
      forceUpdate: false
    };
  }
}

export default VersionService;
