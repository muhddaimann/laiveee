import React, {
  useEffect,
  useRef,
  useCallback,
  useState,
  RefObject,
} from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from "react-native";
import { RealtimeClient } from "@openai/realtime-api-beta";
import { ItemType } from "@openai/realtime-api-beta/dist/lib/client.js";
import { WavRecorder, WavStreamPlayer } from "../../../lib/wavtools/index.js";
import { WavRenderer } from "../../../utils/wavRenderer";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme, Button, ProgressBar, TextInput } from "react-native-paper";
import { OPENAI_API_KEY, LOCAL_RELAY_SERVER_URL } from "../../../constants/env";
import {
  InterviewProvider,
  useInterviewContext,
} from "../../../contexts/interviewContext";
import { interviewConfig } from "../../../utils/interviewConfig";

interface ChatCardProps {
  items: any[];
  deleteConversationItem: (id: string) => void;
}
interface ActionCardProps {
  isConnected: boolean;
  connectConversation: () => void;
  disconnectConversation: () => void;
  toggleMute: () => void;
  muted: boolean;
}
interface IconCardProps {
  clientCanvasRef: RefObject<HTMLCanvasElement | null>;
  serverCanvasRef: RefObject<HTMLCanvasElement | null>;
}
interface ScoreType {
  empathy: { score: number; reasoning: string };
  innovation: { score: number; reasoning: string };
  passion: { score: number; reasoning: string };
  trust: { score: number; reasoning: string };
  insight: { score: number; reasoning: string };
  summary: string;
  average: number;
}

function NameModal({
  visible,
  onSubmit,
}: {
  visible: boolean;
  onSubmit: (name: string) => void;
}) {
  const [name, setName] = useState("");
  const theme = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View
          style={[styles.card, { backgroundColor: theme.colors.background }]}
        >
          <Text style={[styles.title, { color: theme.colors.primary }]}>
            Welcome to the Interview!
          </Text>

          <TextInput
            mode="outlined"
            label="Your Name"
            value={name}
            onChangeText={setName}
            style={{ marginTop: 8 }}
          />

          <View style={styles.actions}>
            <Button mode="contained" onPress={() => onSubmit(name)}>
              Start Interview
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function ResultsModal({
  visible,
  name,
  onBack,
}: {
  visible: boolean;
  name: string;
  onBack: () => void;
}) {
  const theme = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View
          style={[styles.card, { backgroundColor: theme.colors.background }]}
        >
          <Text style={[styles.title, { color: theme.colors.primary }]}>
            Interview Results for {name}
          </Text>
          <ScrollView style={{ maxHeight: 300, marginTop: 12 }}>
            <ScoringFeedback />
          </ScrollView>
          <View style={styles.actions}>
            <Button mode="contained" onPress={onBack}>
              Back to Interview
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function InterviewPage() {
  const theme = useTheme();
  const [name, setName] = useState("");
  const [nameModalVisible, setNameModalVisible] = useState(true);

  const handleNameSubmit = (submittedName: string) => {
    if (submittedName.trim()) {
      setName(submittedName);
      setNameModalVisible(false);
    }
  };

  return (
    <InterviewProvider>
      <NameModal visible={nameModalVisible} onSubmit={handleNameSubmit} />
      {!nameModalVisible && (
        <View
          style={[
            styles.pageContainer,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <View style={styles.leftColumn}>
            <BasicInterview name={name} />
          </View>
          <View style={styles.rightColumn}>
            <ScoringFeedback />
          </View>
        </View>
      )}
    </InterviewProvider>
  );
}

function ScoringFeedback() {
  const theme = useTheme();
  const { scores } = useInterviewContext();
  const progress = scores
    ? Object.values(scores).filter(
        (s) => s && typeof s === "object" && s.hasOwnProperty("score")
      ).length / 5
    : 0;

  return (
    <View
      style={[
        styles.scoringContainer,
        { backgroundColor: theme.colors.surface },
      ]}
    >
      <Text
        style={[
          styles.scoringTitle,
          { color: theme.colors.onSurface, marginBottom: 12 },
        ]}
      >
        Scoring & Feedback
      </Text>
      <ProgressBar progress={progress} color={theme.colors.primary} />
      {scores ? (
        <ScrollView>
          <View style={styles.scoringContent}>
            <Text
              style={[styles.scoringItem, { color: theme.colors.onSurface }]}
            >
              Empathy: {scores.empathy.score}/10
            </Text>
            <Text
              style={[
                styles.reasoningText,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {scores.empathy.reasoning}
            </Text>
            <Text
              style={[styles.scoringItem, { color: theme.colors.onSurface }]}
            >
              Innovation: {scores.innovation.score}/10
            </Text>
            <Text
              style={[
                styles.reasoningText,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {scores.innovation.reasoning}
            </Text>
            <Text
              style={[styles.scoringItem, { color: theme.colors.onSurface }]}
            >
              Passion: {scores.passion.score}/10
            </Text>
            <Text
              style={[
                styles.reasoningText,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {scores.passion.reasoning}
            </Text>
            <Text
              style={[styles.scoringItem, { color: theme.colors.onSurface }]}
            >
              Trust: {scores.trust.score}/10
            </Text>
            <Text
              style={[
                styles.reasoningText,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {scores.trust.reasoning}
            </Text>
            <Text
              style={[styles.scoringItem, { color: theme.colors.onSurface }]}
            >
              Insight: {scores.insight.score}/10
            </Text>
            <Text
              style={[
                styles.reasoningText,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {scores.insight.reasoning}
            </Text>
            <Text
              style={[
                styles.summaryTitle,
                { color: theme.colors.onSurface, marginTop: 12 },
              ]}
            >
              Summary
            </Text>
            <Text
              style={[
                styles.summaryText,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {scores.summary}
            </Text>
            <Text
              style={[
                styles.averageScore,
                { color: theme.colors.primary, marginTop: 12 },
              ]}
            >
              Average Score: {scores.average}%
            </Text>
          </View>
        </ScrollView>
      ) : (
        <Text
          style={[styles.noFeedback, { color: theme.colors.onSurfaceVariant }]}
        >
          No feedback yet.
        </Text>
      )}
    </View>
  );
}

function BasicInterview({ name }: { name: string }) {
  const theme = useTheme();
  const { scores, setScores } = useInterviewContext();
  const [isLoading, setIsLoading] = useState(false);
  const [resultsModalVisible, setResultsModalVisible] = useState(false);

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
        : {
            apiKey: OPENAI_API_KEY,
            dangerouslyAllowAPIKeyInBrowser: true,
          }
    )
  );
  const clientCanvasRef = useRef<HTMLCanvasElement>(null);
  const serverCanvasRef = useRef<HTMLCanvasElement>(null);
  const [items, setItems] = useState<ItemType[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [muted, setMuted] = useState(false);

  const connectConversation = useCallback(async () => {
    if (!LOCAL_RELAY_SERVER_URL && !OPENAI_API_KEY) {
      const errorMessage =
        "No API key or relay server URL provided. Please set EXPO_PUBLIC_OPENAI_API_KEY or EXPO_PUBLIC_LOCAL_RELAY_SERVER_URL in your .env file.";
      console.error(errorMessage);
      alert(errorMessage);
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
    await client.updateSession({
      turn_detection: { type: "server_vad" },
    });
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

  const disconnectConversation = useCallback(async () => {
    const client = clientRef.current;
    client.sendUserMessageContent([
      {
        type: "input_text",
        text: "The interview is over. Please provide the scores.",
      },
    ]);
  }, []);

  const deleteConversationItem = useCallback(async (id: string) => {
    const client = clientRef.current;
    client.deleteItem(id);
  }, []);

  useEffect(() => {
    if (scores) {
      setIsLoading(true);
      const client = clientRef.current;
      client.disconnect();
      const wavRecorder = wavRecorderRef.current;
      wavRecorder.end();
      const wavStreamPlayer = wavStreamPlayerRef.current;
      wavStreamPlayer.interrupt();
      setTimeout(() => {
        setIsConnected(false);
        setIsLoading(false);
        setResultsModalVisible(true);
      }, 3000);
    }
  }, [scores]);

  useEffect(() => {
    let isLoaded = true;
    const wavRecorder = wavRecorderRef.current;
    const clientCanvas = clientCanvasRef.current;
    let clientCtx: CanvasRenderingContext2D | null = null;
    const wavStreamPlayer = wavStreamPlayerRef.current;
    const serverCanvas = serverCanvasRef.current;
    let serverCtx: CanvasRenderingContext2D | null = null;
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
        if (serverCanvas) {
          if (!serverCanvas.width || !serverCanvas.height) {
            serverCanvas.width = serverCanvas.offsetWidth;
            serverCanvas.height = serverCanvas.offsetHeight;
          }
          serverCtx = serverCtx || serverCanvas.getContext("2d");
          if (serverCtx) {
            serverCtx.clearRect(0, 0, serverCanvas.width, serverCanvas.height);
            const result = wavStreamPlayer.analyser
              ? wavStreamPlayer.getFrequencies("voice")
              : { values: new Float32Array([0]) };
            WavRenderer.drawBars(
              serverCanvas,
              serverCtx,
              result.values,
              theme.colors.secondary,
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
  }, []);

  useEffect(() => {
    const wavStreamPlayer = wavStreamPlayerRef.current;
    const client = clientRef.current;
    client.updateSession({
      instructions: interviewConfig.instructions,
    });
    client.updateSession({ voice: "echo" });
    client.updateSession({ input_audio_transcription: { model: "whisper-1" } });
    client.addTool(interviewConfig.tool, async (scores: ScoreType) => {
      setScores(scores);
      return { success: true };
    });

    client.on("error", (event: any) => console.error(event));
    client.on("conversation.interrupted", async () => {
      const trackSampleOffset = await wavStreamPlayer.interrupt();
      if (trackSampleOffset?.trackId) {
        const { trackId, offset } = trackSampleOffset;
        await client.cancelResponse(trackId, offset);
      }
    });
    client.on("conversation.updated", async ({ item, delta }: any) => {
      const updatedItems = client.conversation.getItems();
      if (delta?.audio) {
        wavStreamPlayer.add16BitPCM(delta.audio, item.id);
      }
      setItems(updatedItems);
    });
    setItems(client.conversation.getItems());
    return () => {
      client.reset();
    };
  }, []);

  return (
    <View style={styles.interviewContainer}>
      <Modal visible={isLoading} transparent>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text
            style={[styles.loadingText, { color: theme.colors.onBackground }]}
          >
            Generating Results...
          </Text>
        </View>
      </Modal>
      <ResultsModal
        visible={resultsModalVisible}
        name={name}
        onBack={() => {
          setResultsModalVisible(false);
          setItems([]);
          setScores(null);
        }}
      />
      <View style={styles.chatContainer}>
        <ChatCard
          items={items}
          deleteConversationItem={deleteConversationItem}
        />
      </View>
      <View style={styles.controlsContainer}>
        <ActionCard
          isConnected={isConnected}
          connectConversation={connectConversation}
          disconnectConversation={disconnectConversation}
          toggleMute={toggleMute}
          muted={muted}
        />
      </View>
      <View style={styles.vizContainer}>
        <IconCard
          clientCanvasRef={clientCanvasRef}
          serverCanvasRef={serverCanvasRef}
        />
      </View>
    </View>
  );
}

function ActionCard({
  isConnected,
  connectConversation,
  disconnectConversation,
  toggleMute,
  muted,
}: ActionCardProps) {
  const theme = useTheme();
  const micBgColor = muted
    ? theme.colors.primaryContainer
    : theme.colors.errorContainer;
  const micTextColor = muted
    ? theme.colors.onPrimaryContainer
    : theme.colors.onErrorContainer;
  return (
    <View style={styles.actionCard}>
      <View style={styles.row}>
        {!isConnected ? (
          <>
            <Button
              mode="contained"
              icon="link-variant-plus"
              textColor={theme.colors.onPrimary}
              buttonColor={theme.colors.primary}
              onPress={connectConversation}
              style={styles.paperButton}
              contentStyle={styles.buttonContent}
            >
              Start Interview
            </Button>
          </>
        ) : (
          <>
            <Button
              mode="contained"
              icon={muted ? "microphone-off" : "microphone"}
              textColor={micTextColor}
              buttonColor={micBgColor}
              onPress={toggleMute}
              style={styles.paperButton}
              contentStyle={styles.buttonContent}
            >
              {muted ? "Unmute" : "Mute"}
            </Button>
            <Button
              mode="contained"
              icon="link-variant-remove"
              textColor={theme.colors.onError}
              buttonColor={theme.colors.error}
              onPress={disconnectConversation}
              style={styles.paperButton}
              contentStyle={styles.buttonContent}
            >
              End Interview
            </Button>
          </>
        )}
      </View>
    </View>
  );
}

function ChatCard({ items, deleteConversationItem }: ChatCardProps) {
  const theme = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [items]);
  return (
    <View
      style={[
        styles.chatCard,
        { backgroundColor: theme.colors.surface, padding: 10 },
      ]}
    >
      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        contentContainerStyle={
          !items.length ? { flex: 1, justifyContent: "center" } : undefined
        }
      >
        {!items.length ? (
          <View style={styles.emptyChatContainer}>
            <MaterialCommunityIcons
              name="pulse"
              size={48}
              color={theme.colors.primary}
            />
            <Text
              style={[
                styles.emptyChatText,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Tap Start Interview to begin
            </Text>
          </View>
        ) : (
          items.map((item) => (
            <View
              key={item.id}
              style={[
                styles.messageBubbleContainer,
                item.role === "user"
                  ? styles.userMessageContainer
                  : styles.assistantMessageContainer,
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  {
                    backgroundColor:
                      item.role === "user"
                        ? theme.colors.primaryContainer
                        : theme.colors.secondaryContainer,
                  },
                ]}
              >
                <View style={styles.messageHeader}>
                  <Text
                    style={{
                      fontWeight: "600",
                      color:
                        item.role === "user"
                          ? theme.colors.onPrimaryContainer
                          : theme.colors.onSecondaryContainer,
                    }}
                  >
                    {item.role === "user" ? "You" : "Interviewer"}
                  </Text>
                  <TouchableOpacity
                    onPress={() => deleteConversationItem(item.id)}
                  >
                    <MaterialCommunityIcons
                      name="close"
                      size={18}
                      color={
                        item.role === "user"
                          ? theme.colors.onPrimaryContainer
                          : theme.colors.onSecondaryContainer
                      }
                    />
                  </TouchableOpacity>
                </View>
                <Text
                  style={{
                    color:
                      item.role === "user"
                        ? theme.colors.onPrimaryContainer
                        : theme.colors.onSecondaryContainer,
                  }}
                >
                  {item.formatted?.transcript ||
                    item.formatted?.text ||
                    "Thinking..."}
                </Text>
                {item.formatted?.file && (
                  <audio src={item.formatted.file.url} controls />
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

function IconCard({ clientCanvasRef, serverCanvasRef }: IconCardProps) {
  return (
    <View style={styles.iconCard}>
      <View style={{ flex: 1, flexDirection: "row" }}>
        <View style={{ flex: 1 }}>
          <canvas
            ref={clientCanvasRef}
            style={{ width: "100%", height: "100%" }}
          />
        </View>
        <View style={{ flex: 1 }}>
          <canvas
            ref={serverCanvasRef}
            style={{ width: "100%", height: "100%" }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pageContainer: { flex: 1, flexDirection: "row", padding: 16, gap: 16 },
  backdrop: {
    flex: 1,
    backgroundColor: "#00000080",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 440,
    borderRadius: 20,
    padding: 20,
    elevation: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 24,
  },

  leftColumn: { flex: 1 },
  rightColumn: { flex: 1 },
  scoringCard: { flex: 1 },
  interviewContainer: { flex: 1, flexDirection: "column", gap: 16 },
  chatContainer: { flex: 8 },
  controlsContainer: { flex: 1 },
  vizContainer: { flex: 2 },
  actionCard: { flex: 1, borderRadius: 16, justifyContent: "center" },
  chatCard: { flex: 1, borderRadius: 16, justifyContent: "center" },
  iconCard: { flex: 1, borderRadius: 16, justifyContent: "center" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 100,
  },
  paperButton: { flex: 1, borderRadius: 12 },
  buttonContent: { flexDirection: "row-reverse", gap: 8 },
  messageBubbleContainer: {
    gap: 8,
    minWidth: "50%",
    marginBottom: 12,
    maxWidth: "80%",
  },
  userMessageContainer: { alignSelf: "flex-end" },
  assistantMessageContainer: { alignSelf: "flex-start" },
  messageBubble: { padding: 10, gap: 8, borderRadius: 12 },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  emptyChatContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    gap: 10,
  },
  emptyChatText: { textAlign: "center", fontSize: 16, lineHeight: 24 },
  scoringContainer: { flex: 1, padding: 16, borderRadius: 16 },
  scoringTitle: { fontSize: 20, fontWeight: "700" },
  scoringContent: { gap: 8 },
  scoringItem: { fontSize: 16, lineHeight: 24, fontWeight: "600" },
  reasoningText: { fontSize: 14, lineHeight: 20, marginBottom: 8 },
  summaryTitle: { fontSize: 18, fontWeight: "700" },
  summaryText: { fontSize: 14, lineHeight: 20 },
  averageScore: { fontSize: 16, fontWeight: "700" },
  noFeedback: { fontSize: 16 },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalTitle: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: {
    width: "80%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  loadingText: { fontSize: 18, marginTop: 10 },
});
