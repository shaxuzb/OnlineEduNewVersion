import { Platform } from 'react-native';
import AndroidInAppUpdates, {
  AndroidInAppUpdatesUpdateType,
  AndroidInAppUpdatesInstallStatus,
  AndroidInAppUpdatesUpdateAvailability,
} from '@gurukumparan/react-native-android-inapp-updates';

export interface UpdateResult {
  success: boolean;
  updateStarted?: boolean;
  message?: string;
  error?: string;
}

class InAppUpdateManager {
  /**
   * Dastur ochilganda update tekshirish va FLEXIBLE update boshlash
   */
  static async checkAndStartUpdate(): Promise<UpdateResult> {
    try {
      // Faqat Android'da ishlaydi
      if (Platform.OS !== 'android') {
        console.log('In-app updates faqat Android'da ishlaydi');
        return {
          success: true,
          updateStarted: false,
          message: 'iOS platformasida in-app update ishlamaydi'
        };
      }

      console.log('Update mavjudligini tekshirish...');
      
      // Update mavjudligini tekshirish
      const result = await AndroidInAppUpdates.checkNeedsUpdate();
      
      console.log('Update check result:', result);

      if (result.shouldUpdate) {
        console.log('Yangilanish mavjud! FLEXIBLE update boshlash...');
        
        // FLEXIBLE update'ni boshlash
        // Bu Google Play Store'ning o'zining UI sheet'ini ko'rsatadi
        await AndroidInAppUpdates.startUpdate({
          updateType: AndroidInAppUpdatesUpdateType.FLEXIBLE
        });

        console.log('FLEXIBLE update boshlandi');
        
        return {
          success: true,
          updateStarted: true,
          message: 'Update boshlandi'
        };
      } else {
        console.log('Yangilanish topilmadi');
        return {
          success: true,
          updateStarted: false,
          message: 'Yangilanish mavjud emas'
        };
      }
    } catch (error: any) {
      console.error('In-app update xatoligi:', error);
      return {
        success: false,
        error: error?.message || 'Unknown error',
        updateStarted: false
      };
    }
  }

  /**
   * Update status'ini tekshirish
   * FLEXIBLE update yuklangandan keyin bu metoddan foydalanish mumkin
   */
  static async checkUpdateStatus(): Promise<string | null> {
    try {
      if (Platform.OS !== 'android') {
        return null;
      }

      const status = await AndroidInAppUpdates.installUpdate();
      console.log('Update status:', status);
      
      switch (status) {
        case AndroidInAppUpdatesInstallStatus.DOWNLOADED:
          return 'downloaded';
        case AndroidInAppUpdatesInstallStatus.DOWNLOADING:
          return 'downloading';
        case AndroidInAppUpdatesInstallStatus.FAILED:
          return 'failed';
        case AndroidInAppUpdatesInstallStatus.INSTALLED:
          return 'installed';
        case AndroidInAppUpdatesInstallStatus.INSTALLING:
          return 'installing';
        case AndroidInAppUpdatesInstallStatus.PENDING:
          return 'pending';
        default:
          return 'unknown';
      }
    } catch (error) {
      console.error('Update status tekshirishda xatolik:', error);
      return null;
    }
  }

  /**
   * FLEXIBLE update'dan keyin app'ni restart qilish
   * Bu update download bo'lgandan keyin chaqiriladi
   */
  static async completeFlexibleUpdate(): Promise<boolean> {
    try {
      if (Platform.OS !== 'android') {
        return false;
      }

      // App'ni restart qilish (FLEXIBLE update'dan keyin)
      await AndroidInAppUpdates.installUpdate();
      return true;
    } catch (error) {
      console.error('Flexible update'ni tugatishda xatolik:', error);
      return false;
    }
  }

  /**
   * Immediate update (majburiy update) uchun
   * Bu Play Store'ning to'liq screen update UI'sini ko'rsatadi
   */
  static async startImmediateUpdate(): Promise<UpdateResult> {
    try {
      if (Platform.OS !== 'android') {
        return {
          success: false,
          error: 'Immediate update faqat Android'da ishlaydi'
        };
      }

      const result = await AndroidInAppUpdates.checkNeedsUpdate();
      
      if (result.shouldUpdate) {
        await AndroidInAppUpdates.startUpdate({
          updateType: AndroidInAppUpdatesUpdateType.IMMEDIATE
        });

        return {
          success: true,
          updateStarted: true,
          message: 'Immediate update boshlandi'
        };
      } else {
        return {
          success: true,
          updateStarted: false,
          message: 'Yangilanish mavjud emas'
        };
      }
    } catch (error: any) {
      console.error('Immediate update xatoligi:', error);
      return {
        success: false,
        error: error?.message || 'Unknown error'
      };
    }
  }
}

export default InAppUpdateManager;
