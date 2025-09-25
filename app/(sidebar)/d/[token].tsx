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
import { useLocalSearchParams, useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.js";
import pdfjsWorker from "pdfjs-dist/legacy/build/pdf.worker.entry";

import { DProvider, useDContext } from "../../../contexts/dContext";
import {
  createCandidateAnalyzerConfig,
  createInterviewConfig,
} from "../../../utils/dConfig";
import { getCandidateByToken } from "../../../contexts/api/candidate";
import { useSidebar } from "../../../contexts/sidebarContext";
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
  calculateGptCost,
  UsageData,
} from "../../../utils/costEstimator";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

type PagePhase =
  | "loading"
  | "welcome"
  | "analyzing"
  | "preparation"
  | "interview"
  | "ending"
  | "error";

export default function CandidateInterviewPage() {
  return (
    <DProvider>
      <InterviewFlow />
    </DProvider>
  );
}

function InterviewFlow() {
  const [phase, setPhase] = useState<PagePhase>("loading");
  const [error, setError] = useState<string | null>(null);
  const { token } = useLocalSearchParams<{ token: string }>();
  const { isVisible, toggleVisibility } = useSidebar();

  const {
    publicCandidate,
    setPublicCandidate,
    setCandidateData,
    setConversation,
    setScores,
    setAnalysisUsage,
    setInterviewUsage,
  } = useDContext();

  useEffect(() => {
    if (isVisible) toggleVisibility();
    return () => {
      if (!isVisible) toggleVisibility();
    };
  }, []);

  useEffect(() => {
    if (!token) {
      setError("No interview token provided.");
      setPhase("error");
      return;
    }
    const fetchCandidate = async () => {
      try {
        const res = await getCandidateByToken(token);
        setPublicCandidate(res.data);
        setPhase("welcome");
      } catch (e: any) {
        setError(
          e.response?.data?.error || "Could not find interview details."
        );
        setPhase("error");
      }
    };
    fetchCandidate();
  }, [token, setPublicCandidate]);

  const handleStartAnalysis = async (file: File) => {
    if (!publicCandidate) return;
    setPhase("analyzing");
    try {
      const text = await extractText(file);
      const config = createCandidateAnalyzerConfig(publicCandidate.Role);
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

      const usage = result.usage;
      if (usage) {
        setAnalysisUsage({
          inputTokens: usage.prompt_tokens,
          outputTokens: usage.completion_tokens,
        });
      }

      setPhase("preparation");
    } catch (err: any) {
      console.error("Error during file upload and analysis: ", err);
      Alert.alert(
        "Error",
        err.message ||
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
    setAnalysisUsage(null);
    setInterviewUsage(null);
  };

  switch (phase) {
    case "loading":
      return (
        <AnalyzingScreen
          title="Loading Interview..."
          subtitle="Please wait a moment."
        />
      );
    case "error":
      return <ErrorScreen message={error!} />;
    case "welcome":
      return <WelcomeScreen onStart={handleStartAnalysis} />;
    case "analyzing":
      return (
        <AnalyzingScreen
          title="Analyzing..."
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
  const { publicCandidate } = useDContext();

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
      });

      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        const file = new File([blob], asset.name, { type: asset.mimeType });
        onStart(file);
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
            Welcome, {publicCandidate?.FullName}!
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
              <Text style={{ fontSize: 18, textAlign: "center" }}>
                {publicCandidate?.Role}
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
              <Button mode="contained" icon="upload" onPress={handleUpload}>
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
  const { publicCandidate, languagePref, setLanguagePref, candidateData } =
    useDContext();

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
              Hi, {publicCandidate?.ByName || publicCandidate?.FullName}!
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
    setInterviewUsage,
    publicCandidate,
    languagePref,
    candidateData,
  } = useDContext();
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
  const [muted, setMuted] = useState(true);
  const [isEndButtonActive, setIsEndButtonActive] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    setConversation(items);
  }, [items, setConversation]);

  const connectConversation = useCallback(async () => {
    if (!publicCandidate) return;
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
    await client.updateSession({
      turn_detection: {
        type: "server_vad",
        silence_duration_ms: 3000,
      },
    });
    client.sendUserMessageContent([
      {
        type: `input_text`,
        text: `Hello! My name is ${publicCandidate?.FullName}, and I am ready for my interview for the ${publicCandidate?.Role} role, speaking in ${languagePref}.`,
      },
    ]);
  }, [publicCandidate, languagePref]);

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

  const handleFinishInterview = () => {
    setIsEnding(true);
    clientRef.current.sendUserMessageContent([
      {
        type: "input_text",
        text: "...",
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
      setInterviewUsage(usage);

      const client = clientRef.current;
      client.disconnect();
      const wavRecorder = wavRecorderRef.current;
      wavRecorder.end();
      const wavStreamPlayer = wavStreamPlayerRef.current;
      wavStreamPlayer.interrupt();
      onEndRequest();
    }
  }, [scores, onEndRequest, items, setInterviewUsage]);

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
    if (!publicCandidate || !languagePref || !candidateData) return;

    const wavStreamPlayer = wavStreamPlayerRef.current;
    const client = clientRef.current;
    const config = createInterviewConfig(
      publicCandidate.Role,
      languagePref,
      candidateData
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
    client.addTool(config.scoringTool, async (scores: any) => {
      setScores(scores);
      return { success: true };
    });

    client.addTool(config.signalEndTool, () => {
      setIsEndButtonActive(true);
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
  }, [setScores, publicCandidate, languagePref, candidateData]);

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
          {items
            .filter((item) => (item.formatted?.text || "") !== "...")
            .map((item) => (
              <MessageBubble
                key={item.id}
                item={item}
                userName={
                  publicCandidate?.ByName || publicCandidate?.FullName || "You"
                }
              />
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
          onPress={handleFinishInterview}
          style={styles.endButton}
          buttonColor={theme.colors.error}
          textColor={theme.colors.onError}
          icon="stop-circle-outline"
          disabled={!isEndButtonActive || isEnding}
          loading={isEnding}
        >
          {isEnding ? "Analyzing..." : "Finish interview"}
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
    publicCandidate,
    languagePref,
    candidateData,
    scores,
    conversation,
    interviewUsage,
    analysisUsage,
  } = useDContext();
  const [submissionState, setSubmissionState] = useState<
    "idle" | "submitting" | "success"
  >("idle");

  const analysisCost = analysisUsage
    ? calculateGptCost(
        analysisUsage.inputTokens || 0,
        analysisUsage.outputTokens || 0
      )
    : null;
  const interviewCostResult = interviewUsage
    ? calculateInterviewCost(interviewUsage)
    : null;

  const totalCostUSD =
    (analysisCost?.totalCost || 0) + (interviewCostResult?.totalCostUSD || 0);
  const totalCostMYR = totalCostUSD * 4.7;

  const handleSubmit = async () => {
    if (!publicCandidate || !candidateData || !scores) {
      Alert.alert("Error", "No data available to submit.");
      return;
    }

    setSubmissionState("submitting");

    try {
      // helpers
      const asInt = (v: any) =>
        v == null || Number.isNaN(Number(v)) ? null : Math.round(Number(v));

      const toStringArray = (arr: any) => {
        if (!Array.isArray(arr)) return [];
        return arr.map((c) => {
          if (typeof c === "string") return c;
          // common key fallbacks
          if (c?.name) return String(c.name);
          if (c?.title) return String(c.title);
          if (c?.label) return String(c.label);
          // final fallback (preserve info without crashing)
          try {
            return JSON.stringify(c);
          } catch {
            return String(c);
          }
        });
      };

      const transcriptText = conversation
        .map((item) => {
          const speaker =
            item.role === "user"
              ? publicCandidate.ByName || publicCandidate.FullName
              : "Laive Interviewer";
          const text =
            item.formatted?.text || item.formatted?.transcript || "...";
          return `${speaker}: ${text}`;
        })
        .join("\n");

      const buildKnockoutsArray = (kb?: any) => {
        if (!kb) return [];
        const isYes = (v: any) => {
          if (typeof v === "boolean") return v;
          if (typeof v === "string") {
            const s = v.trim().toLowerCase();
            return [
              "yes",
              "y",
              "true",
              "available",
              "able",
              "can",
              "pass",
              "passed",
            ].includes(s);
          }
          return false;
        };
        return [
          {
            question: "Earliest availability",
            pass: isYes(kb.earliestAvailability),
          },
          { question: "Expected salary", pass: isYes(kb.expectedSalary) },
          { question: "Rotational shift", pass: isYes(kb.rotationalShift) },
          { question: "Able to commute", pass: isYes(kb.ableCommute) },
          { question: "Work flexibility", pass: isYes(kb.workFlex) },
        ];
      };

      const payload = {
        // ---- Required / canonical RA fields
        language_pref: languagePref || "English",
        ra_full_name: candidateData.fullName ?? null,
        ra_candidate_email: candidateData.candidateEmail ?? null,
        ra_candidate_phone: candidateData.candidatePhone ?? null,
        ra_highest_education: candidateData.highestEducation ?? null,
        ra_current_role: candidateData.currentRole ?? null,
        ra_years_experience:
          candidateData.yearExperience != null
            ? Number(candidateData.yearExperience)
            : null,
        ra_professional_summary: candidateData.professionalSummary ?? null,

        // ---- Arrays (JSON-encoded by backend)
        ra_related_links: Array.isArray(candidateData.relatedLink)
          ? candidateData.relatedLink
          : [],
        ra_certs_relate: toStringArray(candidateData.certsRelate), // <-- ensure array of strings
        ra_skill_match: Array.isArray(candidateData.skillMatch)
          ? candidateData.skillMatch
          : [],
        ra_experience_match: Array.isArray(candidateData.experienceMatch)
          ? candidateData.experienceMatch
          : [],
        ra_concern_areas: Array.isArray(candidateData.concernArea)
          ? candidateData.concernArea
          : [],
        ra_strengths: Array.isArray(candidateData.strengths)
          ? candidateData.strengths
          : [],

        // ---- Role-fit
        ra_rolefit_score:
          candidateData.roleFit?.roleScore != null
            ? Number(candidateData.roleFit.roleScore)
            : null,
        ra_rolefit_reason: candidateData.roleFit?.justification ?? null,

        // ---- Interview timestamps (omit if unknown)
        int_started_at: null,
        int_ended_at: null,

        // ---- Scores
        int_average_score: scores.averageScore ?? null,
        int_spoken_score: scores.scoreBreakdown?.spokenAbility?.score ?? null,
        int_spoken_reason:
          scores.scoreBreakdown?.spokenAbility?.reasoning ?? null,
        int_behavior_score: scores.scoreBreakdown?.behavior?.score ?? null,
        int_behavior_reason: scores.scoreBreakdown?.behavior?.reasoning ?? null,
        int_communication_score:
          scores.scoreBreakdown?.communicationStyle?.score ?? null,
        int_communication_reason:
          scores.scoreBreakdown?.communicationStyle?.reasoning ?? null,

        // ---- Knockouts (standardized to array)
        int_knockouts: buildKnockoutsArray(scores.knockoutBreakdown),
        int_summary: scores.summary ?? null,
        int_full_transcript: transcriptText,

        // ---- Usage & cost (COERCED TO INTS)
        ra_input_tokens: asInt(analysisUsage?.inputTokens),
        ra_output_tokens: asInt(analysisUsage?.outputTokens),
        int_input_tokens: asInt(interviewUsage?.inputTokens),
        int_output_tokens: asInt(interviewUsage?.outputTokens), // <-- e.g. 69.75 -> 70
        int_audio_sec: asInt(interviewUsage?.audioInputDuration),

        total_cost_usd:
          Number(
            (
              (analysisCost?.totalCost || 0) +
              (interviewCostResult?.totalCostUSD || 0)
            ).toFixed(5)
          ) || null,

        // ---- JSON blobs
        ra_json_payload: candidateData,
        int_scores_json: {
          detail: {
            spoken: scores.scoreBreakdown?.spokenAbility?.score ?? null,
            behavior: scores.scoreBreakdown?.behavior?.score ?? null,
            communication:
              scores.scoreBreakdown?.communicationStyle?.score ?? null,
          },
          averageScore: scores.averageScore ?? null,
        },
      };

      console.log("DEBUG: Payload to be sent:", payload);
      setSubmissionState("success");
      Alert.alert("Logged", "Payload logged to console successfully.");
    } catch (e: any) {
      console.error(e);
      Alert.alert("Error", e?.message || "Failed to build payload.");
      setSubmissionState("idle");
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
      <Image
        source={require("../../../assets/ta1.png")}
        style={styles.welcomeImage}
      />
      <Text style={styles.welcomeTitle}>
        You're All Set, {publicCandidate?.ByName || publicCandidate?.FullName}!
      </Text>
      <Text style={styles.welcomeSubtitle}>
        Your interview has been completed. We appreciate your time and effort.
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
        <Button
          mode="text"
          onPress={onRestart}
          disabled={submissionState === "submitting"}
        >
          Restart
        </Button>
        <Button
          mode="contained"
          onPress={handleSubmit}
          disabled={submissionState !== "idle"}
          loading={submissionState === "submitting"}
          icon={submissionState === "success" ? "check" : "content-copy"}
        >
          {submissionState === "success" ? "Logged" : "Log Payload to Console"}
        </Button>
      </View>
    </View>
  );
}

function ErrorScreen({ message }: { message: string }) {
  const theme = useTheme();
  const router = useRouter();
  return (
    <View
      style={[
        styles.fullPage,
        styles.centered,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <Avatar.Icon
        icon="alert-circle"
        size={64}
        style={{
          marginBottom: 16,
          backgroundColor: theme.colors.errorContainer,
        }}
        color={theme.colors.error}
      />
      <Text style={styles.analyzingTitle}>An Error Occurred</Text>
      <Text style={{ color: theme.colors.onSurfaceVariant }}>{message}</Text>
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
  welcomeImage: { width: 200, height: 200, marginBottom: 24 },
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
  chatArea: { flex: 1, width: "100%" },
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
  endButton: { width: 200 },
  vizContainer: { flex: 1, height: 50, marginHorizontal: 16 },
});
