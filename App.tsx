import React, { useEffect } from 'react';
import AppNavigation from './src/navigation/AppNavigation';
import { AuthProvider } from './src/context/AuthContext';
import * as SplashScreen from 'expo-splash-screen';
import InAppUpdateManager from './utils/InAppUpdateManager';

// Prevent the splash screen from auto-hiding before App is ready
SplashScreen.preventAutoHideAsync();


export default function App() {
  useEffect(() => {
    // Prepare the app
    const prepare = async () => {
      try {
        // Pre-load fonts, make any API calls you need to do here
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // In-app update tekshirish
        setTimeout(async () => {
          await InAppUpdateManager.checkAndStartUpdate();
        }, 2000); // Splash screen yopilgandan keyin tekshirish
      } catch (e) {
        console.warn(e);
      }
    };

    prepare();
  }, []);

  return (
    <AuthProvider>
      <AppNavigation />
    </AuthProvider>
  );
}
