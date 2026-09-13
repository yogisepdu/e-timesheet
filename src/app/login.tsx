import Ionicons from "@expo/vector-icons/Ionicons";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppButton } from "../components/AppButton";
import { AppInput } from "../components/AppInput";
import { colors, radius, spacing } from "../constants/theme";

import { ApiError } from "../services/api";
import { login } from "../services/auth";

export default function LoginScreen() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async () => {
    const normalizedUsername = username.trim();

    if (!normalizedUsername) {
      setErrorMessage("Username wajib diisi.");
      return;
    }

    if (!password) {
      setErrorMessage("Password wajib diisi.");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");

      await login(normalizedUsername, password);

      router.replace("/(tabs)" as Href);
    } catch (error) {
      console.warn("Login gagal:", error);

      if (error instanceof ApiError) {
        setErrorMessage(error.message);
        return;
      }

      setErrorMessage("Terjadi kesalahan. Silakan coba kembali.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={
            Platform.OS === "ios" ? "interactive" : "on-drag"
          }
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            {/* =========================
                HEADER / LOGO
                ========================= */}

            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Image
                  source={require("@/assets/images/logo.png")}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>

              <Text style={styles.appName}>e-Time Sheet</Text>

              <Text style={styles.subtitle}>
                Laporan Pemakaian Alat Digital
              </Text>
            </View>

            {/* =========================
                LOGIN CARD
                ========================= */}

            <View style={styles.card}>
              <Text style={styles.title}>Selamat Datang</Text>

              <Text style={styles.description}>
                Masuk menggunakan akun pengawas untuk membuat dan memantau
                laporan pemakaian alat.
              </Text>

              {/* Username */}

              <AppInput
                icon="person-outline"
                label="Username"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
                onChangeText={(value) => {
                  setUsername(value);

                  if (errorMessage) {
                    setErrorMessage("");
                  }
                }}
                placeholder="Masukkan username"
                value={username}
              />

              {/* Password */}

              <AppInput
                icon="lock-closed-outline"
                label="Password"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
                onChangeText={(value) => {
                  setPassword(value);

                  if (errorMessage) {
                    setErrorMessage("");
                  }
                }}
                placeholder="Masukkan password"
                rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
                onRightIconPress={() => {
                  setShowPassword((current) => !current);
                }}
                secureTextEntry={!showPassword}
                value={password}
              />

              {/* Error Message */}

              {errorMessage ? (
                <View style={styles.errorCard}>
                  <Ionicons
                    color={colors.danger}
                    name="alert-circle-outline"
                    size={20}
                  />

                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              ) : null}

              {/* Login Button */}

              <AppButton
                icon="log-in-outline"
                onPress={handleLogin}
                title={isLoading ? "Memproses..." : "Masuk"}
              />
            </View>

            {/* =========================
                FOOTER / COPYRIGHT
                ========================= */}

            <View style={styles.footerContainer}>
              <Text style={styles.footer}>© 2026 RuangDev - Yosep</Text>

              <Text style={styles.footerAppName}>e-Time Sheet</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  /* =========================
     SCREEN
     ========================= */

  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },

  flex: {
    flex: 1,
  },

  scrollContent: {
    backgroundColor: colors.background,
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    paddingBottom: spacing.xxl * 2,
  },

  container: {
    alignSelf: "center",
    width: "100%",
    maxWidth: 520,
  },

  /* =========================
     HEADER
     ========================= */

  header: {
    alignItems: "center",
    marginBottom: spacing.xxl,
  },

  logoContainer: {
    alignItems: "center",
    backgroundColor: "#EAF0F5",
    borderColor: colors.border,
    borderRadius: radius.round,
    borderWidth: 1,
    height: 94,
    justifyContent: "center",
    marginBottom: spacing.lg,
    overflow: "hidden",
    width: 94,
  },

  logo: {
    height: 78,
    width: 78,
  },

  appName: {
    color: colors.primary,
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
  },

  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: spacing.xs,
    textAlign: "center",
  },

  /* =========================
     LOGIN CARD
     ========================= */

  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.xxl,

    elevation: 3,

    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },

  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "800",
  },

  description: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: spacing.xxl,
    marginTop: spacing.sm,
  },

  /* =========================
     ERROR
     ========================= */

  errorCard: {
    alignItems: "center",
    backgroundColor: "#FFF1F1",
    borderColor: "#F8D3D3",
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: spacing.md,
    padding: spacing.md,
  },

  errorText: {
    color: colors.danger,
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    marginLeft: spacing.sm,
  },

  /* =========================
     FOOTER
     ========================= */

  footerContainer: {
    alignItems: "center",
    marginTop: spacing.xxl,
    paddingBottom: spacing.md,
  },

  footer: {
    color: colors.textLight,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },

  footerAppName: {
    color: colors.textLight,
    fontSize: 10,
    marginTop: spacing.xs,
    opacity: 0.7,
    textAlign: "center",
  },
});
