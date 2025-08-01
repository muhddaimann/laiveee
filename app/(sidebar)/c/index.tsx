import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  Button,
  Card,
  Text,
  useTheme,
  TextInput,
  ActivityIndicator,
  Avatar,
  RadioButton,
} from "react-native-paper";
import * as DocumentPicker from "expo-document-picker";

const mockAnalysis = {
  summary:
    "A highly motivated software engineer with 5 years of experience in full-stack development, specializing in React and Node.js. Proven track record of leading successful projects and delivering high-quality software.",
  strengths: ["Leadership", "React", "Node.js", "Agile Methodologies"],
  skills: ["JavaScript", "TypeScript", "Python", "Docker", "AWS"],
  jobMatch: "85%",
  suggestedQuestions: [
    "Describe a challenging project you led and how you ensured its success.",
    "How do you stay updated with the latest trends in front-end development?",
    "Can you explain your experience with cloud services like AWS?",
  ],
};

type PagePhase = "welcome" | "analyzing" | "report";

export default function RecruitScreen() {
  const theme = useTheme();
  const [phase, setPhase] = useState<PagePhase>("welcome");
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
      });

      if (result.canceled === false) {
        setFileName(result.assets[0].name);
        setPhase("analyzing");
        setTimeout(() => {
          setPhase("report");
        }, 3000);
      } else {
      }
    } catch (err) {
      console.error("Unknown error: ", err);
    }
  };

  const handleRestart = () => {
    setPhase("welcome");
    setFileName(null);
  };

  if (phase === "welcome") {
    return <WelcomeScreen onUpload={handleFileUpload} />;
  }

  if (phase === "analyzing") {
    return <AnalyzingScreen fileName={fileName} />;
  }

  if (phase === "report") {
    return <ReportScreen fileName={fileName} onRestart={handleRestart} />;
  }

  return null;
}

function WelcomeScreen({ onUpload }: { onUpload: () => void }) {
  const theme = useTheme();
  const [role, setRole] = useState("Customer Service");

  return (
    <View
      style={[
        styles.fullPage,
        styles.centered,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <Text style={[styles.welcomeTitle, { color: theme.colors.onBackground }]}>
        Prepare for Your Interview
      </Text>
      <Text
        style={[
          styles.welcomeSubtitle,
          { color: theme.colors.onSurfaceVariant },
        ]}
      >
        First, select your desired role and upload your resume. Our AI will help
        you refine it.
      </Text>
      <View style={styles.welcomeContainer}>
        <View style={styles.welcomeColumn}>
          <Card style={styles.welcomeCard}>
            <Card.Content>
              <Text style={styles.cardTitle}>Select Your Role</Text>
              <RadioButton.Group
                onValueChange={(newValue) => setRole(newValue)}
                value={role}
              >
                <RadioButton.Item
                  label="Executive - Customer Service"
                  value="Customer Service"
                />
                <RadioButton.Item
                  label="Executive - Technical Support"
                  value="Technical Support"
                />
                <RadioButton.Item
                  label="Executive - Sales Associate"
                  value="Sales Associate"
                />
              </RadioButton.Group>
            </Card.Content>
          </Card>
        </View>
        <View style={styles.welcomeColumn}>
          <Card style={[styles.welcomeCard, { alignItems: "center" }]}>
            <Card.Content style={styles.centered}>
              <Avatar.Icon
                icon="upload"
                size={80}
                style={{
                  backgroundColor: theme.colors.primary,
                  marginBottom: 24,
                }}
                color={theme.colors.onPrimary}
              />
              <Text style={styles.cardTitle}>Upload Your Resume</Text>
              <Text style={{ textAlign: "center", marginBottom: 16 }}>
                PDF or DOCX format
              </Text>
              <Button mode="contained" icon="upload" onPress={onUpload}>
                Choose File
              </Button>
            </Card.Content>
          </Card>
        </View>
      </View>
    </View>
  );
}

function AnalyzingScreen({ fileName }: { fileName: string | null }) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.fullPage,
        styles.centered,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text
        style={[styles.analyzingTitle, { color: theme.colors.onBackground }]}
      >
        Analyzing Your Resume...
      </Text>
      <Text style={{ color: theme.colors.onSurfaceVariant }}>
        {fileName || "Please wait"}
      </Text>
    </View>
  );
}

function ReportScreen({
  fileName,
  onRestart,
}: {
  fileName: string | null;
  onRestart: () => void;
}) {
  const theme = useTheme();
  const [summary, setSummary] = useState(mockAnalysis.summary);
  const [skills, setSkills] = useState(mockAnalysis.skills.join(", "));

  return (
    <ScrollView
      style={[styles.fullPage, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.reportContainer}>
        <Text
          style={[styles.reportTitle, { color: theme.colors.onBackground }]}
        >
          Review Your Profile
        </Text>
        <Text
          style={[
            styles.reportSubtitle,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          This is how your resume will be presented. Feel free to make edits.
        </Text>

        <View style={styles.reportBody}>
          <View style={styles.reportColumn}>
            <Card style={styles.reportCard}>
              <Card.Content>
                <Text style={styles.cardTitle}>Your AI-Generated Summary</Text>
                <TextInput
                  mode="outlined"
                  value={summary}
                  onChangeText={setSummary}
                  multiline
                  numberOfLines={10}
                />
              </Card.Content>
            </Card>

            <Card style={styles.reportCard}>
              <Card.Content>
                <Text style={styles.cardTitle}>Your Skills</Text>
                <TextInput
                  mode="outlined"
                  label="Separate skills with a comma"
                  value={skills}
                  onChangeText={setSkills}
                  multiline
                  numberOfLines={4}
                />
              </Card.Content>
            </Card>
          </View>

          <View style={styles.reportColumn}>
            <Card style={styles.reportCard}>
              <Card.Content>
                <Text style={styles.cardTitle}>
                  Potential Interview Questions
                </Text>
                {mockAnalysis.suggestedQuestions.map((q, i) => (
                  <Text key={i} style={styles.questionText}>
                    - {q}
                  </Text>
                ))}
              </Card.Content>
            </Card>

            <Card style={styles.reportCard}>
              <Card.Content>
                <Text style={styles.cardTitle}>Strengths</Text>
                <View style={styles.chipContainer}>
                  {mockAnalysis.strengths.map((s) => (
                    <Chip key={s} icon="check">
                      {s}
                    </Chip>
                  ))}
                </View>
              </Card.Content>
            </Card>
          </View>
        </View>

        <Button mode="contained" icon="arrow-right" style={styles.actionButton}>
          Start Pre-Screen Interview
        </Button>
        <Button
          mode="outlined"
          icon="reload"
          onPress={onRestart}
          style={styles.actionButton}
        >
          Start Over
        </Button>
      </View>
    </ScrollView>
  );
}

const Chip = ({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon?: string;
}) => {
  const theme = useTheme();
  return (
    <View
      style={[styles.chip, { backgroundColor: theme.colors.primaryContainer }]}
    >
      {icon && (
        <Avatar.Icon
          size={24}
          icon={icon}
          color={theme.colors.onPrimaryContainer}
          style={{ backgroundColor: "transparent" }}
        />
      )}
      <Text style={{ color: theme.colors.onPrimaryContainer }}>{children}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  fullPage: { flex: 1 },
  centered: { justifyContent: "center", alignItems: "center", padding: 24 },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  welcomeSubtitle: {
    fontSize: 16,
    textAlign: "center",
    maxWidth: 500,
    marginBottom: 24,
  },
  welcomeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    maxWidth: 800,
  },
  welcomeColumn: { flex: 1, minWidth: 300, padding: 8 },
  welcomeCard: { flex: 1 },
  uploadButton: { paddingVertical: 8 },
  analyzingTitle: { fontSize: 20, fontWeight: "600", marginTop: 20 },
  reportContainer: { padding: 24 },
  reportTitle: { fontSize: 28, fontWeight: "bold" },
  reportSubtitle: { fontSize: 16, color: "gray", marginBottom: 24 },
  reportBody: { flexDirection: "row", flexWrap: "wrap" },
  reportColumn: { flex: 1, minWidth: 300, padding: 8 },
  reportCard: { marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  chipContainer: { flexDirection: "row", flexWrap: "wrap", marginBottom: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    margin: 4,
  },
  questionText: { marginVertical: 4 },
  actionButton: { marginTop: 16 },
});
