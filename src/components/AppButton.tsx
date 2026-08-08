import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";

import { colors, radius, spacing } from "../constants/theme";

type IconName = ComponentProps<typeof Ionicons>["name"];
type ButtonVariant = "primary" | "secondary" | "outline" | "danger";

type AppButtonProps = {
  title: string;
  onPress: () => void;
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  variant?: ButtonVariant;
  style?: StyleProp<ViewStyle>;
};

export function AppButton({
  title,
  onPress,
  icon,
  loading = false,
  disabled = false,
  variant = "primary",
  style,
}: AppButtonProps) {
  const isDisabled = disabled || loading;

  const textColor =
    variant === "secondary"
      ? colors.primaryDark
      : variant === "outline"
        ? colors.primary
        : colors.white;

  return (
    <Pressable
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        pressed && !isDisabled ? styles.pressed : null,
        isDisabled ? styles.disabled : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <>
          {icon ? (
            <Ionicons
              name={icon}
              size={20}
              color={textColor}
              style={styles.icon}
            />
          ) : null}

          <Text style={[styles.text, { color: textColor }]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: radius.md,
    flexDirection: "row",
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: spacing.lg,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.secondary,
  },
  outline: {
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  danger: {
    backgroundColor: colors.danger,
  },
  text: {
    fontSize: 15,
    fontWeight: "700",
  },
  icon: {
    marginRight: spacing.sm,
  },
  pressed: {
    opacity: 0.82,
  },
  disabled: {
    opacity: 0.55,
  },
});
