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
  List,
  RadioButton,
  ProgressBar,
} from "react-native-paper";
import { OPENAI_API_KEY, LOCAL_RELAY_SERVER_URL } from "../../../constants/env";
import {
  InterviewProvider,
  useInterviewContext,
} from "../../../contexts/interviewContext";
import { createInterviewConfig } from "../../../utils/interviewConfig";
import {
  calculateInterviewCost,
  UsageData,
} from "../../../utils/costEstimator";

interface ScoreType {
  englishProficiency: { score: number; reasoning: string };
  bahasaMalaysiaProficiency: { score: number; reasoning: string };
  codeSwitching: { score: number; reasoning: string };
  empathyAndCustomerHandling: { score: number; reasoning: string };
  confidenceAndClarity: { score: number; reasoning: string };
  summary: string;
  average: number;
}

type PagePhase =
  | "welcome"
  | "preparation"
  | "interview"
  | "analyzing"
  | "report";
type Language = "Malay" | "Mandarin" | "Korean" | "Japanese";

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
  const [conversation, setConversation] = useState<ItemType[]>([]);
  const { setScores, language, setLanguage, setUsage } = useInterviewContext();

  const handleStartInterview = (submittedName: string, lang: Language) => {
    if (submittedName.trim()) {
      setName(submittedName);
      setLanguage(lang);
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
    setName("");
    setScores(null);
    setLanguage(null);
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
          name={name}
          language={language!}
          setConversation={setConversation}
        />
      );
    case "analyzing":
      return <AnalyzingScreen />;
    case "report":
      return (
        <ReportScreen
          name={name}
          onRestart={handleRestart}
          conversation={conversation}
        />
      );
    default:
      return <WelcomeScreen onStart={handleStartInterview} />;
  }
}

function WelcomeScreen({
  onStart,
}: {
  onStart: (name: string, language: Language) => void;
}) {
  const [name, setName] = useState("");
  const [language, setLanguage] = useState<Language>("Malay");
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
          color={theme.colors.onPrimary}
        />
        <Text
          style={[styles.welcomeTitle, { color: theme.colors.onBackground }]}
        >
          AI-Powered Interview
        </Text>
        <Text
          style={[
            styles.welcomeSubtitle,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          Welcome to your automated customer service interview. Please enter
          your name and select your specialized language to begin.
        </Text>
        <TextInput
          mode="outlined"
          label="Your Name"
          value={name}
          onChangeText={setName}
          style={styles.nameInput}
          autoFocus
        />
        <View style={styles.languageSelector}>
          <Text
            style={[styles.languageLabel, { color: theme.colors.onSurface }]}
          >
            Select Language:
          </Text>
          <RadioButton.Group
            onValueChange={(newValue) => setLanguage(newValue as Language)}
            value={language}
          >
            <View style={styles.radioRow}>
              <RadioButton.Item label="Malay" value="Malay" />
              <RadioButton.Item label="Mandarin" value="Mandarin" />
            </View>
            <View style={styles.radioRow}>
              <RadioButton.Item label="Korean" value="Korean" />
              <RadioButton.Item label="Japanese" value="Japanese" />
            </View>
          </RadioButton.Group>
        </View>
        <Button
          mode="contained"
          icon="arrow-right"
          onPress={() => onStart(name, language)}
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

function InterviewScreen({
  onEndRequest,
  name,
  language,
  setConversation,
}: {
  onEndRequest: () => void;
  name: string;
  language: Language;
  setConversation: React.Dispatch<React.SetStateAction<ItemType[]>>;
}) {
  const theme = useTheme();
  const { scores, setScores, setUsage } = useInterviewContext();
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
        text: `Hello! My name is ${name}, and I am ready for my customer service interview specialized in ${language}.`,
      },
    ]);
    await wavRecorder.record((data) => client.appendInputAudio(data.mono));
  }, [name, language]);

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
                text: "That is all for today, thank you for your time. Please provide the scores now.",
              },
            ]);
          },
        },
      ]
    );
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
    const config = createInterviewConfig(language);
    client.updateSession({
      instructions: config.instructions,
      voice: "echo",
      input_audio_transcription: { model: "whisper-1", language: "ms" },
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
  }, [setScores, language]);

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
  name,
  onRestart,
  conversation,
}: {
  name: string;
  onRestart: () => void;
  conversation: ItemType[];
}) {
  const theme = useTheme();
  const { scores, language, usage } = useInterviewContext();
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);

  const costResult = usage ? calculateInterviewCost(usage) : null;

  if (!scores || !usage || !costResult) {
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
        <Text
          style={[
            styles.reportTitle,
            { color: theme.colors.onBackground, fontSize: 22, marginTop: 16 },
          ]}
        >
          No Results Found
        </Text>
        <Text
          style={{
            color: theme.colors.onSurfaceVariant,
            textAlign: "center",
            marginHorizontal: 20,
            marginTop: 8,
          }}
        >
          There was an issue generating your report.
        </Text>
        <Button mode="contained" onPress={onRestart} style={{ marginTop: 20 }}>
          Try Again
        </Button>
      </View>
    );
  }

  const scoreItems = [
    { name: "English Proficiency", data: scores.englishProficiency },
    {
      name: "Bahasa Malaysia Proficiency",
      data: scores.bahasaMalaysiaProficiency,
    },
    { name: "Code-Switching & Natural Tone", data: scores.codeSwitching },
    {
      name: "Empathy & Customer Handling",
      data: scores.empathyAndCustomerHandling,
    },
    { name: "Confidence & Clarity", data: scores.confidenceAndClarity },
  ];

  return (
    <View
      style={[styles.fullPage, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.reportHeader}>
        <Text
          style={[styles.reportTitle, { color: theme.colors.onBackground }]}
        >
          Interview Report
        </Text>
        <Text
          style={[styles.reportFor, { color: theme.colors.onSurfaceVariant }]}
        >
          For {name}
        </Text>
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
              <View style={styles.summaryHeader}>
                <Text
                  style={[
                    styles.summaryTitle,
                    { color: theme.colors.onSurface },
                  ]}
                >
                  Overall Performance
                </Text>
                <Text
                  style={[
                    styles.averageScoreText,
                    { color: theme.colors.primary },
                  ]}
                >
                  {scores.average.toFixed(1)}/5
                </Text>
              </View>
              <Text
                style={[
                  styles.summaryParagraph,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                {scores.summary}
              </Text>
            </Card.Content>
          </Card>

          <Text
            style={[
              styles.reportSubtitle,
              { color: theme.colors.onBackground },
            ]}
          >
            Detailed Breakdown
          </Text>
          <Card
            style={[
              styles.reportCard,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <List.Section style={{ paddingHorizontal: 0, marginVertical: 0 }}>
              {scoreItems.map((item, index) => (
                <List.Accordion
                  key={index}
                  title={`${item.name}`}
                  titleStyle={{
                    color: theme.colors.onSurface,
                    fontWeight: "bold",
                  }}
                  left={(props) => (
                    <List.Icon
                      {...props}
                      icon="star-circle"
                      color={theme.colors.primary}
                    />
                  )}
                  right={(props) => (
                    <Text
                      style={{
                        color: theme.colors.primary,
                        alignSelf: "center",
                      }}
                    >
                      {item.data.score}/5
                    </Text>
                  )}
                  style={{
                    backgroundColor: theme.colors.surface,
                    borderBottomWidth:
                      index === scoreItems.length - 1 ? 0 : 1,
                    borderBottomColor: theme.colors.outlineVariant,
                  }}
                  expanded={activeAccordion === item.name}
                  onPress={() =>
                    setActiveAccordion(
                      activeAccordion === item.name ? null : item.name
                    )
                  }
                >
                  <View style={{ padding: 16, paddingTop: 0 }}>
                    <ProgressBar
                      progress={item.data.score / 5}
                      color={theme.colors.primary}
                      style={{
                        marginBottom: 12,
                        height: 8,
                        borderRadius: 4,
                      }}
                    />
                    <Text
                      style={{
                        color: theme.colors.onSurfaceVariant,
                        lineHeight: 20,
                      }}
                    >
                      {item.data.reasoning}
                    </Text>
                  </View>
                </List.Accordion>
              ))}
            </List.Section>
          </Card>
        </View>

        <View style={styles.reportColumn}>
          <Text
            style={[
              styles.reportSubtitle,
              { color: theme.colors.onBackground },
            ]}
          >
            Cost Estimation
          </Text>
          <Card
            style={[
              styles.reportCard,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Card.Content>
              <View style={styles.costRow}>
                <Text>Input Tokens</Text>
                <Text>{usage.inputTokens}</Text>
              </View>
              <View style={styles.costRow}>
                <Text>Output Tokens</Text>
                <Text>{usage.outputTokens}</Text>
              </View>
              <View style={styles.costRow}>
                <Text>Duration (minutes)</Text>
                <Text>
                  {((usage.audioInputDuration ?? 0) / 60).toFixed(2)}
                </Text>
              </View>
              <View style={styles.costRow}>
                <Text>GPT Input (USD)</Text>
                <Text>{costResult.gptInputCostUSD.toFixed(4)}</Text>
              </View>
              <View style={styles.costRow}>
                <Text>GPT Output (USD)</Text>
                <Text>{costResult.gptOutputCostUSD.toFixed(4)}</Text>
              </View>
              <View style={styles.costRow}>
                <Text>Whisper (USD)</Text>
                <Text>{costResult.whisperCostUSD.toFixed(4)}</Text>
              </View>
              <View style={styles.totalCostRow}>
                <Text style={{ fontWeight: "bold" }}>Total (USD)</Text>
                <Text style={{ fontWeight: "bold" }}>
                  ${costResult.totalCostUSD}
                </Text>
              </View>
              <View style={styles.totalCostRow}>
                <Text style={{ fontWeight: "bold" }}>Total (MYR)</Text>
                <Text style={{ fontWeight: "bold" }}>
                  RM{costResult.totalCostMYR.toFixed(2)}
                </Text>
              </View>
            </Card.Content>
          </Card>

          <Text
            style={[
              styles.reportSubtitle,
              { color: theme.colors.onBackground },
            ]}
          >
            Full Transcript
          </Text>
          <Card
            style={[
              styles.reportCard,
              { backgroundColor: theme.colors.surface, flex: 1 },
            ]}
          >
            <Card.Content style={{ flex: 1 }}>
              <ScrollView style={{ flex: 1 }}>
                {conversation.map((item, index) => {
                  const speaker =
                    item.role === "user" ? name : "Laive Interviewer";
                  const rawTranscript = item.formatted?.transcript;
                  const finalText = item.formatted?.text;

                  return (
                    <View key={index} style={{ marginVertical: 8 }}>
                      <Text style={{ fontWeight: "bold" }}>{speaker}:</Text>
                      {rawTranscript && (
                        <Text
                          selectable
                          style={{ color: theme.colors.onSurfaceVariant }}
                        >
                          <Text style={{ fontWeight: "bold" }}>[RAW]: </Text>
                          {rawTranscript}
                        </Text>
                      )}
                      {finalText && (
                        <Text
                          selectable
                          style={{ color: theme.colors.onSurface }}
                        >
                          <Text style={{ fontWeight: "bold" }}>
                            [FINAL]:{" "}
                          </Text>
                          {finalText}
                        </Text>
                      )}
                      {!rawTranscript && !finalText && (
                        <Text selectable style={{ fontStyle: "italic" }}>
                          ... (no text content)
                        </Text>
                      )}
                    </View>
                  );
                })}
              </ScrollView>
            </Card.Content>
          </Card>
          <Button
            mode="contained"
            onPress={onRestart}
            style={styles.restartButton}
            icon="reload"
          >
            Take Interview Again
          </Button>
        </View>
      </View>
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
  },
  nameInput: { width: "100%", maxWidth: 320, marginTop: 8 },
  languageSelector: {
    marginTop: 20,
    width: "100%",
    maxWidth: 320,
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
  startButton: { marginTop: 24, width: "100%", maxWidth: 320 },
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
  reportHeader: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: "center",
    width: "100%",
  },
  reportTitle: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },
  reportFor: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 24,
  },
  reportBody: {
    flexDirection: "row",
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  reportColumn: {
    flex: 1,
    paddingHorizontal: 12,
  },
  reportSubtitle: {
    fontSize: 22,
    fontWeight: "600",
    marginTop: 24,
    marginBottom: 12,
    alignSelf: "flex-start",
    width: "100%",
  },
  reportCard: {
    width: "100%",
    marginBottom: 16,
    borderRadius: 12,
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  summaryParagraph: {
    fontSize: 14,
    lineHeight: 20,
  },
  costRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  totalCostRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: "#e0e0e0",
  },
  averageScoreText: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },
  restartButton: {
    marginTop: "auto",
    paddingVertical: 8,
  },
});
