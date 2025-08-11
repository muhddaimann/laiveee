import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import {
  Button,
  Card,
  Text,
  useTheme,
  TextInput,
  Divider,
  List,
  Icon,
} from "react-native-paper";
import {
  getAllCandidates,
  getCandidateById,
  mapRowToUI,
  type CandidateUI,
  type CandidateRow,
} from "../../../contexts/api/candidate";
import Header from "../../../components/e/header";

type IconSource = React.ComponentProps<typeof Icon>["source"];

export function NoData({
  text = "No data found",
  icon = "account-search-outline",
}: {
  text?: string;
  icon?: IconSource;
}) {
  const theme = useTheme();
  return (
    <View style={styles.noData}>
      <Icon
        source={icon}
        size={48}
        color={theme.colors.onSurfaceDisabled ?? theme.colors.onSurface}
      />
      <Text
        variant="bodyMedium"
        style={{ opacity: 0.7, marginTop: 8, textAlign: "center" }}
      >
        {text}
      </Text>
    </View>
  );
}

function ReportView({
  candidateData,
  onBack,
}: {
  candidateData: CandidateUI & { id: string };
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
        {value ?? "N/A"}
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
              <Text style={styles.score}>
                {resumeAnalysis.roleFit.roleScore ?? 0} / 10
              </Text>
              <Text style={styles.justification}>
                {resumeAnalysis.roleFit.justification ?? ""}
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
              <Text style={styles.score}>
                {Number(interviewPerformance.averageScore ?? 0).toFixed(1)} /
                5.0
              </Text>
              <Text style={styles.justification}>
                {interviewPerformance.summary ?? ""}
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
                {resumeAnalysis.professionalSummary ?? ""}
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
                value={
                  resumeAnalysis.relatedLink?.length
                    ? resumeAnalysis.relatedLink.join(", ")
                    : "N/A"
                }
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
                  {(resumeAnalysis.strengths ?? []).map(
                    (item: any, i: number) => (
                      <List.Item
                        key={i}
                        title={item.trait}
                        description={item.justification}
                      />
                    )
                  )}
                </List.Accordion>
                <List.Accordion title="Skill Match">
                  {(resumeAnalysis.skillMatch ?? []).map(
                    (item: any, i: number) => (
                      <List.Item
                        key={i}
                        title={item.name}
                        description={item.justification}
                      />
                    )
                  )}
                </List.Accordion>
                <List.Accordion title="Experience Match">
                  {(resumeAnalysis.experienceMatch ?? []).map(
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
                  {(resumeAnalysis.concernArea ?? []).map(
                    (item: any, i: number) => (
                      <List.Item key={i} title={item} />
                    )
                  )}
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
                  {Object.entries(
                    interviewPerformance.scoreBreakdown ?? {}
                  ).map(([key, value]: [string, any]) => (
                    <List.Item
                      key={key}
                      title={`${key.replace(/([A-Z])/g, " $1").trim()} - ${
                        value.score ?? 0
                      }/5`}
                      description={value.reasoning ?? ""}
                      descriptionNumberOfLines={5}
                    />
                  ))}
                </List.Accordion>
                <List.Accordion title="Knockout Questions">
                  {Object.entries(
                    interviewPerformance.knockoutBreakdown ?? {}
                  ).map(([key, value]: [string, any]) => (
                    <List.Item
                      key={key}
                      title={key.replace(/([A-Z])/g, " $1").trim()}
                      description={String(value)}
                    />
                  ))}
                </List.Accordion>
              </List.Section>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

function DashboardView({
  candidates,
  onSelectCandidate,
  selectedId,
}: {
  candidates: (CandidateUI & { id: string })[];
  onSelectCandidate: (id: string) => void;
  selectedId: string | null;
}) {
  const theme = useTheme();
  const firstFive = useMemo(() => candidates.slice(0, 5), [candidates]);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Card
        style={[
          styles.card,
          { marginBottom: 16, backgroundColor: theme.colors.surface },
        ]}
      >
        <Card.Content>
          <Text variant="titleLarge">Total Candidates</Text>
          <Text variant="displayMedium">{candidates.length}</Text>
        </Card.Content>
      </Card>
      <Text variant="titleLarge" style={{ marginBottom: 8 }}>
        All Candidates
      </Text>
      <ScrollView>
        {firstFive.length === 0 ? (
          <NoData text="No recent candidates" icon="history" />
        ) : (
          firstFive.map((c) => (
            <Card
              key={c.id}
              style={[
                styles.card,
                {
                  borderWidth: selectedId === c.id ? 1 : 0,
                  borderColor: theme.colors.primary,
                  marginBottom: 8,
                  backgroundColor: theme.colors.surface,
                },
              ]}
              onPress={() => onSelectCandidate(c.id)}
            >
              <Card.Content>
                <Text style={styles.itemTitle}>
                  {c.candidateDetails.shortName}
                </Text>
                <Text style={styles.itemSub}>
                  {c.candidateDetails.roleAppliedFor}
                </Text>
                <Text style={styles.itemMeta}>{c.candidateDetails.status}</Text>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}

export default function LaiveRecruit() {
  const theme = useTheme();
  const [searchId, setSearchId] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [list, setList] = useState<Array<{ id: string; data: CandidateUI }>>(
    []
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const abort = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const rows = await getAllCandidates(abort.signal);
        const mapped = (rows ?? []).map((r: CandidateRow) => ({
          id: String(r.id),
          data: mapRowToUI(r),
        }));
        setList(mapped);
      } finally {
        setLoading(false);
      }
    })();
    return () => abort.abort();
  }, []);

  const candidates = useMemo(
    () =>
      list.map(({ id, data }) => ({
        id,
        candidateDetails: data.candidateDetails,
        resumeAnalysis: data.resumeAnalysis,
        interviewPerformance: data.interviewPerformance,
      })),
    [list]
  );

  const latestThree = useMemo(
    () =>
      [...candidates].sort((a, b) => Number(b.id) - Number(a.id)).slice(0, 3),
    [candidates]
  );

  const selectedCandidateData =
    selectedId != null
      ? (() => {
          const found = list.find((c) => c.id === selectedId);
          if (!found) return null;
          const { id: _omit, ...rest } = found.data as any;
          return { id: selectedId, ...rest } as CandidateUI & { id: string };
        })()
      : null;

  const handleSearch = async () => {
    if (!searchId.trim()) return;
    setLoading(true);
    const abort = new AbortController();
    try {
      const row = await getCandidateById(searchId.trim(), abort.signal);
      if (!row) {
        alert("Candidate ID not found.");
        return;
      }
      const ui = mapRowToUI(row);
      setList((prev) => {
        const asId = String(row.id);
        const exists = prev.some((c) => c.id === asId);
        return exists ? prev : [...prev, { id: asId, data: ui }];
      });
      setSelectedId(String(row.id));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Header title="LaiveRecruit™" showBack={false} />
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.left}>
          {loading && selectedId && !selectedCandidateData ? (
            <ActivityIndicator style={{ marginTop: 24 }} />
          ) : selectedCandidateData ? (
            <ReportView
              candidateData={selectedCandidateData}
              onBack={() => setSelectedId(null)}
            />
          ) : (
            <DashboardView
              candidates={candidates}
              onSelectCandidate={setSelectedId}
              selectedId={selectedId}
            />
          )}
        </View>
        <View style={styles.right}>
          <Card
            style={[
              styles.card,
              { marginBottom: 12, backgroundColor: theme.colors.surface },
            ]}
          >
            <Card.Content style={{ gap: 8 }}>
              <TextInput
                mode="outlined"
                label="Search by Candidate ID"
                value={searchId}
                onChangeText={setSearchId}
              />
              <Button
                mode="contained"
                onPress={handleSearch}
                disabled={loading}
              >
                Search
              </Button>
            </Card.Content>
          </Card>

          <Text variant="titleLarge" style={{ marginBottom: 8 }}>
            Recently Completed
          </Text>

          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            {loading && !list.length ? (
              <ActivityIndicator style={{ marginTop: 16 }} />
            ) : latestThree.length === 0 ? (
              <NoData text="No recent candidates" icon="history" />
            ) : (
              latestThree.map((c) => (
                <Card
                  key={c.id}
                  style={[
                    styles.card,
                    {
                      borderWidth: selectedId === c.id ? 1 : 0,
                      borderColor: theme.colors.primary,
                      marginBottom: 8,
                      backgroundColor: theme.colors.surface,
                    },
                  ]}
                  onPress={() => setSelectedId(c.id)}
                >
                  <Card.Content>
                    <Text style={styles.itemTitle}>
                      {c.candidateDetails.shortName}
                    </Text>
                    <Text style={styles.itemSub}>
                      {c.candidateDetails.roleAppliedFor}
                    </Text>
                    <Text style={styles.itemMeta}>
                      {c.candidateDetails.status}
                    </Text>
                  </Card.Content>
                </Card>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: "row", padding: 16, gap: 16 },
  left: { flex: 3, gap: 24 },
  right: { flex: 1 },
  card: { borderRadius: 16, overflow: "hidden" },
  itemTitle: { fontSize: 16, fontWeight: "600", marginBottom: 2 },
  itemSub: { fontSize: 13, opacity: 0.8 },
  itemMeta: { fontSize: 12, opacity: 0.6, marginTop: 4 },
  reportContainer: { paddingBottom: 32, gap: 16 },
  row: { flexDirection: "row", gap: 16 },
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  reportTitle: { fontSize: 22, fontWeight: "700" },
  reportSubtitle: { fontSize: 13, opacity: 0.8, marginTop: 4 },
  cardTitle: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  score: { fontSize: 22, fontWeight: "700" },
  justification: { fontSize: 13, opacity: 0.85, marginTop: 8 },
  summaryText: { fontSize: 14, lineHeight: 20 },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  infoLabel: { fontSize: 13, fontWeight: "600" },
  infoValue: { fontSize: 13, flexShrink: 1, textAlign: "right" },
  noData: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
});
