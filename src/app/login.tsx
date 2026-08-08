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

export default function LoginScreen() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setFormError("");

    if (!username.trim()) {
      setFormError("Username wajib diisi.");
      return;
    }

    if (!password.trim()) {
      setFormError("Password wajib diisi.");
      return;
    }

    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 700));

    const usernameValid = username.trim().toLowerCase() === "pengawas";
    const passwordValid = password === "123456";

    if (!usernameValid || !passwordValid) {
      setLoading(false);
      setFormError("Username atau password tidak sesuai.");
      return;
    }

    setLoading(false);
    router.replace("/(tabs)" as Href);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
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
              autoCapitalize="none"
              autoCorrect={false}
              icon="person-outline"
              label="Username"
              onChangeText={setUsername}
              placeholder="Masukkan username"
              returnKeyType="next"
              value={username}
            />

            <AppInput
              icon="lock-closed-outline"
              isPassword
              label="Password"
              onChangeText={setPassword}
              onSubmitEditing={handleLogin}
              placeholder="Masukkan password"
              returnKeyType="done"
              value={password}
            />

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
              loading={loading}
              onPress={handleLogin}
              title="Masuk"
            />

            <View style={styles.demoContainer}>
              <Text style={styles.demoTitle}>Akun sementara</Text>
              <Text style={styles.demoText}>Username: pengawas</Text>
              <Text style={styles.demoText}>Password: 123456</Text>
            </View>
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
    padding: spacing.xl,
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
  errorText: {
    color: colors.danger,
    flex: 1,
    fontSize: 13,
    marginLeft: spacing.sm,
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
