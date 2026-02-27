import "./src/utils/suppressWarnings";
import React, { useEffect } from "react";
import AppNavigation from "./src/navigation/AppNavigation";
import { AuthProvider } from "./src/context/AuthContext";
import { BookmarkProvider } from "./src/context/BookmarkContext";
import { ThemeProvider } from "./src/context/ThemeContext";
import { QueryProvider } from "./src/providers/QueryProvider";
import * as SplashScreen from "expo-splash-screen";
import { UpdateNotificationSheet } from "./src/components";
import { useVersionCheck } from "./src/hooks/useVersionCheck";
import Toast, {
  BaseToast,
  ErrorToast,
  ToastConfig,
} from "react-native-toast-message";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AlertHost from "./src/components/modals/customalert/AlertHost";
import { moderateScale } from "react-native-size-matters";
import { ScreenGuardProvider } from "./src/providers/ScreenGuardProvider";
SplashScreen.preventAutoHideAsync();

const toastConfig: ToastConfig = {
  success: (props) => (
    <BaseToast
      text1NumberOfLines={2}
      {...props}
      style={{
        borderLeftWidth: 6,
        borderLeftColor: "#4CAF50",
        backgroundColor: "#E8F5E9",
        borderRadius: 12,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: moderateScale(14),
        fontWeight: "700",
        color: "#2E7D32",
      }}
      text2Style={{
        fontSize: moderateScale(10),
        color: "#388E3C",
      }}
    />
  ),
  error: (props) => (
    <ErrorToast
      text1NumberOfLines={2}
      {...props}
      style={{
        borderLeftWidth: 6,
        borderLeftColor: "#F44336",
        backgroundColor: "#FFEBEE",
        borderRadius: 12,
        overflow: "visible",
      }}
      contentContainerStyle={{ paddingHorizontal: 10 }}
      text1Style={{
        fontSize: moderateScale(14),
        fontWeight: "700",
        overflow: "visible",

        color: "#C62828",
      }}
      text2Style={{
        fontSize: moderateScale(10),
        color: "#E53935",
      }}
    />
  ),
};
export default function App() {
  const { versionInfo, showUpdateSheet, setShowUpdateSheet, dismissUpdate } =
    useVersionCheck();

  useEffect(() => {
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
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);
  return (
    <QueryProvider>
      <ThemeProvider>
        <AuthProvider>
          <BookmarkProvider>
            <ScreenGuardProvider>
              <SafeAreaProvider>
                <AppNavigation />
                <AlertHost />
                <Toast config={toastConfig} topOffset={50} />
                {/* Update Notification Bottom Sheet */}
                {versionInfo && (
                  <UpdateNotificationSheet
                    visible={showUpdateSheet}
                    versionInfo={versionInfo}
                    onClose={() => setShowUpdateSheet(false)}
                    onUpdateLater={handleUpdateLater}
                  />
                )}
              </SafeAreaProvider>
            </ScreenGuardProvider>
          </BookmarkProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
