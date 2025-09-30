import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import {
  Text,
  useTheme,
  Card,
  Divider,
  List,
  Chip,
  SegmentedButtons,
} from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  getCandidates,
  getCandidateRecords,
  Candidate,
  CandidateRecord,
} from "../../../../contexts/api/candidate";
import Header from "../../../../components/c/header";

type CandidateResult = CandidateRecord;

export default function CandidateResultPage() {
  const theme = useTheme();
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<CandidateResult | null>(null);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [tab, setTab] = useState("resume");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const listRes = await getCandidates();
        const list = listRes.data ?? [];
        const found = list.find((c) => c.PublicToken === token) ?? null;
        if (!mounted) return;
        setCandidate(found ?? null);
        if (!found) {
          setResult(null);
          return;
        }
        const recRes = await getCandidateRecords(found.PublicToken);
        const records = recRes.data ?? [];
        const latest =
          records
            .slice()
            .sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            )[0] ?? null;

        if (!mounted || !latest) {
          setResult(null);
          return;
        }

        // Safely parse all JSON fields
        const safeParse = (field: any) => {
          if (typeof field === "string") {
            try {
              return JSON.parse(field);
            } catch (e) {
              return []; // Return empty array if parsing fails
            }
          }
          return Array.isArray(field) ? field : []; // Return field if already an array, or empty array
        };

        const parsedRecord: CandidateResult = {
          ...latest,
          ra_related_links: safeParse(latest.ra_related_links),
          ra_certs_relate: safeParse(latest.ra_certs_relate),
          ra_skill_match: safeParse(latest.ra_skill_match),
          ra_experience_match: safeParse(latest.ra_experience_match),
          ra_concern_areas: safeParse(latest.ra_concern_areas),
          ra_strengths: safeParse(latest.ra_strengths),
          int_knockouts: safeParse(latest.int_knockouts),
        };

        setResult(parsedRecord);
      } catch (e) {
        setResult(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [token]);

  if (loading || !result) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>
          {loading
            ? "Loading Candidate Result..."
            : "No result found for this candidate."}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Header page="Candidate Result" showBack />
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

export const ResultSummaryCard = ({ result }: { result: CandidateResult }) => {
  const theme = useTheme();
  const isRecommended =
    (result.ra_rolefit_score ?? 0) >= 7.0 &&
    (result.int_average_score ?? 0) >= 3.5;

  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content style={styles.summaryCardContent}>
        <View style={styles.summaryItem}>
          <Text variant="labelLarge">Role Fit Score</Text>
          <Text variant="displayMedium" style={{ color: theme.colors.primary }}>
            {result.ra_rolefit_score ?? "-"}
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
            {result.int_average_score ?? "-"}
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
        <Text variant="bodyMedium" style={{ paddingHorizontal: 16 }}>
          {result.ra_professional_summary ?? "-"}
        </Text>
        <Divider
          style={[
            styles.divider,
            { backgroundColor: theme.colors.outlineVariant },
          ]}
        />
        <List.Item
          title="Education"
          description={result.ra_highest_education ?? "-"}
          left={() => <List.Icon icon="school" />}
        />
        <List.Item
          title="Experience"
          description={`${result.ra_years_experience ?? "-"} years as ${
            result.ra_current_role ?? "-"
          }`}
          left={() => <List.Icon icon="briefcase" />}
        />
      </List.Section>

      <List.AccordionGroup>
        <List.Accordion title="Strengths & Concerns" id="strengths">
          <List.Section>
            {(result.ra_strengths ?? []).map(
              (item: { trait: string; justification: string }, i: number) => (
                <List.Item
                  key={i}
                  title={item.trait}
                  description={item.justification}
                  left={() => (
                    <List.Icon
                      icon="check-decagram"
                      color={theme.colors.primary}
                    />
                  )}
                />
              )
            )}
            {(result.ra_concern_areas ?? []).map((item: string, i: number) => (
              <List.Item
                key={i}
                title={item}
                left={() => (
                  <List.Icon
                    icon="alert-circle-outline"
                    color={theme.colors.tertiary}
                  />
                )}
              />
            ))}
          </List.Section>
        </List.Accordion>
        <List.Accordion title="Skill & Experience Match" id="skills">
          {(result.ra_skill_match ?? []).map(
            (item: { name: string; justification: string }, i: number) => (
              <List.Item
                key={i}
                title={item.name}
                description={item.justification}
              />
            )
          )}
          {(result.ra_experience_match ?? []).map(
            (item: { area: string; justification: string }, i: number) => (
              <List.Item
                key={i}
                title={item.area}
                description={item.justification}
              />
            )
          )}
        </List.Accordion>
      </List.AccordionGroup>
    </View>
  );
};

export const InterviewDetailsView = ({
  result,
}: {
  result: CandidateResult;
}) => {
  const theme = useTheme();

  return (
    <View style={{ paddingTop: 16 }}>
      <List.Section>
        <List.Subheader>Interview Score Breakdown</List.Subheader>
        <List.Item
          title={`Spoken Ability: ${result.int_spoken_score ?? "-"}/5`}
          description={result.int_spoken_reason ?? "-"}
          left={() => (
            <List.Icon icon="volume-high" color={theme.colors.primary} />
          )}
        />
        <List.Item
          title={`Behavioral: ${result.int_behavior_score ?? "-"}/5`}
          description={result.int_behavior_reason ?? "-"}
          left={() => (
            <List.Icon
              icon="account-heart-outline"
              color={theme.colors.secondary}
            />
          )}
        />
        <List.Item
          title={`Communication Style: ${
            result.int_communication_score ?? "-"
          }/5`}
          description={result.int_communication_reason ?? "-"}
          left={() => (
            <List.Icon
              icon="message-text-outline"
              color={theme.colors.tertiary}
            />
          )}
        />
      </List.Section>

      <List.Section>
        <List.Subheader>Knockout Questions</List.Subheader>
        {(result.int_knockouts ?? []).map(
          (item: { question: string; pass: boolean }, i: number) => (
            <List.Item
              key={i}
              title={item.question}
              right={() => (
                <Chip
                  icon={item.pass ? "check" : "close"}
                  style={{
                    backgroundColor: item.pass
                      ? theme.colors.primaryContainer
                      : theme.colors.errorContainer,
                  }}
                  textStyle={{
                    color: item.pass
                      ? theme.colors.onPrimaryContainer
                      : theme.colors.onErrorContainer,
                  }}
                >
                  {item.pass ? "Pass" : "Fail"}
                </Chip>
              )}
            />
          )
        )}
      </List.Section>

      <List.Section>
        <List.Subheader>Full Transcript</List.Subheader>
        <ScrollView style={styles.transcriptContainer}>
          <Text selectable>{result.int_full_transcript ?? "-"}</Text>
        </ScrollView>
      </List.Section>
    </View>
  );
};

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
