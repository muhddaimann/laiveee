import React from "react";
import {
  View,
  Image,
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
import { useRouter } from "expo-router";
import Header from "../../../components/e/header";

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
    <View style={{ flex: 1 }}>
      <Header title="LaiveRecruit™" showBack={false} />
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
          <ProfileCard />
          <LookupCard onSearch={handleSearch} />
          {candidates.length > 0 && (
            <RecentCard
              candidate={candidates[0]}
              onSelect={() => handleSelectCandidate(candidates[0].id)}
            />
          )}
        </View>
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
  const router = useRouter();
  const totalCandidates = candidates.length;
  const roleCounts = candidates.reduce((acc, c) => {
    const role = c.candidateDetails.roleAppliedFor;
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const totalRoles = Object.keys(roleCounts).length;

  return (
    <View style={styles.dashboardContent}>
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
                {totalCandidates}
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
                {totalRoles}
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
                <PercentageCircle percentage="68%" />
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

        <Card style={[{ flex: 2, backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text
              style={[styles.widgetTitle, { color: theme.colors.onSurface }]}
            >
              Top Performing Candidates
            </Text>
            <View style={styles.ringChartGrid}>
              <View style={styles.ringChartItem}>
                <PercentageCircle percentage="85%" />
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
                Configure Laive
              </Text>
              <Text
                style={[
                  styles.configureDesc,
                  { color: theme.colors.onSurfaceVariant, paddingRight: 100 },
                ]}
              >
                Customize prompts, scoring and other settings for the
                recruitment process.
              </Text>
            </View>

            <Button
              mode="contained"
              style={{ alignSelf: "flex-end" }}
              onPress={() => router.push("e/laiveConfigure")}
              icon="chevron-right"
              contentStyle={{ flexDirection: "row-reverse" }}
            >
              Configure
            </Button>
          </View>
        </View>
      </View>

      <CandidateTable candidates={candidates} onSelect={onSelect} />
    </View>
  );
}

function SectionHeader({ title }: { title: string }) {
  const router = useRouter();
  const theme = useTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 8,
        paddingVertical: 4,
      }}
    >
      <Text
        style={{
          fontSize: 16,
          fontWeight: "600",    
          color: theme.colors.onBackground,
        }}
      >
        {title}
      </Text>
      <Button
        mode="text"
        onPress={() => router.push("e/laiveApplicant")}
        icon="chevron-right"
        contentStyle={{ flexDirection: "row-reverse", alignItems: "center" }}
        labelStyle={{ fontSize: 14, color: theme.colors.primary }}
      >
        View all
      </Button>
    </View>
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
      <SectionHeader title="All Candidates" />
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
        <Button icon="arrow-left" onPress={onBack} style={styles.backButton}>
          Back
        </Button>
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
          style={styles.lookupInput}
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
      <Text style={styles.sectionTitle}>Recently Completed</Text>
      <Card
        style={[styles.rightCard, { backgroundColor: theme.colors.surface }]}
      >
        <TouchableOpacity onPress={onSelect}>
          <Card.Content style={styles.recentContent}>
            <Avatar.Icon
              icon="account-check"
              size={48}
              style={[
                styles.recentAvatar,
                { backgroundColor: theme.colors.primaryContainer },
              ]}
              color={theme.colors.primary}
            />
            <View style={styles.recentTextContainer}>
              <Text style={styles.candidateName}>
                {candidate.resumeAnalysis.fullName}
              </Text>
              <Text style={{ color: theme.colors.onSurfaceVariant }}>
                {candidate.candidateDetails.roleAppliedFor}
              </Text>
            </View>
          </Card.Content>
        </TouchableOpacity>
      </Card>
    </>
  );
}

function ProfileCard() {
  const theme = useTheme();
  return (
    <View style={styles.profileCard}>
      <Image
        source={require("../../../assets/ta1.png")}
        style={styles.profileImage}
      />
      <Text style={styles.candidateName}>Laive Recruiter</Text>
      <Text style={{ color: theme.colors.onSurfaceVariant }}>
        August 6th 2025
      </Text>
    </View>
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

const PercentageCircle = ({ percentage }: { percentage: string }) => {
  const theme = useTheme();
  const p = parseInt(percentage.replace("%", ""));
  const size = 120;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = p / 100;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View style={styles.percentageCircle}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          stroke={theme.colors.background}
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          stroke={theme.colors.primary}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <Text style={styles.percentageText}>{percentage}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: "row" },
  left: { flex: 4, padding: 24, borderRightWidth: 1, borderRightColor: "#eee" },
  right: { flex: 1, padding: 16 },
  fullPage: { flex: 1 },
  centered: { justifyContent: "center", alignItems: "center" },
  dashboardContent: { paddingBottom: 32 },
  widgetRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
    alignItems: "stretch",
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
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
  ringChartGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 24,
    marginTop: 16,
  },
  ringChartItem: { alignItems: "center", width: 120 },
  chartLabel: { textAlign: "center", marginTop: 8, fontSize: 14 },
  largeCard: { paddingHorizontal: 16 },
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
  reportContent: { alignItems: "center" },
  reportAvatar: { marginBottom: 16 },
  reportTitle: { fontSize: 24, fontWeight: "bold" },
  reportSubtitle: { fontSize: 16, color: "gray", marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  recommendationScore: { fontSize: 24, fontWeight: "bold" },
  recommendationText: { marginTop: 8 },
  divider: { marginBottom: 12 },
  breakdownItem: { marginBottom: 16 },
  breakdownTitle: { fontSize: 16, fontWeight: "500" },
  breakdownScore: { fontSize: 14, color: "gray", marginTop: 4 },
  breakdownReasoning: { fontSize: 14, marginTop: 4 },
  recentContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  recentTextContainer: { flex: 1, alignItems: "flex-end" },
  recentAvatar: { marginRight: 12 },
  rightCard: { marginBottom: 16 },
  candidateName: { fontSize: 16, fontWeight: "bold", textAlign: "center" },
  profileCard: { alignItems: "center", marginBottom: 24 },
  profileImage: { width: 150, height: 150, borderRadius: 100, marginBottom: 8 },
  lookupInput: { marginBottom: 12 },
  configureDesc: {
    marginTop: 4,
    fontSize: 14,
  },
  configureIcon: {
    elevation: 4,
  },
  backButton: { alignSelf: "flex-start", marginBottom: 16 },
  percentageCircle: {
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  percentageText: { position: "absolute", fontSize: 24, fontWeight: "bold" },
});
