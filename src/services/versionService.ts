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
  private static readonly CDN_URL = 'https://cdn.jsdelivr.net/gh/shaxuzb/OnlineEduNewVersion@main/version.json';

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
   * Try fetch from a single URL with cache busting
   */
  private static async tryFetch(baseUrl: string): Promise<RemoteVersionData> {
    const urlWithCacheBuster = `${baseUrl}?nocache=${new Date().getTime()}`;
    console.log('Trying to fetch from:', urlWithCacheBuster);
    
    const response = await fetch(urlWithCacheBuster, {
      method: 'GET',
      headers: { 
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'If-Modified-Since': '0',
        'If-None-Match': ''
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const rawText = await response.text();
    console.log('Raw response from', baseUrl, ':', rawText);
    
    const data = JSON.parse(rawText);
    
    // Validate the received data
    if (!data.latestVersion || !this.isValidVersion(data.latestVersion)) {
      throw new Error(`Invalid version format: ${data.latestVersion}`);
    }
    
    return data;
  }

  /**
   * Fetch remote version data with fallback
   */
  private static async fetchRemoteVersion(): Promise<RemoteVersionData> {
    const urls = [
      this.VERSION_URL,  // Primary: GitHub Raw
      this.CDN_URL       // Fallback: jsDelivr CDN
    ];
    
    let lastError: Error | null = null;
    
    for (let i = 0; i < urls.length; i++) {
      try {
        console.log(`Attempting fetch ${i + 1}/${urls.length} from: ${urls[i]}`);
        const data = await this.tryFetch(urls[i]);
        console.log('Successfully fetched data:', data);
        return data;
      } catch (error) {
        lastError = error as Error;
        console.warn(`Fetch attempt ${i + 1} failed:`, error);
        
        if (i < urls.length - 1) {
          console.log('Trying next URL...');
          // Wait 1 second before trying next URL
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    throw lastError || new Error('All fetch attempts failed');
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
