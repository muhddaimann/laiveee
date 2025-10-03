import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet } from "react-native";
import {
  Button,
  Card,
  Text,
  useTheme,
  Avatar,
  ActivityIndicator,
} from "react-native-paper";
import { useRouter } from "expo-router";
import { Candidate } from "../../../contexts/api/candidate";
import {
  getCandidateStats,
  CandidateStats,
} from "../../../contexts/api/reporting";
import CandidateTable from "../CandidateTable";
import PercentageCircle from "../PercentageCircle";

function DashboardView({
  onSelectCandidate,
  onRegisterPress,
}: {
  onSelectCandidate: (candidate: Candidate) => void;
  onRegisterPress: () => void;
}) {
  const theme = useTheme();
  const router = useRouter();

  const [stats, setStats] = useState<CandidateStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await getCandidateStats();
        if (mounted) setStats(res.data);
      } catch (e: any) {
        if (mounted)
          setError(e?.response?.data?.error || "Failed to load stats");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const totalCandidates = useMemo(() => {
    const n = parseInt(stats?.totalCandidates ?? "0", 10);
    return Number.isFinite(n) ? n : 0;
  }, [stats]);

  const totalRoles = useMemo(() => {
    const n = parseInt(stats?.totalRoles ?? "0", 10);
    return Number.isFinite(n) ? n : 0;
  }, [stats]);

  const perRole = stats?.candidatesPerRole ?? [];
  const totalAcrossRoles = useMemo(
    () =>
      perRole.reduce((sum, r) => {
        const n = parseInt(r.candidateCount ?? "0", 10);
        return sum + (Number.isFinite(n) ? n : 0);
      }, 0),
    [perRole]
  );

  const topRoles = useMemo(() => perRole.slice(0, 6), [perRole]);

  return (
    <View>
      <View style={styles.widgetRow}>
        <Card
          style={[styles.widgetCard, { backgroundColor: theme.colors.surface }]}
        >
          <Card.Content style={styles.widgetContent}>
            <Avatar.Icon
              icon="account-group"
              size={48}
              style={{ backgroundColor: theme.colors.background }}
              color={theme.colors.primary}
            />
            <View style={styles.widgetTextContainer}>
              <Text
                style={[styles.widgetTitle, { color: theme.colors.onSurface }]}
              >
                Total Candidates
              </Text>
              {loading ? (
                <ActivityIndicator />
              ) : (
                <Text
                  style={[styles.widgetValue, { color: theme.colors.primary }]}
                >
                  {totalCandidates.toLocaleString()}
                </Text>
              )}
            </View>
          </Card.Content>
        </Card>

        <Card
          style={[styles.widgetCard, { backgroundColor: theme.colors.surface }]}
        >
          <Card.Content style={styles.widgetContent}>
            <Avatar.Icon
              icon="briefcase"
              size={48}
              style={{ backgroundColor: theme.colors.background }}
              color={theme.colors.primary}
            />
            <View style={styles.widgetTextContainer}>
              <Text
                style={[styles.widgetTitle, { color: theme.colors.onSurface }]}
              >
                Roles Open
              </Text>
              {loading ? (
                <ActivityIndicator />
              ) : (
                <Text
                  style={[styles.widgetValue, { color: theme.colors.primary }]}
                >
                  {totalRoles.toLocaleString()}
                </Text>
              )}
            </View>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.widgetRow}>
        <Card style={[{ flex: 2, backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text
              style={[styles.widgetTitle, { color: theme.colors.onSurface }]}
            >
              Candidate Per Role
            </Text>

            {loading ? (
              <View style={{ paddingVertical: 24, alignItems: "center" }}>
                <ActivityIndicator />
              </View>
            ) : error ? (
              <Text style={{ marginTop: 12, color: theme.colors.error }}>
                {error}
              </Text>
            ) : topRoles.length === 0 || totalAcrossRoles === 0 ? (
              <Text
                style={{ marginTop: 12, color: theme.colors.onSurfaceVariant }}
              >
                No role distribution yet.
              </Text>
            ) : (
              <View style={styles.ringChartGrid}>
                {topRoles.map((r) => {
                  const count = parseInt(r.candidateCount ?? "0", 10) || 0;
                  const pct =
                    totalAcrossRoles > 0
                      ? Math.round((count / totalAcrossRoles) * 100)
                      : 0;
                  return (
                    <View key={r.Role} style={styles.ringChartItem}>
                      <PercentageCircle percentage={`${pct}%`} />
                      <Text
                        style={[
                          styles.chartLabel,
                          { color: theme.colors.onSurfaceVariant },
                        ]}
                      >
                        {r.Role || "Unspecified"}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </Card.Content>
        </Card>

        <View
          style={[
            {
              flex: 1,
              backgroundColor: theme.colors.surfaceVariant,
              borderRadius: 12,
              padding: 16,
            },
          ]}
        >
          <View style={{ flex: 1, justifyContent: "space-between" }}>
            <View>
              <Text
                style={[styles.widgetTitle, { color: theme.colors.onSurface }]}
              >
                Register New Candidate
              </Text>
              <Text
                style={[
                  styles.configureDesc,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Manually register a new candidate for the screening process.
              </Text>
            </View>
            <Button
              mode="contained"
              style={{ alignSelf: "flex-end" }}
              onPress={onRegisterPress}
              icon="account-plus"
              contentStyle={{ flexDirection: "row-reverse" }}
            >
              Register
            </Button>
          </View>
        </View>

        <View
          style={[
            {
              flex: 1,
              backgroundColor: theme.colors.surfaceVariant,
              borderRadius: 12,
              padding: 16,
            },
          ]}
        >
          <View style={{ flex: 1, justifyContent: "space-between" }}>
            <View>
              <Text
                style={[styles.widgetTitle, { color: theme.colors.onSurface }]}
              >
                Manage Openings
              </Text>
              <Text
                style={[
                  styles.configureDesc,
                  { color: theme.colors.onSurfaceVariant, paddingRight: 100 },
                ]}
              >
                Configure roles and track active vacancies.
              </Text>
            </View>
            <Button
              mode="contained"
              style={{ alignSelf: "flex-end" }}
              onPress={() => router.push("c/laiveRole")}
              icon="plus-circle-outline"
              contentStyle={{ flexDirection: "row-reverse" }}
            >
              Manage
            </Button>
          </View>
        </View>
      </View>

      <CandidateTable onSelect={onSelectCandidate} />
    </View>
  );
}

const styles = StyleSheet.create({
  widgetRow: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 12,
    paddingBottom: 16,
  },
  widgetCard: { flex: 1, paddingVertical: 16, paddingHorizontal: 12 },
  widgetContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  widgetTextContainer: { flex: 1, marginLeft: 16, alignItems: "flex-end" },
  widgetTitle: { fontSize: 16, fontWeight: "500" },
  widgetValue: { fontSize: 24, fontWeight: "bold", marginTop: 4 },
  ringChartGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 24,
    marginTop: 16,
  },
  ringChartItem: { alignItems: "center", width: 120 },
  chartLabel: { textAlign: "center", marginTop: 8, fontSize: 14 },
  configureDesc: { marginTop: 4, fontSize: 14 },
});

export default DashboardView;
