# 🚀 CrudAiApp - AI-Powered Chat Application

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=FastAPI&logoColor=white)](https://fastapi.tiangolo.com/)
[![Auth0](https://img.shields.io/badge/Auth0-EB5424?style=flat&logo=auth0&logoColor=white)](https://auth0.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)](https://docker.com)

Eine moderne, voll-authentifizierte Chat-Anwendung mit AI-Integration über Ollama, Auth0-Authentifizierung und einer professionellen Architektur.

## 📁 Projektstruktur

```
CrudAiApp/
├── 📄 README.md                    # Projekt-Übersicht
├── 📁 server/                      # Backend (FastAPI + Python)
│   ├── 📁 src/                     # Python Quellcode
│   │   ├── 🐍 main.py             # FastAPI Hauptanwendung
│   │   ├── 🔐 auth_service.py     # Auth0 JWT Verifizierung
│   │   ├── 🤖 ai_service.py       # Ollama AI Integration
│   │   ├── 📊 database.py         # SQLAlchemy Setup
│   │   ├── 📋 models.py           # Datenbank Modelle
│   │   ├── 📝 schemas.py          # Pydantic Schemas
│   │   ├── 🛣️ routes.py            # API Endpunkte
│   │   ├── 📦 requirements.txt    # Python Dependencies
│   │   ├── 🗄️ crudai.db           # SQLite Datenbank
│   │   └── 🚫 .dockerignore       # Docker Ignore Rules
│   └── 📁 config/                  # Konfigurationsdateien
│       ├── ⚙️ .env                # Umgebungsvariablen (lokal)
│       └── 📋 .env.example        # Template für .env
├── 📁 client/                      # Frontend (Vite + TypeScript)
│   ├── 📁 src/                     # TypeScript Quellcode
│   │   ├── 🎯 main.ts             # Haupt-Entry Point
│   │   ├── 🔌 api.ts              # Backend API Client
│   │   ├── 🔐 auth.ts             # Auth0 Service
│   │   ├── 🎨 auth-ui.ts          # Authentication UI
│   │   ├── 💬 chat.ts             # Chat Interface Logic
│   │   ├── 📋 sidebar.ts          # Sidebar Management
│   │   ├── 💅 style.css           # Tailwind Styles
│   │   └── 🏷️ vite-env.d.ts       # Vite Type Definitions
│   ├── 📁 public/                  # Statische Assets
│   │   └── 🎨 vite.svg            # Vite Logo
│   ├── 📄 index.html              # HTML Template
│   ├── 📦 package.json            # Node.js Dependencies
│   ├── 🔒 package-lock.json       # Dependency Lock
│   ├── ⚙️ tsconfig.json           # TypeScript Konfiguration
│   ├── 🎨 tailwind.config.js      # Tailwind CSS Setup
│   ├── 📄 .env                    # Client Umgebungsvariablen
│   ├── 📋 .env.example            # Template für Client .env
│   ├── 🚫 .gitignore              # Git Ignore Rules
│   └── 🚫 .dockerignore           # Docker Ignore Rules
├── 📁 docker/                      # Docker Konfiguration
│   ├── 🐳 server.Dockerfile       # Backend Container Build
│   ├── 🐳 client.Dockerfile       # Frontend Container Build
│   └── 🐙 docker-compose.yaml     # Multi-Container Setup
├── 📁 docs/                        # Dokumentation
│   ├── 📖 API_ENDPOINTS_GUIDE.md  # API Dokumentation
│   └── 🤖 OLLAMA_INTEGRATION_GUIDE.md # Ollama Setup Guide
└── 📁 scripts/                     # Utility Scripts
    └── (Platz für zukünftige Scripts)
```

## ✨ Features

- 🔐 **Auth0 Integration**: Vollständige Benutzerauthentifizierung
- 💬 **Real-time Chat**: Interaktive Chat-Sessions
- 🤖 **AI-Integration**: Ollama-powered Antworten
- 📱 **Responsive Design**: Modernes UI mit Tailwind CSS
- 🐳 **Docker Support**: Einfaches Deployment
- 🛡️ **Sichere API**: JWT-basierte Authentifizierung
- 📊 **SQLite Database**: Persistente Datenspeicherung

## 🚀 Schnellstart

### 📋 Voraussetzungen

- Node.js 18+
- Python 3.9+
- Docker & Docker Compose
- Ollama (für AI Features)
- Auth0 Account

### 🔧 Installation

1. **Repository klonen:**
```bash
git clone <repository-url>
cd CrudAiApp
```

2. **Auth0 konfigurieren:**
```bash
# Server Config
cp server/config/.env.example server/config/.env
# Client Config
cp client/.env.example client/.env
```

3. **Mit Docker starten:**
```bash
cd docker
docker-compose up --build
```

4. **Oder manuell starten:**

**Backend:**
```bash
cd server/src
python -m venv venv
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd client
npm install
npm run dev
```

## 🌐 Zugriff

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 🔧 Konfiguration

### Auth0 Setup
1. Erstelle eine Auth0 SPA Application
2. Konfiguriere Callback URLs: `http://localhost:5173`
3. Kopiere Domain, Client ID und Audience in die .env Files

### Ollama Setup
1. Installiere Ollama: https://ollama.ai
2. Starte Ollama Server: `ollama serve`
3. Lade ein Modell: `ollama pull llama2`

## 📚 Dokumentation

Detaillierte Dokumentation findest du im `docs/` Ordner:
- **API Guide**: `docs/API_ENDPOINTS_GUIDE.md`
- **Ollama Integration**: `docs/OLLAMA_INTEGRATION_GUIDE.md`

## 🤝 Contributing

1. Fork das Repository
2. Erstelle einen Feature Branch
3. Committe deine Änderungen
4. Push zum Branch
5. Erstelle einen Pull Request

## 📄 Lizenz

MIT License - siehe [LICENSE](LICENSE) für Details

## 🆘 Support

Bei Fragen oder Problemen erstelle ein Issue im GitHub Repository.

---

**Gebaut mit ❤️ und modernen Web-Technologien**
