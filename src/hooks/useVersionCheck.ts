import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import VersionService, { VersionInfo } from "../services/versionService";

interface UseVersionCheckReturn {
  versionInfo: VersionInfo | null;
  isChecking: boolean;
  showUpdateSheet: boolean;
  checkForUpdates: () => Promise<void>;
  dismissUpdate: () => void;
  setShowUpdateSheet: (show: boolean) => void;
}

const LAST_CHECK_KEY = "@last_update_check";
const DISMISSED_VERSION_KEY = "@dismissed_version";
const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes for testing

export const useVersionCheck = (): UseVersionCheckReturn => {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [showUpdateSheet, setShowUpdateSheet] = useState(false);
  const hasCheckedRef = useRef(false);
  const isCheckingRef = useRef(false);

  // Check if we should check for updates
  const shouldCheck = async (): Promise<boolean> => {
    try {
      const lastCheck = await AsyncStorage.getItem(LAST_CHECK_KEY);
      if (!lastCheck) return true;

      const timeSinceLastCheck = Date.now() - parseInt(lastCheck);
      return timeSinceLastCheck > CHECK_INTERVAL;
    } catch {
      return true;
    }
  };

  // Check if version was dismissed
  const isVersionDismissed = async (version: string): Promise<boolean> => {
    try {
      const dismissedVersion = await AsyncStorage.getItem(
        DISMISSED_VERSION_KEY
      );
      return dismissedVersion === version;
    } catch {
      return false;
    }
  };

  // Save last check time
  const saveLastCheckTime = async () => {
    try {
      await AsyncStorage.setItem(LAST_CHECK_KEY, Date.now().toString());
    } catch (error) {
      // console.error("Failed to save last check time:", error);
    }
  };

  // Main check function
  const checkForUpdates = useCallback(async () => {
    if (Platform.OS === 'web') return;
    if (isCheckingRef.current) return;

    isCheckingRef.current = true;
    setIsChecking(true);

    try {
      // Always use real GitHub API
      const result = await VersionService.checkForUpdates();
      // console.log('Version check result:', result);

      setVersionInfo(result);

      if (result.updateAvailable) {
        const dismissed = await isVersionDismissed(result.storeVersion);
        if (!dismissed) {
          setTimeout(() => setShowUpdateSheet(true), 800);
        }
      }

      await saveLastCheckTime();
    } catch (error) {
      // console.error('Version check failed:', error);
    } finally {
      isCheckingRef.current = false;
      setIsChecking(false);
    }
  }, []);

  // Dismiss update
  const dismissUpdate = useCallback(async () => {
    if (versionInfo?.storeVersion) {
      try {
        await AsyncStorage.setItem(
          DISMISSED_VERSION_KEY,
          versionInfo.storeVersion
        );
      } catch (error) {
        // console.error("Failed to dismiss update:", error);
      }
    }
  }, [versionInfo]);

  // Auto check on first mount only
  useEffect(() => {
    const initCheck = async () => {
      if (hasCheckedRef.current) return;
      hasCheckedRef.current = true;

      // console.log('Initializing version check...');
      
      // Clear cache for testing - remove this in production
      await AsyncStorage.removeItem(LAST_CHECK_KEY);
      await AsyncStorage.removeItem(DISMISSED_VERSION_KEY);
      
      const shouldCheckNow = await shouldCheck();
      // console.log('Should check for updates:', shouldCheckNow);
      
      if (shouldCheckNow) {
        // console.log('Starting version check...');
        checkForUpdates();
      } else {
        // console.log('Skipping version check - checked recently');
      }
    };

    const timer = setTimeout(initCheck, 1500);
    return () => clearTimeout(timer);
  }, [checkForUpdates]);

  return {
    versionInfo,
    isChecking,
    showUpdateSheet,
    checkForUpdates,
    dismissUpdate,
    setShowUpdateSheet,
  };
};

export default useVersionCheck;
