import { useEffect, useRef } from "react";
import { BackHandler, ToastAndroid } from "react-native";
import { useNavigationState } from "@react-navigation/native";

/**
 * Custom hook for handling double back press to exit the app
 */
export default function useDoubleBackExit() {
  const backPressCount = useRef<number>(0);
  const routesLength = useNavigationState((state) => state.routes.length);

  useEffect(() => {
    const backAction = (): boolean => {
      // faqat root screen’da ishlaydi (navigatsiya stack uzunligi = 1)
      if (routesLength === 1) {
        if (backPressCount.current === 0) {
          backPressCount.current += 1;
          ToastAndroid.show("Chiqish uchun yana bir marta bosing", ToastAndroid.SHORT);

          // 2 soniyadan keyin counter’ni reset qilamiz
          setTimeout(() => {
            backPressCount.current = 0;
          }, 2000);

          return true; // orqaga chiqishni to‘xtatadi
        } else if (backPressCount.current === 1) {
          BackHandler.exitApp(); // ilovani yopadi
          return true;
        }
      }

      return false; // boshqa hollarda normal navigatsiya ishlaydi
    };

    const subscription = BackHandler.addEventListener("hardwareBackPress", backAction);

    return () => {
      subscription.remove();
    };
  }, [routesLength]);
}
