import React, { useState } from "react";
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

const mockAnalysis = {
  fullName: "Fauzi Fakhrul",
  relatedLink: "https://www.linkedin.com/in/fauzifakhrul",
  summary:
    "A highly empathetic and patient customer service professional with a strong track record of resolving customer issues effectively. Adept at communication and de-escalation, with experience in CRM software. Proven ability to handle high-stress situations with a calm and positive demeanor. Skilled in building rapport with customers and identifying their needs to provide tailored solutions. Looking to leverage these skills in a challenging new role.",
  strength: ["Empathy", "Patience", "Problem-Solving", "Communication"],
  strengthJustification:
    "The candidate's resume highlights multiple instances of going above and beyond to assist customers, demonstrating a natural ability to understand and share the feelings of others. This is a key trait for a customer service role.",
  jobMatch: "92%",
  candidateEmail: "fauzifakhrul@gmail.com",
  candidatePhone: "+(60)173900822",
};

type PagePhase = "welcome" | "analyzing" | "report";

type LanguagePref = "English" | "Bahasa Malaysia" | "Mandarin" | "Tamil";

export default function LaiveApply() {
  const [phase, setPhase] = useState<PagePhase>("welcome");
  const [fileName, setFileName] = useState<string | null>(null);
  const [shortName, setShortName] = useState("");
  const [roleApply, setRoleApply] = useState("Customer Service Agent");
  const [languagePref, setLanguagePref] = useState<LanguagePref>("English");

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
    setShortName("");
    setRoleApply("");
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
        fileName={fileName}
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
  fileName,
  onRestart,
  languagePref,
  setLanguagePref,
  roleApply,
  shortName,
}: {
  fileName: string | null;
  onRestart: () => void;
  languagePref: LanguagePref;
  setLanguagePref: (language: LanguagePref) => void;
  roleApply: string;
  shortName: string;
}) {
  const theme = useTheme();
  const [summary, setSummary] = useState(mockAnalysis.summary);
  const [fullName, setFullName] = useState(mockAnalysis.fullName);
  const [relatedLink, setRelatedLink] = useState(mockAnalysis.relatedLink);
  const [candidateEmail, setCandidateEmail] = useState(
    mockAnalysis.candidateEmail
  );
  const [candidatePhone, setCandidatePhone] = useState(
    mockAnalysis.candidatePhone
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
                {mockAnalysis.strength.map((s) => (
                  <PaperChip
                    key={s}
                    icon="check"
                    style={{ marginRight: 8, marginBottom: 8 }}
                    mode="outlined"
                    elevated
                  >
                    {s}
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
                <PercentageCircle percentage={mockAnalysis.jobMatch} />
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
