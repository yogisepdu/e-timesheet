import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

import { colors, radius, spacing } from "../constants/theme";

type IconName = ComponentProps<typeof Ionicons>["name"];

type AppInputProps = TextInputProps & {
  label: string;
  icon?: IconName;
  error?: string;
  isPassword?: boolean;
};

export function AppInput({
  label,
  icon,
  error,
  isPassword = false,
  multiline = false,
  style,
  ...props
}: AppInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>

      <View
        style={[
          styles.inputContainer,
          multiline && styles.multilineContainer,
          error ? styles.inputError : null,
        ]}
      >
        {icon ? (
          <Ionicons
            name={icon}
            size={20}
            color={colors.textSecondary}
            style={styles.leftIcon}
          />
        ) : null}

        <TextInput
          {...props}
          multiline={multiline}
          placeholderTextColor={colors.textLight}
          secureTextEntry={isPassword && !showPassword}
          style={[styles.input, multiline && styles.multilineInput, style]}
        />

        {isPassword ? (
          <Pressable
            hitSlop={10}
            onPress={() => setShowPassword((previous) => !previous)}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={21}
              color={colors.textSecondary}
            />
          </Pressable>
        ) : null}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.lg,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  inputContainer: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 52,
    paddingHorizontal: spacing.md,
  },
  multilineContainer: {
    alignItems: "flex-start",
    minHeight: 110,
    paddingTop: spacing.md,
  },
  input: {
    color: colors.text,
    flex: 1,
    fontSize: 15,
    minHeight: 50,
    paddingHorizontal: spacing.sm,
    paddingVertical: 0,
  },
  multilineInput: {
    minHeight: 85,
    paddingTop: 0,
    textAlignVertical: "top",
  },
  leftIcon: {
    marginRight: 2,
  },
  inputError: {
    borderColor: colors.danger,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: spacing.xs,
  },
});
