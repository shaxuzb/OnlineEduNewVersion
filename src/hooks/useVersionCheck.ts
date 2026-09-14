import { useState, useEffect, useCallback, useRef } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import VersionService, { VersionInfo } from "../services/versionService";
import { shouldPresentUpdate } from "../services/versionPolicy";

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
const CHECK_INTERVAL = 24 * 60 * 60 * 1000;

export const useVersionCheck = (): UseVersionCheckReturn => {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [showUpdateSheet, setShowUpdateSheetState] = useState(false);
  const hasCheckedRef = useRef(false);
  const isCheckingRef = useRef(false);

  const shouldCheck = async (): Promise<boolean> => {
    try {
      const lastCheck = await AsyncStorage.getItem(LAST_CHECK_KEY);
      if (!lastCheck) return true;

      const parsed = Number(lastCheck);
      if (!Number.isFinite(parsed)) return true;
      return Date.now() - parsed > CHECK_INTERVAL;
    } catch {
      return true;
    }
  };

  const getDismissedVersion = async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(DISMISSED_VERSION_KEY);
    } catch {
      return null;
    }
  };

  const saveLastCheckTime = async () => {
    try {
      await AsyncStorage.setItem(LAST_CHECK_KEY, Date.now().toString());
    } catch (error) {
      console.warn("Failed to persist version check time:", error);
    }
  };

  const checkForUpdates = useCallback(async () => {
    if (Platform.OS === "web" || isCheckingRef.current) return;

    isCheckingRef.current = true;
    setIsChecking(true);

    try {
      const result = await VersionService.checkForUpdates();
      setVersionInfo(result);

      const dismissedVersion = await getDismissedVersion();
      if (
        shouldPresentUpdate({
          updateAvailable: result.updateAvailable,
          forceUpdate: result.forceUpdate,
          storeVersion: result.storeVersion,
          dismissedVersion,
        })
      ) {
        setTimeout(() => setShowUpdateSheetState(true), 800);
      } else {
        setShowUpdateSheetState(false);
      }

      await saveLastCheckTime();
    } catch (error) {
      console.warn("Version check failed; retry interval was not advanced:", error);
    } finally {
      isCheckingRef.current = false;
      setIsChecking(false);
    }
  }, []);

  const dismissUpdate = useCallback(async () => {
    if (!versionInfo?.storeVersion || versionInfo.forceUpdate) return;

    try {
      await AsyncStorage.setItem(
        DISMISSED_VERSION_KEY,
        versionInfo.storeVersion,
      );
    } catch (error) {
      console.warn("Failed to persist dismissed version:", error);
    }
  }, [versionInfo]);

  const setShowUpdateSheet = useCallback(
    (show: boolean) => {
      if (
        !show &&
        versionInfo?.forceUpdate &&
        versionInfo.updateAvailable
      ) {
        setShowUpdateSheetState(true);
        return;
      }
      setShowUpdateSheetState(show);
    },
    [versionInfo],
  );

  useEffect(() => {
    const initCheck = async () => {
      if (hasCheckedRef.current) return;
      hasCheckedRef.current = true;

      if (await shouldCheck()) {
        void checkForUpdates();
      }
    };

    const timer = setTimeout(() => void initCheck(), 1500);
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
