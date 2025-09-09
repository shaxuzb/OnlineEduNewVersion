import React, { useEffect } from "react";
import AppNavigation from "./src/navigation/AppNavigation";
import { AuthProvider } from "./src/context/AuthContext";
import * as SplashScreen from "expo-splash-screen";
import { UpdateNotificationSheet } from "./src/components";
import { useVersionCheck } from "./src/hooks/useVersionCheck";

// Prevent the splash screen from auto-hiding before App is ready
SplashScreen.preventAutoHideAsync();

export default function App() {
  // Version checking hook
  const {
    versionInfo,
    showUpdateSheet,
    setShowUpdateSheet,
    dismissUpdate,
    isChecking,
    error,
  } = useVersionCheck(true, true);

  useEffect(() => {
    // Prepare the app
    const prepare = async () => {
      try {
        // Pre-load fonts, make any API calls you need to do here
        const response = await fetch(
          `https://play.google.com/store/apps/details?id=com.anonymous.onlineedu`
        );
        console.log(response);

        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn(e);
      }
    };

    prepare();
  }, []);

  // Log version checking status
  useEffect(() => {
    console.log(versionInfo);

    if (versionInfo) {
      console.log("Version Info:", {
        current: versionInfo.currentVersion,
        store: versionInfo.storeVersion,
        updateAvailable: versionInfo.updateAvailable,
      });
    }

    if (error) {
      console.log("Version check error:", error);
    }
  }, [versionInfo, error]);

  const handleUpdateLater = () => {
    dismissUpdate();
    console.log("Update dismissed for version:", versionInfo?.storeVersion);
  };

  return (
    <AuthProvider>
      <AppNavigation />

      {/* Update Notification Bottom Sheet */}
      {versionInfo && (
        <UpdateNotificationSheet
          visible={showUpdateSheet}
          versionInfo={versionInfo}
          onClose={() => setShowUpdateSheet(false)}
          onUpdateLater={handleUpdateLater}
        />
      )}
    </AuthProvider>
  );
}
