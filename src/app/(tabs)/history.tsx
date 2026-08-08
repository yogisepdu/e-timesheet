import Ionicons from "@expo/vector-icons/Ionicons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, radius, spacing } from "../../constants/theme";

const reports = [
  {
    code: "TS-20260805-001",
    date: "05 Agustus 2026",
    operator: "Budi Santoso",
    unit: "EXC-001",
    activity: "Land clearing dan pemindahan material",
    status: "Menunggu Persetujuan",
    statusColor: colors.warning,
    statusBackground: "#FFF4E5",
  },
  {
    code: "TS-20260804-008",
    date: "04 Agustus 2026",
    operator: "Andi Saputra",
    unit: "DZ-003",
    activity: "Perataan jalan operasional",
    status: "Disetujui",
    statusColor: colors.success,
    statusBackground: "#E8F5E9",
  },
  {
    code: "TS-20260804-006",
    date: "04 Agustus 2026",
    operator: "Rahmat",
    unit: "DT-012",
    activity: "Pengangkutan material",
    status: "Draft",
    statusColor: colors.textSecondary,
    statusBackground: "#EEF2F6",
  },
  {
    code: "TS-20260803-011",
    date: "03 Agustus 2026",
    operator: "M. Ridwan",
    unit: "EXC-004",
    activity: "Pembuatan parit",
    status: "Perlu Perbaikan",
    statusColor: colors.danger,
    statusBackground: "#FDECEC",
  },
];

export default function HistoryScreen() {
  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Riwayat Time Sheet</Text>

        <Text style={styles.subtitle}>
          Lihat status dan riwayat laporan pemakaian alat.
        </Text>

        <View style={styles.searchBox}>
          <Ionicons
            color={colors.textSecondary}
            name="search-outline"
            size={20}
          />

          <Text style={styles.searchPlaceholder}>
            Pencarian akan diaktifkan setelah API dibuat
          </Text>
        </View>

        {reports.map((report) => (
          <View key={report.code} style={styles.reportCard}>
            <View style={styles.reportHeader}>
              <View>
                <Text style={styles.reportCode}>{report.code}</Text>
                <Text style={styles.reportDate}>{report.date}</Text>
              </View>

              <View
                style={[
                  styles.badge,
                  { backgroundColor: report.statusBackground },
                ]}
              >
                <Text style={[styles.badgeText, { color: report.statusColor }]}>
                  {report.status}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Ionicons
                color={colors.textSecondary}
                name="person-outline"
                size={18}
              />
              <Text style={styles.detailText}>{report.operator}</Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons
                color={colors.textSecondary}
                name="construct-outline"
                size={18}
              />
              <Text style={styles.detailText}>{report.unit}</Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons
                color={colors.textSecondary}
                name="hammer-outline"
                size={18}
              />
              <Text style={styles.detailText}>{report.activity}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
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
  searchBox: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: spacing.lg,
    marginTop: spacing.xl,
    minHeight: 50,
    paddingHorizontal: spacing.md,
  },
  searchPlaceholder: {
    color: colors.textLight,
    fontSize: 13,
    marginLeft: spacing.sm,
  },
  reportCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  reportHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  reportCode: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  reportDate: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: spacing.xs,
  },
  badge: {
    borderRadius: radius.round,
    maxWidth: 130,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "700",
    textAlign: "center",
  },
  divider: {
    backgroundColor: colors.border,
    height: 1,
    marginVertical: spacing.md,
  },
  detailRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    marginBottom: spacing.sm,
  },
  detailText: {
    color: colors.textSecondary,
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    marginLeft: spacing.sm,
  },
});
