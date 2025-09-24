import React, { useState, useMemo } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  Text,
  useTheme,
  Card,
  TextInput,
  Divider,
  List,
} from "react-native-paper";
import Header from "../../../components/layout/header";
import {
  createCandidateAnalyzerConfig,
  createInterviewConfig,
} from "../../../utils/bConfig";
import { CandidateData } from "../../../contexts/bContext";

const initialCandidateData: CandidateData = {
  fullName: "John Doe",
  candidateEmail: "john.doe@example.com",
  candidatePhone: "123-456-7890",
  relatedLink: ["linkedin.com/in/johndoe"],
  highestEducation: "B.Sc. in Computer Science",
  certsRelate: ["Certified Tech Support Specialist"],
  currentRole: "IT Support Intern",
  yearExperience: 1,
  professionalSummary:
    "A motivated and detail-oriented IT Support Intern with a passion for helping others and solving technical problems. Eager to apply my skills in a dynamic customer service environment.",
  skillMatch: [
    { name: "Troubleshooting", justification: "Experience in IT support" },
  ],
  experienceMatch: [
    { area: "Customer Interaction", justification: "Handled user tickets" },
  ],
  concernArea: ["Limited direct customer service experience"],
  strengths: [
    { trait: "Problem-Solving", justification: "Resolved technical issues" },
  ],
  roleFit: {
    roleScore: 8,
    justification: "Strong technical skills and a customer-focused attitude.",
  },
};

export default function LaiveConfigure() {
  const theme = useTheme();
  const [role, setRole] = useState("Customer Service Agent");
  const [language, setLanguage] = useState("English");
  const [candidateData, setCandidateData] = useState(
    JSON.stringify(initialCandidateData, null, 2)
  );

  const analyzerConfig = useMemo(
    () => createCandidateAnalyzerConfig(role),
    [role]
  );
  const interviewConfig = useMemo(() => {
    try {
      const parsedData = JSON.parse(candidateData);
      return createInterviewConfig(role, language, parsedData);
    } catch (e) {
      return {
        instructions: "Error: Invalid CandidateData JSON",
        tool: { name: "error", description: "Invalid JSON", parameters: {} },
      };
    }
  }, [role, language, candidateData]);

  return (
    <View style={{ flex: 1 }}>
      <Header title="LaiveConfigure" showBack={true} />
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <ScrollView style={styles.left}>
          <Card
            style={[styles.card, { backgroundColor: theme.colors.surface }]}
          >
            <Card.Content>
              <Text style={styles.cardTitle}>Analyzer Configuration</Text>
              <TextInput
                label="Role"
                value={role}
                onChangeText={setRole}
                mode="outlined"
                style={styles.input}
              />
              <Text style={styles.codeBlock}>
                {analyzerConfig.instructions}
              </Text>
            </Card.Content>
          </Card>

          <Card
            style={[styles.card, { backgroundColor: theme.colors.surface }]}
          >
            <Card.Content>
              <Text style={styles.cardTitle}>Interview Configuration</Text>
              <TextInput
                label="Language"
                value={language}
                onChangeText={setLanguage}
                mode="outlined"
                style={styles.input}
              />
              <TextInput
                label="Candidate Data (JSON)"
                value={candidateData}
                onChangeText={setCandidateData}
                mode="outlined"
                multiline
                numberOfLines={10}
                style={styles.input}
              />
              <Text style={styles.codeBlock}>
                {interviewConfig.instructions}
              </Text>
            </Card.Content>
          </Card>
        </ScrollView>
        <View style={styles.right}>
          <ConfigOverview
            analyzerConfig={analyzerConfig}
            interviewConfig={interviewConfig}
          />
        </View>
      </View>
    </View>
  );
}

function ConfigOverview({ analyzerConfig, interviewConfig }: any) {
  const theme = useTheme();
  const analyzerReturns = [
    "fullName",
    "candidateEmail",
    "candidatePhone",
    "relatedLink",
    "highestEducation",
    "certsRelate",
    "currentRole",
    "yearExperience",
    "professionalSummary",
    "skillMatch",
    "experienceMatch",
    "concernArea",
    "strengths",
    "roleFit",
  ];

  const interviewToolParams = interviewConfig.tool.parameters.properties
    ? Object.keys(interviewConfig.tool.parameters.properties)
    : [];

  return (
    <Card style={{ flex: 1, backgroundColor: theme.colors.surface }}>
      <Card.Content>
        <Text style={styles.cardTitle}>Configuration Overview</Text>
        <Text style={styles.overviewSubtitle}>
          A summary of what the configured prompts and tools will return.
        </Text>
        <Divider style={styles.divider} />

        <List.Section>
          <List.Accordion
            title="Candidate Analyzer"
            left={(props) => <List.Icon {...props} icon="account-search" />}
          >
            {analyzerReturns.map((item, index) => (
              <List.Item
                key={index}
                title={item}
                left={(props) => <List.Icon {...props} icon="code-braces" />}
              />
            ))}
          </List.Accordion>
          <List.Accordion
            title="Interview Scorer"
            left={(props) => <List.Icon {...props} icon="clipboard-check" />}
          >
            {interviewToolParams.map((item: string, index: number) => (
              <List.Item
                key={index}
                title={item}
                left={(props) => <List.Icon {...props} icon="cogs" />}
              />
            ))}
          </List.Accordion>
        </List.Section>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: "row", padding: 24, gap: 16 },
  left: { flex: 2 },
  right: { flex: 1 },
  card: { marginBottom: 16, borderRadius: 12 },
  cardTitle: { fontSize: 18, fontWeight: "600", marginBottom: 12 },
  input: { marginBottom: 12 },
  codeBlock: {
    fontFamily: "monospace",
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 8,
    color: "#333",
    fontSize: 12,
  },
  overviewSubtitle: {
    fontSize: 14,
    color: "gray",
    marginBottom: 12,
  },
  divider: {
    marginVertical: 12,
  },
});
