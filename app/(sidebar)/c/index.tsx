import React, {
  useEffect,
  useRef,
  useCallback,
  useState,
  RefObject,
} from "react";
import { RealtimeClient } from "@openai/realtime-api-beta";
import { ItemType } from "@openai/realtime-api-beta/dist/lib/client.js";
import { WavRecorder, WavStreamPlayer } from "../../../lib/wavtools/index.js";
import { WavRenderer } from "../../../utils/wavRenderer";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme, Button } from "react-native-paper";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import {
  OPENAI_API_KEY,
  LOCAL_RELAY_SERVER_URL,
} from "../../../constants/env";

interface RealtimeEvent {
  time: string;
  source: "client" | "server";
  count?: number;
  event: { [key: string]: any };
}

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

export default function JokeGenerator() {
  const theme = useTheme();

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
  const eventsScrollHeightRef = useRef(0);
  const eventsScrollRef = useRef<ScrollView>(null);
  const startTimeRef = useRef<string>(new Date().toISOString());
  const [items, setItems] = useState<ItemType[]>([]);
  const [realtimeEvents, setRealtimeEvents] = useState<RealtimeEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [muted, setMuted] = useState(false);

  const connectConversation = useCallback(async () => {
    if (!LOCAL_RELAY_SERVER_URL && !OPENAI_API_KEY) {
      const errorMessage =
        'No API key or relay server URL provided. Please set EXPO_PUBLIC_OPENAI_API_KEY or EXPO_PUBLIC_LOCAL_RELAY_SERVER_URL in your .env file.';
      console.error(errorMessage);
      alert(errorMessage);
      return;
    }
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;

    startTimeRef.current = new Date().toISOString();
    setIsConnected(true);
    setRealtimeEvents([]);
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
        text: `Tell me a joke!`,
      },
    ]);

    await wavRecorder.record((data) => client.appendInputAudio(data.mono));
  }, []);

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
    setIsConnected(false);
    setRealtimeEvents([]);
    setItems([]);

    const client = clientRef.current;
    client.disconnect();

    const wavRecorder = wavRecorderRef.current;
    await wavRecorder.end();

    const wavStreamPlayer = wavStreamPlayerRef.current;
    await wavStreamPlayer.interrupt();
  }, []);

  const deleteConversationItem = useCallback(async (id: string) => {
    const client = clientRef.current;
    client.deleteItem(id);
  }, []);

  useEffect(() => {
    if (eventsScrollRef.current) {
      const eventsEl = eventsScrollRef.current as unknown as HTMLDivElement;
      const scrollHeight = eventsEl.scrollHeight;
      if (scrollHeight !== eventsScrollHeightRef.current) {
        eventsEl.scrollTop = scrollHeight;
        eventsScrollHeightRef.current = scrollHeight;
      }
    }
  }, [realtimeEvents]);

  useEffect(() => {
    const conversationEls = [].slice.call(
      document.body.querySelectorAll("[data-conversation-content]")
    );
    for (const el of conversationEls) {
      const conversationEl = el as HTMLDivElement;
      conversationEl.scrollTop = conversationEl.scrollHeight;
    }
  }, [items]);

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
    client.updateSession({ instructions: "You are a funny assistant that tells jokes." });
    client.updateSession({ voice: "echo" });
    client.updateSession({ input_audio_transcription: { model: "whisper-1" } });

    client.on("realtime.event", (realtimeEvent: RealtimeEvent) => {
      setRealtimeEvents((realtimeEvents) => {
        const lastEvent = realtimeEvents[realtimeEvents.length - 1];
        if (lastEvent?.event.type === realtimeEvent.event.type) {
          lastEvent.count = (lastEvent.count || 0) + 1;
          return realtimeEvents.slice(0, -1).concat(lastEvent);
        } else {
          return realtimeEvents.concat(realtimeEvent);
        }
      });
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

      if (item.status === "completed" && item.formatted.audio?.length) {
        try {
          const wavFile = await WavRecorder.decode(
            item.formatted.audio,
            24000,
            24000
          );
          item.formatted.file = wavFile;
          console.log("Decoded WAV file:", wavFile);
        } catch (err) {
          console.error("Error decoding audio:", err);
        }
      }

      setItems(updatedItems);
    });

    setItems(client.conversation.getItems());

    return () => {
      client.reset();
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.leftColumn}>
        <View style={styles.topFlex8}>
          <ChatCard
            items={items}
            deleteConversationItem={deleteConversationItem}
          />
        </View>
        <View style={styles.bottomFlex2}>
          <ActionCard
            isConnected={isConnected}
            connectConversation={connectConversation}
            disconnectConversation={disconnectConversation}
            toggleMute={toggleMute}
            muted={muted}
          />
        </View>
      </View>
      <View style={styles.rightColumn}>
        <View style={styles.topFlex3}>
          <IconCard
            clientCanvasRef={clientCanvasRef}
            serverCanvasRef={serverCanvasRef}
          />
        </View>
      </View>
    </View>
  );
}

export function ActionCard({
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
    <View style={styles.card}>
      <View style={styles.row}>
        {!isConnected ? (
          <>
            <Button
              mode="outlined"
              icon="account-voice"
              textColor={theme.colors.onBackground}
              style={styles.paperButton}
              contentStyle={styles.buttonContent}
              disabled
            >
              Interactive
            </Button>
            <Button
              mode="contained"
              icon="link-variant-plus"
              textColor={theme.colors.onPrimary}
              buttonColor={theme.colors.primary}
              onPress={connectConversation}
              style={styles.paperButton}
              contentStyle={styles.buttonContent}
            >
              Connect
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
              Disconnect
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
        styles.card,
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
              Tap Connect to start conversation
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
                    {item.role === "user" ? "You" : "Assistant"}
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

export function IconCard({ clientCanvasRef, serverCanvasRef }: IconCardProps) {
  return (
    <View style={styles.card}>
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
  container: {
    flexDirection: "row",
    flex: 1,
    padding: 24,
    gap: 16,
  },
  leftColumn: {
    flex: 1,
    gap: 16,
  },
  rightColumn: {
    flex: 1,
    gap: 16,
  },
  topFlex8: {
    flex: 11,
  },
  bottomFlex2: {
    flex: 1,
  },
  topFlex3: {
    flex: 2,
  },
  bottomFlex7: {
    flex: 8,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 100,
  },
  paperButton: {
    flex: 1,
    borderRadius: 12,
  },
  buttonContent: {
    flexDirection: "row-reverse",
    gap: 8,
  },
  messageBubbleContainer: {
    gap: 8,
    minWidth: "50%",
    marginBottom: 12,
    maxWidth: "80%",
  },
  userMessageContainer: {
    alignSelf: "flex-end",
  },
  assistantMessageContainer: {
    alignSelf: "flex-start",
  },
  messageBubble: {
    padding: 10,
    gap: 8,
    borderRadius: 12,
  },
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
  emptyChatText: {
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
  },
});
