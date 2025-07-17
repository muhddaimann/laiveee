import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RealtimeClient } from '@openai/realtime-api-beta';
import { ItemType } from '@openai/realtime-api-beta/dist/lib/client.js';
import { v4 as uuidv4 } from 'uuid';
import { WavRecorder, WavStreamPlayer } from '../lib/wavtools';
import { WavRenderer } from '../utils/wavRenderer';
import { instructions } from '../utils/conversationConfig';
import { OPENAI_API_KEY, LOCAL_RELAY_SERVER_URL } from '../constants/env';

interface RealtimeEvent {
  time: string;
  source: 'client' | 'server';
  count?: number;
  event: { [key: string]: any };
}

interface QueryResults {
  retrieved_documents: string[];
  chat_history: { role: string; content: string }[];
}

export default function VoiceDemo() {
  const theme = useTheme();
  const apiKey = LOCAL_RELAY_SERVER_URL ? '' : OPENAI_API_KEY;
  const clientRef = useRef<RealtimeClient>(
    new RealtimeClient(
      LOCAL_RELAY_SERVER_URL
        ? { url: LOCAL_RELAY_SERVER_URL }
        : { apiKey, dangerouslyAllowAPIKeyInBrowser: true }
    )
  );

  const wavRecorderRef = useRef(new WavRecorder({ sampleRate: 24000 }));
  const wavStreamPlayerRef = useRef(new WavStreamPlayer({ sampleRate: 24000 }));

  const [items, setItems] = useState<ItemType[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [muted, setMuted] = useState(false);
  const clientCanvasRef = useRef<HTMLCanvasElement>(null);
  const serverCanvasRef = useRef<HTMLCanvasElement>(null);

  const connectConversation = useCallback(async () => {
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;

    await wavRecorder.begin();
    await wavStreamPlayer.connect();
    await client.connect();
    await client.updateSession({ instructions });
    await client.updateSession({ turn_detection: { type: 'server_vad' } });
    client.sendUserMessageContent([{ type: 'input_text', text: 'Hello!' }]);
    await wavRecorder.record((data) => client.appendInputAudio(data.mono));
    setIsConnected(true);
  }, []);

  const toggleMute = useCallback(async () => {
    const wavRecorder = wavRecorderRef.current;
    const client = clientRef.current;
    if (muted) {
      await wavRecorder.record((data) => client.appendInputAudio(data.mono));
    } else {
      await wavRecorder.pause();
    }
    setMuted(!muted);
  }, [muted]);

  const disconnectConversation = useCallback(async () => {
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;
    client.disconnect();
    await wavRecorder.end();
    await wavStreamPlayer.interrupt();
    setItems([]);
    setIsConnected(false);
  }, []);

  useEffect(() => {
    const client = clientRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;
    client.on('conversation.updated', ({ item, delta }: any) => {
      const updatedItems = client.conversation.getItems();
      if (delta?.audio) {
        wavStreamPlayer.add16BitPCM(delta.audio, item.id);
      }
      setItems(updatedItems);
    });
    return () => client.reset();
  }, []);

  // simple canvas rendering for audio levels
  useEffect(() => {
    let mounted = true;
    const wavRecorder = wavRecorderRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;
    const clientCanvas = clientCanvasRef.current;
    const serverCanvas = serverCanvasRef.current;
    const render = () => {
      if (!mounted) return;
      if (clientCanvas) {
        const ctx = clientCanvas.getContext('2d');
        if (ctx) {
          const result = wavRecorder.recording ? wavRecorder.getFrequencies('voice') : { values: new Float32Array([0]) };
          ctx.clearRect(0, 0, clientCanvas.width, clientCanvas.height);
          WavRenderer.drawBars(clientCanvas, ctx, result.values, theme.colors.primary, 10, 0, 8);
        }
      }
      if (serverCanvas) {
        const ctx = serverCanvas.getContext('2d');
        if (ctx) {
          const result = wavStreamPlayer.analyser ? wavStreamPlayer.getFrequencies('voice') : { values: new Float32Array([0]) };
          ctx.clearRect(0, 0, serverCanvas.width, serverCanvas.height);
          WavRenderer.drawBars(serverCanvas, ctx, result.values, theme.colors.secondary, 10, 0, 8);
        }
      }
      requestAnimationFrame(render);
    };
    render();
    return () => {
      mounted = false;
    };
  }, [theme.colors.primary, theme.colors.secondary]);

  return (
    <View style={styles.container}>
      <View style={styles.leftColumn}>
        <View style={styles.chatContainer}>
          <ScrollView>
            {items.map((item) => (
              <View key={item.id} style={styles.message}>
                <Text style={{ fontWeight: '600' }}>{item.role === 'user' ? 'You' : 'Assistant'}</Text>
                <Text>{item.formatted?.transcript || item.formatted?.text || '...'}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
        <View style={styles.actions}>
          {!isConnected ? (
            <Button mode="contained" onPress={connectConversation}>Connect</Button>
          ) : (
            <>
              <Button mode="contained" onPress={toggleMute}>{muted ? 'Unmute' : 'Mute'}</Button>
              <Button mode="contained" onPress={disconnectConversation}>Disconnect</Button>
            </>
          )}
        </View>
      </View>
      <View style={styles.rightColumn}>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <View style={{ flex: 1 }}>
            <canvas ref={clientCanvasRef} style={{ width: '100%', height: '100%' }} />
          </View>
          <View style={{ flex: 1 }}>
            <canvas ref={serverCanvasRef} style={{ width: '100%', height: '100%' }} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', flex: 1, padding: 24, gap: 16 },
  leftColumn: { flex: 1, gap: 16 },
  rightColumn: { flex: 1, gap: 16 },
  chatContainer: { flex: 1, borderRadius: 16, padding: 10, backgroundColor: '#fff' },
  actions: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  message: { marginBottom: 8 },
});
