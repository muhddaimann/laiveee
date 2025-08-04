import React, { useEffect, useRef, useCallback, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { RealtimeClient } from "@openai/realtime-api-beta";
import { ItemType } from "@openai/realtime-api-beta/dist/lib/client";
import { WavRecorder, WavStreamPlayer } from "../../../lib/wavtools/index";
import { WavRenderer } from "../../../utils/wavRenderer";
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
import { BetaProvider, useBetaContext } from "../../../contexts/betaContext";
import { createBetaConfig } from "../../../utils/ivConfig";
import {
  calculateInterviewCost,
  UsageData,
} from "../../../utils/costEstimator";

interface ScoreType {}

type PagePhase =
  | "welcome"
  | "preparation"
  | "interview"
  | "analyzing"
  | "report";

const languageOptions = [
  "English",
  "Bahasa Malaysia",
  "Mandarin",
  "Tamil",
] as const;

type LanguagePref = (typeof languageOptions)[number];

export default function LaiveIV() {
  return (
    <BetaProvider>
      <InterviewFlow />
    </BetaProvider>
  );
}

function InterviewFlow() {
  const [phase, setPhase] = useState<PagePhase>("welcome");
  const [conversation, setConversation] = useState<ItemType[]>([]);
  const {
    setScores,
    setShortName,
    setRoleApply,
    setLanguagePref,
    setUsage,
    shortName,
    roleApply,
    languagePref,
  } = useBetaContext();

  const handleStartInterview = (
    name: string,
    role: string,
    lang: LanguagePref
  ) => {
    if (name.trim() && role.trim()) {
      setShortName(name);
      setRoleApply(role);
      setLanguagePref(lang);
      setPhase("preparation");
    }
  };

  const handleProceedToInterview = () => {
    setPhase("interview");
  };

  const handleGoBack = () => {
    setPhase("welcome");
  };

  const handleEndInterview = useCallback(() => {
    setPhase("analyzing");
    setTimeout(() => {
      setPhase("report");
    }, 4000);
  }, []);

  const handleRestart = () => {
    setScores(null);
    setShortName(null);
    setRoleApply(null);
    setLanguagePref(null);
    setConversation([]);
    setUsage(null);
    setPhase("welcome");
  };

  switch (phase) {
    case "welcome":
      return <WelcomeScreen onStart={handleStartInterview} />;
    case "preparation":
      return (
        <PreparationScreen
          onProceed={handleProceedToInterview}
          onBack={handleGoBack}
        />
      );
    case "interview":
      return (
        <InterviewScreen
          onEndRequest={handleEndInterview}
          name={shortName!}
          role={roleApply!}
          language={languagePref!}
          setConversation={setConversation}
        />
      );
    case "analyzing":
      return <AnalyzingScreen />;
    case "report":
      return <ReportScreen onRestart={handleRestart} shortName={shortName!} />;
    default:
      return <WelcomeScreen onStart={handleStartInterview} />;
  }
}

function WelcomeScreen({
  onStart,
}: {
  onStart: (
    shortName: string,
    roleApply: string,
    languagePref: LanguagePref
  ) => void;
}) {
  const [shortName, setShortName] = useState("");
  const [roleApply, setRoleApply] = useState("Customer Service Agent");
  const [languagePref, setLanguagePref] = useState<LanguagePref>("English");
  const theme = useTheme();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.fullPage, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.welcomeLayout}>
        <View style={styles.welcomeBranding}>
          <Avatar.Icon
            icon="rocket-launch"
            size={100}
            style={{ backgroundColor: theme.colors.primary, marginBottom: 24 }}
            color={theme.colors.onPrimary}
          />
          <Text
            style={[styles.welcomeTitle, { color: theme.colors.onBackground }]}
          >
            LaiveIV
          </Text>
          <Text
            style={[
              styles.welcomeSubtitle,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            Welcome to your AI-powered screening. Please provide the following
            details to begin.
          </Text>
        </View>

        <View style={styles.welcomeForm}>
          <Card style={{ width: "100%", padding: 12 }}>
            <TextInput
              mode="outlined"
              label="Your Short Name"
              value={shortName}
              onChangeText={setShortName}
              style={{ marginBottom: 20 }}
              autoFocus
            />
            <View style={styles.languageSelector}>
              <Text
                style={[
                  styles.languageLabel,
                  { color: theme.colors.onSurface },
                ]}
              >
                Select Role:
              </Text>
              <RadioButton.Group
                onValueChange={(newValue) => setRoleApply(newValue as string)}
                value={roleApply!}
              >
                <RadioButton.Item
                  label="Customer Service Agent"
                  value="Customer Service Agent"
                />
              </RadioButton.Group>
            </View>
            <View style={styles.languageSelector}>
              <Text
                style={[
                  styles.languageLabel,
                  { color: theme.colors.onSurface },
                ]}
              >
                Select Preferred Language:
              </Text>
              <RadioButton.Group
                onValueChange={(newValue) =>
                  setLanguagePref(newValue as LanguagePref)
                }
                value={languagePref}
              >
                <View style={styles.radioRow}>
                  <RadioButton.Item label="English" value="English" />
                  <RadioButton.Item
                    label="Bahasa Malaysia"
                    value="Bahasa Malaysia"
                  />
                </View>
                <View style={styles.radioRow}>
                  <RadioButton.Item label="Mandarin" value="Mandarin" />
                  <RadioButton.Item label="Tamil" value="Tamil" />
                </View>
              </RadioButton.Group>
            </View>
            <Button
              mode="contained"
              icon="arrow-right"
              onPress={() => onStart(shortName, roleApply, languagePref)}
              disabled={!shortName.trim() || !roleApply.trim()}
              style={styles.startButton}
              contentStyle={styles.startButtonContent}
            >
              Start Screening
            </Button>
          </Card>
        </View>
      </View>
    </KeyboardAvoidingView>
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
          contentStyle={styles.proceedButtonContent}
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

const languageCodeMapping: { [key in LanguagePref]: string } = {
  English: "en",
  "Bahasa Malaysia": "ms",
  Mandarin: "zh",
  Tamil: "ta",
};

function InterviewScreen({
  onEndRequest,
  name,
  role,
  language,
  setConversation,
}: {
  onEndRequest: () => void;
  name: string;
  role: string;
  language: LanguagePref;
  setConversation: React.Dispatch<React.SetStateAction<ItemType[]>>;
}) {
  const theme = useTheme();
  const { scores, setScores, setUsage } = useBetaContext();
  const startTimeRef = useRef<number | null>(null);

  const wavRecorderRef = useRef<WavRecorder>(
    new WavRecorder({ sampleRate: 24000 })
  );
  const wavStreamPlayerRef = useRef<WavStreamPlayer>(
    new WavStreamPlayer({ sampleRate: 24000 })
  );
  const clientRef = useRef<RealtimeClient>(
    new RealtimeClient(
      LOCAL_RELAY_SERVER_URL
        ? { url: LOCAL_RELAY_SERVER_URL }
        : { apiKey: OPENAI_API_KEY, dangerouslyAllowAPIKeyInBrowser: true }
    )
  );
  const clientCanvasRef = useRef<HTMLCanvasElement>(null);
  const [items, setItems] = useState<ItemType[]>([]);
  const [muted, setMuted] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    setConversation(items);
  }, [items, setConversation]);

  const connectConversation = useCallback(async () => {
    if (!LOCAL_RELAY_SERVER_URL && !OPENAI_API_KEY) {
      Alert.alert(
        "Configuration Error",
        "No API key or relay server URL provided."
      );
      return;
    }
    startTimeRef.current = Date.now();
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;

    setItems(client.conversation.getItems());
    await wavRecorder.begin();
    await wavStreamPlayer.connect();
    await client.connect();
    await client.updateSession({ turn_detection: { type: "server_vad" } });
    client.sendUserMessageContent([
      {
        type: `input_text`,
        text: `Hello! My name is ${name}, and I am ready for my interview for the ${role} role, speaking in ${language}.`,
      },
    ]);
    await wavRecorder.record((data) => client.appendInputAudio(data.mono));
  }, [name, role, language]);

  const toggleMute = useCallback(async () => {
    const wavRecorder = wavRecorderRef.current;
    const client = clientRef.current;
    if (!wavRecorder) return;
    if (muted) {
      await wavRecorder.record((data) => client.appendInputAudio(data.mono));
    } else {
      await wavRecorder.pause();
    }
    setMuted(!muted);
  }, [muted]);

  const requestDisconnect = () => {
    Alert.alert("End Interview", "Are you sure you want to end the session?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "End Interview",
        style: "destructive",
        onPress: () => {
          clientRef.current.sendUserMessageContent([
            {
              type: "input_text",
              text: "That is all for today, thank you for your time. Please provide the scores now.",
            },
          ]);
        },
      },
    ]);
  };

  useEffect(() => {
    if (scores) {
      const endTime = Date.now();
      const durationInSeconds = startTimeRef.current
        ? (endTime - startTimeRef.current) / 1000
        : 0;

      const usage: UsageData = {
        inputTokens: items.reduce((acc, item) => {
          const text = item.formatted?.text || item.formatted?.transcript || "";
          return acc + Math.round(text.length / 4);
        }, 0),
        outputTokens: scores.summary.length / 4,
        audioInputDuration: durationInSeconds,
      };
      setUsage(usage);

      const client = clientRef.current;
      client.disconnect();
      const wavRecorder = wavRecorderRef.current;
      wavRecorder.end();
      const wavStreamPlayer = wavStreamPlayerRef.current;
      wavStreamPlayer.interrupt();
      onEndRequest();
    }
  }, [scores, onEndRequest, items, setUsage]);

  useEffect(() => {
    connectConversation();
  }, [connectConversation]);

  useEffect(() => {
    let isLoaded = true;
    const wavRecorder = wavRecorderRef.current;
    const clientCanvas = clientCanvasRef.current;
    let clientCtx: CanvasRenderingContext2D | null = null;
    const render = () => {
      if (isLoaded) {
        if (clientCanvas) {
          if (!clientCanvas.width || !clientCanvas.height) {
            clientCanvas.width = clientCanvas.offsetWidth;
            clientCanvas.height = clientCanvas.offsetHeight;
          }
          clientCtx = clientCtx || clientCanvas.getContext("2d");
          if (clientCtx) {
            clientCtx.clearRect(0, 0, clientCanvas.width, clientCanvas.height);
            const result = wavRecorder.recording
              ? wavRecorder.getFrequencies("voice")
              : { values: new Float32Array([0]) };
            WavRenderer.drawBars(
              clientCanvas,
              clientCtx,
              result.values,
              theme.colors.primary,
              10,
              0,
              8
            );
          }
        }
        window.requestAnimationFrame(render);
      }
    };
    render();
    return () => {
      isLoaded = false;
    };
  }, [theme.colors.primary]);

  useEffect(() => {
    const wavStreamPlayer = wavStreamPlayerRef.current;
    const client = clientRef.current;
    const config = createBetaConfig(role, language);
    const transcriptionLanguage = languageCodeMapping[language] || "ms";

    client.updateSession({
      instructions: config.instructions,
      voice: "echo",
      input_audio_transcription: {
        model: "whisper-1",
        language: transcriptionLanguage,
      },
    });
    client.addTool(config.tool, async (scores: ScoreType) => {
      setScores(scores);
      return { success: true };
    });

    client.on("error", (event: any) => console.error(event));
    client.on("conversation.interrupted", async () => {
      const trackSampleOffset = await wavStreamPlayer.interrupt();
      if (trackSampleOffset?.trackId) {
        await client.cancelResponse(
          trackSampleOffset.trackId,
          trackSampleOffset.offset
        );
      }
    });
    client.on("conversation.updated", async ({ item, delta }: any) => {
      if (delta?.audio) {
        wavStreamPlayer.add16BitPCM(delta.audio, item.id);
      }
      setItems(client.conversation.getItems());
    });
    setItems(client.conversation.getItems());
    return () => {
      client.reset();
    };
  }, [setScores, role, language]);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [items]);

  return (
    <View
      style={[styles.fullPage, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.chatArea}>
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
        >
          {items.map((item) => (
            <MessageBubble key={item.id} item={item} userName={name} />
          ))}
        </ScrollView>
      </View>
      <View
        style={[styles.controlBar, { backgroundColor: theme.colors.surface }]}
      >
        <Button
          mode="contained"
          onPress={toggleMute}
          style={styles.muteButton}
          buttonColor={
            muted ? theme.colors.errorContainer : theme.colors.primaryContainer
          }
          textColor={
            muted
              ? theme.colors.onErrorContainer
              : theme.colors.onPrimaryContainer
          }
          icon={muted ? "microphone-off" : "microphone"}
        >
          {muted ? "Unmute" : "Mute"}
        </Button>
        <View style={styles.vizContainer}>
          <canvas
            ref={clientCanvasRef}
            style={{ width: "100%", height: "100%" }}
          />
        </View>
        <Button
          mode="contained"
          onPress={requestDisconnect}
          style={styles.endButton}
          buttonColor={theme.colors.error}
          textColor={theme.colors.onError}
          icon="stop-circle-outline"
        >
          End
        </Button>
      </View>
    </View>
  );
}

function MessageBubble({
  item,
  userName,
}: {
  item: ItemType;
  userName: string;
}) {
  const theme = useTheme();
  const isUser = item.role === "user";
  const senderName = isUser ? userName : "Laive Interviewer";

  return (
    <View
      style={[
        styles.messageContainer,
        isUser ? styles.userMessage : styles.aiMessage,
      ]}
    >
      {!isUser && (
        <Image
          source={require("../../../assets/ta1.png")}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            marginRight: 8,
          }}
        />
      )}
      {isUser && (
        <Avatar.Text
          size={40}
          label={userName.charAt(0).toUpperCase()}
          style={{
            marginLeft: 8,
            backgroundColor: theme.colors.primary,
          }}
          color={theme.colors.onPrimary}
        />
      )}
      <View style={{ flex: 1 }}>
        <Text
          style={[
            styles.senderName,
            isUser ? styles.userSender : styles.aiSender,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          {senderName}
        </Text>
        <Card
          style={[
            styles.messageCard,
            {
              backgroundColor: isUser
                ? theme.colors.primaryContainer
                : theme.colors.secondaryContainer,
            },
          ]}
        >
          <Card.Content>
            <Text
              style={{
                color: isUser
                  ? theme.colors.onPrimaryContainer
                  : theme.colors.onSecondaryContainer,
              }}
            >
              {item.formatted?.text || item.formatted?.transcript || "..."}
            </Text>
          </Card.Content>
        </Card>
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
        Analyzing your results...
      </Text>
      <Text style={{ color: theme.colors.onSurfaceVariant }}>
        Please wait a moment.
      </Text>
    </View>
  );
}

function ReportScreen({
  onRestart,
  shortName,
}: {
  onRestart: () => void;
  shortName: string;
}) {
  const theme = useTheme();

  const handleDownload = (format: "pdf" | "csv") => {
    Alert.alert(
      "Download",
      `This feature is not yet implemented. Tapped on download ${format.toUpperCase()}`
    );
  };

  return (
    <View
      style={[
        styles.fullPage,
        styles.centered,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <View style={styles.reportLayout}>
        <View style={styles.reportMessage}>
          <Avatar.Icon
            icon="check-decagram"
            size={100}
            style={{ backgroundColor: theme.colors.primary, marginBottom: 24 }}
            color={theme.colors.onPrimary}
          />
          <Text
            style={[styles.reportTitle, { color: theme.colors.onBackground }]}
          >
            Thank You, {shortName}!
          </Text>
          <Text
            style={[
              styles.reportSubtitle,
              { color: theme.colors.onSurfaceVariant, textAlign: "center" },
            ]}
          >
            We appreciate you taking the time to complete the screening. The
            hiring team will review your results and be in touch shortly.
          </Text>
        </View>
        <View style={styles.reportActions}>
          <Card
            style={[
              styles.reportCard,
              {
                backgroundColor: theme.colors.surface,
                width: "100%",
                maxWidth: 400,
              },
            ]}
          >
            <Card.Content>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  textAlign: "center",
                  color: theme.colors.onSurface,
                  marginBottom: 20,
                }}
              >
                Download Your Results
              </Text>
              <View
                style={{ flexDirection: "row", justifyContent: "space-around" }}
              >
                <Button
                  icon="file-pdf-box"
                  mode="contained"
                  onPress={() => handleDownload("pdf")}
                >
                  PDF
                </Button>
                <Button
                  icon="file-delimited"
                  mode="contained"
                  onPress={() => handleDownload("csv")}
                >
                  CSV
                </Button>
              </View>
            </Card.Content>
          </Card>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fullPage: { flex: 1, width: "100%" },
  centered: { justifyContent: "center", alignItems: "center", padding: 24 },
  welcomeLayout: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
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
  languageSelector: {
    marginBottom: 20,
    width: "100%",
  },
  languageLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  radioRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  startButton: { marginTop: 16, width: "100%" },
  startButtonContent: { paddingVertical: 8, flexDirection: "row-reverse" },
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
  tipsCard: { width: "100%", borderRadius: 12, marginBottom: 24 },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
  },
  tipText: { flex: 1, fontSize: 14, lineHeight: 20 },
  proceedButton: { width: "100%", marginTop: 8 },
  proceedButtonContent: { paddingVertical: 8, flexDirection: "row-reverse" },
  backButton: { marginTop: 12 },
  chatArea: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  messageContainer: {
    flexDirection: "row",
    marginVertical: 8,
    maxWidth: "85%",
    alignItems: "flex-start",
  },
  userMessage: { alignSelf: "flex-end", flexDirection: "row-reverse" },
  aiMessage: { alignSelf: "flex-start" },
  messageCard: { borderRadius: 18, flexShrink: 1 },
  senderName: {
    fontSize: 12,
    marginBottom: 4,
    fontWeight: "bold",
  },
  userSender: {
    textAlign: "right",
    marginRight: 12,
  },
  aiSender: {
    marginLeft: 12,
  },
  controlBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderColor: "#e0e0e0",
  },
  muteButton: { width: 130 },
  endButton: { width: 130 },
  vizContainer: { flex: 1, height: 50, marginHorizontal: 16 },
  analyzingTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 20,
  },
  reportLayout: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  reportMessage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingRight: 24,
  },
  reportActions: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 24,
  },
  reportTitle: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  reportSubtitle: {
    fontSize: 18,
  },
  reportCard: {
    width: "100%",
    borderRadius: 12,
  },
});
