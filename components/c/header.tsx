import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
import { useAuth } from "../../contexts/cAuthContext";
import { getSelfDetails, Staff } from "../../contexts/api/staff";

const formatTime = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

type CHeaderProps = { page: string };

export default function Header({ page }: CHeaderProps) {
  const theme = useTheme();
  const { isAuthenticated, logout, tokenExp } = useAuth();
  const [user, setUser] = useState<Staff | null>(null);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      getSelfDetails()
        .then(setUser)
        .catch(() => setUser(null));
    } else {
      setUser(null);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!tokenExp) {
      setTimeLeft("");
      return;
    }

    const intervalId = setInterval(() => {
      const remaining = tokenExp * 1000 - Date.now();
      if (remaining <= 0) {
        setTimeLeft("Expired");
        clearInterval(intervalId);
        // Optional: trigger logout automatically
        // logout(); 
      } else {
        setTimeLeft(formatTime(remaining));
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [tokenExp]);

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: theme.colors.surface,
          borderBottomColor: theme.colors.outlineVariant,
        },
      ]}
    >
      <Text style={[styles.title, { color: theme.colors.onSurface }]}>
        LaiveRecruit - {page}
      </Text>
      <View style={styles.rightSection}>
        {isAuthenticated && user && (
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: theme.colors.onSurface }]}>
              {user.nick_name}
            </Text>
            {timeLeft && (
              <Text style={[styles.timer, { color: theme.colors.secondary }]}>
                {timeLeft}
              </Text>
            )}
          </View>
        )}
        {isAuthenticated && (
          <Button
            mode="contained"
            icon="logout"
            onPress={logout}
            labelStyle={{ fontWeight: "500" }}
          >
            Logout
          </Button>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 60,
    width: "100%",
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { fontSize: 18, fontWeight: "600" },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  userInfo: {
    alignItems: "flex-end",
  },
  userName: {
    fontWeight: "bold",
  },
  timer: {
    fontSize: 12,
  },
});