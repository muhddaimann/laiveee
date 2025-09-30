import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import {
  Text,
  useTheme,
  Avatar,
  Button,
  Card,
  Divider,
  List,
  Chip,
  SegmentedButtons,
} from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import Header from "../../../../components/c/header";

// --- MOCK DATA BASED ON SCHEMA ---
const mockCandidateResult = {
  id: 1,
  candidate_id: 101,
  language_pref: "English",
  ra_full_name: "John Doe",
  ra_candidate_email: "john.doe@example.com",
  ra_candidate_phone: "+1-555-123-4567",
  ra_highest_education: "Master's in Computer Science",
  ra_current_role: "Senior Software Engineer",
  ra_years_experience: 5.5,
  ra_professional_summary:
    "A highly motivated and experienced Senior Software Engineer with a passion for developing scalable and efficient applications. Proven ability to lead projects and mentor junior developers.",
  ra_related_links: [
    "https://linkedin.com/in/johndoe",
    "https://github.com/johndoe",
  ],
  ra_certs_relate: [
    "AWS Certified Solutions Architect",
    "Certified Kubernetes Application Developer",
  ],
  ra_skill_match: [
    {
      name: "React",
      justification: "5+ years of experience mentioned in resume.",
    },
    {
      name: "Node.js",
      justification: "Backend experience highlighted in multiple projects.",
    },
    { name: "SQL", justification: "Database management skills listed." },
  ],
  ra_experience_match: [
    {
      area: "Team Leadership",
      justification: "Led a team of 5 engineers on Project X.",
    },
    {
      area: "Agile Methodologies",
      justification: "Mentioned working in Agile/Scrum environments.",
    },
  ],
  ra_concern_areas: [
    "No direct experience with GraphQL.",
    "Limited exposure to mobile development.",
  ],
  ra_strengths: [
    {
      trait: "Problem-Solving",
      justification:
        "Demonstrated complex problem-solving in project descriptions.",
    },
    {
      trait: "Leadership",
      justification: "Clear leadership roles and responsibilities listed.",
    },
  ],
  ra_rolefit_score: 8.7,
  ra_rolefit_reason:
    "Strong alignment with technical requirements and leadership experience makes John a great fit for the role.",
  int_started_at: "2025-08-20T10:00:00Z",
  int_ended_at: "2025-08-20T10:25:00Z",
  int_average_score: 4.2,
  int_spoken_score: 4.5,
  int_spoken_reason:
    "Candidate speaks clearly and fluently with a professional tone.",
  int_behavior_score: 4.0,
  int_behavior_reason:
    "Demonstrated positive and collaborative behaviors in situational questions.",
  int_communication_score: 4.1,
  int_communication_reason:
    "Articulates thoughts clearly, though could be slightly more concise.",
  int_knockouts: [
    { question: "Willing to relocate?", pass: true },
    { question: "Has valid work visa?", pass: true },
  ],
  int_summary:
    "John performed well in the interview, showcasing strong technical knowledge and good communication skills. He meets all knockout criteria and is recommended for the next stage.",
  int_full_transcript: `Interviewer: Hello John, thank you for coming in today.\nJohn: Hello, thank you for having me.\n... (full transcript follows) ...`,
};

type CandidateResult = typeof mockCandidateResult;

// --- MAIN COMPONENT ---
export default function CandidateResultPage() {
  const theme = useTheme();
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<CandidateResult | null>(null);
  const [tab, setTab] = useState("resume");

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setResult(mockCandidateResult);
      setLoading(false);
    }, 1000);
  }, [token]);

  if (loading || !result) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Loading Candidate Result...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Header page={`Result: ${result.ra_full_name}`} showBack />
      <ScrollView contentContainerStyle={styles.container}>
        <ResultSummaryCard result={result} />

        <Card style={{ backgroundColor: theme.colors.surface }}>
          <Card.Content>
            <SegmentedButtons
              value={tab}
              onValueChange={setTab}
              buttons={[
                {
                  value: "resume",
                  label: "Resume Analysis",
                  icon: "text-box-search-outline",
                },
                {
                  value: "interview",
                  label: "Interview Details",
                  icon: "microphone-outline",
                },
              ]}
            />
            <Divider style={{ marginTop: 16 }} />

            {tab === "resume" ? (
              <ResumeAnalysisView result={result} />
            ) : (
              <InterviewDetailsView result={result} />
            )}
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
}

// --- CHILD COMPONENTS ---

export const ResultSummaryCard = ({ result }: { result: CandidateResult }) => {
  const theme = useTheme();
  const isRecommended =
    result.ra_rolefit_score >= 7.0 && result.int_average_score >= 3.5;

  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content style={styles.summaryCardContent}>
        <View style={styles.summaryItem}>
          <Text variant="labelLarge">Role Fit Score</Text>
          <Text variant="displayMedium" style={{ color: theme.colors.primary }}>
            {result.ra_rolefit_score}
            <Text variant="headlineSmall">/10</Text>
          </Text>
        </View>
        <Divider
          style={[
            styles.verticalDivider,
            { backgroundColor: theme.colors.outlineVariant },
          ]}
        />
        <View style={styles.summaryItem}>
          <Text variant="labelLarge">Interview Score</Text>
          <Text variant="displayMedium" style={{ color: theme.colors.primary }}>
            {result.int_average_score}
            <Text variant="headlineSmall">/5</Text>
          </Text>
        </View>
        <Divider
          style={[
            styles.verticalDivider,
            { backgroundColor: theme.colors.outlineVariant },
          ]}
        />
        <View style={styles.summaryItem}>
          <Text variant="labelLarge">Recommendation</Text>
          <Chip
            icon={isRecommended ? "thumb-up" : "thumb-down"}
            selected={isRecommended}
            selectedColor={theme.colors.onPrimaryContainer}
            style={{
              backgroundColor: isRecommended
                ? theme.colors.primaryContainer
                : theme.colors.surfaceVariant,
            }}
          >
            {isRecommended ? "Recommended" : "Not Recommended"}
          </Chip>
        </View>
      </Card.Content>
    </Card>
  );
};

export const ResumeAnalysisView = ({ result }: { result: CandidateResult }) => {
  const theme = useTheme();

  return (
    <View style={{ paddingTop: 16 }}>
      <List.Section>
        <List.Subheader>Professional Summary</List.Subheader>
        <Text variant="bodyMedium" style={{ paddingHorizontal: 16 }}>{result.ra_professional_summary}</Text>
        <Divider style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]} />
        <List.Item title="Education" description={result.ra_highest_education} left={() => <List.Icon icon="school" />} />
        <List.Item title="Experience" description={`${result.ra_years_experience} years as ${result.ra_current_role}`} left={() => <List.Icon icon="briefcase" />} />
      </List.Section>

      <List.AccordionGroup>
        <List.Accordion title="Strengths & Concerns" id="strengths">
            <List.Section>
              {result.ra_strengths.map((item, i) => (
                <List.Item key={i} title={item.trait} description={item.justification} left={() => <List.Icon icon="check-decagram" color={theme.colors.primary} />} />
              ))}
              {result.ra_concern_areas.map((item, i) => (
                <List.Item key={i} title={item} left={() => <List.Icon icon="alert-circle-outline" color={theme.colors.tertiary} />} />
              ))}
            </List.Section>
        </List.Accordion>
        <List.Accordion title="Skill & Experience Match" id="skills">
            {result.ra_skill_match.map((item, i) => (
              <List.Item key={i} title={item.name} description={item.justification} />
            ))}
            {result.ra_experience_match.map((item, i) => (
              <List.Item key={i} title={item.area} description={item.justification} />
            ))}
        </List.Accordion>
      </List.AccordionGroup>
    </View>
  );
};

export const InterviewDetailsView = ({ result }: { result: CandidateResult; }) => {
  const theme = useTheme();

  return (
    <View style={{ paddingTop: 16 }}>
      <List.Section>
        <List.Subheader>Interview Score Breakdown</List.Subheader>
        <List.Item title={`Spoken Ability: ${result.int_spoken_score}/5`} description={result.int_spoken_reason} left={() => <List.Icon icon="volume-high" color={theme.colors.primary} />} />
        <List.Item title={`Behavioral: ${result.int_behavior_score}/5`} description={result.int_behavior_reason} left={() => <List.Icon icon="account-heart-outline" color={theme.colors.secondary} />} />
        <List.Item title={`Communication Style: ${result.int_communication_score}/5`} description={result.int_communication_reason} left={() => <List.Icon icon="message-text-outline" color={theme.colors.tertiary} />} />
      </List.Section>

      <List.Section>
        <List.Subheader>Knockout Questions</List.Subheader>
        {result.int_knockouts.map((item, i) => (
          <List.Item key={i} title={item.question} right={() => (
            <Chip icon={item.pass ? "check" : "close"} style={{ backgroundColor: item.pass ? theme.colors.primaryContainer : theme.colors.errorContainer }} textStyle={{ color: item.pass ? theme.colors.onPrimaryContainer : theme.colors.onErrorContainer }}>
              {item.pass ? "Pass" : "Fail"}
            </Chip>
          )} />
        ))}
      </List.Section>

      <List.Section>
        <List.Subheader>Full Transcript</List.Subheader>
        <ScrollView style={styles.transcriptContainer}>
          <Text selectable>{result.int_full_transcript}</Text>
        </ScrollView>
      </List.Section>
    </View>
  );
};

// --- STYLES ---
const styles = StyleSheet.create({
  container: { padding: 16 },
  card: { marginBottom: 16 },
  divider: { marginVertical: 12 },
  summaryCardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 16,
  },
  summaryItem: {
    alignItems: "center",
    gap: 8,
  },
  verticalDivider: { width: 1, height: "100%" },
  transcriptContainer: {
    maxHeight: 300,
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 8,
  },
});
