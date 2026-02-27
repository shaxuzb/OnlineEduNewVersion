import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import ScreenGuardModule, { useSGScreenRecord } from "react-native-screenguard";
import Toast from "react-native-toast-message";

interface ScreenGuardContextType {
  isRecording: boolean;
}

const ScreenGuardContext = createContext<ScreenGuardContextType | undefined>(
  undefined,
);

export const useScreenGuard = () => {
  const context = useContext(ScreenGuardContext);
  if (!context) {
    throw new Error("useScreenGuard must be used within ScreenGuardProvider");
  }
  return context;
};

export const ScreenGuardProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const initializedRef = useRef(false);

  // Screen recording event listener
  const { recordingData } = useSGScreenRecord((event) => {
    if (event.isRecording && !isRecording) {
      setIsRecording(true);
      Toast.show({
        type: "error",
        text1: "Screen Recording Detected",
        text2: "Please disable screen recording",
        position: "top",
        visibilityTime: 4000,
      });
    } else if (!event.isRecording && isRecording) {
      setIsRecording(false);
    }
  });

  const initScreenGuard = async () => {
    if (initializedRef.current) return;

    try {
      await ScreenGuardModule.initSettings({
        displayScreenGuardOverlay: true,
        timeAfterResume: 1500,
        getScreenshotPath: true,
      });
      await ScreenGuardModule.register({
        backgroundColor: "#000  ",
      });

      initializedRef.current = true;
    } catch (error) {
      console.error("Failed to initialize ScreenGuard:", error);
    }
  };

  useEffect(() => {
    initScreenGuard();

    return () => {
      if (initializedRef.current) {
        ScreenGuardModule.unregister();
      }
    };
  }, []);

  return (
    <ScreenGuardContext.Provider value={{ isRecording }}>
      {children}
    </ScreenGuardContext.Provider>
  );
};
