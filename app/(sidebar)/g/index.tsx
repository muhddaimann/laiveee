import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import {
  useTheme,
  Button,
  Avatar,
  Card,
  TextInput,
  Chip as PaperChip,
} from "react-native-paper";
import * as DocumentPicker from "expo-document-picker";
import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.js";
import pdfjsWorker from "pdfjs-dist/legacy/build/pdf.worker.entry";
import {
  ResumeProvider,
  useResumeContext,
} from "../../../contexts/resumeContext";
import { createResumeAnalyzerConfig } from "../../../utils/resumeAnalyzerConfig";
import { OPENAI_API_KEY, COMPLETION_URL } from "../../../constants/env";

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
      const response = await fetch(COMPLETION_URL, {
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
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error("API Error Response:", errorBody);
        throw new Error(`The server returned an error: ${response.status}.`);
      }

      const result = await response.json();

      if (!result.choices?.[0]?.message?.content) {
        console.error("Invalid AI Response:", JSON.stringify(result, null, 2));
        throw new Error("The AI returned an unexpected response format.");
      }
      
      const parsedData = JSON.parse(result.choices[0].message.content);
      setResumeData(parsedData);
      setPhase("report");
    } catch (error) {
      console.error("Error analyzing resume:", error);
      const errorMessage = error instanceof Error ? error.message : "Please try again.";
      Alert.alert("Analysis Failed", errorMessage);
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
    <View
      style={[
        styles.fullPage,
        { backgroundColor: theme.colors.background, justifyContent: "center" },
      ]}
    >
      <View style={styles.reportContainer}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
            gap: 32,
          }}
        >
          <Image
            source={require("../../../assets/ta1.png")}
            style={{ width: 120, height: 120, marginRight: 16 }}
          />
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.reportTitle,
                { color: theme.colors.onBackground, textAlign: "left" },
              ]}
            >
              Hi {resumeData.fullName.split(" ")[0]},
            </Text>
            <Text
              style={[
                styles.reportSubtitle,
                { color: theme.colors.onSurfaceVariant, textAlign: "left" },
              ]}
            >
              Please review your AI-generated profile and confirm your contact
              details below.
            </Text>
          </View>
        </View>

        <View style={styles.reportBody}>
          <View style={styles.reportColumn}>
            <Card
              style={[
                styles.reportCard,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <Card.Content>
                <Text style={styles.cardTitle}>Candidate Details</Text>
                <TextInput
                  label="Full Name"
                  value={resumeData.fullName}
                  style={{ marginBottom: 16 }}
                />
                <TextInput
                  label="Related Link (Social Media, Website, etc)"
                  value={resumeData.relatedLinks.join(", ")}
                />
              </Card.Content>
            </Card>
            <Card
              style={[
                styles.reportCard,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <Card.Content>
                <Text style={styles.cardTitle}>Your AI-Generated Summary</Text>
                <TextInput
                  mode="outlined"
                  value={resumeData.professionalSummary}
                  multiline
                  numberOfLines={6}
                />
              </Card.Content>
            </Card>

            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  marginBottom: 12,
                  color: theme.colors.onSurface,
                  textAlign: "left",
                }}
              >
                Strengths
              </Text>
              <View style={styles.chipContainer}>
                {resumeData.strengths.map((s, index) => (
                  <PaperChip
                    key={index}
                    icon="check"
                    style={{ marginRight: 8, marginBottom: 8 }}
                    mode="outlined"
                    elevated
                  >
                    {s.short}
                  </PaperChip>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.reportColumn}>
            <Card
              style={[
                styles.reportCard,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <Card.Content
                style={{ flexDirection: "row", alignItems: "center" }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "bold",
                      color: theme.colors.onSurface,
                      marginBottom: 4,
                    }}
                  >
                    Role Fit Percentage
                  </Text>
                  <Text style={{ color: theme.colors.onSurfaceVariant }}>
                    Customer Service Agent
                  </Text>
                </View>
                <PercentageCircle percentage={`${resumeData.jobMatch}%`} />
              </Card.Content>
            </Card>
            <Card
              style={[
                styles.reportCard,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <Card.Content>
                <Text style={styles.cardTitle}>Contact Information</Text>
                <TextInput
                  label="Email Address"
                  value={resumeData.candidateEmail}
                  style={{ marginBottom: 16 }}
                />
                <TextInput
                  label="Phone Number"
                  value={resumeData.candidatePhone}
                />
              </Card.Content>
            </Card>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            icon="reload"
            onPress={onRestart}
            style={styles.actionButton}
          >
            Start Over
          </Button>
          <Button
            mode="contained"
            icon="arrow-right"
            style={styles.actionButton}
          >
            Analyze Another
          </Button>
        </View>
      </View>
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
    <View
      style={{
        width: size,
        height: size,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          stroke={theme.colors.surfaceVariant}
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
      <Text
        style={{
          position: "absolute",
          fontSize: 24,
          fontWeight: "bold",
          color: theme.colors.primary,
        }}
      >
        {percentage}
      </Text>
    </View>
  );
};

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
    flex: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  reportTitle: { fontSize: 28, fontWeight: "bold", marginBottom: 8 },
  reportSubtitle: {
    fontSize: 16,
    color: "gray",
    marginBottom: 24,
    textAlign: "center",
  },
  reportBody: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    maxWidth: 1200,
  },
  reportColumn: { flex: 1, minWidth: 400, padding: 8 },
  reportCard: { marginBottom: 16 },
  roleFitCardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  roleFitTextContainer: { flex: 1, paddingRight: 16 },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  chipContainer: { flexDirection: "row", flexWrap: "wrap", marginBottom: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    margin: 4,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    marginTop: 16,
  },
  actionButton: { marginHorizontal: 8, flex: 1, maxWidth: 300 },
});
