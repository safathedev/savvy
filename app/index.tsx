// Entry Point - Routes to onboarding or main app
import { hatchColors } from "@/constants/theme";
import { useApp } from "@/lib/app-context";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View, Text } from "react-native";

export default function Index() {
  const router = useRouter();
  const { userProfile, isLoading } = useApp();

  useEffect(() => {
    if (!isLoading) {
      if (userProfile?.hasCompletedOnboarding) {
        router.replace("/(tabs)");
      } else {
        router.replace("/onboarding");
      }
    }
  }, [isLoading, userProfile, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={hatchColors.primary.default} />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: hatchColors.background.primary,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: hatchColors.text.secondary,
  },
});
