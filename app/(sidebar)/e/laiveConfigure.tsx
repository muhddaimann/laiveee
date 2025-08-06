import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, useTheme, Card } from "react-native-paper";

export default function LaiveConfigure() {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.left}>
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>
          Configure Laive
        </Text>
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text style={[styles.desc, { color: theme.colors.onSurfaceVariant }]}>
              Customize system-wide interview settings, scoring configurations, AI personas, and more.
            </Text>
          </Card.Content>
        </Card>
      </View>
      <View style={styles.right}>
        <ProfileCard />
      </View>
    </View>
  );
}

function ProfileCard() {
  const theme = useTheme();
  return (
    <View style={styles.profileCard}>
      <Text style={styles.profileName}>Laive Admin</Text>
      <Text style={{ color: theme.colors.onSurfaceVariant }}>August 6th 2025</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: "row" },
  left: { flex: 4, padding: 24, borderRightWidth: 1, borderRightColor: "#eee" },
  right: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
  desc: { fontSize: 16 },
  card: { padding: 16, borderRadius: 12 },
  profileCard: { alignItems: "center", marginTop: 24 },
  profileName: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
});
