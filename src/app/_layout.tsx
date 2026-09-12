import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { useEffect } from "react";

import { colors } from "../constants/theme";
import { initializeDatabase } from "../services/offline/database";

export default function RootLayout() {
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.background).catch(
      (error: unknown) => {
        console.warn("Gagal mengatur warna latar sistem:", error);
      },
    );
  }, []);

  return (
    <SQLiteProvider
      databaseName="etimesheet.db"
      onInit={initializeDatabase}
      onError={(error) => {
        console.error("SQLite initialization error:", error);
      }}
    >
      <StatusBar style="dark" />

      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </SQLiteProvider>
  );
}
