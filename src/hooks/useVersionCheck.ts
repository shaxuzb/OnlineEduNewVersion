import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import VersionService, { VersionInfo } from '../services/versionService';

interface UseVersionCheckReturn {
  versionInfo: VersionInfo | null;
  isChecking: boolean;
  updateAvailable: boolean;
  showUpdateSheet: boolean;
  error: string | null;
  checkForUpdates: () => Promise<void>;
  dismissUpdate: () => void;
  setShowUpdateSheet: (show: boolean) => void;
}

const LAST_UPDATE_CHECK_KEY = '@last_update_check';
const UPDATE_DISMISSED_KEY = '@update_dismissed_version';
const CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 soat

export const useVersionCheck = (
  autoCheck: boolean = true,
  showOnAppStart: boolean = true
): UseVersionCheckReturn => {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [showUpdateSheet, setShowUpdateSheet] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Oxirgi tekshirish vaqtini saqlash
  const saveLastCheckTime = async () => {
    try {
      await AsyncStorage.setItem(LAST_UPDATE_CHECK_KEY, Date.now().toString());
    } catch (error) {
      console.error('Last check time saqlashda xatolik:', error);
    }
  };

  // Oxirgi tekshirish vaqtini olish
  const getLastCheckTime = async (): Promise<number> => {
    try {
      const timeStr = await AsyncStorage.getItem(LAST_UPDATE_CHECK_KEY);
      return timeStr ? parseInt(timeStr, 10) : 0;
    } catch (error) {
      console.error('Last check time olishda xatolik:', error);
      return 0;
    }
  };

  // Update dismiss qilinganligini saqlash
  const saveUpdateDismissed = async (version: string) => {
    try {
      await AsyncStorage.setItem(UPDATE_DISMISSED_KEY, version);
    } catch (error) {
      console.error('Update dismiss saqlashda xatolik:', error);
    }
  };

  // Update dismiss qilinganligini tekshirish
  const isUpdateDismissed = async (version: string): Promise<boolean> => {
    try {
      const dismissedVersion = await AsyncStorage.getItem(UPDATE_DISMISSED_KEY);
      return dismissedVersion === version;
    } catch (error) {
      console.error('Update dismiss tekshirishda xatolik:', error);
      return false;
    }
  };

  // Tekshirish kerakmi deb qarash
  const shouldCheck = async (): Promise<boolean> => {
    const lastCheck = await getLastCheckTime();
    const now = Date.now();
    return (now - lastCheck) > CHECK_INTERVAL;
  };

  // Versiya tekshirish
  const checkForUpdates = useCallback(async () => {
    if (isChecking) return;

    setIsChecking(true);
    setError(null);

    try {
      // Development rejimida mock data ishlatish
      const versionResult = __DEV__ 
        ? await VersionService.checkForUpdatesMock()
        : await VersionService.checkForUpdates();

      setVersionInfo(versionResult);

      if (versionResult.updateAvailable) {
        // Update dismiss qilinmaganini tekshirish
        const dismissed = await isUpdateDismissed(versionResult.storeVersion);
        
        if (!dismissed && showOnAppStart) {
          // Bottom sheet ko'rsatish uchun kichik kechikish
          setTimeout(() => {
            setShowUpdateSheet(true);
          }, 1000);
        }
      }

      await saveLastCheckTime();
    } catch (err: any) {
      setError(err.message || 'Versiya tekshirishda xatolik');
      console.error('Version check error:', err);
    } finally {
      setIsChecking(false);
    }
  }, [isChecking, showOnAppStart]);

  // Update ni keyinroq qilish
  const dismissUpdate = useCallback(async () => {
    if (versionInfo?.storeVersion) {
      await saveUpdateDismissed(versionInfo.storeVersion);
    }
  }, [versionInfo]);

  // Komponent mount bo'lganda avtomatik tekshirish
  useEffect(() => {
    if (autoCheck && Platform.OS !== 'web') {
      const initCheck = async () => {
        const shouldCheckNow = await shouldCheck();
        if (shouldCheckNow) {
          checkForUpdates();
        } else {
          // Oxirgi saqlangan ma'lumotlarni yuklash
          try {
            // Bu yerda siz oxirgi saqlangan version info ni yuklashingiz mumkin
            // Hozircha faqat tekshirish amalga oshiramiz
          } catch (error) {
            console.error('Cached version info yuklashda xatolik:', error);
          }
        }
      };

      // App ochilgandan 2 soniya keyin tekshirish
      const timeout = setTimeout(initCheck, 2000);
      return () => clearTimeout(timeout);
    }
  }, [autoCheck, checkForUpdates]);

  return {
    versionInfo,
    isChecking,
    updateAvailable: versionInfo?.updateAvailable || false,
    showUpdateSheet,
    error,
    checkForUpdates,
    dismissUpdate,
    setShowUpdateSheet,
  };
};

export default useVersionCheck;
