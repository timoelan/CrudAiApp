# # CrudAI Chat App

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=FastAPI&logoColor=white)](https://fastapi.tiangolo.com/)
[![Auth0](https://img.shields.io/badge/Auth0-EB5424?style=flat&logo=auth0&logoColor=white)](https://auth0.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)](https://docker.com)

A full-stack chat application with Auth0 authentication and local AI integration via Ollama.

## Features

- **Auth0 Authentication**: Secure JWT-based user authentication
- **Local AI Integration**: Ollama-powered chat responses (llama3.2:3b)
- **Persistent Storage**: SQLite database with auto-migrations
- **Real-time Chat**: Interactive chat interface with sidebar management
- **Docker Support**: Multi-container setup with health checks
- **Modern UI**: Responsive design with TypeScript frontend

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- Docker & Docker Compose
- Ollama (for AI features)
- Auth0 account

### Setup

1. **Clone repository:**
```bash
git clone https://github.com/timoelan/CrudAiApp.git
cd CrudAiApp
```

2. **Install Ollama and model:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama serve
ollama pull llama3.2:3b
```

3. **Configure Auth0:**

Create a Single Page Application in [Auth0 Dashboard](https://auth0.com):
- **Application Type:** Single Page Application
- **Allowed Callback URLs:** `http://localhost:5173`
- **Allowed Web Origins:** `http://localhost:5173`
- **Allowed Logout URLs:** `http://localhost:5173`

Create an API in Auth0:
- **Identifier:** `https://crudai-api`
- **Signing Algorithm:** RS256

4. **Environment setup:**

Frontend (.env):
```bash
cd client
cp .env.example .env
# Add your Auth0 values
```

Backend (.env):
```bash
cd server/config
cp .env.example .env
# Add your Auth0 values
```

5. **Start with Docker:**
```bash
cd docker
docker-compose up --build -d
```

6. **Access:**
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

## Project Structure

```
CrudAiApp/
├── client/                 # Frontend (Vite + TypeScript)
│   ├── src/
│   │   ├── main.ts        # Application entry
│   │   ├── auth.ts        # Auth0 service
│   │   ├── api.ts         # Backend API client
│   │   ├── chat.ts        # Chat interface
│   │   └── sidebar.ts     # Chat management
│   └── package.json
├── server/                 # Backend (FastAPI + Python)
│   └── src/
│       ├── main.py        # FastAPI application
│       ├── auth_service.py # JWT verification
│       ├── ai_service.py  # Ollama integration
│       ├── database.py    # SQLAlchemy setup
│       ├── models.py      # Database models
│       └── routes.py      # API endpoints
├── docker/                 # Docker configuration
│   ├── server.Dockerfile
│   ├── client.Dockerfile
│   └── docker-compose.yaml
└── docs/                   # Documentation
    ├── API_ENDPOINTS_GUIDE.md
    └── OLLAMA_INTEGRATION_GUIDE.md
```

## API Endpoints

All endpoints require Bearer JWT token authentication.

### User Management
- `GET /users/me` - Get current user
- `PUT /users/me` - Update user profile

### Chat Management
- `GET /chats` - Get user chats
- `POST /chats` - Create new chat
- `GET /chats/{id}` - Get specific chat
- `PUT /chats/{id}` - Update chat
- `DELETE /chats/{id}` - Delete chat

### Messages
- `GET /messages/{chat_id}` - Get chat messages
- `POST /messages` - Send new message

### AI Integration
- `POST /ai/generate/{chat_id}` - Generate AI response

## Development

### Local Development (without Docker)

**Backend:**
```bash
cd server/src
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd client
npm install
npm run dev
```

## Troubleshooting

### Auth0 Login Issues
```bash
# Check Auth0 configuration
echo $VITE_AUTH0_DOMAIN
echo $VITE_AUTH0_CLIENT_ID

# Ensure callback URL is correct in Auth0 Dashboard
```

### AI Not Responding
```bash
# Check if Ollama is running
curl http://localhost:11434/api/version

# Start Ollama if not running
ollama serve

# Check available models
ollama list
```

### Database Issues
```bash
# Check database file
ls -la server/src/crudai.db

# Test SQLite directly
sqlite3 server/src/crudai.db "SELECT * FROM chats LIMIT 5;"
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

---
## 🏗️ Architektur

```
┌─────────────────────────────────────────────────────────────┐
│                    Production Architecture                   │
├─────────────────────────────────────────────────────────────┤
│  Frontend (React-like TypeScript)                          │
│  ├── Auth0 SPA Client (JWT Tokens)                        │
│  ├── Chat UI (Messages, Sidebar)                          │
│  └── API Client (HTTP + CORS)                             │
│                            │                               │
│  ┌─────────────────────────▼──────────────────────────┐    │
│  │              Backend (FastAPI)                     │    │
│  │  ├── JWT Verification (JWKS)                      │    │
│  │  ├── CRUD API Routes                               │    │
│  │  ├── Ollama AI Integration                         │    │
│  │  └── SQLAlchemy ORM                                │    │
│  └─────────────────────────┬──────────────────────────┘    │
│                            │                               │
│  ┌─────────────────────────▼──────────────────────────┐    │
│  │                    Data Layer                      │    │
│  │  ├── SQLite Database (crudai.db)                  │    │
│  │  └── Ollama (llama3.2:3b)                         │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### **Nützliche Kommandos**
```bash
# Logs anschauen
docker-compose -f docker/docker-compose.yaml logs -f

# Services neustarten
docker-compose -f docker/docker-compose.yaml restart

# Alles stoppen
docker-compose -f docker/docker-compose.yaml down

# Setup-Script ausführen
./scripts/setup.sh
```

## 📚 API Dokumentation

### **Authentifizierte Endpoints**

Alle Endpoints benötigen einen **Bearer JWT Token** im Authorization Header.

#### **User Management**
- `GET /users/me` - Aktuellen Benutzer abrufen
- `PUT /users/me` - Benutzerprofil aktualisieren

#### **Chat Management**  
- `GET /chats` - Alle Benutzer-Chats
- `POST /chats` - Neuen Chat erstellen
- `GET /chats/{id}` - Spezifischen Chat abrufen
- `PUT /chats/{id}` - Chat aktualisieren
- `DELETE /chats/{id}` - Chat löschen

#### **Messages**
- `GET /messages/{chat_id}` - Chat-Nachrichten
- `POST /messages` - Neue Nachricht senden

#### **AI Integration**
- `POST /ai/generate/{chat_id}` - KI-Antwort generieren

Detaillierte API-Dokumentation findest du in [`docs/API_ENDPOINTS_GUIDE.md`](docs/API_ENDPOINTS_GUIDE.md).

## 🔧 Konfiguration

### **Ollama Modelle**

#### **Verfügbare Modelle:**
```bash
# Empfohlen für Chat (schnell, gut)
ollama pull llama3.2:3b

# Sehr schnell (weniger genau)
ollama pull llama3.2:1b  

# Größer, sehr gut (mehr RAM)
ollama pull mistral:7b

# Für Code-Generierung
ollama pull codellama:7b
```

#### **Modell wechseln:**
```python
# In server/src/ai_service.py
self.model = "mistral:7b"  # Oder ein anderes Modell
```

Vollständige Ollama-Integration findest du in [`docs/OLLAMA_INTEGRATION_GUIDE.md`](docs/OLLAMA_INTEGRATION_GUIDE.md).

## 🔍 Troubleshooting

### **Häufige Probleme:**

#### **1. Auth0 Login funktioniert nicht**
```bash
# Prüfe Auth0-Konfiguration
echo $VITE_AUTH0_DOMAIN
echo $VITE_AUTH0_CLIENT_ID

# Stelle sicher, dass Callback URL korrekt ist
# Auth0 Dashboard > Applications > Settings > Allowed Callback URLs
# Muss enthalten: http://localhost:5173
```

#### **2. AI antwortet nicht (503 Error)**
```bash
# Prüfe ob Ollama läuft
curl http://localhost:11434/api/version

# Ollama starten falls nicht läuft
ollama serve

# Modell prüfen
ollama list
```

#### **3. Datenbank-Probleme**
```bash
# Datenbank-Datei prüfen  
ls -la server/src/crudai.db

# SQLite direkt testen
sqlite3 server/src/crudai.db "SELECT * FROM chats LIMIT 5;"
```

#### **4. Docker-Container-Probleme**
```bash
# Container-Status prüfen
docker ps

# Logs überprüfen
docker-compose -f docker/docker-compose.yaml logs backend
docker-compose -f docker/docker-compose.yaml logs frontend

# Container neu bauen
docker-compose -f docker/docker-compose.yaml up --build --force-recreate
```

## 📊 Performance & Skalierung

### **Aktuelle Limits:**
- **SQLite:** Bis ~100k Nachrichten (für mehr: PostgreSQL)
- **Ollama:** Lokaler RAM-basiert (3B Modell = ~4GB RAM)
- **Auth0:** 7,000 aktive Benutzer (kostenlos)

### **Produktions-Optimierungen:**
- **Datenbank:** Wechsel zu PostgreSQL
- **Ollama:** GPU-Beschleunigung aktivieren
- **Caching:** Redis für Session-Management
- **Load Balancing:** Nginx für mehrere Backend-Instanzen

## 🤝 Contributing

Contributions sind willkommen! Bitte:

1. **Fork** das Repository
2. **Branch** erstellen (`git checkout -b feature/neue-funktion`)
3. **Commit** deine Changes (`git commit -m 'Neue Funktion hinzugefügt'`)
4. **Push** zum Branch (`git push origin feature/neue-funktion`)
5. **Pull Request** öffnen


## 🙏 Credits

- **FastAPI** - Modernes Python Web Framework
- **Auth0** - Authentifizierung als Service
- **Ollama** - Lokale LLM-Runtime
- **Vite** - Schneller Frontend-Build-Tool
- **SQLAlchemy** - Python ORM
- **TypeScript** - Typsichere JavaScript-Entwicklung

---

**⭐ Star das Repository wenn es dir geholfen hat!**

**🐛 Issues melden:** [GitHub Issues](https://github.com/timoelan/CrudAiApp/issues)

**📧 Kontakt:** [GitHub Profile](https://github.com/timoelan)
