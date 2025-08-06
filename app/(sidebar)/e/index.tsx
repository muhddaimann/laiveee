import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {
  Button,
  Card,
  Text,
  useTheme,
  TextInput,
  Avatar,
  Divider,
} from "react-native-paper";
import { useCandidates, Candidate } from "../../../hooks/useCandidate";

export default function LaiveRecruit() {
  const theme = useTheme();
  const {
    candidates,
    selectedCandidateData,
    loading,
    handleSearch,
    handleSelectCandidate,
    handleBackToDashboard,
  } = useCandidates();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.left}>
        {loading ? (
          <LoadingScreen />
        ) : selectedCandidateData ? (
          <ReportView
            candidateData={selectedCandidateData}
            onBack={handleBackToDashboard}
          />
        ) : (
          <DashboardView
            candidates={candidates}
            onSelect={handleSelectCandidate}
          />
        )}
      </View>

      <View style={styles.right}>
        <LookupCard onSearch={handleSearch} />
        {candidates.length > 0 && (
          <RecentCard
            candidate={candidates[0]}
            onSelect={() => handleSelectCandidate(candidates[0].id)}
          />
        )}
      </View>
    </View>
  );
}

function DashboardView({
  candidates,
  onSelect,
}: {
  candidates: (Candidate & { id: string })[];
  onSelect: (id: string) => void;
}) {
  const theme = useTheme();
  const totalCandidates = candidates.length;
  const roleCounts = candidates.reduce((acc, c) => {
    const role = c.candidateDetails.roleAppliedFor;
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const totalRoles = Object.keys(roleCounts).length;

  return (
    <ScrollView contentContainerStyle={styles.dashboardContent}>
      <View style={styles.widgetRow}>
        <Card
          style={[styles.widgetCard, { backgroundColor: theme.colors.surface }]}
        >
          <Card.Content>
            <Avatar.Icon
              icon="account-group"
              size={48}
              style={{
                marginBottom: 12,
                backgroundColor: theme.colors.primaryContainer,
              }}
              color={theme.colors.primary}
            />
            <Text style={styles.widgetTitle}>Total Candidates</Text>
            <Text style={[styles.widgetValue, { color: theme.colors.primary }]}>
              {totalCandidates}
            </Text>
          </Card.Content>
        </Card>

        <Card
          style={[styles.widgetCard, { backgroundColor: theme.colors.surface }]}
        >
          <Card.Content>
            <Avatar.Icon
              icon="briefcase"
              size={48}
              style={{
                marginBottom: 12,
                backgroundColor: theme.colors.primaryContainer,
              }}
              color={theme.colors.primary}
            />
            <Text style={styles.widgetTitle}>Roles Open</Text>
            <Text style={[styles.widgetValue, { color: theme.colors.primary }]}>
              {totalRoles}
            </Text>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.widgetRow}>
        <Card
          style={[
            styles.largeCard,
            { flex: 1, backgroundColor: theme.colors.surface },
          ]}
        >
          <Card.Content>
            <Text style={styles.widgetTitle}>Candidates per Role</Text>
            <View style={styles.chartContainer}>
              {Object.entries(roleCounts).map(([role, count], idx) => (
                <View
                  key={role}
                  style={[
                    styles.bar,
                    {
                      height: `${Math.min(100, count * 20)}%`,
                      backgroundColor:
                        idx % 3 === 0
                          ? theme.colors.primary
                          : idx % 3 === 1
                          ? theme.colors.secondary
                          : theme.colors.tertiary,
                    },
                  ]}
                />
              ))}
            </View>
          </Card.Content>
        </Card>

        <Card
          style={[
            styles.largeCard,
            { flex: 3, backgroundColor: theme.colors.surface },
          ]}
        >
          <Card.Content>
            <Text style={styles.widgetTitle}>Application Trend</Text>
            <View style={styles.chartContainer}>
              <View
                style={[
                  styles.lineSegment,
                  {
                    transform: [{ rotate: "-10deg" }],
                    width: "25%",
                    bottom: "20%",
                    left: "0%",
                    backgroundColor: theme.colors.primary,
                  },
                ]}
              />
              <View
                style={[
                  styles.lineSegment,
                  {
                    transform: [{ rotate: "20deg" }],
                    width: "25%",
                    bottom: "30%",
                    left: "25%",
                    backgroundColor: theme.colors.primary,
                  },
                ]}
              />
              <View
                style={[
                  styles.lineSegment,
                  {
                    transform: [{ rotate: "-5deg" }],
                    width: "25%",
                    bottom: "45%",
                    left: "50%",
                    backgroundColor: theme.colors.primary,
                  },
                ]}
              />
              <View
                style={[
                  styles.lineSegment,
                  {
                    transform: [{ rotate: "15deg" }],
                    width: "25%",
                    bottom: "40%",
                    left: "75%",
                    backgroundColor: theme.colors.primary,
                  },
                ]}
              />
            </View>
          </Card.Content>
        </Card>
      </View>

      <CandidateTable candidates={candidates} onSelect={onSelect} />
    </ScrollView>
  );
}

function CandidateTable({
  candidates,
  onSelect,
}: {
  candidates: (Candidate & { id: string })[];
  onSelect: (id: string) => void;
}) {
  const theme = useTheme();
  return (
    <>
      <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>
        All Candidates
      </Text>
      <Card
        style={[styles.largeCard, { backgroundColor: theme.colors.surface }]}
      >
        <Card.Content>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderText}>Candidate</Text>
            <Text style={styles.tableHeaderText}>Role</Text>
            <Text style={styles.tableHeaderText}>Action</Text>
          </View>
          {candidates.map((candidate) => (
            <View key={candidate.id} style={styles.tableRow}>
              <Text style={styles.tableCell}>
                {candidate.resumeAnalysis.fullName}
              </Text>
              <Text style={styles.tableCell}>
                {candidate.candidateDetails.roleAppliedFor}
              </Text>
              <Button mode="contained" onPress={() => onSelect(candidate.id)}>
                View
              </Button>
            </View>
          ))}
        </Card.Content>
      </Card>
    </>
  );
}

function ReportView({
  candidateData,
  onBack,
}: {
  candidateData: Candidate;
  onBack: () => void;
}) {
  const theme = useTheme();
  const { candidateDetails, resumeAnalysis, interviewPerformance } =
    candidateData;

  return (
    <ScrollView>
      <View style={styles.reportContainer}>
        <Button
          icon="arrow-left"
          onPress={onBack}
          style={{ alignSelf: "flex-start", marginBottom: 16 }}
        >
          Back
        </Button>

        <Card
          style={[styles.reportCard, { backgroundColor: theme.colors.surface }]}
        >
          <Card.Content style={{ alignItems: "center" }}>
            <Avatar.Icon
              icon="account-tie"
              size={80}
              style={{ marginBottom: 16 }}
            />
            <Text style={styles.reportTitle}>{resumeAnalysis.fullName}</Text>
            <Text style={styles.reportSubtitle}>
              {candidateDetails.roleAppliedFor}
            </Text>
          </Card.Content>
        </Card>

        <Card
          style={[styles.reportCard, { backgroundColor: theme.colors.surface }]}
        >
          <Card.Content>
            <Text style={styles.cardTitle}>Recommendation</Text>
            <Text
              style={[
                styles.recommendationScore,
                { color: theme.colors.primary },
              ]}
            >
              {interviewPerformance.averageScore}
            </Text>
            <Text
              style={{ color: theme.colors.onPrimaryContainer, marginTop: 8 }}
            >
              {interviewPerformance.summary}
            </Text>
          </Card.Content>
        </Card>

        <Card
          style={[styles.reportCard, { backgroundColor: theme.colors.surface }]}
        >
          <Card.Content>
            <Text style={styles.cardTitle}>Score Breakdown</Text>
            <Divider style={{ marginBottom: 12 }} />
            {Object.entries(interviewPerformance.scoreBreakdown).map(
              ([key, value]: [string, any]) => (
                <View key={key} style={styles.breakdownItem}>
                  <Text style={styles.breakdownTitle}>
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </Text>
                  <Text style={styles.breakdownScore}>{value.score}</Text>
                  <Text style={styles.breakdownReasoning}>
                    {value.reasoning}
                  </Text>
                </View>
              )
            )}
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
}

function LookupCard({ onSearch }: { onSearch: (id: string) => void }) {
  const theme = useTheme();
  const [id, setId] = React.useState("");
  return (
    <Card style={[styles.rightCard, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <Text style={styles.cardTitle}>Candidate Lookup</Text>
        <TextInput
          mode="outlined"
          label="Enter Candidate ID"
          value={id}
          onChangeText={setId}
          style={{ marginBottom: 12 }}
        />
        <Button mode="contained" onPress={() => onSearch(id)} disabled={!id}>
          Search
        </Button>
      </Card.Content>
    </Card>
  );
}

function RecentCard({
  candidate,
  onSelect,
}: {
  candidate: Candidate & { id: string };
  onSelect: () => void;
}) {
  const theme = useTheme();

  return (
    <>
      <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>
        Recently Completed
      </Text>
      <Card
        style={[styles.rightCard, { backgroundColor: theme.colors.surface }]}
      >
        <TouchableOpacity onPress={onSelect}>
          <Card.Content>
            <View style={{ alignItems: "center" }}>
              <Avatar.Icon
                icon="account-check"
                size={50}
                style={{ marginBottom: 8 }}
              />
              <Text style={styles.candidateName}>
                {candidate.resumeAnalysis.fullName}
              </Text>
              <Text>{candidate.candidateDetails.roleAppliedFor}</Text>
            </View>
          </Card.Content>
        </TouchableOpacity>
      </Card>
    </>
  );
}

function LoadingScreen() {
  const theme = useTheme();
  return (
    <View style={[styles.fullPage, styles.centered]}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={{ marginTop: 16, color: theme.colors.onSurface }}>
        Loading...
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: "row" },
  left: { flex: 4, padding: 24, borderRightWidth: 1, borderRightColor: "#eee" },
  right: { flex: 1, padding: 16 },
  fullPage: { flex: 1 },
  centered: { justifyContent: "center", alignItems: "center" },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 12 },
  dashboardContent: { paddingBottom: 32 },
  widgetRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  widgetCard: { flex: 1, padding: 16 },
  widgetTitle: { fontSize: 16, marginBottom: 4 },
  widgetValue: { fontSize: 28, fontWeight: "bold" },
  largeCard: { padding: 16 },
  chartContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
    position: "relative",
    height: 100,
  },
  bar: { width: 20, borderRadius: 4 },
  lineSegment: { position: "absolute", height: 3, borderRadius: 2 },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  tableHeaderText: { fontWeight: "bold" },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  tableCell: { flex: 1 },
  reportContainer: { paddingBottom: 32 },
  reportCard: { marginBottom: 16 },
  reportTitle: { fontSize: 24, fontWeight: "bold" },
  reportSubtitle: { fontSize: 16, color: "gray", marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  recommendationScore: { fontSize: 24, fontWeight: "bold" },
  breakdownItem: { marginBottom: 16 },
  breakdownTitle: { fontSize: 16, fontWeight: "500" },
  breakdownScore: { fontSize: 14, color: "gray", marginTop: 4 },
  breakdownReasoning: { fontSize: 14, marginTop: 4, color: "#555" },
  rightCard: { marginBottom: 16 },
  candidateName: { fontSize: 16, fontWeight: "bold", textAlign: "center" },
});
