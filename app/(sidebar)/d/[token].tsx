import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  useTheme,
  Avatar,
  RadioButton,
  TextInput,
} from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  getCandidateByToken,
  updateCandidateStatus,
  PublicCandidate,
} from "../../../contexts/api/candidate";
import { useNotification } from "../../../contexts/notificationContext";
import { useSidebar } from "../../../contexts/sidebarContext";

type PagePhase = "welcome" | "preparation" | "interview" | "ending";

export default function CandidateInterviewPage() {
  const theme = useTheme();
  const router = useRouter();
  const notification = useNotification();
  const { token } = useLocalSearchParams<{ token: string }>();
  const { isVisible, toggleVisibility } = useSidebar();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [candidate, setCandidate] = useState<PublicCandidate | null>(null);
  const [phase, setPhase] = useState<PagePhase>("welcome");

  useEffect(() => {
    if (isVisible) {
      toggleVisibility();
    }
    return () => {
      if (!isVisible) {
        toggleVisibility();
      }
    };
  }, []);

  useEffect(() => {
    if (!token) {
      setError("No interview token provided.");
      setLoading(false);
      return;
    }
    const fetchCandidate = async () => {
      try {
        const res = await getCandidateByToken(token);
        setCandidate(res.data);
      } catch (e: any) {
        setError(
          e.response?.data?.error || "Could not find interview details."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchCandidate();
  }, [token]);

  const handleProceed = () => {
    if (phase === "welcome") {
      setPhase("preparation");
    } else if (phase === "preparation") {
      setPhase("interview");
    }
  };

  const handleEndInterview = async () => {
    if (!token) return;
    try {
      await updateCandidateStatus(token, { status: "completed" });
      setPhase("ending");
    } catch (e: any) {
      notification.showToast(
        e.response?.data?.error || "Failed to update status.",
        { type: "error" }
      );
    }
  };

  const handleRestart = () => {
    setPhase("welcome");
  };

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator animating size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Avatar.Icon
          icon="alert-circle"
          size={64}
          style={{
            marginBottom: 16,
            backgroundColor: theme.colors.errorContainer,
          }}
          color={theme.colors.error}
        />
        <Text style={styles.title}>An Error Occurred</Text>
        <Text style={styles.subtitle}>{error}</Text>
        <Button
          mode="contained"
          onPress={() => router.push("/")}
          style={{ marginTop: 24 }}
        >
          Back to Home
        </Button>
      </View>
    );
  }

  if (!candidate) {
    return null;
  }

  switch (phase) {
    case "welcome":
      return (
        <WelcomeScreen
          onProceed={handleProceed}
          candidate={candidate}
          token={token!}
        />
      );
    case "preparation":
      return (
        <PreparationScreen
          candidate={candidate}
          onProceed={handleProceed}
          onBack={handleRestart}
        />
      );
    case "interview":
      return <InterviewScreen onEndRequest={handleEndInterview} />;
    case "ending":
      return <EndingScreen onRestart={handleRestart} />;
    default:
      return (
        <WelcomeScreen
          onProceed={handleProceed}
          candidate={candidate}
          token={token!}
        />
      );
  }
}

function WelcomeScreen({
  onProceed,
  candidate,
  token,
}: {
  onProceed: () => void;
  candidate: PublicCandidate;
  token: string;
}) {
  const theme = useTheme();
  const notification = useNotification();
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const handleWithdraw = () => {
    notification.showAlert({
      title: "Confirm Withdrawal",
      message:
        "Are you sure you want to withdraw your application? This action cannot be undone.",
      buttons: [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm & Withdraw",
          style: "destructive",
          onPress: async () => {
            setIsWithdrawing(true);
            try {
              await updateCandidateStatus(token, { status: "withdrawn" });
              notification.showToast("Application withdrawn.", {
                type: "info",
              });
            } catch (e: any) {
              notification.showToast(
                e.response?.data?.error || "Failed to withdraw application.",
                { type: "error" }
              );
            }
            setIsWithdrawing(false);
          },
        },
      ],
    });
  };

  return (
    <View
      style={[
        styles.centeredContainer,
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
            Welcome, {candidate.FullName}!
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
              <Text style={styles.cardTitle}>
                You are applying for the role of
              </Text>
              <Text style={{ textAlign: "center", fontSize: 18 }}>
                {candidate.Role}
              </Text>
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
              <Button mode="contained" icon="upload" disabled>
                Choose File
              </Button>
            </Card.Content>
          </Card>
          <Button
            mode="text"
            onPress={onProceed}
            style={{ marginTop: 12 }}
            disabled={isWithdrawing}
          >
            Proceed without resume
          </Button>
          <Button
            mode="text"
            onPress={handleWithdraw}
            style={{ marginTop: 12 }}
            textColor={theme.colors.error}
            disabled={isWithdrawing}
            loading={isWithdrawing}
          >
            Withdraw Application
          </Button>
        </ScrollView>
      </View>
    </View>
  );
}

function PreparationScreen({
  candidate,
  onProceed,
  onBack,
}: {
  candidate: PublicCandidate;
  onProceed: () => void;
  onBack: () => void;
}) {
  const theme = useTheme();
  const [languagePref, setLanguagePref] = useState("English");

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
        styles.centeredContainer,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <View style={styles.preparationLayout}>
        <View style={styles.preparationColumn}>
          <Card
            style={{ marginBottom: 16, backgroundColor: theme.colors.surface }}
          >
            <Card.Content>
              <Text style={styles.cardTitle}>Your Details</Text>
              <TextInput
                label="Full Name"
                value={candidate.FullName}
                disabled
                style={{ marginBottom: 16 }}
              />
              <TextInput
                label="Role"
                value={candidate.Role}
                disabled
              />
            </Card.Content>
          </Card>
          <Card style={{ backgroundColor: theme.colors.surface }}>
            <Card.Content>
              <Text style={styles.cardTitle}>Interview Language</Text>
              <RadioButton.Group
                onValueChange={(newValue) => setLanguagePref(newValue as any)}
                value={languagePref || ""}
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
            <Avatar.Icon
              icon="camera-iris"
              size={80}
              style={{
                marginBottom: 24,
                backgroundColor: theme.colors.primaryContainer,
              }}
              color={theme.colors.primary}
            />
            <Text style={[styles.welcomeTitle, { fontSize: 24 }]}>
              Hi, {candidate.FullName}!
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
            <Button mode="contained" onPress={onProceed}>
              Proceed
            </Button>
          </View>
        </View>
      </View>
    </View>
  );
}

function InterviewScreen({ onEndRequest }: { onEndRequest: () => void }) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.centeredContainer,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <Text style={styles.title}>Interview In Progress</Text>
          <Text style={styles.subtitle}>
            The interview recording would be here.
          </Text>
          <Button
            mode="contained"
            onPress={onEndRequest}
            style={{ marginTop: 24 }}
          >
            Finish Interview
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
}

function EndingScreen({ onRestart }: { onRestart: () => void }) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.centeredContainer,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <Avatar.Icon
            icon="party-popper"
            size={80}
            style={{
              marginBottom: 24,
              backgroundColor: theme.colors.primaryContainer,
            }}
            color={theme.colors.primary}
          />
          <Text style={styles.title}>You're All Set!</Text>
          <Text style={styles.subtitle}>
            Your interview has been completed. We appreciate your time and
            effort.
          </Text>
          <Button
            mode="contained"
            onPress={onRestart}
            style={{ marginTop: 24 }}
          >
            Restart
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 500,
  },
  cardContent: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "gray",
    textAlign: "center",
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "gray",
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: "500",
    color: "#007bff",
    marginVertical: 8,
  },
  instructions: {
    fontSize: 14,
    textAlign: "center",
    color: "gray",
    marginTop: 24,
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
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
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
  welcomeImage: { width: 200, height: 200, marginBottom: 24 },
  welcomeCard: { width: "100%", marginBottom: 16 },
});
