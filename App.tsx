import "./src/utils/suppressWarnings";
import React, { useEffect, useState } from "react";
import AppNavigation from "./src/navigation/AppNavigation";
import { AuthProvider } from "./src/context/AuthContext";
import { BookmarkProvider } from "./src/context/BookmarkContext";
import { ThemeProvider } from "./src/context/ThemeContext";
import { QueryProvider } from "./src/providers/QueryProvider";
import * as SplashScreen from "expo-splash-screen";
import { UpdateNotificationSheet } from "./src/components";
import { useVersionCheck } from "./src/hooks/useVersionCheck";
import NetInfo from "@react-native-community/netinfo";
import NoConnection from "./src/components/NoConnection";
import Toast, {
  BaseToast,
  ErrorToast,
  ToastConfig,
} from "react-native-toast-message";
SplashScreen.preventAutoHideAsync();

const toastConfig: ToastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftWidth: 6,
        borderLeftColor: "#4CAF50",
        backgroundColor: "#E8F5E9",
        borderRadius: 12,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 16,
        fontWeight: "700",
        color: "#2E7D32",
      }}
      text2Style={{
        fontSize: 14,
        color: "#388E3C",
      }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftWidth: 6,
        borderLeftColor: "#F44336",
        backgroundColor: "#FFEBEE",
        borderRadius: 12,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 16,
        fontWeight: "700",
        color: "#C62828",
      }}
      text2Style={{
        fontSize: 14,
        color: "#E53935",
      }}
    />
  ),
};
export default function App() {
  const { versionInfo, showUpdateSheet, setShowUpdateSheet, dismissUpdate } =
    useVersionCheck();
  const [isConnected, setIsConnected] = useState(true);
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(!!state.isConnected);
    });

    return () => unsubscribe();
  }, []);
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
  if (!isConnected) {
    return <NoConnection setIsConnected={setIsConnected} />;
  }
  return (
    <QueryProvider>
      <ThemeProvider>
        <AuthProvider>
          <BookmarkProvider>
            <AppNavigation />
            <Toast config={toastConfig} topOffset={30} />

            {/* Update Notification Bottom Sheet */}
            {versionInfo && (
              <UpdateNotificationSheet
                visible={showUpdateSheet}
                versionInfo={versionInfo}
                onClose={() => setShowUpdateSheet(false)}
                onUpdateLater={handleUpdateLater}
              />
            )}
          </BookmarkProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
