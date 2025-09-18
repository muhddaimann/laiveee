import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  Text,
  ActivityIndicator,
  Card,
  Avatar,
  Divider,
  useTheme,
  Button,
} from "react-native-paper";
import Header from "../../../components/c/header";
import { useAuth } from "../../../contexts/cAuthContext";
import { getSelfDetails, Staff } from "../../../contexts/api/staff";

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string | null | undefined;
}) => {
  const theme = useTheme();
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <Avatar.Icon
        size={32}
        icon={icon}
        style={styles.infoIcon}
        color={theme.colors.primary}
      />
      <View>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
};

export default function Dashboard() {
  const theme = useTheme();
  const { loading: authLoading, isAuthenticated } = useAuth();
  const [user, setUser] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      try {
        const me = await getSelfDetails();
        if (mounted) setUser(me);
      } catch (e: any) {
        if (mounted)
          setError(e?.messages?.[0] || e?.message || "Failed to load profile");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  if (authLoading || loading) {
    return (
      <View
        style={[styles.centered, { backgroundColor: theme.colors.background }]}
      >
        <ActivityIndicator animating size="large" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View
        style={[
          styles.centered,
          { backgroundColor: theme.colors.background, padding: 24 },
        ]}
      >
        <Text style={{ marginBottom: 12 }}>You’re not signed in.</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[
          styles.centered,
          { backgroundColor: theme.colors.background, padding: 24 },
        ]}
      >
        <Text style={{ marginBottom: 12 }}>{error}</Text>
        <Button
          mode="contained"
          onPress={() => {
            setLoading(true);
            setError(null);
          }}
        >
          Retry
        </Button>
      </View>
    );
  }

  if (!user) {
    return (
      <View
        style={[styles.centered, { backgroundColor: theme.colors.background }]}
      >
        <ActivityIndicator animating size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header page="Dashboard" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Card.Content style={styles.profileSection}>
            <Avatar.Text
              size={80}
              label={user.initials}
              style={styles.avatar}
            />
            <Text style={styles.fullName}>{user.full_name}</Text>
            <Text style={styles.designation}>{user.designation_name}</Text>
          </Card.Content>
          <Divider />
          <Card.Content style={styles.detailsSection}>
            <InfoRow icon="email-outline" label="Email" value={user.email} />
            <InfoRow
              icon="phone-outline"
              label="Contact No."
              value={user.contact_no}
            />
            <InfoRow
              icon="map-marker-outline"
              label="Address"
              value={user.full_address}
            />
            <InfoRow
              icon="card-account-details-outline"
              label="NRIC/Username"
              value={user.nric}
            />
            <InfoRow
              icon="calendar-outline"
              label="Join Date"
              value={user.join_date}
            />
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContent: { padding: 20, alignItems: "center" },
  card: { width: "100%", maxWidth: 800 },
  profileSection: { alignItems: "center", paddingVertical: 24 },
  avatar: { marginBottom: 16 },
  fullName: { fontSize: 24, fontWeight: "bold" },
  designation: { fontSize: 16, color: "gray", marginTop: 4 },
  detailsSection: { paddingVertical: 16 },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  infoIcon: { marginRight: 16, backgroundColor: "transparent" },
  infoLabel: { fontSize: 12, color: "gray" },
  infoValue: { fontSize: 16 },
});
