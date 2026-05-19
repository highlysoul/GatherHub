import { Stack } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";
import { AuthProvider } from "./context/AuthContext";

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS !== "web") return;

    const root = document.documentElement;
    const body = document.body;

    root.style.backgroundColor = "#2F6B4F";
    root.style.overscrollBehavior = "none";
    root.style.height = "100%";

    body.style.backgroundColor = "#2F6B4F";
    body.style.overscrollBehavior = "none";
    body.style.minHeight = "100%";
  }, []);

  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#2F6B4F" },
        }}
      />
    </AuthProvider>
  );
}
