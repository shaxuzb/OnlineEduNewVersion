import { Platform } from 'react-native';
import * as Application from 'expo-application';

export interface VersionInfo {
  currentVersion: string;
  storeVersion: string;
  updateAvailable: boolean;
  storeUrl: string;
}

export interface StoreVersionResponse {
  version: string;
  url: string;
}

class VersionService {
  // App Store va Google Play Store ma'lumotlari
  private static readonly APP_STORE_ID = 'YOUR_APP_STORE_ID'; // iOS App Store ID
  private static readonly PLAY_STORE_PACKAGE = 'com.anonymous.onlineedu'; // Android package name
  
  /**
   * Hozirgi ilova versiyasini olish
   */
  static getCurrentVersion(): string {
    return Application.nativeApplicationVersion || '1.0.0';
  }

  /**
   * Play Store dan versiya olish (Google Play Store API orqali)
   */
  private static async getPlayStoreVersion(): Promise<StoreVersionResponse> {
    try {
      // Google Play Store API ning ochiq endpoint'i yo'q, 
      // lekin web scraping yoki third-party service ishlatish mumkin
      
      // Bu yerda oddiy mock data qaytarmoqdamiz
      // Real holatda siz backend orqali yoki third-party service orqali tekshirasiz
      const response = await fetch(
        `https://play.google.com/store/apps/details?id=${this.PLAY_STORE_PACKAGE}&hl=en`
      );
      console.log(response);
      
      if (!response.ok) {
        throw new Error('Play Store ma\'lumotlarini olishda xatolik');
      }

      // Bu yerda real parsing mantiq bo'lishi kerak
      // Hozircha mock data qaytarmoqdamiz
      return {
        version: '1.0.4', // Mock versiya
        url: `https://play.google.com/store/apps/details?id=${this.PLAY_STORE_PACKAGE}`
      };
    } catch (error) {
      console.error('Play Store versiyasini olishda xatolik:', error);
      // Fallback versiya
      return {
        version: '1.0.0',
        url: `https://play.google.com/store/apps/details?id=${this.PLAY_STORE_PACKAGE}`
      };
    }
  }

  /**
   * App Store dan versiya olish (iTunes API orqali)
   */
  private static async getAppStoreVersion(): Promise<StoreVersionResponse> {
    try {
      const response = await fetch(
        `https://itunes.apple.com/lookup?id=${this.APP_STORE_ID}`
      );
      
      if (!response.ok) {
        throw new Error('App Store ma\'lumotlarini olishda xatolik');
      }

      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const appInfo = data.results[0];
        return {
          version: appInfo.version,
          url: appInfo.trackViewUrl
        };
      } else {
        throw new Error('App Store da ilova topilmadi');
      }
    } catch (error) {
      console.error('App Store versiyasini olishda xatolik:', error);
      // Fallback versiya
      return {
        version: '1.0.0',
        url: `https://apps.apple.com/app/id${this.APP_STORE_ID}`
      };
    }
  }

  /**
   * Backend orqali versiya tekshirish (tavsiya etilgan yondashuv)
   */
  private static async getVersionFromBackend(): Promise<StoreVersionResponse> {
    try {
      // Bu yerda sizning backend API endpoint'ingizga so'rov yuborasiz
      const response = await fetch('YOUR_BACKEND_API/version-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform: Platform.OS,
          packageName: this.PLAY_STORE_PACKAGE,
          appStoreId: this.APP_STORE_ID,
        }),
      });

      if (!response.ok) {
        throw new Error('Backend dan versiya olishda xatolik');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Backend versiya tekshirishda xatolik:', error);
      throw error;
    }
  }

  /**
   * Versiyalarni solishtirish
   */
  private static compareVersions(current: string, store: string): boolean {
    const currentParts = current.split('.').map(Number);
    const storeParts = store.split('.').map(Number);
    
    for (let i = 0; i < Math.max(currentParts.length, storeParts.length); i++) {
      const currentPart = currentParts[i] || 0;
      const storePart = storeParts[i] || 0;
      
      if (storePart > currentPart) {
        return true; // Update mavjud
      } else if (storePart < currentPart) {
        return false; // Hozirgi versiya yangiroq
      }
    }
    
    return false; // Versiyalar teng
  }

  /**
   * Asosiy versiya tekshirish funksiyasi
   */
  static async checkForUpdates(): Promise<VersionInfo> {
    try {
      const currentVersion = this.getCurrentVersion();
      let storeInfo: StoreVersionResponse;

      // Platform ga qarab store ma'lumotlarini olish
      if (Platform.OS === 'ios') {
        storeInfo = await this.getAppStoreVersion();
      } else if (Platform.OS === 'android') {
        storeInfo = await this.getPlayStoreVersion();
      } else {
        // Web yoki boshqa platformlar uchun
        storeInfo = {
          version: currentVersion,
          url: ''
        };
      }

      const updateAvailable = this.compareVersions(currentVersion, storeInfo.version);

      return {
        currentVersion,
        storeVersion: storeInfo.version,
        updateAvailable,
        storeUrl: storeInfo.url
      };
    } catch (error) {
      console.error('Versiya tekshirishda xatolik:', error);
      
      // Xatolik holatida hozirgi versiya bilan qaytarish
      const currentVersion = this.getCurrentVersion();
      return {
        currentVersion,
        storeVersion: currentVersion,
        updateAvailable: false,
        storeUrl: ''
      };
    }
  }

  /**
   * Development rejimi uchun mock data
   */
  static async checkForUpdatesMock(): Promise<VersionInfo> {
    // Development da test uchun
    const currentVersion = this.getCurrentVersion();
    const shouldShowUpdate = Math.random() > 0.6; // 40% ehtimol
    
    return {
      currentVersion,
      storeVersion: shouldShowUpdate ? '1.0.5' : currentVersion,
      updateAvailable: shouldShowUpdate,
      storeUrl: Platform.OS === 'ios' 
        ? `https://apps.apple.com/app/id${this.APP_STORE_ID}`
        : `https://play.google.com/store/apps/details?id=${this.PLAY_STORE_PACKAGE}`
    };
  }
}

export default VersionService;
