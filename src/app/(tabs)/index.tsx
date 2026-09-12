import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, radius, spacing } from "../../constants/theme";
import { getAuthUser } from "../../services/api";
import {
  getDashboard,
  type DashboardData,
  type DashboardReport,
} from "../../services/dashboard";

export default function HomeScreen() {
  const router = useRouter();

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);

  const [userName, setUserName] = useState("Pengawas Lapangan");

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const formattedDate = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      try {
        setIsLoading(true);
        setErrorMessage("");

        /**
         * Ambil user dari session lokal.
         *
         * Data user sebelumnya sudah disimpan
         * pada SecureStore ketika login berhasil.
         */
        const user = await getAuthUser();

        if (mounted && user) {
          setUserName(user.name);
        }

        /**
         * Ambil dashboard dari backend.
         *
         * Endpoint:
         * GET /api/dashboard
         */
        const data = await getDashboard();

        if (mounted) {
          setDashboard(data);
        }
      } catch (error) {
        console.warn("Gagal mengambil data dashboard:", error);

        if (mounted) {
          setErrorMessage(
            "Tidak dapat memuat data dashboard. Silakan coba kembali.",
          );
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* =====================================================
            HEADER
        ====================================================== */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>Selamat datang,</Text>

            <Text numberOfLines={1} style={styles.userName}>
              {userName}
            </Text>

            <Text style={styles.date}>{formattedDate}</Text>
          </View>

          <View style={styles.avatar}>
            <Ionicons color={colors.primary} name="person" size={28} />
          </View>
        </View>

        {/* =====================================================
            HERO / BUAT TIME SHEET
        ====================================================== */}
        <Pressable
          onPress={() => router.push("/timesheet")}
          style={({ pressed }) => [styles.heroCard, pressed && styles.pressed]}
        >
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Buat Time Sheet Baru</Text>

            <Text style={styles.heroDescription}>
              Catat jam operasi, Hour Meter, BBM, lokasi, aktivitas, dan hasil
              produksi alat.
            </Text>

            <View style={styles.heroButton}>
              <Text style={styles.heroButtonText}>Mulai mengisi</Text>

              <Ionicons
                color={colors.primaryDark}
                name="arrow-forward"
                size={18}
              />
            </View>
          </View>

          <Ionicons
            color="#FFE188"
            name="construct"
            size={84}
            style={styles.heroIcon}
          />
        </Pressable>

        {/* =====================================================
            RINGKASAN LAPORAN
        ====================================================== */}
        <Text style={styles.sectionTitle}>Ringkasan Laporan</Text>

        {isLoading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator color={colors.primary} size="small" />

            <Text style={styles.loadingText}>Memuat ringkasan laporan...</Text>
          </View>
        ) : dashboard ? (
          <View style={styles.summaryGrid}>
            <SummaryCard
              backgroundColor="#EEF2F6"
              icon="document-outline"
              iconColor={colors.textSecondary}
              label="Draft"
              value={String(dashboard.summary.draft)}
            />

            <SummaryCard
              backgroundColor="#FFF4E5"
              icon="hourglass-outline"
              iconColor={colors.warning}
              label="Menunggu"
              value={String(dashboard.summary.submitted)}
            />

            <SummaryCard
              backgroundColor="#E8F5E9"
              icon="checkmark-circle-outline"
              iconColor={colors.success}
              label="Disetujui"
              value={String(dashboard.summary.approved)}
            />

            <SummaryCard
              backgroundColor="#FDECEC"
              icon="close-circle-outline"
              iconColor={colors.danger}
              label="Perbaikan"
              value={String(dashboard.summary.revision)}
            />
          </View>
        ) : null}

        {/* =====================================================
            ERROR DASHBOARD
        ====================================================== */}
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

        {/* =====================================================
            LAPORAN TERBARU HEADER
        ====================================================== */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Laporan Terbaru</Text>

          <Pressable onPress={() => router.push("/history")} hitSlop={8}>
            <Text style={styles.seeAll}>Lihat semua</Text>
          </Pressable>
        </View>

        {/* =====================================================
            LAPORAN TERBARU
        ====================================================== */}
        <View style={styles.reportCard}>
          {isLoading ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator color={colors.primary} size="small" />

              <Text style={styles.emptyText}>Memuat laporan terbaru...</Text>
            </View>
          ) : dashboard?.recent_reports?.length ? (
            dashboard.recent_reports.map((report, index) => (
              <View key={report.id}>
                <ReportItem report={report} />

                {index < dashboard.recent_reports.length - 1 ? (
                  <View style={styles.divider} />
                ) : null}
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  color={colors.textLight}
                  name="document-text-outline"
                  size={28}
                />
              </View>

              <Text style={styles.emptyTitle}>Belum ada laporan</Text>

              <Text style={styles.emptyText}>
                Time Sheet yang Anda buat akan muncul di sini.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ============================================================
   SUMMARY CARD
============================================================ */

type SummaryCardProps = {
  value: string;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  iconColor: string;
  backgroundColor: string;
};

function SummaryCard({
  value,
  label,
  icon,
  iconColor,
  backgroundColor,
}: SummaryCardProps) {
  return (
    <View style={styles.summaryCard}>
      <View
        style={[
          styles.summaryIcon,
          {
            backgroundColor,
          },
        ]}
      >
        <Ionicons color={iconColor} name={icon} size={22} />
      </View>

      <Text style={styles.summaryValue}>{value}</Text>

      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

/* ============================================================
   REPORT ITEM
============================================================ */

type ReportItemProps = {
  report: DashboardReport;
};

function ReportItem({ report }: ReportItemProps) {
  const statusConfig = getStatusConfig(report.status);

  return (
    <View style={styles.reportItem}>
      {/* Icon */}
      <View style={styles.reportIcon}>
        <Ionicons
          color={colors.primary}
          name="document-text-outline"
          size={22}
        />
      </View>

      {/* Information */}
      <View style={styles.reportInformation}>
        <Text numberOfLines={1} style={styles.reportCode}>
          {report.code}
        </Text>

        <Text numberOfLines={1} style={styles.reportDetail}>
          {report.unit} • {report.operator}
        </Text>

        {report.work_date ? (
          <Text numberOfLines={1} style={styles.reportDate}>
            {formatWorkDate(report.work_date)}
          </Text>
        ) : null}
      </View>

      {/* Status */}
      <View
        style={[
          styles.statusBadge,
          {
            backgroundColor: statusConfig.backgroundColor,
          },
        ]}
      >
        <Text
          numberOfLines={1}
          style={[
            styles.statusText,
            {
              color: statusConfig.color,
            },
          ]}
        >
          {report.status_label}
        </Text>
      </View>
    </View>
  );
}

/* ============================================================
   STATUS CONFIGURATION
============================================================ */

function getStatusConfig(status: DashboardReport["status"]) {
  switch (status) {
    case "draft":
      return {
        backgroundColor: "#EEF2F6",
        color: colors.textSecondary,
      };

    case "submitted":
      return {
        backgroundColor: "#FFF4E5",
        color: colors.warning,
      };

    case "approved":
      return {
        backgroundColor: "#E8F5E9",
        color: colors.success,
      };

    case "revision":
      return {
        backgroundColor: "#E8F0FE",
        color: colors.primary,
      };

    case "rejected":
      return {
        backgroundColor: "#FDECEC",
        color: colors.danger,
      };

    default:
      return {
        backgroundColor: "#EEF2F6",
        color: colors.textSecondary,
      };
  }
}

/* ============================================================
   FORMAT TANGGAL
============================================================ */

function formatWorkDate(date: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  } catch {
    return date;
  }
}

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },

  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },

  emptyText: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.xs,
    textAlign: "center",
  },

  emptyCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl,
  },

  emptyIcon: {
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: radius.round,
    height: 72,
    justifyContent: "center",
    width: 72,
  },

  emptyTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
    marginTop: spacing.md,
  },

  /* ========================================================
     HEADER
  ======================================================== */

  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xl,
  },

  headerText: {
    flex: 1,
    paddingRight: spacing.md,
  },

  greeting: {
    color: colors.textSecondary,
    fontSize: 13,
  },

  userName: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
    marginTop: 2,
  },

  date: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: spacing.xs,
    textTransform: "capitalize",
  },

  avatar: {
    alignItems: "center",
    backgroundColor: "#EAF0F5",
    borderRadius: radius.round,
    height: 52,
    justifyContent: "center",
    width: 52,
  },

  /* ========================================================
     HERO
  ======================================================== */

  heroCard: {
    backgroundColor: colors.secondary,
    borderRadius: radius.lg,
    flexDirection: "row",
    marginBottom: spacing.xxl,
    minHeight: 174,
    overflow: "hidden",
    padding: spacing.xl,
  },

  heroContent: {
    flex: 1,
    zIndex: 2,
  },

  heroTitle: {
    color: colors.primaryDark,
    fontSize: 21,
    fontWeight: "800",
  },

  heroDescription: {
    color: "#4D4020",
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.sm,
    maxWidth: "82%",
  },

  heroButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: colors.white,
    borderRadius: radius.round,
    flexDirection: "row",
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },

  heroButtonText: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: "700",
    marginRight: spacing.sm,
  },

  heroIcon: {
    bottom: -10,
    opacity: 0.7,
    position: "absolute",
    right: -4,
  },

  /* ========================================================
     SECTION
  ======================================================== */

  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "800",
  },

  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },

  seeAll: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "700",
  },

  /* ========================================================
     SUMMARY
  ======================================================== */

  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: spacing.md,
  },

  summaryCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.lg,
    width: "48%",
  },

  summaryIcon: {
    alignItems: "center",
    borderRadius: radius.md,
    height: 42,
    justifyContent: "center",
    marginBottom: spacing.md,
    width: 42,
  },

  summaryValue: {
    color: colors.text,
    fontSize: 25,
    fontWeight: "800",
  },

  summaryLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },

  /* ========================================================
     LOADING
  ======================================================== */

  loadingCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.md,
    padding: spacing.xl,
  },

  loadingText: {
    color: colors.textSecondary,
    fontSize: 13,
    marginLeft: spacing.sm,
  },

  /* ========================================================
     ERROR
  ======================================================== */

  errorCard: {
    alignItems: "center",
    backgroundColor: "#FDECEC",
    borderColor: "#F8D3D3",
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    marginTop: spacing.md,
    padding: spacing.md,
  },

  errorText: {
    color: colors.danger,
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    marginLeft: spacing.sm,
  },

  /* ========================================================
     REPORT CARD
  ======================================================== */

  reportCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: "hidden",
  },

  reportItem: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 78,
    padding: spacing.lg,
  },

  reportIcon: {
    alignItems: "center",
    backgroundColor: "#EAF0F5",
    borderRadius: radius.md,
    height: 42,
    justifyContent: "center",
    marginRight: spacing.md,
    width: 42,
  },

  reportInformation: {
    flex: 1,
    minWidth: 0,
    paddingRight: spacing.sm,
  },

  reportCode: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
  },

  reportDetail: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 4,
  },

  reportDate: {
    color: colors.textLight,
    fontSize: 10,
    marginTop: 3,
  },

  /* ========================================================
     STATUS
  ======================================================== */

  statusBadge: {
    alignSelf: "center",
    borderRadius: radius.round,
    maxWidth: 120,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },

  statusText: {
    fontSize: 10,
    fontWeight: "700",
    textAlign: "center",
  },

  /* ========================================================
     EMPTY
  ======================================================== */

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },

  /* ========================================================
     DIVIDER
  ======================================================== */

  divider: {
    backgroundColor: colors.border,
    height: 1,
    marginLeft: spacing.lg + 42 + spacing.md,
  },

  /* ========================================================
     PRESS
  ======================================================== */

  pressed: {
    opacity: 0.85,
  },
});
