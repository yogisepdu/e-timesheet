import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import type { ComponentProps } from "react";
import type { ColorValue } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "../../constants/theme";

type IconName = ComponentProps<typeof Ionicons>["name"];

function TabIcon({ color, name }: { color: ColorValue; name: IconName }) {
  return <Ionicons color={color} name={name} size={23} />;
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,

        tabBarHideOnKeyboard: true,

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },

        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border,
          height: 68 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 7,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Beranda",

          tabBarIcon: ({ color }) => (
            <TabIcon color={color} name="home-outline" />
          ),
        }}
      />

      <Tabs.Screen
        name="timesheet"
        options={{
          title: "Time Sheet",

          tabBarIcon: ({ color }) => (
            <TabIcon color={color} name="document-text-outline" />
          ),
        }}
      />

      <Tabs.Screen
        name="history"
        options={{
          title: "Riwayat",

          tabBarIcon: ({ color }) => (
            <TabIcon color={color} name="time-outline" />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",

          tabBarIcon: ({ color }) => (
            <TabIcon color={color} name="person-outline" />
          ),
        }}
      />
    </Tabs>
  );
}
