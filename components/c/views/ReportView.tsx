import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  Button,
  Card,
  Text,
  useTheme,
  Divider,
  List,
} from "react-native-paper";
import { Candidate, CandidateRecord } from "../../../contexts/api/candidate";
import EmptyStateCard from "../EmptyStateCard";
import { useStatus } from "../../../hooks/useStatus";

function StatusPill({ status }: { status: Candidate['Status'] }) {
  const { backgroundColor, color } = useStatus(status);
  return (
    <View style={[styles.pill, { backgroundColor }]}>
      <Text style={[styles.pillText, { color }]}>{status}</Text>
    </View>
  );
}

function ReportView({
  candidate,
  candidateData,
  onBack,
}: {
  candidate: Candidate;
  candidateData: CandidateRecord;
  onBack: () => void;
}) {
  const theme = useTheme();

  const InfoRow = ({ label, value }: { label: string; value: any }) => (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: theme.colors.onSurface }]}>
        {label}
      </Text>
      <Text
        style={[styles.infoValue, { color: theme.colors.onSurfaceVariant }]}
      >
        {value || "N/A"}
      </Text>
    </View>
  );

  // If no detailed record is found, show a partial view that mimics the full report layout.
  if (!candidateData || !candidateData.id) {
    return (
      <View style={{ flex: 1 }}>
        <View
          style={{ paddingRight: 16, paddingBottom: 16, alignSelf: "flex-end" }}
        >
          <Button icon="arrow-left" onPress={onBack}>
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
                <Text style={styles.reportTitle}>{candidate.FullName}</Text>
                <Text style={styles.reportSubtitle}>
                  {candidate.Role} #{candidate.ID}
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
                <Text
                  style={[styles.score, { color: theme.colors.onSurfaceDisabled }]}
                >
                  N/A
                </Text>
                <Text style={styles.justification}>Awaiting resume analysis</Text>
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
                <Text
                  style={[styles.score, { color: theme.colors.onSurfaceDisabled }]}
                >
                  N/A
                </Text>
                <Text style={styles.justification}>
                  Awaiting interview completion
                </Text>
              </Card.Content>
            </Card>
          </View>

        <View style={{ justifyContent: 'center', alignItems: 'center', height: 600 }}>
            <EmptyStateCard
              icon="file-question-outline"
              title=""
              message="The full report is not yet available."
              suggestion={`The report will be generated after they complete the assessment.`}
            />
          </View>
        </ScrollView>
      </View>
    );
  }

  const {
    id,
    ra_full_name,
    ra_current_role,
    ra_rolefit_score,
    ra_rolefit_reason,
    int_average_score,
    int_summary,
    ra_professional_summary,
    ra_candidate_email,
    ra_candidate_phone,
    ra_related_links,
    ra_highest_education,
    ra_strengths,
    ra_skill_match,
    ra_experience_match,
    ra_concern_areas,
    int_scores_json,
    int_knockouts,
  } = candidateData;
  const parseJsonString = (jsonString: any, defaultValue: any = []) => {
    if (typeof jsonString === "object" && jsonString !== null)
      return jsonString;
    if (typeof jsonString === "string") {
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
    if (typeof links === "string") {
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

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{ paddingRight: 16, paddingBottom: 16, alignSelf: "flex-end" }}
      >
        <Button icon="arrow-left" onPress={onBack}>
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
              <Text style={styles.justification}>{ra_rolefit_reason}</Text>
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
                {Number(int_average_score ?? 0).toFixed(1)} / 5.0
              </Text>
              <Text style={styles.justification}>{int_summary}</Text>
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
              <Text style={styles.summaryText}>{ra_professional_summary}</Text>
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
              <InfoRow
                label="Links"
                value={getDisplayableLinks(ra_related_links)}
              />
              <Divider style={{ marginVertical: 8 }} />
              <InfoRow label="Education" value={ra_highest_education} />
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
                        description={value.pass ? "Pass" : "Fail"}
                        descriptionStyle={{
                          color: value.pass ? "green" : "red",
                        }}
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

const styles = StyleSheet.create({
  reportContainer: { paddingHorizontal: 16 },
  row: { flexDirection: "row", gap: 16, marginBottom: 16 },
  card: { borderRadius: 12 },
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  reportTitle: { fontSize: 24, fontWeight: "bold" },
  reportSubtitle: { fontSize: 16, color: "gray" },
  cardTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
  score: { fontSize: 28, fontWeight: "bold" },
  justification: { fontSize: 14, color: "gray", marginTop: 8 },
  summaryText: { fontSize: 14, lineHeight: 20 },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  infoLabel: { fontWeight: "bold" },
  infoValue: { color: "gray" },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  summaryLabel: { fontSize: 16 },
  summaryValue: { fontSize: 16, fontWeight: "bold" },
  pill: {
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  pillText: {
    fontSize: 12,
    fontWeight: "500",
    textTransform: "capitalize",
  },
});

export default ReportView;
