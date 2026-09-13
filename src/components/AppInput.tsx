import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { colors, radius, spacing } from "../constants/theme";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

export type AppInputProps = {
  icon?: IoniconName;
  label: string;
  placeholder?: string;
  value: string;

  /**
   * Optional karena beberapa input digunakan
   * hanya untuk menampilkan data yang tidak dapat diedit.
   */
  onChangeText?: (value: string) => void;

  editable?: boolean;
  secureTextEntry?: boolean;

  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoCorrect?: boolean;

  keyboardType?:
    | "default"
    | "email-address"
    | "numeric"
    | "phone-pad"
    | "decimal-pad";

  error?: string;

  rightIcon?: IoniconName;
  onRightIconPress?: () => void;

  multiline?: boolean;
  numberOfLines?: number;

  maxLength?: number;

  returnKeyType?: "done" | "go" | "next" | "search" | "send" | "default";

  onSubmitEditing?: () => void;

  textContentType?:
    | "none"
    | "username"
    | "password"
    | "emailAddress"
    | "telephoneNumber";

  accessibilityLabel?: string;
};

export function AppInput({
  icon,
  label,
  placeholder,
  value,
  onChangeText,
  editable = true,
  secureTextEntry = false,
  autoCapitalize = "none",
  autoCorrect = false,
  keyboardType = "default",
  error,
  rightIcon,
  onRightIconPress,
  multiline = false,
  numberOfLines = 1,
  maxLength,
  returnKeyType,
  onSubmitEditing,
  textContentType,
  accessibilityLabel,
}: AppInputProps) {
  const isDisabled = editable === false;
  const hasError = Boolean(error);

  return (
    <View style={styles.container}>
      {/* Label */}
      <Text style={styles.label}>{label}</Text>

      {/* Input */}
      <View
        style={[
          styles.inputContainer,
          isDisabled ? styles.inputContainerDisabled : null,
          hasError ? styles.inputContainerError : null,
          multiline ? styles.inputContainerMultiline : null,
        ]}
      >
        {/* Left Icon */}
        {icon ? (
          <Ionicons
            color={
              hasError
                ? colors.danger
                : isDisabled
                  ? colors.textLight
                  : colors.textSecondary
            }
            name={icon}
            size={20}
            style={styles.leftIcon}
          />
        ) : null}

        {/* Text Input */}
        <TextInput
          accessibilityLabel={accessibilityLabel ?? label}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          editable={editable}
          keyboardType={keyboardType}
          maxLength={maxLength}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmitEditing}
          placeholder={placeholder}
          placeholderTextColor={colors.textLight}
          returnKeyType={returnKeyType}
          secureTextEntry={secureTextEntry}
          style={[styles.input, multiline ? styles.inputMultiline : null]}
          textContentType={textContentType}
          value={value}
        />

        {/* Right Icon */}
        {rightIcon && onRightIconPress ? (
          <Pressable
            accessibilityLabel={
              secureTextEntry ? "Tampilkan password" : "Sembunyikan password"
            }
            accessibilityRole="button"
            hitSlop={10}
            onPress={onRightIconPress}
            style={styles.rightButton}
          >
            <Ionicons
              color={isDisabled ? colors.textLight : colors.textSecondary}
              name={rightIcon}
              size={20}
            />
          </Pressable>
        ) : null}
      </View>

      {/* Error */}
      {error ? (
        <View style={styles.errorContainer}>
          <Ionicons
            color={colors.danger}
            name="alert-circle-outline"
            size={15}
          />

          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
    width: "100%",
  },

  label: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },

  inputContainer: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 50,
    paddingHorizontal: spacing.md,
  },

  inputContainerDisabled: {
    backgroundColor: "#F5F7F9",
    opacity: 0.85,
  },

  inputContainerError: {
    borderColor: colors.danger,
  },

  inputContainerMultiline: {
    alignItems: "flex-start",
    minHeight: 100,
  },

  leftIcon: {
    marginRight: spacing.sm,
  },

  input: {
    color: colors.text,
    flex: 1,
    fontSize: 14,
    minHeight: 48,
    paddingHorizontal: 0,
    paddingVertical: spacing.sm,
  },

  inputMultiline: {
    minHeight: 90,
    textAlignVertical: "top",
  },

  rightButton: {
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.sm,
    minHeight: 40,
    minWidth: 32,
  },

  errorContainer: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: spacing.xs,
  },

  errorText: {
    color: colors.danger,
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    marginLeft: spacing.xs,
  },
});
