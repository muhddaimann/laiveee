import React, { useEffect, useRef, useCallback, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { RealtimeClient } from "@openai/realtime-api-beta";
import { ItemType } from "@openai/realtime-api-beta/dist/lib/client.js";
import { WavRecorder, WavStreamPlayer } from "../../../lib/wavtools/index.js";
import { WavRenderer } from "../../../utils/wavRenderer";
import * as DocumentPicker from "expo-document-picker";

import {
  useTheme,
  Button,
  TextInput,
  Avatar,
  Card,
  List,
  RadioButton,
} from "react-native-paper";
import { OPENAI_API_KEY, LOCAL_RELAY_SERVER_URL } from "../../../constants/env";
import {
  InterviewProvider,
  useInterviewContext,
} from "../../../contexts/interviewContext";
import { createInterviewConfig } from "../../../utils/interviewConfig";
import { UsageData } from "../../../utils/costEstimator";

const mockAnalysis = {
  summary:
    "A highly motivated software engineer with 5 years of experience in full-stack development, specializing in React and Node.js. Proven track record of leading successful projects and delivering high-quality software.",
  strengths: ["Leadership", "React", "Node.js", "Agile Methodologies"],
  skills: ["JavaScript", "TypeScript", "Python", "Docker", "AWS"],
  suggestedQuestions: [
    "Describe a challenging project you led and how you ensured its success.",
    "How do you stay updated with the latest trends in front-end development?",
    "Can you explain your experience with cloud services like AWS?",
  ],
};

type PagePhase =
  | "welcome"
  | "analyzingResume"
  | "resumeReport"
  | "preparation"
  | "interview"
  | "analyzingInterview"
  | "thankYou";

const languageOptions = ["English", "Malay", "Mandarin"] as const;

type Language = (typeof languageOptions)[number];

export default function LaiveApply() {
  return (
    <InterviewProvider>
      <ApplyFlow />
    </InterviewProvider>
  );
}

function ApplyFlow() {
  const [phase, setPhase] = useState<PagePhase>("welcome");
  const [name, setName] = useState("");
  const [role, setRole] = useState("Customer Service");
  const [fileName, setFileName] = useState<string | null>(null);
  const { setScores, language, setLanguage, setUsage } = useInterviewContext();

  const handleWelcomeSubmit = (
    submittedName: string,
    submittedRole: string,
    submittedFile: string
  ) => {
    setName(submittedName);
    setRole(submittedRole);
    setFileName(submittedFile);
    setPhase("analyzingResume");
    setTimeout(() => setPhase("resumeReport"), 2000);
  };

  const handleProceedToInterview = () => {
    setPhase("preparation");
  };

  const handleStartInterview = () => {
    setPhase("interview");
  };

  const handleEndInterview = useCallback(() => {
    setPhase("analyzingInterview");
    setTimeout(() => {
      setPhase("thankYou");
    }, 4000);
  }, []);

  const handleRestart = () => {
    setName("");
    setRole("Customer Service");
    setFileName(null);
    setScores(null);
    setLanguage("English");
    setUsage(null);
    setPhase("welcome");
  };

  switch (phase) {
    case "welcome":
      return <WelcomeScreen onSubmit={handleWelcomeSubmit} />;
    case "analyzingResume":
      return <AnalyzingScreen text="Analyzing Your Resume..." />;
    case "resumeReport":
      return <ResumeReportScreen onProceed={handleProceedToInterview} />;
    case "preparation":
      return (
        <PreparationScreen
          onProceed={handleStartInterview}
          onBack={() => setPhase("resumeReport")}
        />
      );
    case "interview":
      return (
        <InterviewScreen
          onEndRequest={handleEndInterview}
          name={name}
          language={language}
        />
      );
    case "analyzingInterview":
      return <AnalyzingScreen text="Analyzing Your Interview..." />;
    case "thankYou":
      return <ThankYouScreen onRestart={handleRestart} />;
    default:
      return <WelcomeScreen onSubmit={handleWelcomeSubmit} />;
  }
}

function WelcomeScreen({
  onSubmit,
}: {
  onSubmit: (name: string, role: string, fileName: string) => void;
}) {
  const theme = useTheme();
  const [name, setName] = useState("");
  const [role, setRole] = useState("Customer Service");
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(
    null
  );

  const handleFileUpload = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
    });
    if (result.canceled === false) {
      setFile(result.assets[0]);
    }
  };

  const canSubmit = name.trim() && role && file;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={styles.centered}>
        <Text
          style={[styles.welcomeTitle, { color: theme.colors.onBackground }]}
        >
          Start Your Application
        </Text>
        <Text
          style={[
            styles.welcomeSubtitle,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          Let's get to know you. Please provide your name, the role you're
          applying for, and your latest resume.
        </Text>
        <Card
          style={[
            styles.welcomeCard,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <Card.Content>
            <TextInput
              mode="outlined"
              label="What should we call you?"
              value={name}
              onChangeText={setName}
              style={{ marginBottom: 16 }}
            />
            <Text style={{ marginBottom: 8, fontWeight: "bold" }}>
              Which position are you applying for?
            </Text>
            <RadioButton.Group onValueChange={setRole} value={role}>
              <RadioButton.Item
                label="Customer Service"
                value="Customer Service"
              />
            </RadioButton.Group>
            <Button
              mode="outlined"
              icon="upload"
              onPress={handleFileUpload}
              style={{ marginTop: 16 }}
            >
              {file ? `Uploaded: ${file.name}` : "Upload Your Resume"}
            </Button>
          </Card.Content>
        </Card>
        <Button
          mode="contained"
          icon="arrow-right"
          onPress={() => onSubmit(name, role, file!.name)}
          disabled={!canSubmit}
          style={{ marginTop: 24 }}
        >
          Proceed
        </Button>
      </ScrollView>
    </View>
  );
}

function ResumeReportScreen({ onProceed }: { onProceed: () => void }) {
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
          This is how our AI sees your resume. You can edit the summary and
          skills to best represent yourself.
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
          </View>
        </View>
        <Button
          mode="contained"
          icon="arrow-right"
          onPress={onProceed}
          style={styles.actionButton}
        >
          Proceed to Interview
        </Button>
      </View>
    </ScrollView>
  );
}

function PreparationScreen({
  onProceed,
  onBack,
}: {
  onProceed: () => void;
  onBack: () => void;
}) {
  const theme = useTheme();
  const tips = [
    { icon: "map-marker-radius", text: "Find a quiet space." },
    { icon: "microphone-outline", text: "Check your microphone." },
    { icon: "lightbulb-on-outline", text: "Be ready to share examples." },
    { icon: "account-heart-outline", text: "Be yourself! Good luck." },
  ];

  return (
    <View
      style={[
        styles.fullPage,
        styles.centered,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <View style={styles.preparationContainer}>
        <Text
          style={[
            styles.preparationTitle,
            { color: theme.colors.onBackground },
          ]}
        >
          Get Ready for Your Interview
        </Text>
        <Card
          style={[
            styles.tipsCard,
            { backgroundColor: theme.colors.surfaceVariant },
          ]}
        >
          <Card.Content>
            {tips.map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <Avatar.Icon
                  icon={tip.icon}
                  size={32}
                  style={{ backgroundColor: "transparent", marginRight: 16 }}
                  color={theme.colors.onSurfaceVariant}
                />
                <Text
                  style={[
                    styles.tipText,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {tip.text}
                </Text>
              </View>
            ))}
          </Card.Content>
        </Card>
        <Button
          mode="contained"
          icon="arrow-right"
          onPress={onProceed}
          style={styles.proceedButton}
        >
          I'm Ready
        </Button>
        <Button
          mode="text"
          onPress={onBack}
          style={styles.backButton}
          icon="arrow-left"
        >
          Go Back
        </Button>
      </View>
    </View>
  );
}

function InterviewScreen({
  onEndRequest,
  name,
  language,
}: {
  onEndRequest: () => void;
  name: string;
  language: Language;
}) {
  const theme = useTheme();
  const { setScores } = useInterviewContext();
  const wavRecorderRef = useRef(new WavRecorder({ sampleRate: 24000 }));
  const wavStreamPlayerRef = useRef(new WavStreamPlayer({ sampleRate: 24000 }));
  const clientRef = useRef(
    new RealtimeClient(
      LOCAL_RELAY_SERVER_URL
        ? { url: LOCAL_RELAY_SERVER_URL }
        : { apiKey: OPENAI_API_KEY, dangerouslyAllowAPIKeyInBrowser: true }
    )
  );
  const [items, setItems] = useState<ItemType[]>([]);
  const [muted, setMuted] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const connectConversation = useCallback(async () => {
    onEndRequest();
  }, [name, language, onEndRequest]);

  useEffect(() => {
    connectConversation();
  }, [connectConversation]);

  return (
    <View
      style={[styles.fullPage, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.chatArea}>
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={{ textAlign: "center", marginTop: 40 }}>
            Interview in progress...
          </Text>
        </ScrollView>
      </View>
      <View
        style={[styles.controlBar, { backgroundColor: theme.colors.surface }]}
      >
        <Button mode="contained" icon={muted ? "microphone-off" : "microphone"}>
          {muted ? "Unmute" : "Mute"}
        </Button>
        <Button
          mode="contained"
          onPress={onEndRequest}
          buttonColor={theme.colors.error}
        >
          End Interview
        </Button>
      </View>
    </View>
  );
}

function AnalyzingScreen({ text }: { text: string }) {
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
        {text}
      </Text>
    </View>
  );
}

function ThankYouScreen({ onRestart }: { onRestart: () => void }) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.fullPage,
        styles.centered,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <Avatar.Icon
        icon="check-decagram"
        size={80}
        style={{ backgroundColor: theme.colors.primary, marginBottom: 24 }}
        color={theme.colors.onPrimary}
      />
      <Text style={[styles.welcomeTitle, { color: theme.colors.onBackground }]}>
        Application Submitted!
      </Text>
      <Text
        style={[
          styles.welcomeSubtitle,
          { color: theme.colors.onSurfaceVariant },
        ]}
      >
        Thank you for completing the process. The hiring team will review your
        application and be in touch soon.
      </Text>
      <Button mode="contained" onPress={onRestart}>
        Start Over
      </Button>
    </View>
  );
}

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
  welcomeCard: { width: "100%", maxWidth: 500 },
  reportContainer: { padding: 24 },
  reportTitle: { fontSize: 28, fontWeight: "bold" },
  reportSubtitle: { fontSize: 16, color: "gray", marginBottom: 24 },
  reportBody: { flexDirection: "row", flexWrap: "wrap" },
  reportColumn: { flex: 1, minWidth: 300, padding: 8 },
  reportCard: { marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  questionText: { marginVertical: 4 },
  actionButton: { marginTop: 16 },
  preparationContainer: { width: "100%", maxWidth: 500, padding: 24 },
  preparationTitle: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
  },
  tipsCard: { width: "100%", borderRadius: 12, marginBottom: 24 },
  tipItem: { flexDirection: "row", alignItems: "center", marginVertical: 12 },
  tipText: { flex: 1, fontSize: 14, lineHeight: 20 },
  proceedButton: { width: "100%", marginTop: 8 },
  backButton: { marginTop: 12 },
  chatArea: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  controlBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    padding: 20,
    borderTopWidth: 1,
    borderColor: "#e0e0e0",
  },
  analyzingTitle: { fontSize: 20, fontWeight: "600", marginTop: 20 },
});
