import Ionicons from "@expo/vector-icons/Ionicons";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppButton } from "../../components/AppButton";
import { colors, radius, spacing } from "../../constants/theme";

export default function ProfileScreen() {
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const closeLogoutModal = () => {
    setShowLogoutModal(false);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    router.replace("/login" as Href);
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Profil</Text>
          <Text style={styles.subtitle}>Informasi akun pengguna aplikasi.</Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatarOuter}>
            <View style={styles.avatar}>
              <Ionicons color={colors.primary} name="person" size={46} />
            </View>
          </View>

          <Text style={styles.name}>Pengawas Lapangan</Text>

          <View style={styles.roleBadge}>
            <Ionicons
              color={colors.primary}
              name="shield-checkmark-outline"
              size={14}
            />
            <Text style={styles.role}>Pengawas</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons
                color={colors.primary}
                name="person-outline"
                size={19}
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Username</Text>
              <Text style={styles.infoValue}>pengawas</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons
                color={colors.primary}
                name="briefcase-outline"
                size={19}
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Jabatan</Text>
              <Text style={styles.infoValue}>Pengawas Operasional</Text>
            </View>
          </View>

          <View style={[styles.infoRow, styles.infoRowLast]}>
            <View style={styles.infoIcon}>
              <Ionicons
                color={colors.success}
                name="checkmark-circle-outline"
                size={19}
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Status akun</Text>

              <View style={styles.activeStatus}>
                <View style={styles.activeDot} />
                <Text style={styles.activeText}>Aktif</Text>
              </View>
            </View>
          </View>
        </View>

        <AppButton
          icon="log-out-outline"
          onPress={handleLogout}
          title="Keluar"
          variant="danger"
        />

        <Text style={styles.version}>e-Time Sheet versi 1.0.0</Text>
      </View>

      <Modal
        animationType="fade"
        onRequestClose={closeLogoutModal}
        statusBarTranslucent
        transparent
        visible={showLogoutModal}
      >
        <View style={styles.logoutOverlay}>
          <Pressable
            onPress={closeLogoutModal}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.logoutCenter}>
            <View style={styles.logoutCard}>
              <Pressable
                accessibilityLabel="Tutup"
                accessibilityRole="button"
                hitSlop={10}
                onPress={closeLogoutModal}
                style={styles.logoutCloseButton}
              >
                <Ionicons
                  color={colors.textSecondary}
                  name="close-outline"
                  size={23}
                />
              </Pressable>

              <View style={styles.logoutIconOuter}>
                <View style={styles.logoutIconInner}>
                  <Ionicons
                    color={colors.danger}
                    name="log-out-outline"
                    size={31}
                  />
                </View>
              </View>

              <Text style={styles.logoutTitle}>Keluar dari aplikasi?</Text>

              <Text style={styles.logoutDescription}>
                Anda akan keluar dari akun Pengawas Lapangan. Pastikan draft
                yang sedang dikerjakan sudah disimpan sebelum melanjutkan.
              </Text>

              <View style={styles.logoutWarning}>
                <View style={styles.logoutWarningIcon}>
                  <Ionicons
                    color={colors.warning}
                    name="information-circle-outline"
                    size={20}
                  />
                </View>

                <Text style={styles.logoutWarningText}>
                  Data yang belum disimpan dapat hilang setelah Anda keluar dari
                  aplikasi.
                </Text>
              </View>

              <Pressable
                accessibilityRole="button"
                onPress={confirmLogout}
                style={({ pressed }) => [
                  styles.logoutPrimaryButton,
                  pressed ? styles.buttonPressed : null,
                ]}
              >
                <View style={styles.logoutPrimaryIcon}>
                  <Ionicons
                    color={colors.danger}
                    name="log-out-outline"
                    size={19}
                  />
                </View>

                <Text style={styles.logoutPrimaryText}>Ya, Keluar</Text>

                <Ionicons
                  color={colors.white}
                  name="arrow-forward-outline"
                  size={19}
                />
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={closeLogoutModal}
                style={({ pressed }) => [
                  styles.logoutSecondaryButton,
                  pressed ? styles.buttonPressed : null,
                ]}
              >
                <Ionicons
                  color={colors.textSecondary}
                  name="arrow-back-outline"
                  size={18}
                />

                <Text style={styles.logoutSecondaryText}>
                  Tetap di Aplikasi
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.text,
    fontSize: 25,
    fontWeight: "800",
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: spacing.xs,
  },

  /*
   * Profile card
   */
  profileCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderWidth: 1,
    elevation: 2,
    marginBottom: spacing.xl,
    marginTop: spacing.xl,
    padding: spacing.xl,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },
  avatarOuter: {
    alignItems: "center",
    backgroundColor: "#F2F6F9",
    borderRadius: radius.round,
    height: 112,
    justifyContent: "center",
    width: 112,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: "#E4EDF4",
    borderColor: "#D6E2EB",
    borderRadius: radius.round,
    borderWidth: 1,
    height: 88,
    justifyContent: "center",
    width: 88,
  },
  name: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
    marginTop: spacing.md,
  },
  roleBadge: {
    alignItems: "center",
    backgroundColor: "#EAF0F5",
    borderRadius: radius.round,
    flexDirection: "row",
    gap: 5,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  role: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  divider: {
    backgroundColor: colors.border,
    height: 1,
    marginVertical: spacing.xl,
    width: "100%",
  },
  infoRow: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: spacing.lg,
    width: "100%",
  },
  infoRowLast: {
    marginBottom: 0,
  },
  infoIcon: {
    alignItems: "center",
    backgroundColor: "#EAF0F5",
    borderRadius: radius.md,
    height: 42,
    justifyContent: "center",
    marginRight: spacing.md,
    width: 42,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  infoValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
    marginTop: 2,
  },
  activeStatus: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: 4,
  },
  activeDot: {
    backgroundColor: colors.success,
    borderRadius: radius.round,
    height: 7,
    marginRight: 6,
    width: 7,
  },
  activeText: {
    color: colors.success,
    fontSize: 14,
    fontWeight: "700",
  },
  version: {
    color: colors.textLight,
    fontSize: 11,
    marginTop: spacing.xl,
    textAlign: "center",
  },

  /*
   * Logout modal
   */
  logoutOverlay: {
    backgroundColor: "rgba(10, 23, 36, 0.60)",
    flex: 1,
  },
  logoutCenter: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  logoutCard: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 28,
    elevation: 14,
    maxWidth: 420,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: 30,
    position: "relative",
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 14,
    },
    shadowOpacity: 0.2,
    shadowRadius: 26,
    width: "100%",
  },
  logoutCloseButton: {
    alignItems: "center",
    backgroundColor: "#F4F6F8",
    borderRadius: radius.round,
    height: 38,
    justifyContent: "center",
    position: "absolute",
    right: spacing.md,
    top: spacing.md,
    width: 38,
  },
  logoutIconOuter: {
    alignItems: "center",
    backgroundColor: "#FFF1F1",
    borderRadius: radius.round,
    height: 94,
    justifyContent: "center",
    width: 94,
  },
  logoutIconInner: {
    alignItems: "center",
    backgroundColor: "#FDE1E1",
    borderColor: "#F7CCCC",
    borderRadius: radius.round,
    borderWidth: 1,
    height: 64,
    justifyContent: "center",
    width: 64,
  },
  logoutTitle: {
    color: colors.text,
    fontSize: 23,
    fontWeight: "800",
    marginTop: spacing.lg,
    textAlign: "center",
  },
  logoutDescription: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginTop: spacing.sm,
    maxWidth: 330,
    textAlign: "center",
  },
  logoutWarning: {
    alignItems: "center",
    backgroundColor: "#FFF8EC",
    borderColor: "#F5DFC0",
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    marginTop: spacing.xl,
    padding: spacing.md,
    width: "100%",
  },
  logoutWarningIcon: {
    alignItems: "center",
    backgroundColor: "#FFF0D7",
    borderRadius: radius.md,
    height: 40,
    justifyContent: "center",
    marginRight: spacing.md,
    width: 40,
  },
  logoutWarningText: {
    color: "#7A5B2A",
    flex: 1,
    fontSize: 11,
    lineHeight: 17,
  },
  logoutPrimaryButton: {
    alignItems: "center",
    backgroundColor: colors.danger,
    borderRadius: radius.lg,
    elevation: 4,
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.xl,
    minHeight: 58,
    paddingHorizontal: spacing.md,
    shadowColor: colors.danger,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 9,
    width: "100%",
  },
  logoutPrimaryIcon: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: radius.md,
    height: 36,
    justifyContent: "center",
    marginRight: spacing.md,
    width: 36,
  },
  logoutPrimaryText: {
    color: colors.white,
    flex: 1,
    fontSize: 14,
    fontWeight: "800",
  },
  logoutSecondaryButton: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "center",
    marginTop: spacing.sm,
    minHeight: 46,
    width: "100%",
  },
  logoutSecondaryText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "700",
  },
  buttonPressed: {
    opacity: 0.78,
  },
});
