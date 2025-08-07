import React, { useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import {
  Text,
  useTheme,
  Card,
  Avatar,
  Divider,
  Searchbar,
  DataTable,
} from "react-native-paper";
import Header from "../../../components/e/header";
import { useCandidates, Candidate } from "../../../hooks/useCandidate";

export default function LaiveApplicant() {
  const theme = useTheme();
  const {
    candidates,
    selectedCandidateData,
    loading,
    handleSelectCandidate,
    handleBackToDashboard,
  } = useCandidates();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Header title="All Applicants" showBack={true} />
      <View style={styles.container}>
        {loading ? (
          <LoadingScreen />
        ) : selectedCandidateData ? (
          <ReportView
            candidateData={selectedCandidateData}
            onBack={handleBackToDashboard}
          />
        ) : (
          <ApplicantListView
            candidates={candidates}
            onSelect={handleSelectCandidate}
          />
        )}
      </View>
    </View>
  );
}

function ApplicantListView({ candidates, onSelect }: any) {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState<{ column: string; direction: string }>({
    column: "name",
    direction: "ascending",
  });

  const filteredCandidates = useMemo(() => {
    return candidates.filter((c: any) =>
      c.resumeAnalysis.fullName
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [candidates, searchQuery]);

  const sortedCandidates = useMemo(() => {
    return [...filteredCandidates].sort((a, b) => {
      const aValue =
        sort.column === "score"
          ? parseFloat(a.interviewPerformance.averageScore)
          : a.resumeAnalysis.fullName;
      const bValue =
        sort.column === "score"
          ? parseFloat(b.interviewPerformance.averageScore)
          : b.resumeAnalysis.fullName;

      if (aValue < bValue) return sort.direction === "ascending" ? -1 : 1;
      if (aValue > bValue) return sort.direction === "ascending" ? 1 : -1;
      return 0;
    });
  }, [filteredCandidates, sort]);

  const handleSort = (column: string) => {
    const direction =
      sort.column === column && sort.direction === "ascending"
        ? "descending"
        : "ascending";
    setSort({ column, direction });
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Searchbar
        placeholder="Search by name..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        icon="magnify"
        style={{
          marginBottom: 16,
          backgroundColor: theme.colors.surface,
        }}
      />

      <Card style={{ flex: 1, backgroundColor: theme.colors.surface }}>
        <DataTable>
          <DataTable.Header>
            <DataTable.Title
              sortDirection={
                sort.column === "name"
                  ? (sort.direction as "ascending" | "descending")
                  : undefined
              }
              onPress={() => handleSort("name")}
            >
              Name
            </DataTable.Title>
            <DataTable.Title>Role</DataTable.Title>
            <DataTable.Title
              numeric
              sortDirection={
                sort.column === "score"
                  ? (sort.direction as "ascending" | "descending")
                  : undefined
              }
              onPress={() => handleSort("score")}
            >
              Score
            </DataTable.Title>
          </DataTable.Header>

          <ScrollView>
            {sortedCandidates.map((candidate: any) => (
              <TouchableOpacity
                key={candidate.id}
                onPress={() => onSelect(candidate.id)}
              >
                <DataTable.Row>
                  <DataTable.Cell>
                    {candidate.resumeAnalysis.fullName}
                  </DataTable.Cell>
                  <DataTable.Cell>
                    {candidate.candidateDetails.roleAppliedFor}
                  </DataTable.Cell>
                  <DataTable.Cell numeric>
                    {candidate.interviewPerformance.averageScore}
                  </DataTable.Cell>
                </DataTable.Row>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </DataTable>
      </Card>
    </View>
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
    <ScrollView style={styles.reportContainer}>
      <Card
        style={[styles.reportCard, { backgroundColor: theme.colors.surface }]}
      >
        <Card.Content style={styles.reportContent}>
          <Avatar.Icon
            icon="account-tie"
            size={80}
            style={styles.reportAvatar}
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
            style={[
              styles.recommendationText,
              { color: theme.colors.onPrimaryContainer },
            ]}
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
          <Divider style={styles.divider} />
          {Object.entries(interviewPerformance.scoreBreakdown).map(
            ([key, value]: [string, any]) => (
              <View key={key} style={styles.breakdownItem}>
                <Text style={styles.breakdownTitle}>
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </Text>
                <Text style={styles.breakdownScore}>{value.score}</Text>
                <Text style={styles.breakdownReasoning}>{value.reasoning}</Text>
              </View>
            )
          )}
        </Card.Content>
      </Card>
    </ScrollView>
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
  container: { flex: 1 },
  fullPage: { flex: 1 },
  centered: { justifyContent: "center", alignItems: "center" },
  reportContainer: { flex: 1, padding: 16 },
  reportCard: { marginBottom: 16, borderRadius: 12 },
  reportContent: { alignItems: "center", padding: 16 },
  reportAvatar: { marginBottom: 16 },
  reportTitle: { fontSize: 24, fontWeight: "bold" },
  reportSubtitle: { fontSize: 16, color: "gray", marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  recommendationScore: { fontSize: 24, fontWeight: "bold" },
  recommendationText: { marginTop: 8 },
  divider: { marginVertical: 12 },
  breakdownItem: { marginBottom: 16 },
  breakdownTitle: { fontSize: 16, fontWeight: "500" },
  breakdownScore: { fontSize: 14, color: "gray", marginTop: 4 },
  breakdownReasoning: { fontSize: 14, marginTop: 4 },
});
