import React, { useState, useCallback } from "react";
import { View, StyleSheet, ScrollView, Image, Alert } from "react-native";
import {
  Button,
  Card,
  Text,
  useTheme,
  TextInput,
  ActivityIndicator,
  RadioButton,
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
type LanguagePref = "English" | "Bahasa Malaysia" | "Mandarin" | "Tamil";

export default function LaiveApply() {
  return (
    <ResumeProvider>
      <ResumeAnalysisFlow />
    </ResumeProvider>
  );
}

function ResumeAnalysisFlow() {
  const [phase, setPhase] = useState<PagePhase>("welcome");
  const [fileName, setFileName] = useState<string | null>(null);
  const [shortName, setShortName] = useState("");
  const [roleApply, setRoleApply] = useState("Customer Service Agent");
  const [languagePref, setLanguagePref] = useState<LanguagePref>("English");
  const { setResumeData } = useResumeContext();

  const handleFileUpload = async () => {
    if (!shortName.trim() || !roleApply.trim()) {
      Alert.alert(
        "Missing Information",
        "Please enter your name and the role you are applying for."
      );
      return;
    }
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
      });

      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setFileName(asset.name);
        setPhase("analyzing");

        const response = await fetch(asset.uri);
        const blob = await response.blob();
        const file = new File([blob], asset.name, { type: asset.mimeType });

        const text = await extractText(file);
        const config = createResumeAnalyzerConfig();
        const apiResponse = await fetch(COMPLETION_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4-turbo",
            messages: [
              { role: "system", content: config.instructions },
              { role: "user", content: text },
            ],
            response_format: { type: "json_object" },
          }),
        });

        if (!apiResponse.ok) {
          const errorBody = await apiResponse.text();
          throw new Error(`API Error: ${apiResponse.status} - ${errorBody}`);
        }

        const apiResult = await apiResponse.json();
        const parsedData = JSON.parse(apiResult.choices[0].message.content);
        setResumeData(parsedData);
        setPhase("report");
      }
    } catch (err) {
      console.error("Error during file upload and analysis: ", err);
      Alert.alert(
        "Error",
        "An error occurred during the analysis. Please try again."
      );
      setPhase("welcome");
    }
  };

  const handleRestart = () => {
    setPhase("welcome");
    setFileName(null);
    setShortName("");
    setRoleApply("Customer Service Agent");
    setResumeData(null);
  };

  if (phase === "welcome") {
    return (
      <WelcomeScreen
        onUpload={handleFileUpload}
        shortName={shortName}
        setShortName={setShortName}
        roleApply={roleApply}
        setRoleApply={setRoleApply}
      />
    );
  }

  if (phase === "analyzing") {
    return <AnalyzingScreen fileName={fileName} />;
  }

  if (phase === "report") {
    return (
      <ReportScreen
        onRestart={handleRestart}
        languagePref={languagePref}
        setLanguagePref={setLanguagePref}
        roleApply={roleApply}
        shortName={shortName}
      />
    );
  }

  return null;
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

function WelcomeScreen({
  onUpload,
  shortName,
  setShortName,
  roleApply,
  setRoleApply,
}: {
  onUpload: () => void;
  shortName: string;
  setShortName: (name: string) => void;
  roleApply: string;
  setRoleApply: (role: string) => void;
}) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.fullPage,
        styles.centered,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <View style={styles.welcomeLayout}>
        <View style={styles.welcomeBranding}>
          <Image
            source={require("../../../assets/ta1.png")}
            style={styles.welcomeImage}
          />
          <Text
            style={[styles.welcomeTitle, { color: theme.colors.onBackground }]}
          >
            Welcome to LaiveApply
          </Text>
          <Text
            style={[
              styles.welcomeSubtitle,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            Your personal AI-powered interview preparation assistant. Let's get
            your resume ready.
          </Text>
        </View>
        <ScrollView style={styles.welcomeForm}>
          <Card
            style={[
              styles.welcomeCard,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Card.Content>
              <Text style={styles.cardTitle}>What should we call you?</Text>
              <TextInput
                label="Your short name"
                value={shortName}
                onChangeText={setShortName}
                mode="outlined"
              />
            </Card.Content>
          </Card>

          <Card
            style={[
              styles.welcomeCard,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Card.Content>
              <Text style={styles.cardTitle}>
                What role are you looking for?
              </Text>
              <RadioButton.Group
                onValueChange={(newValue) => setRoleApply(newValue as string)}
                value={roleApply}
              >
                <RadioButton.Item
                  label="Customer Service Agent"
                  value="Customer Service Agent"
                />
              </RadioButton.Group>
            </Card.Content>
          </Card>

          <Card
            style={[
              styles.welcomeCard,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Card.Content>
              <Text style={styles.cardTitle}>Upload Your Resume</Text>
              <Text style={{ marginBottom: 16, textAlign: "center" }}>
                PDF or DOCX format
              </Text>
              <Button mode="contained" icon="upload" onPress={onUpload}>
                Choose File
              </Button>
            </Card.Content>
          </Card>
        </ScrollView>
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
  onRestart,
  languagePref,
  setLanguagePref,
  roleApply,
  shortName,
}: {
  onRestart: () => void;
  languagePref: LanguagePref;
  setLanguagePref: (language: LanguagePref) => void;
  roleApply: string;
  shortName: string;
}) {
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
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 16 }}>Loading report...</Text>
      </View>
    );
  }

  const [summary, setSummary] = useState(resumeData.professionalSummary);
  const [fullName, setFullName] = useState(resumeData.fullName);
  const [relatedLink, setRelatedLink] = useState(
    resumeData.relatedLinks.join(", ")
  );
  const [candidateEmail, setCandidateEmail] = useState(
    resumeData.candidateEmail
  );
  const [candidatePhone, setCandidatePhone] = useState(
    resumeData.candidatePhone
  );

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
              Hi {shortName},
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
                  value={fullName}
                  onChangeText={setFullName}
                  style={{ marginBottom: 16 }}
                />
                <TextInput
                  label="Related Link (Social Media, Website, etc)"
                  value={relatedLink}
                  onChangeText={setRelatedLink}
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
                  value={summary}
                  onChangeText={setSummary}
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
                    {roleApply}
                  </Text>
                </View>
                <PercentageCircle percentage={resumeData.jobMatch} />
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
                  value={candidateEmail}
                  onChangeText={setCandidateEmail}
                  style={{ marginBottom: 16 }}
                />
                <TextInput
                  label="Phone Number"
                  value={candidatePhone}
                  onChangeText={setCandidatePhone}
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
                <Text style={styles.cardTitle}>Interview Language</Text>
                <RadioButton.Group
                  onValueChange={(newValue) =>
                    setLanguagePref(newValue as LanguagePref)
                  }
                  value={languagePref}
                >
                  <RadioButton.Item label="English" value="English" />
                  <RadioButton.Item
                    label="Bahasa Malaysia"
                    value="Bahasa Malaysia"
                  />
                  <RadioButton.Item label="Mandarin" value="Mandarin" />
                  <RadioButton.Item label="Tamil" value="Tamil" />
                </RadioButton.Group>
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
            Start Pre-Screen Interview
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
  fullPage: { flex: 1 },
  centered: { justifyContent: "center", alignItems: "center", padding: 24 },
  welcomeLayout: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    maxWidth: 1000,
    alignItems: "center",
  },
  welcomeBranding: {
    flex: 1,
    minWidth: 400,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  welcomeForm: { flex: 1, minWidth: 400, padding: 24 },
  welcomeImage: { width: 200, height: 200, borderRadius: 75, marginBottom: 24 },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  welcomeSubtitle: {
    fontSize: 18,
    textAlign: "center",
    maxWidth: 500,
  },
  welcomeCard: { width: "100%", marginBottom: 16 },
  analyzingTitle: { fontSize: 20, fontWeight: "600", marginTop: 20 },
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
