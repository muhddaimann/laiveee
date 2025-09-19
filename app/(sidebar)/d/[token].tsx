import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  useTheme,
  Avatar,
} from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  getCandidateByPublicToken,
  completeCandidate,
  CandidatePublicView,
} from "../../../contexts/api/candidate";
import { useNotification } from "../../../contexts/notificationContext";
import { useSidebar } from "../../../contexts/sidebarContext";

export default function CandidateInterviewPage() {
  const theme = useTheme();
  const router = useRouter();
  const notification = useNotification();
  const { token } = useLocalSearchParams<{ token: string }>();
  const { isVisible, toggleVisibility } = useSidebar();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [candidate, setCandidate] = useState<CandidatePublicView | null>(null);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [interviewCompleted, setInterviewCompleted] = useState(false);

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
        const fetchedCandidate = await getCandidateByPublicToken(token);
        setCandidate(fetchedCandidate);
      } catch (e: any) {
        setError(e.message || "Could not find interview details.");
      } finally {
        setLoading(false);
      }
    };
    fetchCandidate();
  }, [token]);

  const handleStartInterview = () => {
    setInterviewStarted(true);
    notification.showToast("Interview has started. Good luck!", { type: "info" });
  };

  const handleCompleteInterview = async () => {
    if (!token) return;
    setIsCompleting(true);
    try {
      const res = await completeCandidate(token);
      if (res.success) {
        notification.showToast("Interview completed successfully!", { type: "success" });
        setInterviewCompleted(true);
      } else {
        throw new Error(res.message || "Failed to complete interview.");
      }
    } catch (e: any) {
      notification.showToast(e.message || "An error occurred.", { type: "error" });
    }
    setIsCompleting(false);
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
        <Avatar.Icon icon="alert-circle" size={64} style={{marginBottom: 16, backgroundColor: theme.colors.errorContainer}} color={theme.colors.error} />
        <Text style={styles.title}>An Error Occurred</Text>
        <Text style={styles.subtitle}>{error}</Text>
        <Button mode="contained" onPress={() => router.push("/")} style={{marginTop: 24}}>
            Back to Home
        </Button>
      </View>
    );
  }

  if (!candidate) {
    return null;
  }

  const getButtonText = () => {
      if (interviewCompleted) return "Completed";
      if (interviewStarted) return "Complete Interview";
      return "Start Interview";
  }

  return (
    <View style={[styles.centeredContainer, { backgroundColor: theme.colors.background }]}>
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
            <Avatar.Icon icon={interviewCompleted ? "party-popper" : (interviewStarted ? "video-check" : "camera-iris")} size={80} style={{marginBottom: 24, backgroundColor: theme.colors.primaryContainer}} color={theme.colors.primary} />
            <Text style={styles.welcomeTitle}>Welcome, {candidate.FullName}</Text>
            <Text style={styles.welcomeSubtitle}>You are applying for the role of</Text>
            <Text style={styles.roleTitle}>{candidate.Role}</Text>
            <Text style={styles.instructions}>
                {interviewCompleted
                    ? "Thank you for completing the interview. We will be in touch with the next steps."
                    : (interviewStarted 
                        ? "Click the button below to finalize and submit your interview."
                        : "Please ensure you are in a quiet environment with a stable internet connection before you begin.")
                }
            </Text>
            <Button 
                mode="contained" 
                contentStyle={{paddingVertical: 8}} 
                labelStyle={{fontSize: 18}} 
                style={{marginTop: 32, borderRadius: 30}} 
                icon={interviewCompleted ? "check-all" : (interviewStarted ? "check-circle" : "arrow-right-circle")}
                onPress={interviewStarted ? handleCompleteInterview : handleStartInterview}
                loading={isCompleting}
                disabled={isCompleting || interviewCompleted}
            >
                {getButtonText()}
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
      width: '100%',
      maxWidth: 500,
  },
  cardContent: {
      alignItems: 'center',
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
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 12,
  },
  welcomeSubtitle: {
      fontSize: 16,
      color: 'gray',
  },
  roleTitle: {
      fontSize: 20,
      fontWeight: '500',
      color: '#007bff',
      marginVertical: 8,
  },
  instructions: {
      fontSize: 14,
      textAlign: 'center',
      color: 'gray',
      marginTop: 24,
  }
});
