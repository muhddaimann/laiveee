import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { useTheme, Button, Avatar, Card, List } from "react-native-paper";
import * as DocumentPicker from "expo-document-picker";
import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.js";
import pdfjsWorker from "pdfjs-dist/legacy/build/pdf.worker.entry";
import {
  ResumeProvider,
  useResumeContext,
} from "../../../contexts/resumeContext";
import { createResumeAnalyzerConfig } from "../../../utils/resumeAnalyzerConfig";
import { OPENAI_API_KEY } from "../../../constants/env";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

type PagePhase = "welcome" | "analyzing" | "report";

export default function LaiveUpload() {
  return (
    <ResumeProvider>
      <ResumeAnalysisFlow />
    </ResumeProvider>
  );
}

function ResumeAnalysisFlow() {
  const [phase, setPhase] = useState<PagePhase>("welcome");
  const { setResumeData, resumeData } = useResumeContext();

  const handleStartAnalysis = async (file: File) => {
    setPhase("analyzing");
    try {
      const text = await extractText(file);
      const config = createResumeAnalyzerConfig();
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4-turbo",
            messages: [
              {
                role: "system",
                content: config.instructions,
              },
              {
                role: "user",
                content: text,
              },
            ],
            response_format: { type: "json_object" },
          }),
        }
      );

      const result = await response.json();
      const parsedData = JSON.parse(result.choices[0].message.content);
      setResumeData(parsedData);
      setPhase("report");
    } catch (error) {
      console.error("Error analyzing resume:", error);
      Alert.alert("Error", "Failed to analyze the resume. Please try again.");
      setPhase("welcome");
    }
  };

  const handleRestart = () => {
    setResumeData(null);
    setPhase("welcome");
  };

  switch (phase) {
    case "welcome":
      return <WelcomeScreen onStart={handleStartAnalysis} />;
    case "analyzing":
      return <AnalyzingScreen />;
    case "report":
      return <ReportScreen onRestart={handleRestart} />;
    default:
      return <WelcomeScreen onStart={handleStartAnalysis} />;
  }
}

async function extractText(file: File): Promise<string> {
  if (file.type === "application/pdf") {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item: any) => item.str).join(" ") + "\n";
    }

    return text;
  } else if (
    file.type ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } else {
    throw new Error("Unsupported file type");
  }
}

function WelcomeScreen({ onStart }: { onStart: (file: File) => void }) {
  const theme = useTheme();

  const handlePickDocument = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
      });
      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset.uri) {
          const response = await fetch(asset.uri);
          const blob = await response.blob();
          const file = new File([blob], asset.name, { type: asset.mimeType });
          onStart(file);
        }
      }
    } catch (err) {
      console.error("Error picking document:", err);
      Alert.alert("Error", "Failed to pick the document.");
    }
  }, [onStart]);

  return (
    <View
      style={[
        styles.fullPage,
        styles.centered,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <View style={styles.welcomeBranding}>
        <Avatar.Icon
          icon="file-upload-outline"
          size={100}
          style={{ backgroundColor: theme.colors.primary, marginBottom: 24 }}
          color={theme.colors.onPrimary}
        />
        <Text
          style={[styles.welcomeTitle, { color: theme.colors.onBackground }]}
        >
          LaiveUpload
        </Text>
        <Text
          style={[
            styles.welcomeSubtitle,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          Upload a resume to get AI-powered insights for the Customer Service
          Agent role.
        </Text>
      </View>
      <View style={styles.welcomeForm}>
        <Button
          mode="contained"
          icon="upload"
          onPress={handlePickDocument}
          style={styles.startButton}
          contentStyle={styles.startButtonContent}
        >
          Select Resume (.pdf, .docx)
        </Button>
      </View>
    </View>
  );
}

function AnalyzingScreen() {
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
        Analyzing Resume...
      </Text>
      <Text style={{ color: theme.colors.onSurfaceVariant }}>
        This may take a moment.
      </Text>
    </View>
  );
}

function ReportScreen({ onRestart }: { onRestart: () => void }) {
  const theme = useTheme();
  const { resumeData } = useResumeContext();

  if (!resumeData) {
    return (
      <View
        style={[
          styles.fullPage,
          styles.centered,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Text>No report to display.</Text>
        <Button onPress={onRestart}>Start Over</Button>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.fullPage, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.reportContainer}
    >
      <Card style={styles.reportCard}>
        <Card.Title
          title={resumeData.fullName}
          subtitle="Resume Analysis Report"
          left={(props) => <Avatar.Icon {...props} icon="account" />}
        />
        <Card.Content>
          <List.Section>
            <List.Subheader>Contact Information</List.Subheader>
            <List.Item
              title="Email"
              description={resumeData.candidateEmail}
              left={() => <List.Icon icon="email" />}
            />
            <List.Item
              title="Phone"
              description={resumeData.candidatePhone}
              left={() => <List.Icon icon="phone" />}
            />
          </List.Section>
          <List.Section>
            <List.Subheader>Professional Summary</List.Subheader>
            <Text style={styles.summaryText}>
              {resumeData.professionalSummary}
            </Text>
          </List.Section>
          <List.Section>
            <List.Subheader>Analysis</List.Subheader>
            <List.Item
              title="Job Match Score"
              description={`${resumeData.jobMatch}/100`}
              left={() => <List.Icon icon="star-circle" />}
            />
            <List.Item
              title="Strengths (Long)"
              description={resumeData.longStrength}
              left={() => <List.Icon icon="text-long" />}
            />
            <List.Item
              title="Strengths (Short)"
              description={resumeData.shortStrength}
              left={() => <List.Icon icon="text-short" />}
            />
          </List.Section>
          <List.Section>
            <List.Subheader>Related Links</List.Subheader>
            {resumeData.relatedLinks.map((link, index) => (
              <List.Item
                key={index}
                title={link}
                left={() => <List.Icon icon="link" />}
              />
            ))}
          </List.Section>
        </Card.Content>
        <Card.Actions>
          <Button onPress={onRestart}>Analyze Another</Button>
        </Card.Actions>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fullPage: { flex: 1, width: "100%" },
  centered: { justifyContent: "center", alignItems: "center", padding: 24 },
  welcomeBranding: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingRight: 24,
  },
  welcomeForm: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 24,
  },
  welcomeTitle: {
    fontSize: 36,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  welcomeSubtitle: {
    fontSize: 18,
    textAlign: "center",
    maxWidth: 400,
  },
  startButton: { marginTop: 16, width: "100%" },
  startButtonContent: { paddingVertical: 8, flexDirection: "row-reverse" },
  analyzingTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 20,
  },
  reportContainer: {
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  reportCard: {
    width: "100%",
    maxWidth: 800,
  },
  summaryText: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    lineHeight: 22,
  },
});
