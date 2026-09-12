import Ionicons from "@expo/vector-icons/Ionicons";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
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

  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

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
        >
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons
                name="construct-outline"
                size={48}
                color={colors.secondary}
              />
            </View>

            <Text style={styles.appName}>e-Time Sheet</Text>

            <Text style={styles.subtitle}>Laporan Pemakaian Alat Digital</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Selamat Datang</Text>

            <Text style={styles.description}>
              Masuk menggunakan akun pengawas untuk membuat dan memantau laporan
              pemakaian alat.
            </Text>

            <AppInput
              icon="person-outline"
              label="Username"
              onChangeText={(value) => {
                setUsername(value);

                if (errorMessage) {
                  setErrorMessage("");
                }
              }}
              placeholder="Masukkan username"
              value={username}
            />

            <AppInput
              icon="lock-closed-outline"
              label="Password"
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

            {formError ? (
              <View style={styles.errorContainer}>
                <Ionicons
                  name="alert-circle-outline"
                  size={18}
                  color={colors.danger}
                />

                <Text style={styles.errorText}>{formError}</Text>
              </View>
            ) : null}

            <AppButton
              icon="log-in-outline"
              onPress={handleLogin}
              title={isLoading ? "Memproses..." : "Masuk"}
            />
          </View>

          <Text style={styles.footer}>Aplikasi e-Time Sheet Alat</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    width: 94,
  },
  appName: {
    color: colors.primary,
    fontSize: 30,
    fontWeight: "800",
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: spacing.xs,
  },
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
  errorContainer: {
    alignItems: "center",
    backgroundColor: "#FDECEC",
    borderRadius: radius.md,
    flexDirection: "row",
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  demoContainer: {
    alignItems: "center",
    backgroundColor: "#F5F7FA",
    borderRadius: radius.md,
    marginTop: spacing.lg,
    padding: spacing.md,
  },
  demoTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  demoText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  footer: {
    color: colors.textLight,
    fontSize: 12,
    marginTop: spacing.xxl,
    textAlign: "center",
  },
});
