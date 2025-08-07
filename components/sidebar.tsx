import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Pressable,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import { useTheme } from "react-native-paper";
import { useSidebar } from "../contexts/sidebarContext";
import { useToggle } from "../contexts/themeContext";

const navItems = [
  { icon: "home-outline", label: "Home", route: "/a" },
  { icon: "robot-happy", label: "LaiveDemo", route: "/b" },
  { icon: "form-select", label: "LaiveApply", route: "/h" },
  { icon: "account-search-outline", label: "LaiveRecruit", route: "/e" },
];

export default function Sidebar() {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { isVisible, isExpanded, disableNavigation, toggleExpand } =
    useSidebar();
  const { isDarkMode, toggleTheme } = useToggle();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!isVisible) return null;

  return (
    <View
      style={[
        styles.sidebar,
        {
          width: isExpanded ? 240 : 72,
          backgroundColor: theme.colors.surface,
        },
      ]}
    >
      <View style={styles.topSection}>
        {isExpanded ? (
          <View style={styles.logoRow}>
            <MaterialCommunityIcons
              name="pulse"
              size={24}
              color={theme.colors.primary}
            />
            <TouchableOpacity onPress={toggleExpand}>
              <MaterialCommunityIcons
                name="chevron-left"
                size={24}
                color={theme.colors.onSurfaceVariant}
              />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={toggleExpand} style={styles.chevronOnly}>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={theme.colors.onSurfaceVariant}
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.navSection}>
        {navItems.map((item, index) => {
          const isActive = pathname === item.route;
          const isHovered = hoveredIndex === index;
          return (
            <Pressable
              key={index}
              onPress={() => {
                if (!disableNavigation) router.push(item.route);
              }}
              onHoverIn={() => setHoveredIndex(index)}
              onHoverOut={() => setHoveredIndex(null)}
              disabled={disableNavigation}
              style={[
                styles.navItem,
                isActive && { backgroundColor: theme.colors.primaryContainer },
                isHovered &&
                  !isActive && {
                    backgroundColor: theme.colors.background,
                  },
              ]}
            >
              <MaterialCommunityIcons
                name={item.icon as any}
                size={24}
                color={isActive ? theme.colors.primary : theme.colors.onSurface}
              />
              {isExpanded && (
                <Text style={[styles.label, { color: theme.colors.onSurface }]}>
                  {item.label}
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>

      <View
        style={[
          styles.bottomControls,
          isExpanded && {
            alignItems: "flex-start",
            paddingHorizontal: 16,
            backgroundColor: theme.colors.background,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.toggleButton,
            isExpanded && styles.toggleButtonExpanded,
          ]}
          onPress={toggleTheme}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name={isDarkMode ? "weather-sunny" : "moon-waning-crescent"}
            size={22}
            color={theme.colors.onSurfaceVariant}
          />
          {isExpanded && (
            <Text
              style={[
                styles.toggleLabel,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {isDarkMode ? "Light Mode" : "Dark Mode"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    height: "100%",
    justifyContent: "space-between",
    paddingTop: 16,
    paddingBottom: 16,
  },
  topSection: {
    paddingHorizontal: 12,
  },
  logoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chevronOnly: {
    alignItems: "center",
    justifyContent: "center",
  },
  navSection: {
    flex: 1,
    marginTop: 24,
    gap: 6,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 8,
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
  },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    justifyContent: "center",
  },
  toggleButtonExpanded: {
    justifyContent: "flex-start",
    gap: 12,
  },
  toggleLabel: {
    fontSize: 13,
    fontWeight: "500",
    marginLeft: 8,
  },
  bottomControls: {
    alignSelf: "center",
    width: "90%",
    borderRadius: 16,
    alignItems: "center",
    paddingVertical: 8,
  },
});
