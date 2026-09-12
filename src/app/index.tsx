import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { colors } from "../constants/theme";
import { hasValidSession } from "../services/auth";

type SessionState = "checking" | "authenticated" | "unauthenticated";

export default function IndexScreen() {
  const [sessionState, setSessionState] = useState<SessionState>("checking");

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      try {
        const valid = await hasValidSession();

        if (!mounted) {
          return;
        }

        setSessionState(valid ? "authenticated" : "unauthenticated");
      } catch (error) {
        console.warn("Gagal memeriksa session authentication:", error);

        if (mounted) {
          setSessionState("unauthenticated");
        }
      }
    }

    checkSession();

    return () => {
      mounted = false;
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Masih memeriksa session
  |--------------------------------------------------------------------------
  */

  if (sessionState === "checking") {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={colors.primary} size="large" />

        <Text style={styles.loadingText}>Memeriksa sesi...</Text>
      </View>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Session masih valid
  |--------------------------------------------------------------------------
  */

  if (sessionState === "authenticated") {
    return <Redirect href="/(tabs)" />;
  }

  /*
  |--------------------------------------------------------------------------
  | Tidak ada session / session expired
  |--------------------------------------------------------------------------
  */

  return <Redirect href="/login" />;
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: "center",
  },

  loadingText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 12,
  },
});
