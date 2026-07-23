# 🎙️ Verbex: AI-Powered Meeting Intelligence

Verbex is a state-of-the-art meeting intelligence platform designed to transform raw conversations into structured, actionable data. It leverages high-performance AI models to capture, transcribe, and analyze meetings in real-time, integrating seamlessly with your existing engineering workflows.

![Verbex Banner](https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=2070)

---

## 🚀 Key Features

### 1. **Hybrid Transcription Engine**
- **Live Feedback**: Instant feedback using the Web Speech API.
- **Precision Refinement**: Ultra-fast, high-fidelity transcription powered by **Groq Whisper Large V3**.
- **Screen Audio Mixing**: Seamlessly mix your microphone and system audio (tabs/windows) to capture full presentation context.

### 2. **AI Intelligence Extraction**
- **Automated Registry**: Extract tasks and decisions automatically using **Groq LLaMA 3.3 (70B)**.
- **Smart TL;DR**: Generates immediate strategic summaries for every meeting.
- **Confidence Scoring & Dual-Gate**: Every extraction is measured for precision and contextual relevance. High-confidence tasks move to Gate 1 (Approved), while unmapped/credential-less tasks stay locked in Gate 2 (Needs Review).

### 3. **Enterprise Integration & Workforce Onboarding**
- **GitHub Sync**: Push extracted tasks directly to your GitHub repository issues.
- **Bi-directional Mapping**: Automatically maps AI-extracted owners to real team members' GitHub accounts.
- **Automated Draft Employee Creation**: Detects new meeting participants, auto-provisions draft employee profiles, and auto-elevates task status once GitHub credentials are added.

### 4. **Management Oversight**
- **Manager Dashboard**: Real-time meeting stats, health score trends, and system performance metrics.
- **Speaker Map**: Track team ownership, load, and notable contributions.
- **Stale Task Detection**: Automatically identify blockers that have been unresolved across multiple sessions.

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), TypeScript, Lucide Icons, Vanilla CSS (Premium Finish).
- **Backend**: FastAPI (Python 3.12), Prisma ORM, PostgreSQL 15.
- **AI Services**: Groq (LLaMA 3.3 & Whisper Large V3).
- **Deployment**: Docker, Docker Compose, Nginx Reverse Proxy.

---

## 🚦 Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Groq API Key](https://console.groq.com/keys)
- [Node.js](https://nodejs.org/) (Optional, for local development)
- [Python 3.10+](https://www.python.org/) (Optional, for local development)

### Quick Start (Docker)

1. Clone the repository:
   ```bash
   git clone https://github.com/LIKHITH-M/VerbexAI.git
   cd VerbexAI
   ```

2. Create a `.env` file in the `backend` directory with your Groq API Key:
   ```env
   DATABASE_URL="postgresql://postgres:yourpassword@vertex_db:5432/meeting_ai_system"
   GROQ_API_KEY=your_groq_api_key_here
   GROQ_MODEL=llama-3.3-70b-versatile
   ```

3. Launch the stack:
   ```bash
   docker-compose up -d --build
   ```

4. Access the applications:
   - **Frontend UI**: `http://localhost:80`
   - **Backend API Docs**: `http://localhost:8000/docs`

---

## 🌐 Webhook & GitHub Integration

To enable bi-directional sync with GitHub issues:

1. Start **ngrok** on port 80:
   ```bash
   ngrok http 80
   ```

2. Copy your forwarding URL (e.g., `https://xxxx.ngrok-free.app`).

3. Add a Webhook in your GitHub repository (**Settings** $\rightarrow$ **Webhooks** $\rightarrow$ **Add webhook**):
   - **Payload URL**: `https://xxxx.ngrok-free.app/api/webhooks/github`
   - **Content type**: `application/json`
   - **Events**: Issues

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

Built with ❤️ by the Verbex Team.
