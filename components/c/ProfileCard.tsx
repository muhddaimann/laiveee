import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, useTheme, Avatar } from "react-native-paper";

export function ProfileCard({
  name,
  designation,
  avatarLabel,
}: {
  name?: string | null;
  designation?: string | null;
  avatarLabel?: string | null;
}) {
  const theme = useTheme();
  const safeName = name ?? "—";
  const safeDesignation = designation ?? "—";
  const safeLabel =
    (avatarLabel && avatarLabel.trim()) ||
    (safeName.trim()
      ? safeName
          .split(" ")
          .filter(Boolean)
          .slice(0, 2)
          .map((p) => p[0]!.toUpperCase())
          .join("")
      : "??");
  return (
    <View style={styles.profileCard}>
      <Avatar.Text size={100} label={safeLabel} style={{ marginBottom: 16 }} />
      <Text style={styles.candidateName}>{safeName}</Text>
      <Text style={{ color: theme.colors.onSurfaceVariant }}>
        {safeDesignation}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  candidateName: { fontSize: 16, fontWeight: "bold", textAlign: "center" },
  profileCard: { alignItems: "center", marginBottom: 24 },
});

export default ProfileCard;
