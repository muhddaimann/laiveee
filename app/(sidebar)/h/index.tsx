import React, { useState, useCallback, useEffect, useRef } from "react";
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
import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.js";
import pdfjsWorker from "pdfjs-dist/legacy/build/pdf.worker.entry";
import { HProvider, useHContext } from "../../../contexts/hContext";
import {
  createCandidateAnalyzerConfig,
  createInterviewConfig,
} from "../../../utils/hConfig";
import {
  OPENAI_API_KEY,
  COMPLETION_URL,
  LOCAL_RELAY_SERVER_URL,
} from "../../../constants/env";
import { RealtimeClient } from "@openai/realtime-api-beta";
import { ItemType } from "@openai/realtime-api-beta/dist/lib/client.js";
import { WavRecorder, WavStreamPlayer } from "../../../lib/wavtools/index";
import { WavRenderer } from "../../../utils/wavRenderer";
import {
  calculateInterviewCost,
  UsageData,
} from "../../../utils/costEstimator";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

type PagePhase =
  | "welcome"
  | "analyzing"
  | "preparation"
  | "interview"
  | "ending";

export default function LaiveTest() {
  return (
    <HProvider>
      <ResumeAnalysisFlow />
    </HProvider>
  );
}

function ResumeAnalysisFlow() {
  const [phase, setPhase] = useState<PagePhase>("welcome");
  const { setCandidateData, roleApply, setConversation, setScores, setUsage } =
    useHContext();

  const handleStartAnalysis = async (file: File) => {
    setPhase("analyzing");
    try {
      const text = await extractText(file);
      const config = createCandidateAnalyzerConfig(roleApply || "");
      const response = await fetch(COMPLETION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4-turbo",
          messages: [
            { role: "system", content: config.instructions },
            { role: "user", content: text },
          ],
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorBody}`);
      }

      const result = await response.json();
      const parsedData = JSON.parse(result.choices[0].message.content);
      setCandidateData(parsedData);
      setPhase("preparation");
    } catch (err) {
      console.error("Error during file upload and analysis: ", err);
      Alert.alert(
        "Error",
        "An error occurred during the analysis. Please try again."
      );
      setPhase("welcome");
    }
  };

  const handleProceed = () => {
    setPhase("interview");
  };

  const handleEndInterview = useCallback(() => {
    setPhase("analyzing");
    setTimeout(() => {
      setPhase("ending");
    }, 4000);
  }, []);

  const handleRestart = () => {
    setPhase("welcome");
    setCandidateData(null);
    setScores(null);
    setConversation([]);
    setUsage(null);
  };

  switch (phase) {
    case "welcome":
      return <WelcomeScreen onStart={handleStartAnalysis} />;
    case "analyzing":
      return (
        <AnalyzingScreen
          title="Analyzing Your Profile"
          subtitle="Please wait while we process your information..."
        />
      );
    case "preparation":
      return (
        <PreparationScreen onProceed={handleProceed} onBack={handleRestart} />
      );
    case "interview":
      return (
        <InterviewScreen
          onEndRequest={handleEndInterview}
          setConversation={setConversation}
        />
      );
    case "ending":
      return <EndingScreen onRestart={handleRestart} />;
    default:
      return <WelcomeScreen onStart={handleStartAnalysis} />;
  }
}

async function extractText(file: File): Promise<string> {
  if (file.type === "application/pdf") {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item: any) => item.str).join(" ") + "\n";
    }
    return text;
  } else if (
    file.type ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } else {
    throw new Error("Unsupported file type");
  }
}

function WelcomeScreen({ onStart }: { onStart: (file: File) => void }) {
  const theme = useTheme();
  const { shortName, setShortName, roleApply, setRoleApply, setFileName } =
    useHContext();

  const handleUpload = async () => {
    if (!shortName?.trim() || !roleApply?.trim()) {
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
        const asset = result.assets[0];
        setFileName(asset.name);
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        const file = new File([blob], asset.name, { type: asset.mimeType });
        onStart(file);
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
                value={shortName || ""}
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
                value={roleApply || ""}
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
                disabled={!shortName?.trim()}
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
}: {
  onProceed: () => void;
  onBack: () => void;
}) {
  const theme = useTheme();
  const { shortName, fileName, languagePref, setLanguagePref, candidateData } =
    useHContext();

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

  if (!candidateData) {
    return <AnalyzingScreen title="Loading..." subtitle="" />;
  }

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
                value={candidateData.fullName}
                disabled
                style={{ marginBottom: 16 }}
              />
              <TextInput
                label="Email Address"
                value={candidateData.candidateEmail}
                disabled
                style={{ marginBottom: 16 }}
              />
              <TextInput
                label="Phone Number"
                value={candidateData.candidatePhone}
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
            {" "}
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

const languageCodeMapping: { [key in string]: string } = {
  English: "en",
  "Bahasa Malaysia": "ms",
  Mandarin: "zh",
  Tamil: "ta",
};

function InterviewScreen({
  onEndRequest,
  setConversation,
}: {
  onEndRequest: () => void;
  setConversation: React.Dispatch<React.SetStateAction<ItemType[]>>;
}) {
  const theme = useTheme();
  const {
    scores,
    setScores,
    setUsage,
    shortName,
    roleApply,
    languagePref,
    candidateData,
  } = useHContext();
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
        text: `Hello! My name is ${shortName}, and I am ready for my interview for the ${roleApply} role, speaking in ${languagePref}.`,
      },
    ]);
    await wavRecorder.record((data) => client.appendInputAudio(data.mono));
  }, [shortName, roleApply, languagePref]);

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
    const config = createInterviewConfig(
      roleApply!,
      languagePref!,
      candidateData!
    );
    const transcriptionLanguage = languageCodeMapping[languagePref!] || "ms";

    client.updateSession({
      instructions: config.instructions,
      voice: "echo",
      input_audio_transcription: {
        model: "whisper-1",
        language: transcriptionLanguage,
      },
    });
    client.addTool(config.tool, async (scores: any) => {
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
  }, [setScores, roleApply, languagePref, candidateData]);

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
            <MessageBubble key={item.id} item={item} userName={shortName!} />
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

function EndingScreen({ onRestart }: { onRestart: () => void }) {
  const theme = useTheme();
  const {
    shortName,
    roleApply,
    languagePref,
    candidateData,
    scores,
    conversation,
    usage,
  } = useHContext();

  const costResult = usage ? calculateInterviewCost(usage) : null;

  const handleCopy = async () => {
    if (!candidateData || !scores || !costResult) {
      Alert.alert("Error", "No summary available to copy.");
      return;
    }
    const summaryText = `
# LaiveApply Interview Summary

## Candidate Details
- **Name:** ${shortName}
- **Role Applied For:** ${roleApply}
- **Interview Language:** ${languagePref}

## AI-Powered Resume Analysis
- **Full Name:** ${candidateData.fullName}
- **Email:** ${candidateData.candidateEmail}
- **Phone:** ${candidateData.candidatePhone}
- **Summary:** ${candidateData.professionalSummary}

## AI-Powered Interview Performance
- **Overall Average Score:** ${scores.average.toFixed(1)}/5
- **Overall Summary:** ${scores.summary}

### Score Breakdown
${Object.entries(scores)
  .filter(([key]) => key !== "summary" && key !== "average")
  .map(([key, value]) => {
    const typedValue = value as { score: number; reasoning: string };
    const formattedKey = key.replace(/([A-Z])/g, " $1").trim();
    return `- **${formattedKey}:** ${typedValue.score.toFixed(
      1
    )}/5\n  - *Reasoning:* ${typedValue.reasoning}`;
  })
  .join("\n")}

## Cost Estimation
- **Total Cost (USD):** $${costResult.totalCostUSD}
- **Total Cost (MYR):** RM${costResult.totalCostMYR.toFixed(2)}

## Full Transcript
${conversation
  .map((item) => {
    const speaker = item.role === "user" ? shortName : "Laive Interviewer";
    const text = item.formatted?.text || item.formatted?.transcript || "...";
    return `**${speaker}:** ${text}`;
  })
  .join("\n")}
`;

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
      <Text style={styles.welcomeTitle}>You're All Set, {shortName}!</Text>
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
});
