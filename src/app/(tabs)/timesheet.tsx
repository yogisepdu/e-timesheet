import DateTimePicker from "@expo/ui/community/datetime-picker";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { Href } from "expo-router";
import { useFocusEffect, useRouter } from "expo-router";
import { type ComponentProps, useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppButton } from "../../components/AppButton";
import { AppInput } from "../../components/AppInput";
import { colors, radius, spacing } from "../../constants/theme";
import { ApiError, removeToken } from "../../services/api";
import { type AuthUser, getAuthenticatedUser } from "../../services/auth";
import {
  getMasterData,
  type MasterData,
  type ProductionUnit,
} from "../../services/master-data";
import {
  createAndSubmitTimeSheet,
  createTimeSheetDraft,
  submitTimeSheetDraft,
  type TimeSheetSavePayload,
  updateTimeSheetDraft,
} from "../../services/time-sheets";

type IconName = ComponentProps<typeof Ionicons>["name"];

type TimeSheetForm = {
  date: string;

  contractorId: string;

  operatorId: string;
  operatorCode: string;
  operatorName: string;

  equipmentUnitId: string;
  unitCode: string;
  equipmentType: string;

  startTime: string;
  endTime: string;

  hmStart: string;
  hmEnd: string;
  fuel: string;

  location: string;

  activityId: string;
  activityName: string;

  production: string;
  productionUnit: ProductionUnit;
};

type SelectOption = {
  value: string;
  label: string;
  description?: string;
  searchText?: string;
  icon?: IconName;
};

type SubmitModalState = "closed" | "confirm" | "draft" | "success";

function getTodayDateString() {
  const date = new Date();

  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function createInitialForm(): TimeSheetForm {
  return {
    date: getTodayDateString(),

    contractorId: "",

    operatorId: "",
    operatorCode: "",
    operatorName: "",

    equipmentUnitId: "",
    unitCode: "",
    equipmentType: "",

    startTime: "",
    endTime: "",

    hmStart: "",
    hmEnd: "",
    fuel: "",

    location: "",

    activityId: "",
    activityName: "",

    production: "",
    productionUnit: "Ha",
  };
}

function parseDecimal(value: string) {
  return Number(value.replace(",", "."));
}

function formatDecimal(value: number) {
  return value.toFixed(2).replace(".", ",");
}

function parseTime(value: string) {
  const match = value.match(/^([01]\d|2[0-3]):([0-5]\d)$/);

  if (!match) {
    return null;
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);

  return hour * 60 + minute;
}

function calculateTotalHours(startTime: string, endTime: string) {
  const start = parseTime(startTime);
  const end = parseTime(endTime);

  if (start === null || end === null) {
    return "";
  }

  let difference = end - start;

  /**
   * Mendukung pekerjaan yang melewati tengah malam.
   *
   * Contoh:
   * 22:00 sampai 02:00 = 4 jam.
   */
  if (difference < 0) {
    difference += 24 * 60;
  }

  return formatDecimal(difference / 60);
}

function timeStringToDate(value: string) {
  const date = new Date();

  if (!value) {
    date.setSeconds(0, 0);

    return date;
  }

  const parsedTime = parseTime(value);

  if (parsedTime === null) {
    date.setSeconds(0, 0);

    return date;
  }

  const hour = Math.floor(parsedTime / 60);
  const minute = parsedTime % 60;

  date.setHours(hour, minute, 0, 0);

  return date;
}

function dateToTimeString(date: Date) {
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${hour}:${minute}`;
}

function dateStringToDate(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    return new Date();
  }

  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
  );

  date.setHours(0, 0, 0, 0);

  return date;
}

function dateToDateString(date: Date) {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDateLabel(value: string) {
  const date = dateStringToDate(value);

  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function nullableDecimal(value: string) {
  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  const parsed = parseDecimal(normalized);

  return Number.isNaN(parsed) ? null : parsed;
}

type SelectFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  options: SelectOption[];
  onSelect: (option: SelectOption) => void;
  icon?: IconName;
  searchable?: boolean;
  searchPlaceholder?: string;
};

function SelectField({
  label,
  placeholder,
  value,
  options,
  onSelect,
  icon = "list-outline",
  searchable = false,
  searchPlaceholder = "Cari data...",
}: SelectFieldProps) {
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState("");

  const selectedOption = options.find((option) => {
    return option.value === value;
  });

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!searchable || !normalizedQuery) {
      return options;
    }

    return options.filter((option) => {
      const searchableText = [
        option.label,
        option.description,
        option.searchText,
        option.value,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [options, query, searchable]);

  const closeModal = () => {
    setVisible(false);
    setQuery("");
  };

  const handleSelect = (option: SelectOption) => {
    onSelect(option);
    closeModal();
  };

  return (
    <View style={styles.selectWrapper}>
      <Text style={styles.selectLabel}>{label}</Text>

      <Pressable
        accessibilityRole="button"
        onPress={() => setVisible(true)}
        style={({ pressed }) => [
          styles.selectButton,
          pressed ? styles.selectButtonPressed : null,
        ]}
      >
        <Ionicons color={colors.textSecondary} name={icon} size={20} />

        <View style={styles.selectTextContainer}>
          <Text
            numberOfLines={1}
            style={
              selectedOption ? styles.selectValue : styles.selectPlaceholder
            }
          >
            {selectedOption?.label ?? placeholder}
          </Text>

          {selectedOption?.description ? (
            <Text numberOfLines={1} style={styles.selectDescription}>
              {selectedOption.description}
            </Text>
          ) : null}
        </View>

        <Ionicons
          color={colors.textSecondary}
          name="chevron-down-outline"
          size={20}
        />
      </Pressable>

      <Modal
        animationType="slide"
        onRequestClose={closeModal}
        statusBarTranslucent
        transparent
        visible={visible}
      >
        <View style={styles.modalOverlay}>
          <Pressable onPress={closeModal} style={StyleSheet.absoluteFill} />

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.modalKeyboardView}
          >
            <SafeAreaView edges={["bottom"]} style={styles.modalSheet}>
              <View style={styles.modalHandle} />

              <View style={styles.modalHeader}>
                <View style={styles.modalTitleContainer}>
                  <Text style={styles.modalTitle}>{label}</Text>

                  <Text style={styles.modalSubtitle}>
                    Pilih salah satu data yang tersedia
                  </Text>
                </View>

                <Pressable
                  hitSlop={10}
                  onPress={closeModal}
                  style={styles.modalCloseButton}
                >
                  <Ionicons
                    color={colors.text}
                    name="close-outline"
                    size={25}
                  />
                </Pressable>
              </View>

              {searchable ? (
                <View style={styles.searchContainer}>
                  <Ionicons
                    color={colors.textSecondary}
                    name="search-outline"
                    size={20}
                  />

                  <TextInput
                    autoCapitalize="none"
                    autoCorrect={false}
                    onChangeText={setQuery}
                    placeholder={searchPlaceholder}
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
              ) : null}

              <FlatList
                contentContainerStyle={styles.optionList}
                data={filteredOptions}
                keyboardShouldPersistTaps="handled"
                keyExtractor={(item) => item.value}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Ionicons
                      color={colors.textLight}
                      name="search-outline"
                      size={40}
                    />

                    <Text style={styles.emptyTitle}>Data tidak ditemukan</Text>

                    <Text style={styles.emptyDescription}>
                      Coba gunakan kata pencarian yang berbeda.
                    </Text>
                  </View>
                }
                renderItem={({ item }) => {
                  const selected = item.value === value;

                  return (
                    <Pressable
                      onPress={() => handleSelect(item)}
                      style={({ pressed }) => [
                        styles.optionItem,
                        selected ? styles.optionItemSelected : null,
                        pressed ? styles.optionItemPressed : null,
                      ]}
                    >
                      <View
                        style={[
                          styles.optionIcon,
                          selected ? styles.optionIconSelected : null,
                        ]}
                      >
                        <Ionicons
                          color={
                            selected ? colors.primary : colors.textSecondary
                          }
                          name={item.icon ?? "list-outline"}
                          size={21}
                        />
                      </View>

                      <View style={styles.optionTextContainer}>
                        <Text
                          style={[
                            styles.optionLabel,
                            selected ? styles.optionLabelSelected : null,
                          ]}
                        >
                          {item.label}
                        </Text>

                        {item.description ? (
                          <Text style={styles.optionDescription}>
                            {item.description}
                          </Text>
                        ) : null}
                      </View>

                      <View style={styles.optionSelectedMark}>
                        {selected ? (
                          <Ionicons
                            color={colors.primary}
                            name="checkmark-circle"
                            size={22}
                          />
                        ) : (
                          <Ionicons
                            color={colors.border}
                            name="ellipse-outline"
                            size={22}
                          />
                        )}
                      </View>
                    </Pressable>
                  );
                }}
                showsVerticalScrollIndicator={false}
              />
            </SafeAreaView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

type TimePickerFieldProps = {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
};

function TimePickerField({
  label,
  value,
  placeholder = "Pilih waktu",
  onChange,
}: TimePickerFieldProps) {
  const [showPicker, setShowPicker] = useState(false);

  const pickerValue = useMemo(() => {
    return timeStringToDate(value);
  }, [value]);

  const openPicker = () => {
    setShowPicker(true);
  };

  const closePicker = () => {
    setShowPicker(false);
  };

  return (
    <View style={styles.timePickerWrapper}>
      <Text style={styles.timePickerLabel}>{label}</Text>

      <Pressable
        accessibilityLabel={
          value
            ? `${label}, waktu yang dipilih ${value}`
            : `${label}, waktu belum dipilih`
        }
        accessibilityRole="button"
        onPress={openPicker}
        style={({ pressed }) => [
          styles.timePickerButton,
          pressed ? styles.timePickerButtonPressed : null,
        ]}
      >
        <View style={styles.timePickerIcon}>
          <Ionicons color={colors.primary} name="time-outline" size={22} />
        </View>

        <View style={styles.timePickerTextContainer}>
          {value ? (
            <>
              <Text style={styles.timePickerValue}>{value}</Text>

              <Text style={styles.timePickerDescription}>
                Tekan untuk mengubah
              </Text>
            </>
          ) : (
            <Text style={styles.timePickerPlaceholder}>{placeholder}</Text>
          )}
        </View>

        <Ionicons
          color={colors.textSecondary}
          name="chevron-forward-outline"
          size={20}
        />
      </Pressable>

      {showPicker ? (
        <DateTimePicker
          accentColor={colors.primary}
          display="clock"
          is24Hour
          mode="time"
          onDismiss={closePicker}
          onValueChange={(_event, selectedDate) => {
            closePicker();
            onChange(dateToTimeString(selectedDate));
          }}
          presentation="dialog"
          value={pickerValue}
        />
      ) : null}
    </View>
  );
}

type DatePickerFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

function DatePickerField({ label, value, onChange }: DatePickerFieldProps) {
  const [showPicker, setShowPicker] = useState(false);

  const pickerValue = useMemo(() => {
    return dateStringToDate(value);
  }, [value]);

  return (
    <View style={styles.datePickerWrapper}>
      <Text style={styles.datePickerLabel}>{label}</Text>

      <Pressable
        accessibilityRole="button"
        onPress={() => setShowPicker(true)}
        style={({ pressed }) => [
          styles.datePickerButton,
          pressed ? styles.datePickerButtonPressed : null,
        ]}
      >
        <View style={styles.datePickerIcon}>
          <Ionicons color={colors.primary} name="calendar-outline" size={21} />
        </View>

        <View style={styles.datePickerTextContainer}>
          <Text style={styles.datePickerValue}>{formatDateLabel(value)}</Text>

          <Text style={styles.datePickerDescription}>
            Tekan untuk mengubah tanggal
          </Text>
        </View>

        <Ionicons
          color={colors.textSecondary}
          name="chevron-forward-outline"
          size={20}
        />
      </Pressable>

      {showPicker ? (
        <DateTimePicker
          accentColor={colors.primary}
          display="calendar"
          mode="date"
          onDismiss={() => setShowPicker(false)}
          onValueChange={(_event, selectedDate) => {
            setShowPicker(false);
            onChange(dateToDateString(selectedDate));
          }}
          presentation="dialog"
          value={pickerValue}
        />
      ) : null}
    </View>
  );
}

type SubmitTimeSheetModalProps = {
  visible: boolean;
  mode: Exclude<SubmitModalState, "closed">;
  form: TimeSheetForm;
  onClose: () => void;
  onConfirm: () => void;
};

function SubmitTimeSheetModal({
  visible,
  mode,
  form,
  onClose,
  onConfirm,
}: SubmitTimeSheetModalProps) {
  const isSuccess = mode === "success";
  const isDraft = mode === "draft";
  const isConfirm = mode === "confirm";

  const modalTitle = isSuccess
    ? "Time Sheet Terkirim"
    : isDraft
      ? "Draft Tersimpan"
      : "Kirim Time Sheet?";

  const modalDescription = isSuccess
    ? "Laporan berhasil dikirim dan sekarang menunggu pemeriksaan supervisor."
    : isDraft
      ? "Data Time Sheet berhasil disimpan sementara. Anda dapat melanjutkan pengisian dan mengirimnya setelah seluruh data lengkap."
      : "Pastikan seluruh data sudah benar sebelum laporan dikirim kepada supervisor.";

  const primaryLabel = isSuccess
    ? "Selesai"
    : isDraft
      ? "Lanjut Mengisi"
      : "Ya, Kirim Sekarang";

  const primaryIcon: IconName = isSuccess
    ? "checkmark-circle-outline"
    : isDraft
      ? "create-outline"
      : "paper-plane-outline";

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.submitModalOverlay}>
        <Pressable
          onPress={isSuccess ? undefined : onClose}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.submitModalCenter}>
          <View style={styles.submitModalCard}>
            <View
              style={[
                styles.submitModalIconHalo,
                isSuccess
                  ? styles.submitModalSuccessHalo
                  : isDraft
                    ? styles.submitModalDraftHalo
                    : styles.submitModalConfirmHalo,
              ]}
            >
              <View
                style={[
                  styles.submitModalIconCircle,
                  isSuccess
                    ? styles.submitModalSuccessIcon
                    : isDraft
                      ? styles.submitModalDraftIcon
                      : styles.submitModalConfirmIcon,
                ]}
              >
                <Ionicons
                  color={colors.white}
                  name={
                    isSuccess
                      ? "checkmark"
                      : isDraft
                        ? "save-outline"
                        : "paper-plane-outline"
                  }
                  size={32}
                />
              </View>
            </View>

            <Text style={styles.submitModalTitle}>{modalTitle}</Text>

            <Text style={styles.submitModalDescription}>
              {modalDescription}
            </Text>

            {isConfirm ? (
              <View style={styles.submitSummaryCard}>
                <View style={styles.submitSummaryRow}>
                  <View style={styles.submitSummaryIcon}>
                    <Ionicons
                      color={colors.primary}
                      name="person-circle-outline"
                      size={19}
                    />
                  </View>

                  <View style={styles.submitSummaryContent}>
                    <Text style={styles.submitSummaryLabel}>Operator</Text>
                    <Text numberOfLines={1} style={styles.submitSummaryValue}>
                      {form.operatorCode} - {form.operatorName}
                    </Text>
                  </View>
                </View>

                <View style={styles.submitSummaryDivider} />

                <View style={styles.submitSummaryRow}>
                  <View style={styles.submitSummaryIcon}>
                    <Ionicons
                      color={colors.primary}
                      name="construct-outline"
                      size={19}
                    />
                  </View>

                  <View style={styles.submitSummaryContent}>
                    <Text style={styles.submitSummaryLabel}>Unit Alat</Text>
                    <Text numberOfLines={1} style={styles.submitSummaryValue}>
                      {form.unitCode} - {form.equipmentType}
                    </Text>
                  </View>
                </View>

                <View style={styles.submitSummaryDivider} />

                <View style={styles.submitSummaryRow}>
                  <View style={styles.submitSummaryIcon}>
                    <Ionicons
                      color={colors.primary}
                      name="time-outline"
                      size={19}
                    />
                  </View>

                  <View style={styles.submitSummaryContent}>
                    <Text style={styles.submitSummaryLabel}>Jam Operasi</Text>
                    <Text style={styles.submitSummaryValue}>
                      {form.startTime} - {form.endTime}
                    </Text>
                  </View>
                </View>
              </View>
            ) : isDraft ? (
              <View style={styles.submitDraftInfo}>
                <View style={styles.submitDraftInfoIcon}>
                  <Ionicons
                    color={colors.primary}
                    name="cloud-done-outline"
                    size={21}
                  />
                </View>

                <View style={styles.submitDraftInfoContent}>
                  <Text style={styles.submitDraftInfoTitle}>
                    Tersimpan sebagai draft
                  </Text>
                  <Text style={styles.submitDraftInfoText}>
                    Data belum dikirim ke supervisor dan masih dapat diubah.
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.submitSuccessInfo}>
                <Ionicons
                  color={colors.success}
                  name="shield-checkmark-outline"
                  size={18}
                />
                <Text style={styles.submitSuccessInfoText}>
                  Data telah tercatat sebagai laporan terkirim.
                </Text>
              </View>
            )}

            <Pressable
              accessibilityRole="button"
              onPress={isConfirm ? onConfirm : onClose}
              style={({ pressed }) => [
                styles.submitModalPrimaryButton,
                isSuccess
                  ? styles.submitModalSuccessButton
                  : isDraft
                    ? styles.submitModalDraftButton
                    : styles.submitModalSendButton,
                pressed ? styles.submitModalButtonPressed : null,
              ]}
            >
              <View style={styles.submitModalPrimaryIcon}>
                <Ionicons
                  color={isSuccess ? colors.success : colors.primary}
                  name={primaryIcon}
                  size={20}
                />
              </View>

              <Text style={styles.submitModalPrimaryText}>{primaryLabel}</Text>

              <Ionicons
                color={colors.white}
                name="arrow-forward-outline"
                size={20}
              />
            </Pressable>

            {isConfirm ? (
              <Pressable
                accessibilityRole="button"
                onPress={onClose}
                style={({ pressed }) => [
                  styles.submitModalSecondaryButton,
                  pressed ? styles.submitModalButtonPressed : null,
                ]}
              >
                <Ionicons
                  color={colors.textSecondary}
                  name="arrow-back-outline"
                  size={18}
                />
                <Text style={styles.submitModalSecondaryText}>
                  Periksa Lagi
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function TimeSheetScreen() {
  const router = useRouter();

  const [form, setForm] = useState<TimeSheetForm>(createInitialForm());

  const [masterData, setMasterData] = useState<MasterData | null>(null);

  const [user, setUser] = useState<AuthUser | null>(null);

  const [currentTimeSheetId, setCurrentTimeSheetId] = useState<number | null>(
    null,
  );

  const [currentTimeSheetCode, setCurrentTimeSheetCode] = useState("");

  const [submitModal, setSubmitModal] = useState<SubmitModalState>("closed");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState("");

  const updateField = <K extends keyof TimeSheetForm>(
    field: K,
    value: TimeSheetForm[K],
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const loadScreenData = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError("");

      const [authenticatedUser, loadedMasterData] = await Promise.all([
        getAuthenticatedUser(),
        getMasterData(),
      ]);

      setUser(authenticatedUser);
      setMasterData(loadedMasterData);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          await removeToken();
          router.replace("/login" as Href);

          return;
        }

        setLoadError(error.message);

        return;
      }

      setLoadError(
        "Data form tidak dapat dimuat. Periksa koneksi ke server lalu coba kembali.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      void loadScreenData();
    }, [loadScreenData]),
  );

  const contractorOptions = useMemo<SelectOption[]>(() => {
    if (!masterData) {
      return [];
    }

    return masterData.contractors.map((contractor) => ({
      value: String(contractor.id),
      label: contractor.name,
      description: `${contractor.code} • ${
        contractor.type === "internal" ? "Internal" : "External"
      }`,
      searchText: `${contractor.code} ${contractor.name} ${contractor.type}`,
      icon:
        contractor.type === "internal"
          ? "business-outline"
          : "briefcase-outline",
    }));
  }, [masterData]);

  const operatorOptions = useMemo<SelectOption[]>(() => {
    if (!masterData || !form.contractorId) {
      return [];
    }

    const contractorId = Number(form.contractorId);

    return masterData.operators
      .filter((operator) => {
        return (
          operator.contractor_id === null ||
          operator.contractor_id === contractorId
        );
      })
      .map((operator) => ({
        value: String(operator.id),
        label: `${operator.code} - ${operator.name}`,
        description: operator.contractor?.name ?? "Operator alat",
        searchText: `${operator.code} ${operator.name} ${
          operator.contractor?.name ?? ""
        }`,
        icon: "person-circle-outline",
      }));
  }, [form.contractorId, masterData]);

  const unitOptions = useMemo<SelectOption[]>(() => {
    if (!masterData || !form.contractorId) {
      return [];
    }

    const contractorId = Number(form.contractorId);

    return masterData.equipment_units
      .filter((unit) => {
        return (
          unit.contractor_id === null || unit.contractor_id === contractorId
        );
      })
      .map((unit) => ({
        value: String(unit.id),
        label: `${unit.code} - ${unit.equipment_type}`,
        description: unit.contractor?.name ?? `Kode unit: ${unit.code}`,
        searchText: `${unit.code} ${unit.equipment_type} ${
          unit.brand ?? ""
        } ${unit.model ?? ""}`,
        icon: "construct-outline",
      }));
  }, [form.contractorId, masterData]);

  const activityOptions = useMemo<SelectOption[]>(() => {
    if (!masterData) {
      return [];
    }

    return masterData.activities.map((activity) => ({
      value: String(activity.id),
      label: activity.name,
      description: activity.default_production_unit
        ? `Satuan default: ${activity.default_production_unit}`
        : undefined,
      searchText: `${activity.code} ${activity.name}`,
      icon: "layers-outline",
    }));
  }, [masterData]);

  const productionUnits = useMemo(() => {
    return masterData?.production_units.map((item) => item.value) ?? [];
  }, [masterData]);

  const totalHm = useMemo(() => {
    const start = parseDecimal(form.hmStart);
    const end = parseDecimal(form.hmEnd);

    if (
      !form.hmStart ||
      !form.hmEnd ||
      Number.isNaN(start) ||
      Number.isNaN(end) ||
      end < start
    ) {
      return "";
    }

    return formatDecimal(end - start);
  }, [form.hmEnd, form.hmStart]);

  const totalHours = useMemo(() => {
    return calculateTotalHours(form.startTime, form.endTime);
  }, [form.endTime, form.startTime]);

  const hmError = useMemo(() => {
    const start = parseDecimal(form.hmStart);
    const end = parseDecimal(form.hmEnd);

    if (
      form.hmStart &&
      form.hmEnd &&
      !Number.isNaN(start) &&
      !Number.isNaN(end) &&
      end < start
    ) {
      return "HM akhir tidak boleh lebih kecil dari HM awal.";
    }

    return "";
  }, [form.hmEnd, form.hmStart]);

  const handleContractorSelect = (option: SelectOption) => {
    setForm((previous) => ({
      ...previous,
      contractorId: option.value,

      operatorId: "",
      operatorCode: "",
      operatorName: "",

      equipmentUnitId: "",
      unitCode: "",
      equipmentType: "",
    }));
  };

  const handleOperatorSelect = (option: SelectOption) => {
    const selectedOperator = masterData?.operators.find((operator) => {
      return String(operator.id) === option.value;
    });

    if (!selectedOperator) {
      return;
    }

    setForm((previous) => ({
      ...previous,
      operatorId: String(selectedOperator.id),
      operatorCode: selectedOperator.code,
      operatorName: selectedOperator.name,
    }));
  };

  const handleUnitSelect = (option: SelectOption) => {
    const selectedUnit = masterData?.equipment_units.find((unit) => {
      return String(unit.id) === option.value;
    });

    if (!selectedUnit) {
      return;
    }

    setForm((previous) => ({
      ...previous,
      equipmentUnitId: String(selectedUnit.id),
      unitCode: selectedUnit.code,
      equipmentType: selectedUnit.equipment_type,
    }));
  };

  const handleActivitySelect = (option: SelectOption) => {
    const selectedActivity = masterData?.activities.find((activity) => {
      return String(activity.id) === option.value;
    });

    if (!selectedActivity) {
      return;
    }

    setForm((previous) => ({
      ...previous,
      activityId: String(selectedActivity.id),
      activityName: selectedActivity.name,
      productionUnit:
        selectedActivity.default_production_unit ?? previous.productionUnit,
    }));
  };

  const validateForm = () => {
    const requiredFields: Array<{
      value: string;
      label: string;
    }> = [
      {
        value: form.date,
        label: "Tanggal",
      },
      {
        value: form.contractorId,
        label: "Kontraktor",
      },
      {
        value: form.operatorId,
        label: "Operator",
      },
      {
        value: form.equipmentUnitId,
        label: "Unit alat",
      },
      {
        value: form.startTime,
        label: "Jam mulai",
      },
      {
        value: form.endTime,
        label: "Jam selesai",
      },
      {
        value: form.hmStart,
        label: "HM awal",
      },
      {
        value: form.hmEnd,
        label: "HM akhir",
      },
      {
        value: form.location,
        label: "Lokasi",
      },
      {
        value: form.activityId,
        label: "Kegiatan",
      },
    ];

    const missingField = requiredFields.find(({ value }) => !value.trim());

    if (missingField) {
      Alert.alert("Data belum lengkap", `${missingField.label} wajib diisi.`);

      return false;
    }

    if (!totalHours) {
      Alert.alert(
        "Waktu tidak sesuai",
        "Pilih jam mulai dan jam selesai terlebih dahulu.",
      );

      return false;
    }

    if (form.startTime === form.endTime) {
      Alert.alert(
        "Waktu tidak sesuai",
        "Jam selesai tidak boleh sama dengan jam mulai.",
      );

      return false;
    }

    if (hmError || !totalHm) {
      Alert.alert(
        "HM tidak sesuai",
        hmError || "Periksa kembali nilai HM awal dan HM akhir.",
      );

      return false;
    }

    if (
      form.fuel &&
      (nullableDecimal(form.fuel) === null ||
        (nullableDecimal(form.fuel) ?? 0) < 0)
    ) {
      Alert.alert(
        "BBM tidak sesuai",
        "BBM terpakai harus berupa angka 0 atau lebih.",
      );

      return false;
    }

    if (
      form.production &&
      (nullableDecimal(form.production) === null ||
        (nullableDecimal(form.production) ?? 0) < 0)
    ) {
      Alert.alert(
        "Produksi tidak sesuai",
        "Jumlah produksi harus berupa angka 0 atau lebih.",
      );

      return false;
    }

    if (form.production && !form.productionUnit) {
      Alert.alert(
        "Satuan produksi belum dipilih",
        "Pilih satuan produksi terlebih dahulu.",
      );

      return false;
    }

    return true;
  };

  const hasDraftContent = () => {
    return Boolean(
      form.contractorId ||
      form.operatorId ||
      form.equipmentUnitId ||
      form.startTime ||
      form.endTime ||
      form.hmStart ||
      form.hmEnd ||
      form.fuel ||
      form.location.trim() ||
      form.activityId ||
      form.production,
    );
  };

  const buildPayload = (): TimeSheetSavePayload => {
    return {
      work_date: form.date || null,

      contractor_id: form.contractorId ? Number(form.contractorId) : null,

      operator_id: form.operatorId ? Number(form.operatorId) : null,

      equipment_unit_id: form.equipmentUnitId
        ? Number(form.equipmentUnitId)
        : null,

      activity_id: form.activityId ? Number(form.activityId) : null,

      start_time: form.startTime || null,
      end_time: form.endTime || null,

      hm_start: nullableDecimal(form.hmStart),
      hm_end: nullableDecimal(form.hmEnd),

      fuel_used: nullableDecimal(form.fuel),

      location: form.location.trim() || null,

      production: nullableDecimal(form.production),

      production_unit: form.productionUnit || null,
    };
  };

  const handleApiError = async (error: unknown, fallbackMessage: string) => {
    if (error instanceof ApiError) {
      if (error.status === 401) {
        await removeToken();
        router.replace("/login" as Href);

        return;
      }

      Alert.alert("Proses gagal", error.message);

      return;
    }

    Alert.alert("Proses gagal", fallbackMessage);
  };

  const handleSaveDraft = async () => {
    if (isSaving) {
      return;
    }

    if (!hasDraftContent()) {
      Alert.alert(
        "Belum ada data",
        "Isi minimal salah satu data Time Sheet sebelum menyimpan draft.",
      );

      return;
    }

    try {
      setIsSaving(true);

      const payload = buildPayload();

      const response = currentTimeSheetId
        ? await updateTimeSheetDraft(currentTimeSheetId, payload)
        : await createTimeSheetDraft(payload);

      setCurrentTimeSheetId(response.data.id);
      setCurrentTimeSheetCode(response.data.code);

      setSubmitModal("draft");
    } catch (error) {
      await handleApiError(
        error,
        "Draft tidak dapat disimpan. Silakan coba kembali.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    setSubmitModal("confirm");
  };

  const handleConfirmSubmit = async () => {
    if (isSaving) {
      return;
    }

    try {
      setIsSaving(true);

      const payload = buildPayload();

      const response = currentTimeSheetId
        ? await submitTimeSheetDraft(currentTimeSheetId, payload)
        : await createAndSubmitTimeSheet(payload);

      setCurrentTimeSheetId(response.data.id);
      setCurrentTimeSheetCode(response.data.code);

      setSubmitModal("success");
    } catch (error) {
      setSubmitModal("closed");

      await handleApiError(
        error,
        "Time Sheet tidak dapat dikirim. Silakan coba kembali.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseSubmitModal = () => {
    if (isSaving) {
      return;
    }

    if (submitModal === "success") {
      setForm(createInitialForm());
      setCurrentTimeSheetId(null);
      setCurrentTimeSheetCode("");
    }

    setSubmitModal("closed");
  };

  if (isLoading && !masterData) {
    return (
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={styles.screenLoadingContainer}>
          <View style={styles.screenLoadingIcon}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>

          <Text style={styles.screenLoadingTitle}>
            Menyiapkan Form Time Sheet
          </Text>

          <Text style={styles.screenLoadingText}>
            Mengambil data Pengawas, Kontraktor, Operator, Unit Alat, dan
            Kegiatan dari server...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!masterData) {
    return (
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={styles.loadErrorContainer}>
          <View style={styles.loadErrorIcon}>
            <Ionicons
              color={colors.danger}
              name="cloud-offline-outline"
              size={30}
            />
          </View>

          <Text style={styles.loadErrorTitle}>Data form gagal dimuat</Text>

          <Text style={styles.loadErrorText}>
            {loadError || "Tidak dapat mengambil master data dari server."}
          </Text>

          <Pressable
            accessibilityRole="button"
            onPress={() => {
              void loadScreenData();
            }}
            style={({ pressed }) => [
              styles.retryButton,
              pressed ? styles.submitModalButtonPressed : null,
            ]}
          >
            <Ionicons color={colors.white} name="refresh-outline" size={18} />

            <Text style={styles.retryButtonText}>Coba Lagi</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Form Time Sheet</Text>

            <Text style={styles.subtitle}>
              Isi laporan pemakaian alat sesuai kegiatan di lapangan.
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Ionicons
              color={colors.info}
              name="information-circle-outline"
              size={22}
            />

            <View style={styles.infoContent}>
              <Text style={styles.infoText}>
                Nama pengawas diambil otomatis dari akun yang sedang login:{" "}
                <Text style={styles.infoTextStrong}>{user?.name ?? "-"}</Text>.
              </Text>

              {currentTimeSheetCode ? (
                <View style={styles.draftCodeRow}>
                  <Ionicons
                    color={colors.primary}
                    name="document-text-outline"
                    size={15}
                  />
                  <Text style={styles.draftCodeText}>
                    Draft aktif: {currentTimeSheetCode}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          {loadError ? (
            <Pressable
              onPress={() => {
                void loadScreenData();
              }}
              style={styles.inlineWarning}
            >
              <Ionicons
                color={colors.warning}
                name="warning-outline"
                size={18}
              />

              <Text style={styles.inlineWarningText}>{loadError}</Text>

              <Ionicons
                color={colors.warning}
                name="refresh-outline"
                size={18}
              />
            </Pressable>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Identitas Laporan</Text>

            <DatePickerField
              label="Hari/Tanggal"
              onChange={(value) => {
                updateField("date", value);
              }}
              value={form.date}
            />

            <SelectField
              icon="business-outline"
              label="Kontraktor"
              onSelect={handleContractorSelect}
              options={contractorOptions}
              placeholder="Pilih kontraktor"
              searchable
              searchPlaceholder="Cari kode atau nama kontraktor..."
              value={form.contractorId}
            />

            <SelectField
              icon="person-circle-outline"
              label="Pilih Operator"
              onSelect={handleOperatorSelect}
              options={operatorOptions}
              placeholder={
                form.contractorId
                  ? "Cari kode atau nama operator"
                  : "Pilih kontraktor terlebih dahulu"
              }
              searchable
              searchPlaceholder="Cari kode atau nama operator..."
              value={form.operatorId}
            />

            <View style={styles.row}>
              <View style={styles.operatorCodeColumn}>
                <AppInput
                  editable={false}
                  label="Kode Operator"
                  placeholder="-"
                  value={form.operatorCode}
                />
              </View>

              <View style={styles.operatorNameColumn}>
                <AppInput
                  editable={false}
                  label="Nama Operator"
                  placeholder="Terisi otomatis"
                  value={form.operatorName}
                />
              </View>
            </View>

            <SelectField
              icon="construct-outline"
              label="Pilih Unit Alat"
              onSelect={handleUnitSelect}
              options={unitOptions}
              placeholder={
                form.contractorId
                  ? "Cari kode unit atau jenis alat"
                  : "Pilih kontraktor terlebih dahulu"
              }
              searchable
              searchPlaceholder="Cari kode unit atau jenis alat..."
              value={form.equipmentUnitId}
            />

            <View style={styles.row}>
              <View style={styles.unitCodeColumn}>
                <AppInput
                  editable={false}
                  label="Kode Unit"
                  placeholder="Terisi otomatis"
                  value={form.unitCode}
                />
              </View>

              <View style={styles.unitTypeColumn}>
                <AppInput
                  editable={false}
                  label="Jenis Alat"
                  placeholder="Terisi otomatis"
                  value={form.equipmentType}
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Jam Operasi</Text>

            <View style={styles.row}>
              <View style={styles.half}>
                <TimePickerField
                  label="Jam Mulai"
                  onChange={(value) => {
                    updateField("startTime", value);
                  }}
                  placeholder="Pilih jam mulai"
                  value={form.startTime}
                />
              </View>

              <View style={styles.half}>
                <TimePickerField
                  label="Jam Selesai"
                  onChange={(value) => {
                    updateField("endTime", value);
                  }}
                  placeholder="Pilih jam selesai"
                  value={form.endTime}
                />
              </View>
            </View>

            <AppInput
              editable={false}
              icon="hourglass-outline"
              label="Total Jam"
              placeholder="Dihitung otomatis"
              value={totalHours ? `${totalHours} jam` : ""}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hour Meter</Text>

            <View style={styles.row}>
              <View style={styles.half}>
                <AppInput
                  keyboardType="decimal-pad"
                  label="HM Awal"
                  onChangeText={(value) => {
                    updateField("hmStart", value);
                  }}
                  placeholder="9969,80"
                  value={form.hmStart}
                />
              </View>

              <View style={styles.half}>
                <AppInput
                  keyboardType="decimal-pad"
                  label="HM Akhir"
                  onChangeText={(value) => {
                    updateField("hmEnd", value);
                  }}
                  placeholder="9971,80"
                  value={form.hmEnd}
                />
              </View>
            </View>

            <AppInput
              editable={false}
              error={hmError}
              icon="speedometer-outline"
              label="Total HM"
              placeholder="Dihitung otomatis"
              value={totalHm}
            />

            <AppInput
              icon="water-outline"
              keyboardType="decimal-pad"
              label="BBM Terpakai (Liter)"
              onChangeText={(value) => {
                updateField("fuel", value);
              }}
              placeholder="Contoh: 25"
              value={form.fuel}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Kegiatan dan Produksi</Text>

            <AppInput
              icon="location-outline"
              label="Lokasi"
              onChangeText={(value) => {
                updateField("location", value);
              }}
              placeholder="Masukkan lokasi pekerjaan"
              value={form.location}
            />

            <SelectField
              icon="layers-outline"
              label="Kegiatan"
              onSelect={handleActivitySelect}
              options={activityOptions}
              placeholder="Pilih kegiatan alat"
              searchable
              searchPlaceholder="Cari kegiatan..."
              value={form.activityId}
            />

            <AppInput
              icon="bar-chart-outline"
              keyboardType="decimal-pad"
              label="Jumlah Produksi"
              onChangeText={(value) => {
                updateField("production", value);
              }}
              placeholder="Contoh: 0,9"
              value={form.production}
            />

            <Text style={styles.unitLabel}>Satuan Produksi</Text>

            <View style={styles.unitContainer}>
              {productionUnits.map((unit) => {
                const selected = form.productionUnit === unit;

                return (
                  <Pressable
                    key={unit}
                    onPress={() => {
                      updateField("productionUnit", unit);
                    }}
                    style={[
                      styles.unitButton,
                      selected ? styles.unitButtonSelected : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.unitText,
                        selected ? styles.unitTextSelected : null,
                      ]}
                    >
                      {unit}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.actionRow}>
            <AppButton
              icon="save-outline"
              onPress={() => {
                void handleSaveDraft();
              }}
              style={styles.actionButton}
              title={
                isSaving
                  ? "Memproses..."
                  : currentTimeSheetId
                    ? "Perbarui Draft"
                    : "Simpan Draft"
              }
              variant="outline"
            />

            <AppButton
              icon="paper-plane-outline"
              onPress={handleSubmit}
              style={styles.actionButton}
              title="Kirim"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <SubmitTimeSheetModal
        form={form}
        mode={
          submitModal === "success"
            ? "success"
            : submitModal === "draft"
              ? "draft"
              : "confirm"
        }
        onClose={handleCloseSubmitModal}
        onConfirm={() => {
          void handleConfirmSubmit();
        }}
        visible={submitModal !== "closed"}
      />
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
  content: {
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
  infoCard: {
    alignItems: "flex-start",
    backgroundColor: "#EAF4FC",
    borderRadius: radius.md,
    flexDirection: "row",
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  infoText: {
    color: "#24587C",
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    marginLeft: spacing.sm,
  },
  section: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "800",
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
  half: {
    flex: 1,
  },
  operatorCodeColumn: {
    flex: 0.8,
  },
  operatorNameColumn: {
    flex: 1.4,
  },
  unitCodeColumn: {
    flex: 0.8,
  },
  unitTypeColumn: {
    flex: 1.4,
  },

  screenLoadingContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  screenLoadingIcon: {
    alignItems: "center",
    backgroundColor: "#EAF0F5",
    borderRadius: radius.round,
    height: 84,
    justifyContent: "center",
    width: 84,
  },
  screenLoadingTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
    marginTop: spacing.lg,
    textAlign: "center",
  },
  screenLoadingText: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.sm,
    maxWidth: 310,
    textAlign: "center",
  },
  loadErrorContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  loadErrorIcon: {
    alignItems: "center",
    backgroundColor: "#FFF1F1",
    borderRadius: radius.round,
    height: 78,
    justifyContent: "center",
    width: 78,
  },
  loadErrorTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
    marginTop: spacing.lg,
  },
  loadErrorText: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.sm,
    maxWidth: 310,
    textAlign: "center",
  },
  retryButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "center",
    marginTop: spacing.lg,
    minHeight: 48,
    paddingHorizontal: spacing.xl,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "800",
  },
  infoContent: {
    flex: 1,
  },
  infoTextStrong: {
    fontWeight: "800",
  },
  draftCodeRow: {
    alignItems: "center",
    flexDirection: "row",
    marginLeft: spacing.sm,
    marginTop: spacing.sm,
  },
  draftCodeText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "800",
    marginLeft: 6,
  },
  inlineWarning: {
    alignItems: "center",
    backgroundColor: "#FFF8EC",
    borderColor: "#F5DFC0",
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  inlineWarningText: {
    color: "#7A5B2A",
    flex: 1,
    fontSize: 11,
    lineHeight: 17,
    marginHorizontal: spacing.sm,
  },

  /*
   * Date picker
   */
  datePickerWrapper: {
    marginBottom: spacing.lg,
  },
  datePickerLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  datePickerButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 62,
    paddingHorizontal: spacing.sm,
  },
  datePickerButtonPressed: {
    backgroundColor: "#F7F9FB",
    borderColor: colors.primary,
  },
  datePickerIcon: {
    alignItems: "center",
    backgroundColor: "#EAF0F5",
    borderRadius: radius.md,
    height: 40,
    justifyContent: "center",
    marginRight: spacing.sm,
    width: 40,
  },
  datePickerTextContainer: {
    flex: 1,
  },
  datePickerValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  datePickerDescription: {
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 3,
  },

  /*
   * Time picker
   */
  timePickerWrapper: {
    flex: 1,
    marginBottom: spacing.lg,
  },
  timePickerLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  timePickerButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 62,
    paddingHorizontal: spacing.sm,
  },
  timePickerButtonPressed: {
    backgroundColor: "#F7F9FB",
    borderColor: colors.primary,
  },
  timePickerIcon: {
    alignItems: "center",
    backgroundColor: "#EAF0F5",
    borderRadius: radius.md,
    height: 40,
    justifyContent: "center",
    marginRight: spacing.sm,
    width: 40,
  },
  timePickerTextContainer: {
    flex: 1,
  },
  timePickerValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  timePickerDescription: {
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 2,
  },
  timePickerPlaceholder: {
    color: colors.textLight,
    fontSize: 12,
  },

  /*
   * Select field
   */
  selectWrapper: {
    marginBottom: spacing.lg,
  },
  selectLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  selectButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 54,
    paddingHorizontal: spacing.md,
  },
  selectButtonPressed: {
    backgroundColor: "#F7F9FB",
    borderColor: colors.primary,
  },
  selectTextContainer: {
    flex: 1,
    marginHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  selectValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  selectPlaceholder: {
    color: colors.textLight,
    fontSize: 14,
  },
  selectDescription: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 3,
  },

  /*
   * Modal dropdown
   */
  modalOverlay: {
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    flex: 1,
    justifyContent: "flex-end",
  },
  modalKeyboardView: {
    justifyContent: "flex-end",
    maxHeight: "84%",
    width: "100%",
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: "100%",
    minHeight: 300,
    overflow: "hidden",
  },
  modalHandle: {
    alignSelf: "center",
    backgroundColor: colors.border,
    borderRadius: radius.round,
    height: 5,
    marginTop: spacing.sm,
    width: 45,
  },
  modalHeader: {
    alignItems: "flex-start",
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: spacing.lg,
  },
  modalTitleContainer: {
    flex: 1,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: "800",
  },
  modalSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  modalCloseButton: {
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: radius.round,
    height: 38,
    justifyContent: "center",
    marginLeft: spacing.md,
    width: 38,
  },
  searchContainer: {
    alignItems: "center",
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    minHeight: 50,
    paddingHorizontal: spacing.md,
  },
  searchInput: {
    color: colors.text,
    flex: 1,
    fontSize: 14,
    marginHorizontal: spacing.sm,
    minHeight: 48,
    paddingVertical: 0,
  },
  optionList: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  optionItem: {
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    minHeight: 62,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
  },
  optionItemSelected: {
    backgroundColor: "#EEF4F8",
    borderBottomWidth: 0,
    borderRadius: radius.md,
    marginBottom: 1,
  },
  optionItemPressed: {
    opacity: 0.7,
  },
  optionIcon: {
    alignItems: "center",
    backgroundColor: "#F4F6F8",
    borderRadius: radius.md,
    height: 42,
    justifyContent: "center",
    marginRight: spacing.md,
    width: 42,
  },
  optionIconSelected: {
    backgroundColor: "#EAF0F5",
  },
  optionTextContainer: {
    flex: 1,
  },
  optionLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  optionLabelSelected: {
    color: colors.primary,
    fontWeight: "800",
  },
  optionSelectedMark: {
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.sm,
    width: 28,
  },
  optionDescription: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
    marginTop: spacing.md,
  },
  emptyDescription: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: spacing.xs,
    textAlign: "center",
  },

  /*
   * Satuan produksi
   */
  unitLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  unitContainer: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  unitButton: {
    alignItems: "center",
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flex: 1,
    paddingVertical: spacing.md,
  },
  unitButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  unitText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "700",
  },
  unitTextSelected: {
    color: colors.white,
  },
  /*
   * Modal konfirmasi & sukses kirim
   */
  submitModalOverlay: {
    backgroundColor: "rgba(11, 24, 38, 0.58)",
    flex: 1,
  },
  submitModalCenter: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  submitModalCard: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 28,
    elevation: 14,
    maxWidth: 430,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: 30,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 14,
    },
    shadowOpacity: 0.2,
    shadowRadius: 26,
    width: "100%",
  },
  submitModalIconHalo: {
    alignItems: "center",
    borderRadius: radius.round,
    height: 94,
    justifyContent: "center",
    width: 94,
  },
  submitModalConfirmHalo: {
    backgroundColor: "#EAF1F6",
  },
  submitModalSuccessHalo: {
    backgroundColor: "#E9F7ED",
  },
  submitModalDraftHalo: {
    backgroundColor: "#EDF4F8",
  },
  submitModalIconCircle: {
    alignItems: "center",
    borderRadius: radius.round,
    elevation: 4,
    height: 64,
    justifyContent: "center",
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    width: 64,
  },
  submitModalConfirmIcon: {
    backgroundColor: colors.primary,
  },
  submitModalSuccessIcon: {
    backgroundColor: colors.success,
  },
  submitModalDraftIcon: {
    backgroundColor: colors.primary,
  },
  submitModalTitle: {
    color: colors.text,
    fontSize: 23,
    fontWeight: "800",
    marginTop: spacing.lg,
    textAlign: "center",
  },
  submitModalDescription: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginTop: spacing.sm,
    maxWidth: 330,
    textAlign: "center",
  },
  submitSummaryCard: {
    backgroundColor: "#F7F9FB",
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginTop: spacing.xl,
    paddingHorizontal: spacing.md,
    width: "100%",
  },
  submitSummaryRow: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 62,
    paddingVertical: spacing.sm,
  },
  submitSummaryIcon: {
    alignItems: "center",
    backgroundColor: "#EAF0F5",
    borderRadius: radius.md,
    height: 38,
    justifyContent: "center",
    marginRight: spacing.md,
    width: 38,
  },
  submitSummaryContent: {
    flex: 1,
  },
  submitSummaryLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  submitSummaryValue: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 3,
  },
  submitSummaryDivider: {
    backgroundColor: colors.border,
    height: 1,
  },
  submitDraftInfo: {
    alignItems: "center",
    backgroundColor: "#F2F7FA",
    borderColor: "#D8E6EF",
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    marginTop: spacing.xl,
    padding: spacing.md,
    width: "100%",
  },
  submitDraftInfoIcon: {
    alignItems: "center",
    backgroundColor: "#E4EEF5",
    borderRadius: radius.md,
    height: 42,
    justifyContent: "center",
    marginRight: spacing.md,
    width: 42,
  },
  submitDraftInfoContent: {
    flex: 1,
  },
  submitDraftInfoTitle: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "800",
  },
  submitDraftInfoText: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 3,
  },
  submitSuccessInfo: {
    alignItems: "center",
    backgroundColor: "#F1FAF3",
    borderColor: "#D6EEDC",
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    marginTop: spacing.xl,
    padding: spacing.md,
    width: "100%",
  },
  submitSuccessInfoText: {
    color: colors.success,
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
    marginLeft: spacing.sm,
  },
  submitModalPrimaryButton: {
    alignItems: "center",
    borderRadius: radius.lg,
    elevation: 4,
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.xl,
    minHeight: 58,
    paddingHorizontal: spacing.md,
    shadowColor: colors.primaryDark,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.18,
    shadowRadius: 9,
    width: "100%",
  },
  submitModalSendButton: {
    backgroundColor: colors.primary,
  },
  submitModalSuccessButton: {
    backgroundColor: colors.success,
  },
  submitModalDraftButton: {
    backgroundColor: colors.primary,
  },
  submitModalPrimaryIcon: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: radius.md,
    height: 36,
    justifyContent: "center",
    marginRight: spacing.md,
    width: 36,
  },
  submitModalPrimaryText: {
    color: colors.white,
    flex: 1,
    fontSize: 14,
    fontWeight: "800",
  },
  submitModalSecondaryButton: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "center",
    marginTop: spacing.sm,
    minHeight: 46,
    width: "100%",
  },
  submitModalSecondaryText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "700",
  },
  submitModalButtonPressed: {
    opacity: 0.78,
  },

  actionRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});
