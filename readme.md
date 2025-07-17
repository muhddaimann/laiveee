# Laive V1 🧠🎙️

**Laive V1** is a web-first AI assistant built with [Expo](https://expo.dev/) + React Native Web, designed to demonstrate how modern AI tools like GPT-4o (Realtime), Whisper, and RAG (Retrieval-Augmented Generation) can enhance everyday tasks through voice and chat.

---

## ✨ What is Laive?

Laive is your intelligent, conversational assistant that:
- Listens to your voice in real time
- Understands and responds naturally
- Accesses internal knowledge to answer accurately
- Helps automate or simplify daily tasks

All from your browser — no installation needed.

---

## 🔍 Key Features

- 🎙️ **Real-time Voice Interaction** (via GPT-4o Realtime API)
- 🗣️ **Speech-to-Text** with Whisper
- 📚 **RAG-based Answers** using your own data (FAQs, policies, docs)
- 🔄 **Streaming Audio In & Out**
- 🧾 **Smart Chat History & Tool Calls**
- 💡 **Customizable Personas** for role-based simulations

---

## 🧪 Example Use Cases

| Use Case             | Tools Used                    |
|----------------------|-------------------------------|
| Internal Helpdesk    | Realtime + RAG                |
| Voice Note Assistant | Whisper + GPT summarization   |
| Interview Simulator  | Realtime + Whisper + Persona  |
| FAQ Chatbot          | Realtime + RAG                |
| Voice Command Agent  | Whisper + Realtime + Actions  |

---

## 🧰 Tech Stack

- **Frontend**: Expo Web (React Native Web, TypeScript)
- **AI & Voice**: OpenAI GPT-4o, Whisper API
- **RAG**: ChromaDB or Supabase for vector search
- **Audio**: WAV recording, waveform visualizations
- **State Management**: React Contexts

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run the web app
npx expo start --web
