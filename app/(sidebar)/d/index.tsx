import React, {
  useEffect,
  useRef,
  useCallback,
  useState,
} from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { RealtimeClient } from "@openai/realtime-api-beta";
import { ItemType } from "@openai/realtime-api-beta/dist/lib/client.js";
import { WavRecorder, WavStreamPlayer } from "../../../lib/wavtools/index.js";
import { WavRenderer } from "../../../utils/wavRenderer";
import {
  useTheme,
  Button,
  TextInput,
  Avatar,
  Card,
  Title,
  Paragraph,
  List,
} from "react-native-paper";
import { OPENAI_API_KEY, LOCAL_RELAY_SERVER_URL } from "../../../constants/env";
import {
  InterviewProvider,
  useInterviewContext,
} from "../../../contexts/interviewContext";
import { interviewConfig } from "../../../utils/interviewConfig";

interface ScoreType {
  empathy: { score: number; reasoning: string };
  innovation: { score: number; reasoning: string };
  passion: { score: number; reasoning: string };
  trust: { score: number; reasoning: string };
  insight: { score: number; reasoning: string };
  summary: string;
  average: number;
}
type PagePhase = "welcome" | "interview" | "analyzing" | "report";

export default function InterviewPage() {
  return (
    <InterviewProvider>
      <InterviewFlow />
    </InterviewProvider>
  );
}

function InterviewFlow() {
  const [phase, setPhase] = useState<PagePhase>("welcome");
  const [name, setName] = useState("");
  const { scores, setScores } = useInterviewContext();

  const handleStartInterview = (submittedName: string) => {
    if (submittedName.trim()) {
      setName(submittedName);
      setPhase("interview");
    }
  };

  const handleEndInterview = useCallback(() => {
    setPhase("analyzing");
    setTimeout(() => {
      setPhase("report");
    }, 4000);
  }, []);

  const handleRestart = () => {
    setName("");
    setScores(null);
    setPhase("welcome");
  };

  switch (phase) {
    case "welcome":
      return <WelcomeScreen onStart={handleStartInterview} />;
    case "interview":
      return <InterviewScreen onEndRequest={handleEndInterview} name={name} />;
    case "analyzing":
      return <AnalyzingScreen />;
    case "report":
      return <ReportScreen name={name} onRestart={handleRestart} />;
    default:
      return <WelcomeScreen onStart={handleStartInterview} />;
  }
}

function WelcomeScreen({ onStart }: { onStart: (name: string) => void }) {
  const [name, setName] = useState("");
  const theme = useTheme();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.fullPage}
    >
      <View
        style={[
          styles.welcomeContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Avatar.Icon
          icon="account-supervisor-circle"
          size={80}
          style={{ backgroundColor: theme.colors.primary, marginBottom: 24 }}
          color="#fff"
        />
        <Title style={styles.welcomeTitle}>AI-Powered Interview</Title>
        <Paragraph style={styles.welcomeSubtitle}>
          Welcome to your automated customer service interview. Please enter
          your name below to begin.
        </Paragraph>
        <TextInput
          mode="outlined"
          label="Your Name"
          value={name}
          onChangeText={setName}
          style={styles.nameInput}
          autoFocus
        />
        <Button
          mode="contained"
          icon="arrow-right"
          onPress={() => onStart(name)}
          disabled={!name.trim()}
          style={styles.startButton}
          contentStyle={styles.startButtonContent}
        >
          Start Interview
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

function InterviewScreen({
  onEndRequest,
  name,
}: {
  onEndRequest: () => void;
  name: string;
}) {
  const theme = useTheme();
  const { scores, setScores } = useInterviewContext();

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
  const [isConnected, setIsConnected] = useState(false);
  const [muted, setMuted] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const connectConversation = useCallback(async () => {
    if (!LOCAL_RELAY_SERVER_URL && !OPENAI_API_KEY) {
      Alert.alert(
        "Configuration Error",
        "No API key or relay server URL provided."
      );
      return;
    }
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;

    setIsConnected(true);
    setItems(client.conversation.getItems());
    await wavRecorder.begin();
    await wavStreamPlayer.connect();
    await client.connect();
    await client.updateSession({ turn_detection: { type: "server_vad" } });
    client.sendUserMessageContent([
      {
        type: `input_text`,
        text: `Hello! My name is ${name}, and I am ready for my customer service interview.`,
      },
    ]);
    await wavRecorder.record((data) => client.appendInputAudio(data.mono));
  }, [name]);

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
    Alert.alert(
      "End Interview",
      "Are you sure you want to end the session? This will proceed to the results.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "End Interview",
          style: "destructive",
          onPress: () => {
            clientRef.current.sendUserMessageContent([
              {
                type: "input_text",
                text: "The interview is over. Please provide the scores.",
              },
            ]);
          },
        },
      ]
    );
  };

  useEffect(() => {
    if (scores) {
      const client = clientRef.current;
      client.disconnect();
      const wavRecorder = wavRecorderRef.current;
      wavRecorder.end();
      const wavStreamPlayer = wavStreamPlayerRef.current;
      wavStreamPlayer.interrupt();
      onEndRequest();
    }
  }, [scores, onEndRequest]);

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
    client.updateSession({
      instructions: interviewConfig.instructions,
      voice: "echo",
      input_audio_transcription: { model: "whisper-1" },
    });
    client.addTool(interviewConfig.tool, async (scores: ScoreType) => {
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
  }, [setScores]);

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
            <MessageBubble key={item.id} item={item} />
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

function MessageBubble({ item }: { item: ItemType }) {
  const theme = useTheme();
  const isUser = item.role === "user";
  return (
    <View
      style={[
        styles.messageContainer,
        isUser ? styles.userMessage : styles.aiMessage,
      ]}
    >
      {!isUser && (
        <Avatar.Icon
          icon="robot-happy"
          size={40}
          style={{
            marginRight: 8,
            backgroundColor: theme.colors.secondaryContainer,
          }}
          color={theme.colors.onSecondaryContainer}
        />
      )}
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
          <Paragraph
            style={{
              color: isUser
                ? theme.colors.onPrimaryContainer
                : theme.colors.onSecondaryContainer,
            }}
          >
            {item.formatted?.transcript || item.formatted?.text || "..."}
          </Paragraph>
        </Card.Content>
      </Card>
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
      <Title style={{ color: theme.colors.onBackground, marginTop: 20 }}>
        Analyzing your results...
      </Title>
      <Paragraph style={{ color: theme.colors.onSurfaceVariant }}>
        Please wait a moment.
      </Paragraph>
    </View>
  );
}

function ReportScreen({
  name,
  onRestart,
}: {
  name: string;
  onRestart: () => void;
}) {
  const theme = useTheme();
  const { scores } = useInterviewContext();

  if (!scores) {
    return (
      <View
        style={[
          styles.fullPage,
          styles.centered,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Avatar.Icon
          icon="alert-circle-outline"
          size={60}
          color={theme.colors.error}
          style={{ backgroundColor: "transparent" }}
        />
        <Title style={{ color: theme.colors.onBackground }}>
          No Results Found
        </Title>
        <Paragraph
          style={{
            color: theme.colors.onSurfaceVariant,
            textAlign: "center",
            marginHorizontal: 20,
          }}
        >
          There was an issue generating your report.
        </Paragraph>
        <Button mode="contained" onPress={onRestart} style={{ marginTop: 20 }}>
          Try Again
        </Button>
      </View>
    );
  }

  const scoreItems = [
    { name: "Empathy", data: scores.empathy },
    { name: "Innovation", data: scores.innovation },
    { name: "Passion", data: scores.passion },
    { name: "Trust", data: scores.trust },
    { name: "Insight", data: scores.insight },
  ];

  return (
    <View
      style={[styles.fullPage, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.reportContainer}>
        <Title style={styles.reportTitle}>Interview Report for {name}</Title>
        <Card
          style={[styles.reportCard, { backgroundColor: theme.colors.surface }]}
        >
          <Card.Content>
            <Title>Overall Summary</Title>
            <Paragraph style={{ color: theme.colors.onSurfaceVariant }}>
              {scores.summary}
            </Paragraph>
            <View style={styles.averageScoreContainer}>
              <Text
                style={[
                  styles.averageScoreText,
                  { color: theme.colors.primary },
                ]}
              >
                Average Score: {scores.average}%
              </Text>
            </View>
          </Card.Content>
        </Card>

        <Title style={styles.reportSubtitle}>Detailed Breakdown</Title>

        <List.Section
          style={[
            styles.reportCard,
            { backgroundColor: theme.colors.surface, paddingHorizontal: 0 },
          ]}
        >
          {scoreItems.map((item, index) => (
            <List.Accordion
              key={index}
              title={`${item.name}: ${item.data.score}/10`}
              left={(props) => <List.Icon {...props} icon="star-circle" />}
              style={{
                backgroundColor: theme.colors.surface,
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.outlineVariant,
              }}
            >
              <List.Item
                title="Reasoning"
                description={item.data.reasoning}
                descriptionNumberOfLines={10}
                style={{ paddingHorizontal: 24, paddingVertical: 8 }}
              />
            </List.Accordion>
          ))}
        </List.Section>

        <Button
          mode="contained"
          onPress={onRestart}
          style={styles.restartButton}
          icon="reload"
        >
          Take Interview Again
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fullPage: { flex: 1, width: "100%" },
  centered: { justifyContent: "center", alignItems: "center" },
  welcomeContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  welcomeTitle: { fontSize: 28, fontWeight: "bold", textAlign: "center" },
  welcomeSubtitle: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 16,
    maxWidth: 400,
    color: "#6c757d",
  },
  nameInput: { width: "100%", maxWidth: 320, marginTop: 8 },
  startButton: { marginTop: 24, width: "100%", maxWidth: 320 },
  startButtonContent: { paddingVertical: 8, flexDirection: "row-reverse" },
  chatArea: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  messageContainer: {
    flexDirection: "row",
    marginVertical: 8,
    maxWidth: "85%",
    alignItems: "flex-end",
  },
  userMessage: { alignSelf: "flex-end", flexDirection: "row-reverse" },
  aiMessage: { alignSelf: "flex-start" },
  messageCard: { borderRadius: 18 },
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
  reportContainer: { padding: 24, alignItems: "center" },
  reportTitle: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  reportSubtitle: {
    fontSize: 22,
    fontWeight: "600",
    marginTop: 24,
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  reportCard: {
    width: "100%",
    maxWidth: 700,
    marginBottom: 16,
    borderRadius: 12,
  },
  averageScoreContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderColor: "#e0e0e0",
  },
  averageScoreText: { fontSize: 20, fontWeight: "bold", textAlign: "center" },
  restartButton: {
    marginTop: 24,
    width: "100%",
    maxWidth: 700,
    paddingVertical: 8,
  },
});
