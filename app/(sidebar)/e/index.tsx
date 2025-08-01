import React, { useState, useMemo } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import {
  Button,
  Card,
  Text,
  useTheme,
  TextInput,
  ActivityIndicator,
  Avatar,
  List,
} from "react-native-paper";

const mockCandidateData = {
  "20250801C1": {
    profile: {
      name: "John Doe",
      role: "Customer Service Specialist",
      summary:
        "A highly motivated customer service professional with 3 years of experience in fast-paced call center environments. Passionate about problem-solving and customer satisfaction.",
    },
    interviewScores: {
      englishProficiency: {
        score: 4.5,
        reasoning:
          "Excellent command of English, clear pronunciation, and wide vocabulary.",
      },
      empathyAndCustomerHandling: {
        score: 4.8,
        reasoning:
          "Demonstrated strong empathy and effective de-escalation techniques in role-play scenarios.",
      },
      confidenceAndClarity: {
        score: 4.6,
        reasoning:
          "Spoke confidently and articulated thoughts clearly throughout the interview.",
      },
      average: 4.6,
    },
    recommendation: {
      status: "Strongly Recommend",
      reason:
        "Exceeds all requirements, demonstrating exceptional communication and empathy.",
    },
    transcript: [
      { role: "user", text: "Hello, my name is John Doe." },
      { role: "ai", text: "Welcome, John. Let's begin." },
    ],
    cost: { totalCostUSD: "0.85", totalCostMYR: "4.00" },
    date: "2025-08-01",
  },
  "20250731C2": {
    profile: {
      name: "Jane Smith",
      role: "Technical Support Tier 2",
      summary:
        "Detail-oriented Technical Support agent with a knack for complex problem-solving.",
    },
    interviewScores: {
      englishProficiency: { score: 4.2, reasoning: "Clear and concise." },
      empathyAndCustomerHandling: {
        score: 3.9,
        reasoning: "Good, but could be more proactive in showing empathy.",
      },
      confidenceAndClarity: {
        score: 4.1,
        reasoning: "Confident in technical explanations.",
      },
      average: 4.1,
    },
    recommendation: {
      status: "Recommend",
      reason: "Strong technical skills and clear communication.",
    },
    transcript: [{ role: "user", text: "Hi, I'm Jane." }],
    cost: { totalCostUSD: "0.75", totalCostMYR: "3.50" },
    date: "2025-07-31",
  },
  "20250730C3": {
    profile: {
      name: "Ahmad Faisal",
      role: "Sales Associate",
      summary: "Energetic and persuasive sales professional.",
    },
    interviewScores: {
      englishProficiency: { score: 3.5, reasoning: "Good, but some accent." },
      empathyAndCustomerHandling: {
        score: 4.0,
        reasoning: "Builds rapport easily.",
      },
      confidenceAndClarity: {
        score: 4.5,
        reasoning: "Very confident and persuasive.",
      },
      average: 4.0,
    },
    recommendation: {
      status: "Proceed with Caution",
      reason:
        "Strong sales skills, but language proficiency might be a concern for certain markets.",
    },
    transcript: [{ role: "user", text: "Hello, my name is Ahmad." }],
    cost: { totalCostUSD: "0.90", totalCostMYR: "4.20" },
    date: "2025-07-30",
  },
};

type Candidate = (typeof mockCandidateData)["20250801C1"];

export default function HireDashboard() {
  const theme = useTheme();
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const candidates = useMemo(
    () =>
      Object.entries(mockCandidateData).map(([id, data]) => ({ id, ...data })),
    []
  );

  const handleSelectCandidate = (id: string) => {
    setLoading(true);
    setTimeout(() => {
      setSelectedCandidateId(id);
      setLoading(false);
    }, 500);
  };

  const handleSearch = (id: string) => {
    if ((mockCandidateData as any)[id]) {
      handleSelectCandidate(id);
    } else {
      alert("Candidate ID not found.");
    }
  };

  const handleBackToDashboard = () => {
    setSelectedCandidateId(null);
  };

  const selectedCandidateData = selectedCandidateId
    ? ((mockCandidateData as any)[selectedCandidateId] as Candidate)
    : null;

  return (
    <View
      style={[
        styles.dashboardContainer,
        { backgroundColor: theme.colors.background },
      ]}
    >
      {/* Left Column */}
      <View style={styles.leftColumn}>
        {loading ? (
          <LoadingScreen />
        ) : selectedCandidateData ? (
          <ReportView
            candidateData={selectedCandidateData}
            onBack={handleBackToDashboard}
          />
        ) : (
          <CompletedInterviewsList
            candidates={candidates}
            onSelect={handleSelectCandidate}
          />
        )}
      </View>

      {/* Right Column */}
      <View style={styles.rightColumn}>
        <LookupCard onSearch={handleSearch} />
        <RecentCard
          candidate={candidates[0]}
          onSelect={() => handleSelectCandidate(candidates[0].id)}
        />
      </View>
    </View>
  );
}

function CompletedInterviewsList({
  candidates,
  onSelect,
}: {
  candidates: (Candidate & { id: string })[];
  onSelect: (id: string) => void;
}) {
  const theme = useTheme();
  return (
    <ScrollView>
      <View style={styles.listContainer}>
        <Text style={[styles.pageTitle, { color: theme.colors.onBackground }]}>
          Completed Interviews
        </Text>
        {candidates.map((candidate) => (
          <TouchableOpacity
            key={candidate.id}
            onPress={() => onSelect(candidate.id)}
          >
            <Card style={styles.candidateCard}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <Avatar.Icon icon="account-circle" size={40} />
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={styles.candidateName}>
                      {candidate.profile.name}
                    </Text>
                    <Text style={styles.candidateRole}>
                      {candidate.profile.role}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.recommendationStatus,
                      { color: theme.colors.primary },
                    ]}
                  >
                    {candidate.recommendation.status}
                  </Text>
                </View>
                <Text style={styles.summaryText}>
                  {candidate.recommendation.reason}
                </Text>
                <Text style={styles.dateText}>
                  Interview Date: {candidate.date}
                </Text>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
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
  const { profile, interviewScores, recommendation, transcript, cost } =
    candidateData;

  return (
    <ScrollView>
      <View style={styles.reportContainer}>
        <Button
          icon="arrow-left"
          onPress={onBack}
          style={{ alignSelf: "flex-start", marginBottom: 16 }}
        >
          Back to Dashboard
        </Button>
        <Card style={styles.reportCard}>
          <Card.Content style={{ alignItems: "center" }}>
            <Avatar.Icon
              icon="account-tie"
              size={80}
              style={{ marginBottom: 16 }}
            />
            <Text style={styles.reportTitle}>{profile.name}</Text>
            <Text style={styles.reportSubtitle}>{profile.role}</Text>
          </Card.Content>
        </Card>
        <Card
          style={[
            styles.reportCard,
            { backgroundColor: theme.colors.primaryContainer },
          ]}
        >
          <Card.Content>
            <Text style={styles.cardTitle}>Hiring Recommendation</Text>
            <Text
              style={[
                styles.recommendationStatus,
                { color: theme.colors.primary },
              ]}
            >
              {recommendation.status}
            </Text>
            <Text style={{ color: theme.colors.onPrimaryContainer }}>
              {recommendation.reason}
            </Text>
          </Card.Content>
        </Card>
        <Card style={styles.reportCard}>
          <Card.Content>
            <Text style={styles.cardTitle}>Interview Performance</Text>
            <List.Section>
              {Object.entries(interviewScores)
                .filter(([key]) => key !== "summary" && key !== "average")
                .map(([key, value]: [string, any]) => (
                  <List.Accordion
                    key={key}
                    title={`${key.replace(/([A-Z])/g, " $1").trim()}`}
                    left={() => <List.Icon icon="star-circle" />}
                    right={() => <Text>{value.score}/5</Text>}
                  >
                    <Text
                      style={{
                        padding: 16,
                        color: theme.colors.onSurfaceVariant,
                      }}
                    >
                      {value.reasoning}
                    </Text>
                  </List.Accordion>
                ))}
            </List.Section>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
}

function LookupCard({ onSearch }: { onSearch: (id: string) => void }) {
  const [id, setId] = useState("");
  return (
    <Card style={styles.rightCard}>
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
  return (
    <Card style={styles.rightCard}>
      <TouchableOpacity onPress={onSelect}>
        <Card.Content>
          <Text style={styles.cardTitle}>Recently Completed</Text>
          <View style={{ alignItems: "center" }}>
            <Avatar.Icon
              icon="account-clock"
              size={50}
              style={{ marginBottom: 8 }}
            />
            <Text style={styles.candidateName}>{candidate.profile.name}</Text>
            <Text>{candidate.profile.role}</Text>
          </View>
        </Card.Content>
      </TouchableOpacity>
    </Card>
  );
}

function LoadingScreen() {
  const theme = useTheme();
  return (
    <View style={[styles.fullPage, styles.centered]}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={{ marginTop: 16, color: theme.colors.onSurface }}>
        Loading Report...
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fullPage: { flex: 1 },
  centered: { justifyContent: "center", alignItems: "center" },
  dashboardContainer: {
    flex: 1,
    flexDirection: "row",
  },
  leftColumn: {
    flex: 3,
    borderRightWidth: 1,
    borderRightColor: "#e0e0e0",
  },
  rightColumn: {
    flex: 1,
    padding: 16,
  },
  listContainer: {
    padding: 24,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
  },
  candidateCard: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  candidateName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  candidateRole: {
    fontSize: 14,
    color: "gray",
  },
  summaryText: {
    marginVertical: 8,
  },
  dateText: {
    fontSize: 12,
    color: "gray",
    textAlign: "right",
  },
  reportContainer: { padding: 24 },
  reportTitle: { fontSize: 24, fontWeight: "bold" },
  reportSubtitle: { fontSize: 16, color: "gray", marginBottom: 16 },
  reportCard: { marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
  recommendationStatus: { fontSize: 20, fontWeight: "bold" },
  rightCard: {
    marginBottom: 16,
  },
});
