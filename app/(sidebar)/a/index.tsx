import React, { useEffect, useMemo, useState } from "react";
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
  List,
} from "react-native-paper";
import { useRouter } from "expo-router";
import Header from "../../../components/layout/header";
import {
  getAllCandidates,
  getCandidateById,
  mapRowToUI,
  type CandidateUI,
} from "../../../contexts/api/candidate";

export default function Recruiter() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState<CandidateUI[]>([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(
    null
  );

  useEffect(() => {
    const abort = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const rows = await getAllCandidates(abort.signal);
        const mapped = (rows ?? []).map(mapRowToUI);
        setCandidates(mapped);
      } finally {
        setLoading(false);
      }
    })();
    return () => abort.abort();
  }, []);

  const handleSearch = async (id: string) => {
    if (!id.trim()) return;
    setLoading(true);
    const abort = new AbortController();
    try {
      const row = await getCandidateById(id.trim(), abort.signal);
      if (!row) {
        alert("Candidate ID not found.");
        return;
      }
      const ui = mapRowToUI(row);
      setCandidates((prev) => {
        const asId = String(row.id);
        const exists = prev.some((c) => c.id === asId);
        return exists ? prev : [...prev, ui];
      });
      setSelectedCandidateId(String(row.id));
    } finally {
      setLoading(false);
    }
  };

  const selectedCandidateData = useMemo(() => {
    if (!selectedCandidateId) return null;
    return candidates.find((c) => c.id === selectedCandidateId) ?? null;
  }, [selectedCandidateId, candidates]);

  const recentCandidates = useMemo(
    () =>
      [...candidates].sort((a, b) => Number(b.id) - Number(a.id)).slice(0, 4),
    [candidates]
  );

  return (
    <View style={{ flex: 1 }}>
      <Header title="LaiveRecruit™" showBack={false} />
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.left}>
          {loading && !candidates.length ? (
            <LoadingScreen />
          ) : selectedCandidateData ? (
            <ReportView
              candidateData={selectedCandidateData}
              onBack={() => setSelectedCandidateId(null)}
            />
          ) : (
            <DashboardView
              candidates={candidates}
              onSelect={setSelectedCandidateId}
            />
          )}
        </View>
        <View style={styles.right}>
          <ProfileCard />
          <LookupCard onSearch={handleSearch} />
          {recentCandidates.length > 0 ? (
            <RecentCard
              candidates={recentCandidates}
              onSelect={setSelectedCandidateId}
            />
          ) : (
            <EmptyStateCard
              title="Recently Completed"
              icon="clock-alert-outline"
              message="No recent completions"
              suggestion="Try refreshing or check back later."
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
  candidates: CandidateUI[];
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
        paddingBottom: 8,
        paddingHorizontal: 8,
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
  candidates: CandidateUI[];
  onSelect: (id: string) => void;
}) {
  const theme = useTheme();
  const firstFive = candidates.slice(0, 6);

  return (
    <>
      <SectionHeader title="All Candidates" />
      {firstFive.length === 0 ? (
        <EmptyStateCard
          title=""
          icon="account-search-outline"
          message="No candidates found"
          suggestion="Try a different search or add new candidates."
        />
      ) : (
        <Card
          style={[styles.largeCard, { backgroundColor: theme.colors.surface }]}
        >
          <Card.Content>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>Candidate</Text>
              <Text style={styles.tableHeaderText}>Role</Text>
              <Text style={styles.tableHeaderText}>Action</Text>
            </View>

            {firstFive.map((candidate) => (
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
      )}
    </>
  );
}

function ReportView({
  candidateData,
  onBack,
}: {
  candidateData: CandidateUI;
  onBack: () => void;
}) {
  const theme = useTheme();
  const { id, candidateDetails, resumeAnalysis, interviewPerformance } =
    candidateData;

  const InfoRow = ({ label, value }: { label: string; value: any }) => (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: theme.colors.onSurface }]}>
        {label}
      </Text>
      <Text
        style={[styles.infoValue, { color: theme.colors.onSurfaceVariant }]}
      >
        {value}
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingRight: 16, paddingBottom: 16 }}>
        <Button
          icon="arrow-left"
          onPress={onBack}
          style={{ alignSelf: "flex-end" }}
        >
          Back to Dashboard
        </Button>
      </View>
      <ScrollView contentContainerStyle={styles.reportContainer}>
        <View style={styles.row}>
          <Card
            style={[
              styles.card,
              styles.flex1,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Card.Content>
              <Text style={styles.reportTitle}>{resumeAnalysis.fullName}</Text>
              <Text style={styles.reportSubtitle}>
                {candidateDetails.roleAppliedFor} #{id}
              </Text>
            </Card.Content>
          </Card>
          <Card
            style={[
              styles.card,
              styles.flex1,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Card.Content>
              <Text style={styles.cardTitle}>Role Fit</Text>
              <Text style={[styles.score, { color: theme.colors.primary }]}>
                {resumeAnalysis.roleFit.roleScore} / 10
              </Text>
              <Text style={styles.justification}>
                {resumeAnalysis.roleFit.justification}
              </Text>
            </Card.Content>
          </Card>
          <Card
            style={[
              styles.card,
              styles.flex1,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Card.Content>
              <Text style={styles.cardTitle}>Interview Score</Text>
              <Text style={[styles.score, { color: theme.colors.primary }]}>
                {Number(interviewPerformance?.averageScore ?? 0).toFixed(1)} /
                5.0
              </Text>
              <Text style={styles.justification}>
                {interviewPerformance.summary}
              </Text>
            </Card.Content>
          </Card>
        </View>

        <View style={styles.row}>
          <Card
            style={[
              styles.card,
              styles.flex2,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Card.Content>
              <Text style={styles.cardTitle}>Professional Summary</Text>
              <Text style={styles.summaryText}>
                {resumeAnalysis.professionalSummary}
              </Text>
            </Card.Content>
          </Card>
          <Card
            style={[
              styles.card,
              styles.flex1,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Card.Content>
              <Text style={styles.cardTitle}>Candidate Details</Text>
              <InfoRow label="Email" value={resumeAnalysis.candidateEmail} />
              <InfoRow label="Phone" value={resumeAnalysis.candidatePhone} />
              <InfoRow
                label="Links"
                value={resumeAnalysis.relatedLink?.join(", ") || "N/A"}
              />
              <Divider style={{ marginVertical: 8 }} />
              <InfoRow
                label="Education"
                value={resumeAnalysis.highestEducation}
              />
              <InfoRow label="Experience" value={resumeAnalysis.currentRole} />
            </Card.Content>
          </Card>
        </View>

        <View style={styles.row}>
          <Card
            style={[
              styles.card,
              styles.flex1,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Card.Content>
              <List.Section title="Resume Analysis">
                <List.Accordion title="Strengths">
                  {resumeAnalysis.strengths?.map((item: any, i: number) => (
                    <List.Item
                      key={i}
                      title={item.trait}
                      description={item.justification}
                    />
                  ))}
                </List.Accordion>
                <List.Accordion title="Skill Match">
                  {resumeAnalysis.skillMatch?.map((item: any, i: number) => (
                    <List.Item
                      key={i}
                      title={item.name}
                      description={item.justification}
                    />
                  ))}
                </List.Accordion>
                <List.Accordion title="Experience Match">
                  {resumeAnalysis.experienceMatch?.map(
                    (item: any, i: number) => (
                      <List.Item
                        key={i}
                        title={item.area}
                        description={item.justification}
                      />
                    )
                  )}
                </List.Accordion>
                <List.Accordion title="Concern Areas">
                  {resumeAnalysis.concernArea?.map((item: any, i: number) => (
                    <List.Item key={i} title={item} />
                  ))}
                </List.Accordion>
              </List.Section>
            </Card.Content>
          </Card>
          <Card
            style={[
              styles.card,
              styles.flex1,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Card.Content>
              <List.Section title="Interview Analysis">
                <List.Accordion title="Score Breakdown">
                  {Object.entries(interviewPerformance.scoreBreakdown).map(
                    ([key, value]: [string, any]) => (
                      <List.Item
                        key={key}
                        title={`${key.replace(/([A-Z])/g, " $1").trim()} - ${
                          value.score
                        }/5`}
                        description={value.reasoning}
                        descriptionNumberOfLines={5}
                      />
                    )
                  )}
                </List.Accordion>
                <List.Accordion title="Knockout Questions">
                  {Object.entries(interviewPerformance.knockoutBreakdown).map(
                    ([key, value]: [string, any]) => (
                      <List.Item
                        key={key}
                        title={key.replace(/([A-Z])/g, " $1").trim()}
                        description={value}
                      />
                    )
                  )}
                </List.Accordion>
              </List.Section>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

// Lookup card
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
  candidates,
  onSelect,
}: {
  candidates: CandidateUI[];
  onSelect: (id: string) => void;
}) {
  const theme = useTheme();
  return (
    <>
      <Text style={styles.sectionTitle}>Recently Completed</Text>
      {candidates.map((candidate) => (
        <Card
          key={candidate.id}
          style={[styles.rightCard, { backgroundColor: theme.colors.surface }]}
        >
          <TouchableOpacity onPress={() => onSelect(candidate.id)}>
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
      ))}
    </>
  );
}

function EmptyStateCard({
  title,
  icon,
  message,
  suggestion,
}: {
  title: string;
  icon: string;
  message: string;
  suggestion: string;
}) {
  const theme = useTheme();

  return (
    <View>
      <Text
        style={{
          fontSize: 16,
          fontWeight: "600",
          marginBottom: 12,
          color: theme.colors.onBackground,
        }}
      >
        {title}
      </Text>

      <View
        style={{
          alignItems: "center",
          paddingVertical: 100,
          borderRadius: 12,
        }}
      >
        <Avatar.Icon
          icon={icon}
          size={56}
          style={{
            backgroundColor: theme.colors.surface,
            marginBottom: 12,
          }}
          color={theme.colors.onSurfaceVariant}
        />
        <Text
          style={{
            fontSize: 15,
            fontWeight: "500",
            color: theme.colors.onSurfaceVariant,
            marginBottom: 4,
          }}
        >
          {message}
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: theme.colors.onSurfaceDisabled,
            textAlign: "center",
          }}
        >
          {suggestion}
        </Text>
      </View>
    </View>
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
        August 12th 2025
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
  container: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 24,
  },
  left: { flex: 4 },
  right: { flex: 1, paddingVertical: 24 },
  fullPage: { flex: 1 },
  centered: { justifyContent: "center", alignItems: "center" },
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
  reportContainer: { paddingHorizontal: 16 },
  row: { flexDirection: "row", gap: 16, marginBottom: 16 },
  card: { borderRadius: 12 },
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  reportTitle: { fontSize: 24, fontWeight: "bold" },
  reportSubtitle: { fontSize: 16, color: "gray" },
  cardTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
  score: { fontSize: 28, fontWeight: "bold", color: "#6200ee" },
  justification: { fontSize: 14, color: "gray", marginTop: 8 },
  summaryText: { fontSize: 14, lineHeight: 20 },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  infoLabel: { fontWeight: "bold" },
  infoValue: { color: "gray" },
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
  profileImage: {
    width: 150,
    height: 150,
    marginBottom: 8,
  },
  lookupInput: { marginBottom: 12 },
  configureDesc: {
    marginTop: 4,
    fontSize: 14,
  },
  percentageCircle: {
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  percentageText: { position: "absolute", fontSize: 24, fontWeight: "bold" },
});
