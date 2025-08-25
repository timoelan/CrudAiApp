# 📡 API Endpoints & Frontend-Backend Kommunikation

Diese Anleitung erklärt detailliert, wie die Kommunikation zwischen Frontend und Backend in der CrudAiApp funktioniert.

## 🏗️ Architektur Übersicht

```
Frontend (TypeScript/Vite)  ←→  Backend (FastAPI/Python)  ←→  SQLite Database
        Port 5173                     Port 8000                  crudai.db
```

## 🔌 Verfügbare API Endpoints

### 1. User Management

#### **GET /users/**
Alle Benutzer abrufen

**Frontend Code:**
```typescript
// In api.ts
export const getUsers = async (): Promise<User[]> => {
  const response = await fetch(`${API_BASE_URL}/users/`);
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
};

// Verwendung im Frontend:
const users = await getUsers();
console.log(users);
```

**Backend Response:**
```json
[
  {
    "id": 1,
    "name": "Max Mustermann",
    "email": "max@example.com",
    "created_at": "2024-01-01T10:00:00"
  }
]
```

#### **POST /users/**
Neuen Benutzer erstellen

**Frontend Code:**
```typescript
// In api.ts
export const createUser = async (userData: { name: string; email: string }): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/users/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  if (!response.ok) throw new Error('Failed to create user');
  return response.json();
};

// Verwendung:
const newUser = await createUser({
  name: "Anna Schmidt",
  email: "anna@example.com"
});
```

### 2. Chat Management

#### **GET /chats/**
Alle Chats abrufen

**Frontend Code:**
```typescript
export const getChats = async (): Promise<Chat[]> => {
  const response = await fetch(`${API_BASE_URL}/chats/`);
  if (!response.ok) throw new Error('Failed to fetch chats');
  return response.json();
};

// Verwendung in der Sidebar:
const loadChats = async () => {
  try {
    const chats = await getChats();
    displayChats(chats);
  } catch (error) {
    console.error('Error loading chats:', error);
  }
};
```

#### **POST /chats/**
Neuen Chat erstellen

**Frontend Code:**
```typescript
export const createChat = async (chatData: { title: string; user_id: number }): Promise<Chat> => {
  const response = await fetch(`${API_BASE_URL}/chats/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(chatData),
  });
  if (!response.ok) throw new Error('Failed to create chat');
  return response.json();
};

// Automatische Chat-Erstellung beim ersten Nachricht:
const createNewChatAutomatically = async (message: string) => {
  const chatTitle = message.substring(0, 30) + (message.length > 30 ? '...' : '');
  const newChat = await createChat({
    title: chatTitle,
    user_id: 1 // Standardbenutzer
  });
  return newChat.id;
};
```

#### **DELETE /chats/{chat_id}**
Chat löschen

**Frontend Code:**
```typescript
export const deleteChat = async (chatId: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/chats/${chatId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete chat');
};

// Verwendung mit Bestätigung:
const handleDeleteChat = async (chatId: number) => {
  if (confirm('Chat wirklich löschen?')) {
    await deleteChat(chatId);
    await loadChats(); // Liste neu laden
  }
};
```

### 3. Message Management

#### **GET /chats/{chat_id}/messages**
Nachrichten eines Chats abrufen

**Frontend Code:**
```typescript
export const getMessages = async (chatId: number): Promise<Message[]> => {
  const response = await fetch(`${API_BASE_URL}/chats/${chatId}/messages`);
  if (!response.ok) throw new Error('Failed to fetch messages');
  return response.json();
};

// Chat-Nachrichten laden:
const loadChatMessages = async (chatId: number) => {
  try {
    const messages = await getMessages(chatId);
    displayMessages(messages);
  } catch (error) {
    console.error('Error loading messages:', error);
  }
};
```

#### **POST /chats/{chat_id}/messages**
Neue Nachricht senden

**Frontend Code:**
```typescript
export const sendMessage = async (chatId: number, content: string, isUser: boolean = true): Promise<Message> => {
  const response = await fetch(`${API_BASE_URL}/chats/${chatId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content: content,
      is_user: isUser,
    }),
  });
  if (!response.ok) throw new Error('Failed to send message');
  return response.json();
};

// Nachricht senden und anzeigen:
const handleSendMessage = async (message: string) => {
  // Benutzernachricht senden
  const userMessage = await sendMessage(currentChatId, message, true);
  displayMessage(userMessage);
  
  // AI-Antwort generieren (siehe AI-Endpoint)
  await generateAIResponse(currentChatId, message);
};
```

### 4. AI Integration

#### **POST /chats/{chat_id}/ai-response**
AI-Antwort generieren

**Frontend Code:**
```typescript
export const generateAIResponse = async (chatId: number, userMessage: string): Promise<Message> => {
  const response = await fetch(`${API_BASE_URL}/chats/${chatId}/ai-response`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_message: userMessage,
    }),
  });
  if (!response.ok) throw new Error('Failed to generate AI response');
  return response.json();
};

// Vollständiger Chat-Workflow:
const handleCompleteMessage = async (message: string) => {
  try {
    // 1. Benutzernachricht senden
    const userMessage = await sendMessage(currentChatId, message, true);
    appendMessage(userMessage);
    
    // 2. Typing-Indikator anzeigen
    showTypingIndicator();
    
    // 3. AI-Antwort generieren
    const aiMessage = await generateAIResponse(currentChatId, message);
    
    // 4. Typing-Indikator entfernen und AI-Antwort anzeigen
    hideTypingIndicator();
    appendMessage(aiMessage);
    
  } catch (error) {
    console.error('Error in message workflow:', error);
    showErrorMessage('Fehler beim Senden der Nachricht');
  }
};
```

## 🔧 Frontend Setup & Konfiguration

### API Configuration (api.ts)
```typescript
// API Base URL - ändere diese je nach Umgebung
const API_BASE_URL = 'http://localhost:8000';

// Error Handling Utility
const handleApiError = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
  }
};

// Generic Fetch Wrapper
const apiRequest = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    await handleApiError(response);
    return response.json();
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
};
```

## 🛡️ Error Handling

### Frontend Error Handling
```typescript
// In chat.ts
const displayErrorMessage = (message: string) => {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'message error';
  errorDiv.innerHTML = `
    <div class="message-content">
      ❌ ${message}
    </div>
  `;
  messagesContainer.appendChild(errorDiv);
};

// Verwendung in API-Calls:
try {
  const response = await sendMessage(chatId, content);
  displayMessage(response);
} catch (error) {
  displayErrorMessage('Nachricht konnte nicht gesendet werden');
}
```

### Backend Error Responses
Das Backend sendet strukturierte Fehlermeldungen:
```json
{
  "detail": "Chat not found",
  "type": "not_found",
  "code": 404
}
```

## 🔄 Real-time Updates

### Polling für Live-Updates
```typescript
// Automatisches Nachladen alle 5 Sekunden
const startPolling = (chatId: number) => {
  const interval = setInterval(async () => {
    try {
      const messages = await getMessages(chatId);
      updateMessagesDisplay(messages);
    } catch (error) {
      console.error('Polling error:', error);
    }
  }, 5000);
  
  return interval;
};

// Polling stoppen
const stopPolling = (interval: number) => {
  clearInterval(interval);
};
```

## 🧪 Testing API Endpoints

### Mit curl testen:
```bash
# Alle Chats abrufen
curl -X GET "http://localhost:8000/chats/"

# Neuen Chat erstellen
curl -X POST "http://localhost:8000/chats/" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Chat", "user_id": 1}'

# Nachricht senden
curl -X POST "http://localhost:8000/chats/1/messages" \
  -H "Content-Type: application/json" \
  -d '{"content": "Hallo!", "is_user": true}'

# AI-Antwort generieren
curl -X POST "http://localhost:8000/chats/1/ai-response" \
  -H "Content-Type: application/json" \
  -d '{"user_message": "Wie geht es dir?"}'
```

## 🚀 Deployment Hinweise

### Entwicklung
- Frontend: `npm run dev` (Port 5173)
- Backend: `uvicorn main:app --reload` (Port 8000)

### Produktion
Vergiss nicht, die API_BASE_URL in der Produktion anzupassen:
```typescript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-api-domain.com' 
  : 'http://localhost:8000';
```

## 📊 Data Flow Beispiel

1. **User sendet Nachricht**
   ```
   Frontend Input → POST /chats/{id}/messages → Database
   ```

2. **AI-Antwort generieren**
   ```
   Frontend → POST /chats/{id}/ai-response → Ollama → Database → Frontend
   ```

3. **Chat laden**
   ```
   Frontend → GET /chats/{id}/messages → Database → Frontend Display
   ```

Diese Anleitung deckt alle wichtigen Aspekte der API-Kommunikation ab und zeigt, wie Frontend und Backend nahtlos zusammenarbeiten! 🎯
