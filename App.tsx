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
  } = useVersionCheck();

  useEffect(() => {
    // Prepare the app
    const prepare = async () => {
      try {

        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn(e);
      }
    };

    prepare();
  }, []);

  const handleUpdateLater = () => {
    
    dismissUpdate();
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
