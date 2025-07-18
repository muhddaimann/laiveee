# 🧠 Laive – Real-time AI Voicebot

**Laive** is a real-time AI-powered voicebot that combines OpenAI's Realtime API and Retrieval-Augmented Generation (RAG) to deliver intelligent, responsive conversations through natural voice input.

---

## 🚀 Key Features

- 🎤 **Realtime Voice Streaming**  
  Stream microphone input directly to OpenAI’s GPT-4o for live, low-latency interaction.

- 🔁 **OpenAI Realtime API**  
  Built with a custom implementation of OpenAI’s Realtime Client to handle full duplex audio and response streaming.

- 📚 **RAG (Retrieval-Augmented Generation)**  
  Dynamically enriches responses with facts from your internal knowledgebase using vector search (Chroma DB).

- 💬 **Voice-to-Voice Interaction**  
  End-to-end voice experience: user speaks, AI thinks, AI replies with voice.

- 🧩 **Modular Architecture**  
  Clean structure with separate hooks and services for voice, chat, tools, and logs.

- 🌐 **Web-First with Expo + React Native Web**  
  Designed to run in-browser with responsive design and minimal setup.

---

## 🛠️ Tech Stack

- **Frontend:** React Native Web (Expo)
- **Voice Streaming:** WavRecorder + WavStreamPlayer
- **AI:** OpenAI GPT-4o + Whisper
- **Knowledgebase:** Chroma Vector DB (RAG)
- **Logging:** PostgreSQL (via RDS)
- **Waveform UI:** `<canvas>`-based visualizer
- **Context Management:** React Context API
- **State:** Custom hooks for audio, assistant, logs, and chat

---

## 🧪 Voice Interaction Flow

```text
🎙️ User speaks
↓
🛰️ Audio streamed to GPT-4o
↓
🧠 Assistant processes voice and responds
↓
📚 (if tool call) RAG queries internal docs
↓
🗣️ Assistant replies with voice (TTS)
↓
📝 Chat and interaction logs are saved
```
