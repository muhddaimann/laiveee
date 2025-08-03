import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
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
import { InterviewProvider } from "../../../contexts/interviewContext";

type PagePhase =
  | "welcome"
  | "scanning"
  | "summary"
  | "preparation"
  | "interview"
  | "analyzing"
  | "ending";

const mockAnalysis = {
  summary:
    "A highly motivated software engineer with 5 years of experience in full-stack development, specializing in React and Node.js. Proven track record of leading successful projects and delivering high-quality software.",
  strengths: ["Leadership", "React", "Node.js", "Agile Methodologies"],
  skills: ["JavaScript", "TypeScript", "Python", "Docker", "AWS"],
};

export default function LaiveApply() {
  return (
    <InterviewProvider>
      <ApplyFlow />
    </InterviewProvider>
  );
}

function ApplyFlow() {
  const [phase, setPhase] = useState<PagePhase>("welcome");
  const [shortName, setShortName] = useState("");
  const [positionApply, setPositionApply] = useState(
    "Executive - Customer Service"
  );
  const [fileName, setFileName] = useState<string | null>(null);
  const [language, setLanguage] = useState("English");

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
      }
    } catch (err) {
      console.error("Unknown error: ", err);
    }
  };

  const handleStart = () => {
    setPhase("scanning");
  };

  const handleRestart = () => {
    setPhase("welcome");
    setShortName("");
    setPositionApply("Executive - Customer Service");
    setFileName(null);
    setLanguage("English");
  };

  switch (phase) {
    case "welcome":
      return (
        <WelcomeScreen
          shortName={shortName}
          setShortName={setShortName}
          positionApply={positionApply}
          setPositionApply={setPositionApply}
          fileName={fileName}
          onFileUpload={handleFileUpload}
          onStart={handleStart}
        />
      );
    case "scanning":
      return (
        <AnalyzeScreen
          title="Scanning Your Resume..."
          subtitle={fileName || "Please wait"}
          onComplete={() => setPhase("summary")}
        />
      );
    case "summary":
      return (
        <SummaryScreen
          language={language}
          setLanguage={setLanguage}
          onStartInterview={() => setPhase("preparation")}
        />
      );
    case "preparation":
      return <PreparationScreen onProceed={() => setPhase("interview")} />;
    case "interview":
      return <InterviewScreen onEndRequest={() => setPhase("analyzing")} />;
    case "analyzing":
      return (
        <AnalyzeScreen
          title="Analyzing your results..."
          subtitle="Please wait a moment."
          onComplete={() => setPhase("ending")}
        />
      );
    case "ending":
      return <EndingScreen onRestart={handleRestart} />;
    default:
      return null;
  }
}

function WelcomeScreen({
  shortName,
  setShortName,
  positionApply,
  setPositionApply,
  fileName,
  onFileUpload,
  onStart,
}: {
  shortName: string;
  setShortName: (name: string) => void;
  positionApply: string;
  setPositionApply: (position: string) => void;
  fileName: string | null;
  onFileUpload: () => void;
  onStart: () => void;
}) {
  const theme = useTheme();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.fullPage}
    >
      <View
        style={[styles.centered, { backgroundColor: theme.colors.background }]}
      >
        <Avatar.Icon
          icon="briefcase-check"
          size={80}
          style={{
            backgroundColor: theme.colors.primary,
            marginBottom: 24,
          }}
          color={theme.colors.onPrimary}
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
          Let's get your application started. Please provide your name, the
          position you're applying for, and upload your resume.
        </Text>
        <View style={styles.welcomeContainer}>
          <View style={styles.welcomeColumn}>
            <Card
              style={[
                styles.welcomeContentCard,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <Card.Content>
                <TextInput
                  label="What should we call you?"
                  value={shortName}
                  onChangeText={setShortName}
                  mode="outlined"
                  style={{ marginBottom: 16 }}
                  autoFocus
                />
                <Text style={styles.cardTitle}>
                  What role are you looking for?
                </Text>
                <RadioButton.Group
                  onValueChange={(newValue) => setPositionApply(newValue)}
                  value={positionApply}
                >
                  <RadioButton.Item
                    label="Executive - Customer Service"
                    value="Executive - Customer Service"
                  />
                </RadioButton.Group>
              </Card.Content>
            </Card>
          </View>
          <View style={styles.welcomeColumn}>
            <Card
              style={[
                styles.welcomeContentCard,
                { backgroundColor: theme.colors.surface },
              ]}
            >
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
                  {fileName ? fileName : "PDF or DOCX format"}
                </Text>
                <Button mode="outlined" icon="upload" onPress={onFileUpload}>
                  Choose File
                </Button>
              </Card.Content>
            </Card>
          </View>
        </View>
        <Button
          mode="contained"
          icon="arrow-right"
          onPress={onStart}
          disabled={!shortName || !positionApply || !fileName}
          contentStyle={{ paddingVertical: 8, flexDirection: "row-reverse" }}
          style={{ marginTop: 24, width: "100%", maxWidth: 824 }}
        >
          Start Application
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

function AnalyzeScreen({
  title,
  subtitle,
  onComplete,
}: {
  title: string;
  subtitle: string;
  onComplete: () => void;
}) {
  const theme = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000); // Simulate processing time

    return () => clearTimeout(timer);
  }, [onComplete]);

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
        {title}
      </Text>
      <Text style={{ color: theme.colors.onSurfaceVariant }}>{subtitle}</Text>
    </View>
  );
}

function SummaryScreen({
  onStartInterview,
  language,
  setLanguage,
}: {
  onStartInterview: () => void;
  language: string;
  setLanguage: (lang: string) => void;
}) {
  const theme = useTheme();
  const [summary, setSummary] = useState(mockAnalysis.summary);
  const [skills, setSkills] = useState(mockAnalysis.skills.join(", "));

  return (
    <ScrollView
      style={[styles.fullPage, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.centered}
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
          Your resume looks on track with the role you're looking for. This is
          how it will be presented. Feel free to make edits.
        </Text>

        <View style={styles.reportBody}>
          <View style={styles.reportColumn}>
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
                  numberOfLines={10}
                  style={{ height: 200 }}
                />
              </Card.Content>
            </Card>
          </View>

          <View style={styles.reportColumn}>
            <Card
              style={[
                styles.reportCard,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <Card.Content>
                <Text style={styles.cardTitle}>Your Skills</Text>
                <TextInput
                  mode="outlined"
                  label="Separate skills with a comma"
                  value={skills}
                  onChangeText={setSkills}
                  multiline
                  numberOfLines={4}
                  style={{ height: 120, marginBottom: 16 }}
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
                <RadioButton.Group onValueChange={setLanguage} value={language}>
                  <RadioButton.Item label="English" value="English" />
                  <RadioButton.Item label="Spanish" value="Spanish" />
                  <RadioButton.Item label="Mandarin" value="Mandarin" />
                </RadioButton.Group>
              </Card.Content>
            </Card>
          </View>
        </View>

        <Button
          mode="contained"
          icon="arrow-right"
          style={styles.actionButton}
          onPress={onStartInterview}
          contentStyle={{ paddingVertical: 8, flexDirection: "row-reverse" }}
        >
          Start Pre-Screen Interview
        </Button>
      </View>
    </ScrollView>
  );
}

function PreparationScreen({ onProceed }: { onProceed: () => void }) {
  const theme = useTheme();
  const tips = [
    {
      icon: "map-marker-radius",
      text: "Find a quiet and comfortable space where you won't be disturbed.",
    },
    {
      icon: "microphone-outline",
      text: "Ensure your microphone is working clearly. Speak at a natural pace.",
    },
    {
      icon: "lightbulb-on-outline",
      text: "Think about your past experiences and be ready to share specific examples.",
    },
    {
      icon: "account-heart-outline",
      text: "Be yourself and let your personality shine through. Good luck!",
    },
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
        <Avatar.Icon
          icon="shield-check-outline"
          size={80}
          style={{
            backgroundColor: theme.colors.secondaryContainer,
            marginBottom: 24,
          }}
          color={theme.colors.onSecondaryContainer}
        />
        <Text
          style={[
            styles.preparationTitle,
            { color: theme.colors.onBackground },
          ]}
        >
          Get Ready for Your Interview
        </Text>
        <Text
          style={[
            styles.preparationSubtitle,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          Here are a few tips to help you succeed:
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
                  style={{
                    backgroundColor: "transparent",
                    marginRight: 16,
                  }}
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
          contentStyle={{ paddingVertical: 8, flexDirection: "row-reverse" }}
        >
          I'm Ready
        </Button>
      </View>
    </View>
  );
}

function InterviewScreen({ onEndRequest }: { onEndRequest: () => void }) {
  const theme = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      onEndRequest();
    }, 3000); // Simulate interview time

    return () => clearTimeout(timer);
  }, [onEndRequest]);

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
        Interview in progress...
      </Text>
      <Text style={{ color: theme.colors.onSurfaceVariant }}>
        Please wait a moment.
      </Text>
    </View>
  );
}

function EndingScreen({ onRestart }: { onRestart: () => void }) {
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
        style={{
          backgroundColor: theme.colors.primary,
          marginBottom: 24,
        }}
        color={theme.colors.onPrimary}
      />
      <Text style={[styles.welcomeTitle, { color: theme.colors.onBackground }]}>
        Thank You For Your Response!
      </Text>
      <Text
        style={[
          styles.welcomeSubtitle,
          { color: theme.colors.onSurfaceVariant },
        ]}
      >
        Your application has been submitted. We will be in touch with you
        shortly.
      </Text>
      <Button
        mode="contained"
        onPress={onRestart}
        style={{ marginTop: 20 }}
        icon="reload"
      >
        Start Over
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  fullPage: { flex: 1, width: "100%" },
  centered: {
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
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
    justifyContent: "center",
  },
  welcomeColumn: {
    flex: 1,
    minWidth: 300,
    padding: 8,
  },
  welcomeContentCard: {
    flex: 1,
    height: "100%", // Ensure cards take full height of the column
  },
  analyzingTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 20,
  },
  reportContainer: {
    padding: 24,
    width: "100%",
    maxWidth: 900,
    alignItems: "center",
  },
  reportTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  reportSubtitle: {
    fontSize: 16,
    color: "gray",
    marginBottom: 24,
    textAlign: "center",
    maxWidth: 600,
  },
  reportBody: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    justifyContent: "center",
  },
  reportColumn: {
    flex: 1,
    minWidth: 300,
    padding: 8,
  },
  reportCard: {
    marginBottom: 16,
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  actionButton: {
    marginTop: 24,
    width: "100%",
    maxWidth: 400,
  },
  preparationContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    width: "100%",
    maxWidth: 500,
  },
  preparationTitle: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  preparationSubtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
  },
  tipsCard: {
    width: "100%",
    borderRadius: 12,
    marginBottom: 24,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  proceedButton: {
    width: "100%",
    marginTop: 8,
  },
});
