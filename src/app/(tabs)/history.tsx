import Ionicons from "@expo/vector-icons/Ionicons";
import type { Href } from "expo-router";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, radius, spacing } from "../../constants/theme";
import { ApiError, removeToken } from "../../services/api";
import {
  getTimeSheetHistory,
  type TimeSheetHistoryItem,
  type TimeSheetStatus,
} from "../../services/time-sheets";

type StatusFilter = "all" | TimeSheetStatus;

type StatusAppearance = {
  label: string;
  color: string;
  backgroundColor: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const STATUS_CONFIG: Record<TimeSheetStatus, StatusAppearance> = {
  draft: {
    label: "Draft",
    color: colors.textSecondary,
    backgroundColor: "#EEF2F6",
    icon: "document-text-outline",
  },
  submitted: {
    label: "Menunggu Persetujuan",
    color: colors.warning,
    backgroundColor: "#FFF4E5",
    icon: "time-outline",
  },
  approved: {
    label: "Disetujui",
    color: colors.success,
    backgroundColor: "#E8F5E9",
    icon: "checkmark-circle-outline",
  },
  revision: {
    label: "Perlu Perbaikan",
    color: colors.danger,
    backgroundColor: "#FDECEC",
    icon: "create-outline",
  },
  rejected: {
    label: "Ditolak",
    color: colors.danger,
    backgroundColor: "#FDECEC",
    icon: "close-circle-outline",
  },
};

const FILTERS: Array<{
  value: StatusFilter;
  label: string;
}> = [
  {
    value: "all",
    label: "Semua",
  },
  {
    value: "submitted",
    label: "Menunggu",
  },
  {
    value: "approved",
    label: "Disetujui",
  },
  {
    value: "draft",
    label: "Draft",
  },
  {
    value: "revision",
    label: "Perlu Perbaikan",
  },
  {
    value: "rejected",
    label: "Ditolak",
  },
];

function formatWorkDate(value: string | null) {
  if (!value) {
    return "Tanggal belum ditentukan";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getSearchText(report: TimeSheetHistoryItem) {
  return [
    report.code,
    report.operator?.code,
    report.operator?.name,
    report.equipment_unit?.code,
    report.equipment_unit?.equipment_type,
    report.activity?.name,
    report.location,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export default function HistoryScreen() {
  const router = useRouter();

  const [reports, setReports] = useState<TimeSheetHistoryItem[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadHistory = useCallback(
    async (refresh = false) => {
      try {
        if (refresh) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        setErrorMessage("");

        const data = await getTimeSheetHistory();

        setReports(data);
      } catch (error) {
        if (error instanceof ApiError) {
          if (error.status === 401) {
            await removeToken();
            router.replace("/login" as Href);

            return;
          }

          setErrorMessage(error.message);

          return;
        }

        setErrorMessage(
          "Riwayat Time Sheet tidak dapat dimuat. Silakan periksa koneksi.",
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [router],
  );

  useFocusEffect(
    useCallback(() => {
      void loadHistory();
    }, [loadHistory]),
  );

  const filteredReports = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return reports.filter((report) => {
      const statusMatches =
        statusFilter === "all" || report.status === statusFilter;

      const searchMatches =
        !normalizedQuery || getSearchText(report).includes(normalizedQuery);

      return statusMatches && searchMatches;
    });
  }, [query, reports, statusFilter]);

  const header = (
    <View>
      <View style={styles.header}>
        <Text style={styles.title}>Riwayat Time Sheet</Text>

        <Text style={styles.subtitle}>
          Lihat status dan riwayat laporan pemakaian alat.
        </Text>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryIcon}>
          <Ionicons color={colors.primary} name="documents-outline" size={22} />
        </View>

        <View style={styles.summaryContent}>
          <Text style={styles.summaryLabel}>Total Laporan</Text>

          <Text style={styles.summaryValue}>{reports.length} Time Sheet</Text>
        </View>

        <View style={styles.summaryStatus}>
          <View style={styles.summaryDot} />
          <Text style={styles.summaryStatusText}>Tersinkron</Text>
        </View>
      </View>

      <View style={styles.searchBox}>
        <Ionicons
          color={colors.textSecondary}
          name="search-outline"
          size={20}
        />

        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={setQuery}
          placeholder="Cari kode, operator, unit, kegiatan..."
          placeholderTextColor={colors.textLight}
          style={styles.searchInput}
          value={query}
        />

        {query ? (
          <Pressable hitSlop={10} onPress={() => setQuery("")}>
            <Ionicons
              color={colors.textSecondary}
              name="close-circle"
              size={20}
            />
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        contentContainerStyle={styles.filterContent}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {FILTERS.map((filter) => {
          const selected = statusFilter === filter.value;

          return (
            <Pressable
              key={filter.value}
              onPress={() => setStatusFilter(filter.value)}
              style={[
                styles.filterChip,
                selected ? styles.filterChipSelected : null,
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selected ? styles.filterChipTextSelected : null,
                ]}
              >
                {filter.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {errorMessage ? (
        <Pressable
          onPress={() => {
            void loadHistory();
          }}
          style={styles.errorBanner}
        >
          <Ionicons
            color={colors.danger}
            name="alert-circle-outline"
            size={19}
          />

          <Text style={styles.errorBannerText}>{errorMessage}</Text>

          <Ionicons color={colors.danger} name="refresh-outline" size={18} />
        </Pressable>
      ) : null}

      <View style={styles.listHeading}>
        <Text style={styles.listTitle}>Daftar Laporan</Text>
        <Text style={styles.listCount}>{filteredReports.length} data</Text>
      </View>
    </View>
  );

  if (isLoading && reports.length === 0) {
    return (
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingIcon}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>

          <Text style={styles.loadingTitle}>Memuat riwayat</Text>

          <Text style={styles.loadingText}>
            Mengambil data Time Sheet dari server...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <FlatList
        contentContainerStyle={styles.content}
        data={filteredReports}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons
                color={colors.textLight}
                name={
                  reports.length === 0
                    ? "document-text-outline"
                    : "search-outline"
                }
                size={36}
              />
            </View>

            <Text style={styles.emptyTitle}>
              {reports.length === 0
                ? "Belum ada Time Sheet"
                : "Data tidak ditemukan"}
            </Text>

            <Text style={styles.emptyText}>
              {reports.length === 0
                ? "Riwayat akan muncul setelah Time Sheet disimpan atau dikirim."
                : "Coba ubah kata pencarian atau filter status."}
            </Text>
          </View>
        }
        ListHeaderComponent={header}
        refreshControl={
          <RefreshControl
            onRefresh={() => {
              void loadHistory(true);
            }}
            refreshing={isRefreshing}
            tintColor={colors.primary}
          />
        }
        renderItem={({ item }) => {
          const status = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.draft;

          const operatorLabel = item.operator
            ? `${item.operator.code} - ${item.operator.name}`
            : "-";

          const unitLabel = item.equipment_unit
            ? `${item.equipment_unit.code} - ${item.equipment_unit.equipment_type}`
            : "-";

          return (
            <View style={styles.reportCard}>
              <View style={styles.reportHeader}>
                <View style={styles.reportHeaderContent}>
                  <Text style={styles.reportCode}>{item.code}</Text>

                  <View style={styles.dateRow}>
                    <Ionicons
                      color={colors.textSecondary}
                      name="calendar-outline"
                      size={14}
                    />
                    <Text style={styles.reportDate}>
                      {formatWorkDate(item.work_date)}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: status.backgroundColor,
                    },
                  ]}
                >
                  <Ionicons color={status.color} name={status.icon} size={13} />

                  <Text
                    style={[
                      styles.badgeText,
                      {
                        color: status.color,
                      },
                    ]}
                  >
                    {status.label}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Ionicons
                    color={colors.primary}
                    name="person-outline"
                    size={18}
                  />
                </View>

                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Operator</Text>
                  <Text style={styles.detailText}>{operatorLabel}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Ionicons
                    color={colors.primary}
                    name="construct-outline"
                    size={18}
                  />
                </View>

                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Unit Alat</Text>
                  <Text style={styles.detailText}>{unitLabel}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Ionicons
                    color={colors.primary}
                    name="layers-outline"
                    size={18}
                  />
                </View>

                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Kegiatan</Text>
                  <Text style={styles.detailText}>
                    {item.activity?.name ?? "-"}
                  </Text>
                </View>
              </View>

              <View style={[styles.detailRow, styles.detailRowLast]}>
                <View style={styles.detailIcon}>
                  <Ionicons
                    color={colors.primary}
                    name="location-outline"
                    size={18}
                  />
                </View>

                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Lokasi</Text>
                  <Text style={styles.detailText}>{item.location || "-"}</Text>
                </View>
              </View>

              {(item.status === "revision" || item.status === "rejected") &&
              item.review_notes ? (
                <View style={styles.revisionNote}>
                  <Ionicons
                    color={colors.danger}
                    name="information-circle-outline"
                    size={18}
                  />

                  <View style={styles.revisionContent}>
                    <Text style={styles.revisionLabel}>
                      {item.status === "rejected"
                        ? "Alasan Penolakan"
                        : "Catatan Perbaikan"}
                    </Text>

                    <Text style={styles.revisionText}>{item.review_notes}</Text>
                  </View>
                </View>
              ) : null}
            </View>
          );
        }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: 25,
    fontWeight: "800",
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.xs,
  },

  /*
   * Loading
   */
  loadingContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  loadingIcon: {
    alignItems: "center",
    backgroundColor: "#EAF0F5",
    borderRadius: radius.round,
    height: 82,
    justifyContent: "center",
    width: 82,
  },
  loadingTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
    marginTop: spacing.lg,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: spacing.sm,
    textAlign: "center",
  },

  /*
   * Summary
   */
  summaryCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  summaryIcon: {
    alignItems: "center",
    backgroundColor: "#EAF0F5",
    borderRadius: radius.md,
    height: 44,
    justifyContent: "center",
    marginRight: spacing.md,
    width: 44,
  },
  summaryContent: {
    flex: 1,
  },
  summaryLabel: {
    color: colors.textSecondary,
    fontSize: 10,
  },
  summaryValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
    marginTop: 2,
  },
  summaryStatus: {
    alignItems: "center",
    backgroundColor: "#EDF8F0",
    borderRadius: radius.round,
    flexDirection: "row",
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  summaryDot: {
    backgroundColor: colors.success,
    borderRadius: radius.round,
    height: 6,
    marginRight: 5,
    width: 6,
  },
  summaryStatusText: {
    color: colors.success,
    fontSize: 9,
    fontWeight: "700",
  },

  /*
   * Search & filters
   */
  searchBox: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 50,
    paddingHorizontal: spacing.md,
  },
  searchInput: {
    color: colors.text,
    flex: 1,
    fontSize: 13,
    marginHorizontal: spacing.sm,
    minHeight: 48,
    paddingVertical: 0,
  },
  filterContent: {
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  filterChip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.round,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  filterChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
  },
  filterChipTextSelected: {
    color: colors.white,
  },
  errorBanner: {
    alignItems: "center",
    backgroundColor: "#FFF1F1",
    borderColor: "#F8D3D3",
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  errorBannerText: {
    color: colors.danger,
    flex: 1,
    fontSize: 11,
    lineHeight: 17,
    marginHorizontal: spacing.sm,
  },
  listHeading: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
    marginTop: spacing.xs,
  },
  listTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  listCount: {
    color: colors.textSecondary,
    fontSize: 11,
  },

  /*
   * Report card
   */
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
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  reportHeaderContent: {
    flex: 1,
  },
  reportCode: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  dateRow: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: spacing.xs,
  },
  reportDate: {
    color: colors.textSecondary,
    fontSize: 11,
    marginLeft: 5,
  },
  badge: {
    alignItems: "center",
    borderRadius: radius.round,
    flexDirection: "row",
    gap: 4,
    maxWidth: 150,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "800",
    textAlign: "center",
  },
  divider: {
    backgroundColor: colors.border,
    height: 1,
    marginVertical: spacing.md,
  },
  detailRow: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: spacing.md,
  },
  detailRowLast: {
    marginBottom: 0,
  },
  detailIcon: {
    alignItems: "center",
    backgroundColor: "#F2F6F9",
    borderRadius: radius.md,
    height: 36,
    justifyContent: "center",
    marginRight: spacing.md,
    width: 36,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  detailText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
    marginTop: 2,
  },
  revisionNote: {
    alignItems: "flex-start",
    backgroundColor: "#FFF4F4",
    borderColor: "#F7D7D7",
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    marginTop: spacing.md,
    padding: spacing.md,
  },
  revisionContent: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  revisionLabel: {
    color: colors.danger,
    fontSize: 10,
    fontWeight: "800",
  },
  revisionText: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 3,
  },

  /*
   * Empty state
   */
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
  emptyText: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 17,
    marginTop: spacing.xs,
    maxWidth: 270,
    textAlign: "center",
  },
});
