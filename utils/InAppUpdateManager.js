import SpInAppUpdates, { 
  IAUUpdateKind, 
  IAUInstallStatus 
} from 'sp-react-native-in-app-updates';

class InAppUpdateManager {
  static async checkAndStartUpdate() {
    try {
      // Update mavjudligini tekshirish
      const result = await SpInAppUpdates.checkNeedsUpdate();
      
      console.log('Update check result:', result);
      
      if (result.shouldUpdate) {
        console.log('Update mavjud, flexible update boshlash...');
        
        // FLEXIBLE update'ni boshlash - Google Play Store'ning o'zining UI'si chiqadi
        const updateResult = await SpInAppUpdates.startUpdate({
          updateType: IAUUpdateKind.FLEXIBLE, // FLEXIBLE type ishlatamiz
        });
        
        console.log('Update natijasi:', updateResult);
        
        return {
          success: true,
          updateStarted: true,
          result: updateResult
        };
      } else {
        console.log('Yangilanish kerak emas');
        return {
          success: true,
          updateStarted: false,
          message: 'No update needed'
        };
      }
    } catch (error) {
      console.error('In-app update xatoligi:', error);
      return {
        success: false,
        error: error.message || 'Unknown error'
      };
    }
  }

  // Update status'ini tekshirish uchun
  static async checkUpdateStatus() {
    try {
      const status = await SpInAppUpdates.installUpdate();
      console.log('Update status:', status);
      return status;
    } catch (error) {
      console.error('Update status tekshirishda xatolik:', error);
      return null;
    }
  }

  // Update'ni to'liq restart qilish uchun (FLEXIBLE update'dan keyin)
  static async completeFlexibleUpdate() {
    try {
      await SpInAppUpdates.installUpdate();
      return true;
    } catch (error) {
      console.error('Flexible update'ni tugatishda xatolik:', error);
      return false;
    }
  }
}

export default InAppUpdateManager;
