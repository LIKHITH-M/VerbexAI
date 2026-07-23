🎙️ Verbex AI — Real-Time Meeting Intelligence & Task Automation System
Stack Python FastAPI React Vite PostgreSQL Prisma Groq LLaMA 3.3 Whisper Docker Nginx MIT License

A production-ready, full-stack meeting intelligence and task automation platform built with FastAPI (Python 3.12) on the backend and React 18 (Vite) on the frontend. It features high-precision AI speech-to-text transcription powered by OpenAI Whisper and LLaMA 3.3 (Groq Precision Engine), automated workforce onboarding, a multi-tiered confidence gating system, and bi-directional GitHub integration with live webhook issue synchronization.

The application provides a complete conversational intelligence experience — live microphone & system audio recording, audio file ingestion, automatic task & decision extraction, speaker load analytics, and stale task detection — alongside an administrative Employee Directory for team credential management.

🏗️ Architecture Overview
┌──────────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (Browser)                                    │
│                     React 18 + Vite + TailwindCSS / CSS3                         │
│                                                                                  │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│   │   Live   │  │   All    │  │   Task   │  │ Speaker  │  │ Employee Manager │  │
│   │ Record   │  │ Meetings │  │  Board   │  │   Map    │  │ (CRUD & Handles) │  │
│   └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────────┬─────────┘  │
│        └──────────────┴──────────────┴──────────────┴───────────────┘             │
│                                     │  Axios / SWR / API Client                  │
└─────────────────────────────────────┼────────────────────────────────────────────┘
                                      │ REST API (HTTP/JSON via Nginx :80)
┌─────────────────────────────────────┼────────────────────────────────────────────┐
│                             FASTAPI BACKEND (Python 3.12)                        │
│                                     │                                            │
│   ┌──────────────────────────────── │ ───────────────────────────────────────┐   │
│   │                    CORS Middleware + Nginx Reverse Proxy                 │   │
│   │                   BCrypt Security + Token Auth                           │   │
│   └──────────────────────────────── │ ───────────────────────────────────────┘   │
│                                     │                                            │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐    │
│   │  Meetings    │  │  Employees   │  │ Integration  │  │  Webhooks        │    │
│   │  Router      │  │  Router      │  │  Service     │  │  Router          │    │
│   └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────────┘    │
│          │                 │                 │                 │                  │
│   ┌──────┴───────┐  ┌──────┴───────┐  ┌──────┴───────┐  ┌──────┴───────────┐    │
│   │WhisperService│  │  GroqLLaMA   │  │ GitHubService│  │  Auto-Provision  │    │
│   │AudioIngestion│  │PrecisionEngine│ │              │  │  Task-Mapper     │    │
│   └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────────┘    │
│          │                 │                 │                 │                  │
│   ┌──────┴─────────────────┴─────────────────┴─────────┐       │                 │
│   │                Prisma ORM (Python Client)           │       │                 │
│   │          (Meeting, Task, Decision, Employee)        │       │                 │
│   └──────────────────────┬──────────────────────────────┘       │                 │
│                          │                                      │                 │
└──────────────────────────┼──────────────────────────────────────┼─────────────────┘
                           │                                      │
              ┌────────────▼────────────┐            ┌────────────▼────────────────┐
              │  PostgreSQL 15 (Docker) │            │     GitHub API & Webhooks   │
              │                         │            │                             │
              │  ┌──────────┐ ┌───────┐ │            │  REST Issue Sync & Actions  │
              │  │ meetings │ │ tasks │ │            │                             │
              │  └──────────┘ └───────┘ │            │  ┌───────────────────────┐  │
              │  ┌───────────┐┌───────┐ │            │  │ Live Issue Sync      │  │
              │  │ employees ││decisns│ │            │  │ Webhook Listener     │──┼──▶ ngrok
              │  └───────────┘└───────┘ │            │  └───────────────────────┘  │
              └─────────────────────────┘            └────────────────────────────┘

⚙️ Tech Stack
Backend
Technology	Purpose
Python 3.12	Core language for high-performance async web services
FastAPI 0.110+	Asynchronous Web Framework with automatic OpenAPI docs & Pydantic validation
Prisma ORM	Type-safe database ORM and migration tool for Python & PostgreSQL
PostgreSQL 15	Primary relational database storing meetings, tasks, decisions, and employees
Groq LLaMA 3.3 (70B)	Ultra-fast LLM precision engine for structuring transcripts and task extractions
Whisper AI	Audio transcription engine (Whisper Large V3 via Groq API)
PyJWT & Passlib	Stateless authentication, security tokens, and BCrypt password hashing
HTTPX	Asynchronous HTTP client for GitHub REST API & external webhooks
Uvicorn	ASGI web server implementation for FastAPI

Frontend
Technology	Purpose
React 18	Component-based UI library with hooks and custom state handlers
Vite 6	Next-generation frontend tooling with instant HMR and optimized builds
TypeScript	Static typing for robust frontend components and API data contracts
TailwindCSS & Vanilla CSS	Corporate design system with dark modes, glassmorphism, and micro-animations
Lucide React	Modern icon suite for sleek dashboard UI components
Axios	HTTP client configured with dynamic API base URL (`/api`)
MediaRecorder API	Browser audio recording API for live meeting transcript streams

Infrastructure & Services
Technology	Purpose
Docker & Docker Compose	Multi-container containerization (Backend, Frontend, PostgreSQL, Nginx)
Nginx	Reverse proxy routing port 80 to frontend (dist) & backend (:8000), streaming chunk size 600m
ngrok	Secure tunnel to expose local webhook endpoints to GitHub
GitHub REST API v3	Automated issue creation, label assignment, and bi-directional webhook updates

🌟 Key Features
🎙️ Meeting Intelligence & Transcription
Hybrid Transcription Engine — Real-time live browser transcription fallback + high-fidelity Groq Whisper Large V3 audio processing
Multi-Format Ingestion — Upload MP3/WAV audio recordings, paste raw text transcripts, or record live conversations directly in the browser
Automated Task & Decision Extraction — Groq LLaMA 3.3 extracts high-priority engineering tasks, assignees, contextual quotes, and strategic decisions
Strategic TL;DR Summaries — Automatically generates executive summaries and meeting health scores (0-100%)

🤖 Automated Workforce Onboarding
Auto-Draft Employee Creation — Detects new or unregistered meeting participants and auto-creates draft profile records in the Employee Directory
Action Required Badges — Flags auto-discovered members with `NEEDS CREDENTIALS` until repository handles are updated by an admin
Automatic Task Elevation — Updating an employee's GitHub handle in the directory automatically elevates all their pending tasks to `APPROVED` and unlocks 1-click GitHub push

🛡️ Dual-Gate Confidence Gating System
Confidence Gate 1 (Auto-Pushed / Approved) — High-confidence tasks (≥ 75%) assigned to registered team members with complete GitHub handles
Confidence Gate 2 (Needs Review) — Low-confidence tasks or tasks for unmapped/credential-less members stay locked in Gate 2 as `REQUIRES CREDENTIALS`
Manual Status Override — Admins can manually move tasks between Gate 2 (Pending Review), Approved, In Progress, Completed, or Failed

👨‍💼 Manager Dashboard & Analytics
All Meetings Overview — Interactive meeting cards with expandable Task Intelligence Overview and Real-time Tracking tables
Speaker Ownership Map — Visual breakdown of task distribution, notable quotes, and workload balance across team members
Stale Task Detection — Automatically identifies overdue tasks (> 7 days unresolved) requiring intervention
Employee Manager — Centralized workforce directory for configuring GitHub tokens, repository handles, and individual credentials

📁 Project Structure
Verbex-AI-main/
├── backend/                                    # Python FastAPI REST API
│   ├── app/
│   │   ├── config.py                           # Application settings & environment variables
│   │   ├── database.py                         # Prisma database connection manager
│   │   ├── routers/                            # API Endpoint Routes
│   │   │   ├── meetings.py                     # /api/meetings — Audio upload, live process, tasks CRUD
│   │   │   └── employees.py                    # /api/employees — Workforce CRUD & auto-mapping
│   │   ├── schemas/                            # Pydantic schemas & response models
│   │   │   ├── meeting.py                      # Meeting payload & nested response models
│   │   │   ├── task.py                         # Task schema with employee relation
│   │   │   ├── decision.py                     # Decision schema
│   │   │   └── employee.py                     # Employee DTOs
│   │   └── services/                           # AI & Integration Services
│   │       ├── gemini_service.py               # LLaMA 3.3 JSON extraction prompt engine
│   │       ├── groq_service.py                 # Groq API client
│   │       ├── audio_service.py                # Audio file storage & Whisper transcription
│   │       ├── github_service.py               # GitHub REST API issue creation & retry logic
│   │       └── integration_service.py          # Unified task push orchestrator
│   ├── prisma/
│   │   └── schema.prisma                       # Database schema definition (PostgreSQL)
│   ├── main.py                                 # FastAPI application entry point & CORS
│   ├── Dockerfile                              # Backend Docker image setup
│   └── requirements.txt                        # Python dependencies
│
├── frontend/                                   # React 18 + Vite SPA
│   ├── src/
│   │   ├── components/                         # Reusable UI components
│   │   │   ├── Navbar.tsx                      # Top navigation bar
│   │   │   ├── Sidebar.tsx                     # Main navigation panel
│   │   │   └── Header.tsx                      # Page header & status indicators
│   │   ├── pages/                              # Main application views
│   │   │   ├── ExecutiveOverview.tsx           # Manager dashboard & high-level stats
│   │   │   ├── AllMeetings.tsx                 # Meetings listing & Task Intelligence table
│   │   │   ├── NewMeeting.tsx                  # Live audio recorder & file/text ingestion
│   │   │   ├── TaskBoard.tsx                   # Dual-gate Kanban board (Gate 1 & Gate 2)
│   │   │   ├── EmployeeManager.tsx             # Team directory & GitHub credentials
│   │   │   ├── SpeakerMap.tsx                  # Ownership map & workload analytics
│   │   │   └── StaleTasks.tsx                  # Overdue blocker tracking
│   │   ├── utils/
│   │   │   └── api.ts                          # Axios client configured with dynamic API base URL
│   │   ├── types.ts                            # TypeScript data interfaces
│   │   ├── App.tsx                             # Application routing & page switcher
│   │   └── main.tsx                            # React DOM entry point
│   ├── Dockerfile                              # Frontend Nginx container setup
│   └── package.json                            # Node.js dependencies & build scripts
│
├── nginx/
│   └── nginx.conf                              # Nginx reverse proxy configuration
├── docker-compose.yml                          # Docker Compose multi-container orchestrator
└── README.md                                   # Project documentation

🔌 API Endpoints Reference
Meetings (/api/meetings)
Method	Endpoint	Description	Auth Required
GET	/meetings	List all meetings with task & decision counts	No
POST	/meetings/upload-audio	Upload MP3/WAV audio file for transcription & AI extraction	No
POST	/meetings/upload-text	Submit text transcript for AI processing	No
POST	/meetings/:id/process-live	Process live audio recording stream	No
GET	/meetings/:id	Get single meeting with tasks and decisions	No
DELETE	/meetings/:id	Delete a meeting record	No

Tasks & Intelligence (/api)
Method	Endpoint	Description	Auth Required
GET	/api/meetings/tasks/all	Retrieve all tasks across all meetings (with employee data)	No
PATCH	/api/tasks/:id	Update task status (pending_review, approved, in_progress, completed)	No
POST	/api/meetings/:id/tasks/:tid/push	Push single task to GitHub issues	No
POST	/api/meetings/:id/push-all	Push all approved tasks in meeting to GitHub	No
GET	/api/meetings/stats	Get executive intelligence metrics & precision trend	No

Employees (/api/employees)
Method	Endpoint	Description	Auth Required
GET	/employees	List all team members in Employee Directory	No
POST	/employees	Register a new team member and auto-map pending tasks	No
PUT	/employees/:id	Update member credentials (GitHub handle, tokens) & auto-map tasks	No
POST	/employees/auto-map-all	Trigger auto-mapping scan across all employees and tasks	No
DELETE	/employees/:id	Remove a team member profile	No

Webhooks (/api/webhooks)
Method	Endpoint	Description	Auth Required
POST	/webhooks/github	GitHub webhook listener for live issue status updates	No

🚀 Getting Started
Prerequisites
Requirement	Version
Docker Desktop	4.x+ (Recommended)
Node.js	18+ (For standalone frontend dev)
Python	3.12+ (For standalone backend dev)
Groq API Key	Free key from console.groq.com
GitHub PAT	Personal Access Token with `repo` scope

1️⃣ Clone the Repository
git clone https://github.com/LIKHITH-M/Verbex-AI.git
cd Verbex-AI

2️⃣ Environment Configuration
Create a `.env` file in the `backend/` directory:

# backend/.env
DATABASE_URL="postgresql://postgres:yourpassword@vertex_db:5432/meeting_ai_system"
GROQ_API_KEY="gsk_your_groq_api_key_here"
GROQ_MODEL="llama-3.3-70b-versatile"

# Global GitHub Fallback Credentials (Optional)
GITHUB_TOKEN="ghp_your_personal_access_token"
GITHUB_REPO_OWNER="your-github-username"
GITHUB_REPO_NAME="your-repo-name"

3️⃣ Run with Docker Compose
docker-compose up -d --build

- App / Frontend: http://localhost
- Backend REST API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

4️⃣ Setting Up Live GitHub Webhooks with ngrok
To receive real-time updates when GitHub issues are closed or updated:

# Start ngrok on port 80
ngrok http 80

- Copy your ngrok Forwarding URL (e.g. `https://a1b2c3.ngrok-free.app`).
- In GitHub Repo → **Settings** → **Webhooks** → **Add webhook**:
  - **Payload URL**: `https://a1b2c3.ngrok-free.app/api/webhooks/github`
  - **Content type**: `application/json`
  - **Events**: Select *Issues* or *Send me everything*
  - Click **Add webhook**.

🔧 Configuration Settings
All backend settings can be configured via environment variables or `backend/.env`:

Property	Description	Default
DATABASE_URL	PostgreSQL connection string	postgresql://postgres:password@localhost:5432/meeting_ai_system
GROQ_API_KEY	Groq API key for LLaMA 3.3 and Whisper	(Required)
GROQ_MODEL	Groq LLM model name	llama-3.3-70b-versatile
GITHUB_TOKEN	Default master GitHub access token	(Optional fallback)
GITHUB_REPO_OWNER	Default GitHub account/organization owner	(Optional fallback)
GITHUB_REPO_NAME	Default target GitHub repository	(Optional fallback)
CONFIDENCE_AUTO_APPROVE	Threshold for Gate 1 auto-approval	0.75
CONFIDENCE_REVIEW_THRESHOLD	Threshold for Gate 2 review	0.50

📐 Frontend Routes
Path	Component	Access	Description
/	ExecutiveOverview	Public	Executive dashboard with stats & meeting health trends
/meetings	AllMeetings	Public	All meetings with task intelligence & GitHub push
/new-meeting	NewMeeting	Public	Live audio recorder, audio upload & text ingestion
/tasks	TaskBoard	Public	Dual-gate Kanban board (Gate 1 Auto-Pushed & Gate 2 Needs Review)
/employees	EmployeeManager	Public	Employee Directory for workforce CRUD & GitHub handles
/speakers	SpeakerMap	Public	Ownership map & workload distribution analytics
/stale	StaleTasks	Public	Overdue task blocker tracker

📨 Event-Driven Flow (Meeting to GitHub Push)
User uploads audio / records live meeting
        │
        ▼
meetings.process_live_transcript() / upload-audio()
        │
        ├──▶ Transcribe audio with Groq Whisper Large V3
        │
        ├──▶ Groq LLaMA 3.3 Precision Engine extracts Tasks & Decisions
        │
        ├──▶ Check Employee Directory for assigned participant
        │         │
        │         ├──▶ Employee Found + Has GitHub Handle
        │         │         └──▶ Set Status: "approved", Confidence: 90% ──▶ Confidence Gate 1
        │         │
        │         └──▶ Employee Unregistered / Missing Handle
        │                   └──▶ Auto-Provision Draft Profile in Directory
        │                   └──▶ Set Status: "pending_review", Confidence: 65% ──▶ Confidence Gate 2
        │
        └──▶ Admin adds GitHub handle in Employee Manager
                  │
                  ▼
             auto_map_tasks_for_employee()
                  │
                  ├──▶ Elevate Task Status to "approved" & Confidence to 90%
                  └──▶ Unlock 1-Click "PUSH TO GITHUB" Button
                            │
                            ▼
                       GitHub REST API Creates Issue in Repository

🤝 Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

📄 License
Distributed under the MIT License. See `LICENSE` for more information.
