import React from "react";
import { View, StyleSheet } from "react-native";
import {
  Button,
  Card,
  Text,
  useTheme,
  Avatar,
} from "react-native-paper";
import { useRouter } from "expo-router";
import { Candidate } from "../../../contexts/api/candidate";
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
              <Text
                style={[styles.widgetValue, { color: theme.colors.primary }]}
              >
                2
              </Text>
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
              <Text
                style={[styles.widgetValue, { color: theme.colors.primary }]}
              >
                2
              </Text>
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
            <View style={styles.ringChartGrid}>
              <View style={styles.ringChartItem}>
                <PercentageCircle percentage="100%" />
                <Text
                  style={[
                    styles.chartLabel,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Customer Service
                </Text>
              </View>
            </View>
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
