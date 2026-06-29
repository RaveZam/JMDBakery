import { type ComponentProps } from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import { Colors } from "@/src/shared/constants/Colors";

type IconProps = { color: string; size: number; focused: boolean };
type IoniconName = ComponentProps<typeof Ionicons>["name"];

function hideOnNonIndex({ route }: { route: object }): { display: "none" } | undefined {
  const name = getFocusedRouteNameFromRoute(route) ?? "index";
  return name !== "index" ? { display: "none" } : undefined;
}

const tabIcon =
  (active: IoniconName, inactive: IoniconName) =>
  ({ color, size, focused }: IconProps) =>
    <Ionicons name={focused ? active : inactive} size={size} color={color} />;

export default function MainTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.light.tabIconSelected,
        tabBarInactiveTintColor: Colors.light.tabIconDefault,
        tabBarStyle: { backgroundColor: "#FFFFFF", borderTopColor: Colors.light.border },
      }}
    >
      <Tabs.Screen
        name="routes"
        options={({ route }) => ({
          title: "Routes",
          tabBarStyle: hideOnNonIndex({ route }),
          tabBarIcon: tabIcon("car", "car-outline"),
        })}
      />
      <Tabs.Screen
        name="history"
        options={({ route }) => ({
          title: "History",
          tabBarStyle: hideOnNonIndex({ route }),
          tabBarIcon: tabIcon("time", "time-outline"),
        })}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: tabIcon("settings", "settings-outline"),
        }}
      />
    </Tabs>
  );
}
