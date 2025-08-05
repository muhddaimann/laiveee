import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  Button,
  Card,
  Text,
  useTheme,
  TextInput,
  RadioButton,
  Avatar,
} from "react-native-paper";
import * as DocumentPicker from "expo-document-picker";
import * as Clipboard from "expo-clipboard";

type PagePhase =
  | "welcome"
  | "analyzing"
  | "preparation"
  | "interview"
  | "ending";

type LanguagePref = "English" | "Bahasa Malaysia" | "Mandarin" | "Tamil";

export default function LaiveTest() {
  const [phase, setPhase] = useState<PagePhase>("welcome");
  const [shortName, setShortName] = useState("");
  const [roleApply, setRoleApply] = useState("Customer Service Agent");
  const [fileName, setFileName] = useState<string | null>(null);
  const [languagePref, setLanguagePref] = useState<LanguagePref>("English");

  const handleStart = (name: string, file: string) => {
    setShortName(name);
    setFileName(file);
    setPhase("analyzing");
    setTimeout(() => {
      setPhase("preparation");
    }, 2000);
  };

  const handleProceed = () => {
    setPhase("interview");
    setTimeout(() => {
      setPhase("ending");
    }, 2000);
  };

  const handleRestart = () => {
    setPhase("welcome");
    setShortName("");
    setRoleApply("Customer Service Agent");
  };

  switch (phase) {
    case "welcome":
      return (
        <WelcomeScreen
          onStart={handleStart}
          shortName={shortName}
          setShortName={setShortName}
          roleApply={roleApply}
          setRoleApply={setRoleApply}
        />
      );
    case "analyzing":
      return (
        <AnalyzingScreen
          title="Analyzing Your Profile"
          subtitle="Please wait while we process your information..."
        />
      );
    case "preparation":
      return (
        <PreparationScreen
          onProceed={handleProceed}
          onBack={handleRestart}
          shortName={shortName}
          fileName={fileName}
          languagePref={languagePref}
          setLanguagePref={setLanguagePref}
        />
      );
    case "interview":
      return (
        <AnalyzingScreen
          title="Interview in Progress"
          subtitle="Simulating interview questions and responses..."
        />
      );
    case "ending":
      return <EndingScreen onRestart={handleRestart} name={shortName} />;
    default:
      return (
        <WelcomeScreen
          onStart={handleStart}
          shortName={shortName}
          setShortName={setShortName}
          roleApply={roleApply}
          setRoleApply={setRoleApply}
        />
      );
  }
}

function WelcomeScreen({
  onStart,
  shortName,
  setShortName,
  roleApply,
  setRoleApply,
}: {
  onStart: (name: string, file: string) => void;
  shortName: string;
  setShortName: (name: string) => void;
  roleApply: string;
  setRoleApply: (role: string) => void;
}) {
  const theme = useTheme();

  const handleUpload = async () => {
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
        onStart(shortName, result.assets[0].name);
      } else {
      }
    } catch (err) {
      console.error("Unknown error: ", err);
    }
  };

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
            Powered by AI | Built for you
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
              <Button
                mode="contained"
                icon="upload"
                onPress={handleUpload}
                disabled={!shortName.trim()}
              >
                Choose File
              </Button>
            </Card.Content>
          </Card>
        </ScrollView>
      </View>
    </View>
  );
}

function AnalyzingScreen({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
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
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={[styles.analyzingTitle, { marginTop: 20 }]}>{title}</Text>
      <Text style={{ color: theme.colors.onSurfaceVariant }}>{subtitle}</Text>
    </View>
  );
}

function PreparationScreen({
  onProceed,
  onBack,
  shortName,
  fileName,
  languagePref,
  setLanguagePref,
}: {
  onProceed: () => void;
  onBack: () => void;
  shortName: string;
  fileName: string | null;
  languagePref: LanguagePref;
  setLanguagePref: (language: LanguagePref) => void;
}) {
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
      <View style={styles.preparationLayout}>
        <View style={styles.preparationColumn}>
          <Card
            style={{ marginBottom: 16, backgroundColor: theme.colors.surface }}
          >
            <Card.Content>
              <Text style={styles.cardTitle}>Resume</Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Avatar.Icon icon="file-document" size={40} />
                <Text style={{ marginLeft: 16 }}>{fileName}</Text>
              </View>
            </Card.Content>
          </Card>
          <Card
            style={{ marginBottom: 16, backgroundColor: theme.colors.surface }}
          >
            <Card.Content>
              <Text style={styles.cardTitle}>Your Details</Text>
              <TextInput
                label="Full Name"
                value={shortName}
                disabled
                style={{ marginBottom: 16 }}
              />
              <TextInput
                label="Email Address"
                value="email@example.com"
                disabled
                style={{ marginBottom: 16 }}
              />
              <TextInput label="Phone Number" value="+1234567890" disabled />
            </Card.Content>
          </Card>
          <Card style={{ backgroundColor: theme.colors.surface }}>
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
        <View style={styles.preparationColumn}>
          <View style={{ alignItems: "center", paddingHorizontal: 16 }}>
            <Image
              source={require("../../../assets/ta1.png")}
              style={styles.welcomeImage}
            />
            <Text style={[styles.welcomeTitle, { fontSize: 24 }]}>
              Hi, {shortName}!
            </Text>
            <Text
              style={[
                styles.welcomeSubtitle,
                { fontSize: 16, textAlign: "center" },
              ]}
            >
              Here are some quick tips before you begin
            </Text>
          </View>

          <View
            style={{
              marginTop: 24,
              paddingHorizontal: 16,
              alignContent: "center",
            }}
          >
            {tips.map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <Avatar.Icon
                  icon={tip.icon}
                  size={32}
                  style={{ backgroundColor: "transparent", marginRight: 12 }}
                  color={theme.colors.onSurfaceVariant}
                />
                <Text
                  style={[
                    styles.tipText,
                    { color: theme.colors.onSurfaceVariant, fontSize: 16 },
                  ]}
                >
                  {tip.text}
                </Text>
              </View>
            ))}
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginTop: 32,
            }}
          >
            <Button mode="text" onPress={onBack} style={{ marginRight: 12 }}>
              Back
            </Button>
            <Button mode="contained" onPress={onProceed}>
              Proceed
            </Button>
          </View>
        </View>
      </View>
    </View>
  );
}

function EndingScreen({
  onRestart,
  name,
}: {
  onRestart: () => void;
  name: string;
}) {
  const theme = useTheme();

  const summaryText = `Candidate: ${name}\nStatus: Interview Completed\nThank you for participating in the Laive AI Interview.`;

  const handleCopy = async () => {
    await Clipboard.setStringAsync(summaryText);
    Alert.alert("Copied!", "Interview summary copied to clipboard.");
  };

  return (
    <View
      style={[
        styles.fullPage,
        styles.centered,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <Image
        source={require("../../../assets/ta1.png")}
        style={styles.welcomeImage}
      />
      <Text style={styles.welcomeTitle}>You're All Set, {name}!</Text>
      <Text style={styles.welcomeSubtitle}>
        Your interview has been completed. We appreciate your time and effort.
        You're one step closer to your journey with us!
      </Text>

      <View
        style={{
          marginTop: 64,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
        }}
      >
        <Button mode="text" onPress={onRestart}>
          Restart
        </Button>
        <Button mode="contained" onPress={handleCopy} icon="content-copy">
          Copy Summary
        </Button>
      </View>
    </View>
  );
}

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
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 18,
    textAlign: "center",
    maxWidth: 500,
  },
  welcomeCard: { width: "100%", marginBottom: 16 },
  analyzingTitle: { fontSize: 20, fontWeight: "600", marginVertical: 9 },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  preparationLayout: {
    flexDirection: "row",
    flex: 1,
    width: "100%",
    maxWidth: 1200,
    gap: 64,
  },
  preparationColumn: {
    flex: 1,
    alignContent: "center",
    justifyContent: "center",
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
  },
  tipText: { flex: 1, fontSize: 12, lineHeight: 16 },
});
