import { hatchColors } from "@/constants/theme";
import "@/global.css";
import { AppProvider, useApp } from "@/lib/app-context";
import { initializePurchases, checkSubscriptionStatus } from "@/lib/revenuecat";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppState } from "react-native";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "index",
};

SplashScreen.preventAutoHideAsync();

// Minimalist white theme
const SavvyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: hatchColors.primary.default,
    background: hatchColors.background.primary,
    card: hatchColors.background.card,
    text: hatchColors.text.primary,
    border: hatchColors.border.default,
    notification: hatchColors.primary.default,
  },
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) {
      console.warn("Font loading error:", error);
    }
  }, [error]);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync().catch(() => {
        // Ignore errors when splash screen is already hidden
      });
    }
  }, [loaded, error]);

  useEffect(() => {
    // Initialize RevenueCat and sync premium status
    const initRevenueCat = async () => {
      try {
        await initializePurchases();
      } catch (error) {
        console.warn("RevenueCat initialization failed, using dummy mode");
      }
    };
    
    initRevenueCat();
  }, []);

  if (!loaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: hatchColors.background.primary }}>
      <SafeAreaProvider>
        <AppProvider>
          <RevenueCatSync />
          <ThemeProvider value={SavvyTheme}>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: hatchColors.background.primary } }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="onboarding/index" />
              <Stack.Screen name="tip/[id]" />
              <Stack.Screen name="lesson/[id]" />
              <Stack.Screen name="paywall/index" options={{ presentation: "modal" }} />
            </Stack>
          </ThemeProvider>
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// Component to sync premium status with RevenueCat on app start and foreground
function RevenueCatSync() {
  const { setPremium } = useApp();
  const appState = useRef(AppState.currentState);

  const syncPremiumStatus = async () => {
    try {
      const hasPremium = await checkSubscriptionStatus();
      await setPremium(hasPremium);
      console.log("Premium status synced from RevenueCat:", hasPremium);
    } catch (error) {
      console.warn("Failed to sync premium status:", error);
    }
  };

  useEffect(() => {
    // Sync on mount
    syncPremiumStatus();

    // Sync when app comes to foreground
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        // App has come to the foreground - sync premium status
        syncPremiumStatus();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [setPremium]);

  return null;
}
