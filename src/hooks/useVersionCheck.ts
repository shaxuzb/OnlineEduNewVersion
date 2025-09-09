import { useState, useEffect, useCallback } from "react";
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
const CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

export const useVersionCheck = (): UseVersionCheckReturn => {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [showUpdateSheet, setShowUpdateSheet] = useState(false);

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
      console.error("Failed to save last check time:", error);
    }
  };

  // Main check function
  const checkForUpdates = useCallback(async () => {

    if (isChecking || Platform.OS === "web") return;
    
    setIsChecking(true);

    try {
      // Always use real GitHub API
      const result = await VersionService.checkForUpdates();
      console.log("Version check result:", result);

      setVersionInfo(result);

      if (result.updateAvailable) {
        const dismissed = await isVersionDismissed(result.storeVersion);
        if (!dismissed) {
          setTimeout(() => setShowUpdateSheet(true), 1000);
        }
      }

      await saveLastCheckTime();
    } catch (error) {
      console.error("Version check failed:", error);
    } finally {
      setIsChecking(false);
    }
  }, [isChecking]);

  // Dismiss update
  const dismissUpdate = useCallback(async () => {
    if (versionInfo?.storeVersion) {
      try {
        await AsyncStorage.setItem(
          DISMISSED_VERSION_KEY,
          versionInfo.storeVersion
        );
      } catch (error) {
        console.error("Failed to dismiss update:", error);
      }
    }
  }, [versionInfo]);

  // Auto check on mount
  useEffect(() => {
    const initCheck = async () => {

      // if (await shouldCheck()) {
        checkForUpdates();
      // }
    };

    const timer = setTimeout(initCheck, 2000);
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
