import React, { useMemo, useState, useEffect } from "react";
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
import Header from "../../../components/c/header";
import { useAuth } from "../../../contexts/cAuthContext";
import { getSelfDetails, Staff } from "../../../contexts/api/staff";
import { CandidateRecord, getCandidateById, getCandidateRecords, Candidate } from "../../../contexts/api/candidate";
import LookupCard from "../../../components/c/LookupCard";
import RecentCard from "../../../components/c/RecentCard";
import CandidateTable from "../../../components/c/CandidateTable";

function ProfileCard({
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

export default function Dashboard() {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateRecord | null>(
    null
  );

  const { isAuthenticated } = useAuth();
  const [staffUser, setStaffUser] = useState<Staff | null>(null);
  useEffect(() => {
    if (isAuthenticated) {
      getSelfDetails()
        .then(setStaffUser)
        .catch(() => setStaffUser(null));
    } else {
      setStaffUser(null);
    }
  }, [isAuthenticated]);

  const handleSearch = async (id: string) => {
    if (!id.trim()) return;
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      alert("Please enter a valid numeric Candidate ID.");
      return;
    }

    setLoading(true);
    setSelectedCandidate(null);
    try {
      // Step 1: Get the basic candidate info by ID
      const candidateRes = await getCandidateById(numericId);
      const candidate = candidateRes.data;

      if (candidate && candidate.PublicToken) {
        // Step 2: Get the detailed records using the token from the candidate
        const recordsRes = await getCandidateRecords(candidate.PublicToken);
        const record = recordsRes.data?.[0];

        if (record) {
          setSelectedCandidate(record);
        } else {
          alert("Candidate found, but no detailed records are available.");
        }
      } else {
        throw new Error("Candidate not found.");
      }
    } catch (err) {
      alert("Candidate ID not found.");
      setSelectedCandidate(null);
    } finally {
      setLoading(false);
    }
  };



  return (
    <View style={{ flex: 1 }}>
      <Header page="Dashboard" />
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.left}>
          {loading ? (
            <LoadingScreen />
          ) : selectedCandidate ? (
            <ReportView
              candidateData={selectedCandidate}
              onBack={() => setSelectedCandidate(null)}
            />
          ) : (
            <DashboardView
              onSelect={(candidate) => {
                setLoading(true);
                getCandidateRecords(candidate.PublicToken)
                  .then(response => {
                    const record = response.data?.[0];
                    if (record) {
                      setSelectedCandidate(record);
                    }
                  })
                  .catch(err => {
                    alert("Could not fetch candidate details.");
                  })
                  .finally(() => setLoading(false));
              }}
            />
          )}
        </View>
        <View style={styles.right}>
          {staffUser ? (
            <ProfileCard
              name={staffUser.nick_name}
              designation="Recruiter"
              avatarLabel={staffUser.initials}
            />
          ) : (
            <ActivityIndicator style={{ marginVertical: 60 }} />
          )}
          <LookupCard onSearch={handleSearch} />
          <RecentCard onSelect={(candidate) => {
            setLoading(true);
            getCandidateRecords(candidate.PublicToken)
              .then(response => {
                const record = response.data?.[0];
                if (record) {
                  setSelectedCandidate(record);
                }
              })
              .catch(err => {
                alert("Could not fetch candidate details.");
              })
              .finally(() => setLoading(false));
          }} />
        </View>
      </View>
    </View>
  );
}

function DashboardView({
  onSelect,
}: {
  onSelect: (candidate: Candidate) => void;
}) {
  const theme = useTheme();
  const router = useRouter();

  // Static data for widgets, can be replaced with real data later
  const totalCandidates = 5; // Example data
  const totalRoles = 1; // Example data

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
              onPress={() => router.push("c/laiveRegister")}
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
      <CandidateTable onSelect={onSelect} />
    </View>
  );
}



function ReportView({
  candidateData,
  onBack,
}: {
  candidateData: CandidateRecord;
  onBack: () => void;
}) {
  const theme = useTheme();
  const { id, ra_full_name, ra_current_role, ra_rolefit_score, ra_rolefit_reason, int_average_score, int_summary, ra_professional_summary, ra_candidate_email, ra_candidate_phone, ra_related_links, ra_highest_education, ra_strengths, ra_skill_match, ra_experience_match, ra_concern_areas, int_scores_json, int_knockouts } =
    candidateData;

  const parseJsonString = (jsonString: any, defaultValue: any = []) => {
    if (typeof jsonString === 'object' && jsonString !== null) return jsonString;
    if (typeof jsonString === 'string') {
      try {
        return JSON.parse(jsonString);
      } catch (e) {
        return defaultValue;
      }
    }
    return defaultValue;
  };

  const getDisplayableLinks = (links: any): string => {
    if (!links) return "N/A";
    if (Array.isArray(links)) {
      return links.join(", ");
    }
    if (typeof links === 'string') {
      try {
        const parsedLinks = JSON.parse(links);
        if (Array.isArray(parsedLinks)) {
          return parsedLinks.join(", ");
        }
      } catch (e) {
        return links;
      }
    }
    return String(links);
  };

  const strengthsList = parseJsonString(ra_strengths, []);
  const skillMatchList = parseJsonString(ra_skill_match, []);
  const experienceMatchList = parseJsonString(ra_experience_match, []);
  const concernAreasList = parseJsonString(ra_concern_areas, []);
  const scoresObject = parseJsonString(int_scores_json, {});
  const knockoutsObject = parseJsonString(int_knockouts, {});

  const InfoRow = ({ label, value }: { label: string; value: any }) => (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: theme.colors.onSurface }]}>
        {label}
      </Text>
      <Text
        style={[styles.infoValue, { color: theme.colors.onSurfaceVariant }]}
      >
        {value || 'N/A'}
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
              <Text style={styles.reportTitle}>{ra_full_name}</Text>
              <Text style={styles.reportSubtitle}>
                {ra_current_role} #{id}
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
                {ra_rolefit_score} / 10
              </Text>
              <Text style={styles.justification}>
                {ra_rolefit_reason}
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
                {Number(int_average_score ?? 0).toFixed(1)} /
                5.0
              </Text>
              <Text style={styles.justification}>
                {int_summary}
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
                {ra_professional_summary}
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
              <InfoRow label="Email" value={ra_candidate_email} />
              <InfoRow label="Phone" value={ra_candidate_phone} />
              <InfoRow label="Links" value={getDisplayableLinks(ra_related_links)} />
              <Divider style={{ marginVertical: 8 }} />
              <InfoRow
                label="Education"
                value={ra_highest_education}
              />
              <InfoRow label="Experience" value={ra_current_role} />
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
                  {strengthsList.map((item: any, i: number) => (
                    <List.Item
                      key={i}
                      title={item.trait}
                      description={item.justification}
                    />
                  ))}
                </List.Accordion>
                <List.Accordion title="Skill Match">
                  {skillMatchList.map((item: any, i: number) => (
                    <List.Item
                      key={i}
                      title={item.name}
                      description={item.justification}
                    />
                  ))}
                </List.Accordion>
                <List.Accordion title="Experience Match">
                  {experienceMatchList.map((item: any, i: number) => (
                    <List.Item
                      key={i}
                      title={item.area}
                      description={item.justification}
                    />
                  ))}
                </List.Accordion>
                <List.Accordion title="Concern Areas">
                  {concernAreasList.map((item: any, i: number) => (
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
                  {Object.entries(scoresObject).map(
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
                  {Object.entries(knockoutsObject).map(
                    ([key, value]: [string, any]) => (
                      <List.Item
                        key={key}
                        title={value.question}
                        description={value.pass ? 'Pass' : 'Fail'}
                        descriptionStyle={{ color: value.pass ? 'green' : 'red' }}
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
  },
  left: {
    flex: 4,
    borderRightWidth: 1,
    borderRightColor: "#e0e0e0",
    paddingRight: 24,
  },
  right: { flex: 1, paddingVertical: 24, paddingLeft: 24 },
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
  profileImage: { width: 150, height: 150, marginBottom: 8 },
  lookupInput: { marginBottom: 12 },
  configureDesc: { marginTop: 4, fontSize: 14 },
  percentageCircle: {
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  percentageText: { position: "absolute", fontSize: 24, fontWeight: "bold" },
});
