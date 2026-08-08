import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, radius, spacing } from "../../constants/theme";

export default function HomeScreen() {
  const router = useRouter();

  const formattedDate = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>Selamat datang,</Text>
            <Text style={styles.userName}>Pengawas Lapangan</Text>
            <Text style={styles.date}>{formattedDate}</Text>
          </View>

          <View style={styles.avatar}>
            <Ionicons color={colors.primary} name="person" size={28} />
          </View>
        </View>

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

        <Text style={styles.sectionTitle}>Ringkasan Laporan</Text>

        <View style={styles.summaryGrid}>
          <SummaryCard
            backgroundColor="#EEF2F6"
            icon="document-outline"
            iconColor={colors.textSecondary}
            label="Draft"
            value="2"
          />

          <SummaryCard
            backgroundColor="#FFF4E5"
            icon="hourglass-outline"
            iconColor={colors.warning}
            label="Menunggu"
            value="3"
          />

          <SummaryCard
            backgroundColor="#E8F5E9"
            icon="checkmark-circle-outline"
            iconColor={colors.success}
            label="Disetujui"
            value="12"
          />

          <SummaryCard
            backgroundColor="#FDECEC"
            icon="close-circle-outline"
            iconColor={colors.danger}
            label="Perbaikan"
            value="1"
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Laporan Terbaru</Text>

          <Pressable onPress={() => router.push("/history")}>
            <Text style={styles.seeAll}>Lihat semua</Text>
          </Pressable>
        </View>

        <View style={styles.reportCard}>
          <ReportItem
            code="TS-20260805-001"
            operator="Wak Heri"
            status="Menunggu"
            unit="SPD16"
          />

          <View style={styles.divider} />

          <ReportItem
            code="TS-20260804-008"
            operator="Budi Santoso"
            status="Disetujui"
            unit="EXC-001"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

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
      <View style={[styles.summaryIcon, { backgroundColor }]}>
        <Ionicons color={iconColor} name={icon} size={22} />
      </View>

      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

type ReportItemProps = {
  code: string;
  operator: string;
  unit: string;
  status: "Menunggu" | "Disetujui";
};

function ReportItem({ code, operator, unit, status }: ReportItemProps) {
  const approved = status === "Disetujui";

  return (
    <View style={styles.reportItem}>
      <View style={styles.reportIcon}>
        <Ionicons
          color={colors.primary}
          name="document-text-outline"
          size={22}
        />
      </View>

      <View style={styles.reportInformation}>
        <Text style={styles.reportCode}>{code}</Text>
        <Text style={styles.reportDetail}>
          {unit} • {operator}
        </Text>
      </View>

      <View
        style={[
          styles.statusBadge,
          {
            backgroundColor: approved ? "#E8F5E9" : "#FFF4E5",
          },
        ]}
      >
        <Text
          style={[
            styles.statusText,
            {
              color: approved ? colors.success : colors.warning,
            },
          ]}
        >
          {status}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xl,
  },
  headerText: {
    flex: 1,
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
  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "800",
  },
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
  statusBadge: {
    borderRadius: radius.round,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
  },
  divider: {
    backgroundColor: colors.border,
    height: 1,
  },
  pressed: {
    opacity: 0.85,
  },
});
