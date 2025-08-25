# 🤖 Ollama Integration Guide

Diese umfassende Anleitung erklärt, wie Ollama in die CrudAiApp integriert wird und wie du es selbst einrichten kannst.

## 📋 Was ist Ollama?

Ollama ist ein Tool, um große Sprachmodelle (LLMs) lokal auf deinem Computer auszuführen. Es ermöglicht:
- **Offline AI-Chats** ohne Internet
- **Datenschutz** - alle Daten bleiben auf deinem Computer
- **Schnelle Antworten** ohne externe API-Kosten
- **Verschiedene Modelle** wie Llama, Mistral, CodeLlama

## 🛠️ Ollama Installation

### macOS Installation
```bash
# 1. Ollama herunterladen und installieren
curl -fsSL https://ollama.com/install.sh | sh

# 2. Ollama starten (läuft im Hintergrund)
ollama serve

# 3. Erstes Modell herunterladen (z.B. Llama 3.2:3b)
ollama pull llama3.2:3b
```

### Alternative: Manuelle Installation
1. Gehe zu [ollama.com](https://ollama.com)
2. Lade die App für dein Betriebssystem herunter
3. Installiere und starte Ollama
4. Öffne Terminal und führe `ollama pull llama3.2:3b` aus

## 🎯 Verfügbare Modelle

### Empfohlene Modelle für Chat:
```bash
# Llama 3.2 (3B) - Schnell, gut für Chat
ollama pull llama3.2:3b

# Llama 3.2 (1B) - Sehr schnell, weniger genau  
ollama pull llama3.2:1b

# Mistral (7B) - Größer, sehr gut für komplexe Fragen
ollama pull mistral:7b

# CodeLlama - Speziell für Programmierung
ollama pull codellama:7b
```

### Modell-Vergleich:
| Modell | Größe | RAM Bedarf | Geschwindigkeit | Qualität |
|--------|-------|------------|----------------|----------|
| llama3.2:1b | 1.3GB | 2GB | ⚡⚡⚡ | ⭐⭐⭐ |
| llama3.2:3b | 2GB | 4GB | ⚡⚡ | ⭐⭐⭐⭐ |
| mistral:7b | 4.1GB | 8GB | ⚡ | ⭐⭐⭐⭐⭐ |

## 🔧 Backend Integration

### 1. AI Service Setup (ai_service.py)

```python
import httpx
import asyncio
from typing import Dict, List, Optional
import logging

# =============================================================================
# OLLAMA AI SERVICE - Lokale KI-Integration
# =============================================================================

class OllamaService:
    """
    Service für die Kommunikation mit dem lokalen Ollama Server
    Verwaltet Konversationen und generiert AI-Antworten
    """
    
    def __init__(self, base_url: str = "http://localhost:11434", model: str = "llama3.2:3b"):
        self.base_url = base_url
        self.model = model
        self.conversations: Dict[int, List[Dict]] = {}
        
    async def is_available(self) -> bool:
        """
        Prüft ob Ollama Server erreichbar ist
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self.base_url}/api/tags")
                return response.status_code == 200
        except Exception as e:
            logging.error(f"Ollama nicht verfügbar: {e}")
            return False
    
    async def get_available_models(self) -> List[str]:
        """
        Ruft alle verfügbaren Modelle vom Ollama Server ab
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self.base_url}/api/tags")
                if response.status_code == 200:
                    data = response.json()
                    return [model["name"] for model in data.get("models", [])]
        except Exception as e:
            logging.error(f"Fehler beim Abrufen der Modelle: {e}")
        return []
    
    def _prepare_conversation_context(self, chat_id: int, new_message: str) -> List[Dict]:
        """
        Bereitet den Konversationskontext vor
        Fügt neue Nachricht zur Chat-Historie hinzu
        """
        if chat_id not in self.conversations:
            self.conversations[chat_id] = []
        
        # Neue Benutzernachricht hinzufügen
        self.conversations[chat_id].append({
            "role": "user",
            "content": new_message
        })
        
        # System-Prompt für bessere deutsche Antworten
        messages = [
            {
                "role": "system", 
                "content": "Du bist ein hilfsreicher AI-Assistent. Antworte immer auf Deutsch und sei freundlich und hilfsreich."
            }
        ]
        
        # Bisherige Konversation hinzufügen (max. 10 Nachrichten für Performance)
        recent_messages = self.conversations[chat_id][-10:]
        messages.extend(recent_messages)
        
        return messages
    
    async def generate_response(self, chat_id: int, user_message: str) -> str:
        """
        Generiert AI-Antwort für eine Benutzernachricht
        
        Args:
            chat_id: ID des Chats
            user_message: Nachricht vom Benutzer
            
        Returns:
            str: AI-Antwort
        """
        try:
            # Konversationskontext vorbereiten
            messages = self._prepare_conversation_context(chat_id, user_message)
            
            # Anfrage an Ollama senden
            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(
                    f"{self.base_url}/api/chat",
                    json={
                        "model": self.model,
                        "messages": messages,
                        "stream": False,
                        "options": {
                            "temperature": 0.7,  # Kreativität
                            "top_p": 0.9,       # Fokussierung
                            "top_k": 40         # Wortauswahl
                        }
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    ai_response = data.get("message", {}).get("content", "Keine Antwort erhalten.")
                    
                    # AI-Antwort zur Konversation hinzufügen
                    self.conversations[chat_id].append({
                        "role": "assistant",
                        "content": ai_response
                    })
                    
                    return ai_response
                else:
                    return f"Fehler beim Generieren der Antwort (Status: {response.status_code})"
                    
        except asyncio.TimeoutError:
            return "⏱️ Die AI-Antwort hat zu lange gedauert. Bitte versuche es erneut."
        except Exception as e:
            logging.error(f"Fehler bei AI-Generierung: {e}")
            return f"❌ Fehler bei der AI-Antwort: {str(e)}"
    
    async def reset_conversation(self, chat_id: int):
        """
        Setzt die Konversationshistorie für einen Chat zurück
        """
        if chat_id in self.conversations:
            del self.conversations[chat_id]
    
    async def get_conversation_length(self, chat_id: int) -> int:
        """
        Gibt die Anzahl der Nachrichten in einer Konversation zurück
        """
        return len(self.conversations.get(chat_id, []))

# Globale Service-Instanz
ollama_service = OllamaService()
```

### 2. Route Integration (routes.py)

```python
from fastapi import HTTPException
from .ai_service import ollama_service

# AI-Response Endpoint
@app.post("/chats/{chat_id}/ai-response")
async def generate_ai_response(chat_id: int, request: dict):
    """
    Generiert eine AI-Antwort für eine Benutzernachricht
    
    1. Prüft ob Ollama verfügbar ist
    2. Generiert AI-Antwort
    3. Speichert AI-Antwort in Datenbank
    4. Gibt AI-Nachricht zurück
    """
    try:
        # Chat existiert prüfen
        chat = db.query(Chat).filter(Chat.id == chat_id).first()
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")
        
        # Ollama Verfügbarkeit prüfen
        if not await ollama_service.is_available():
            raise HTTPException(status_code=503, detail="AI-Service nicht verfügbar. Ist Ollama gestartet?")
        
        user_message = request.get("user_message", "")
        if not user_message:
            raise HTTPException(status_code=400, detail="user_message ist erforderlich")
        
        # AI-Antwort generieren
        ai_response = await ollama_service.generate_response(chat_id, user_message)
        
        # AI-Antwort in Datenbank speichern
        ai_message = Message(
            content=ai_response,
            chat_id=chat_id,
            is_user=False
        )
        db.add(ai_message)
        db.commit()
        db.refresh(ai_message)
        
        return {
            "id": ai_message.id,
            "content": ai_message.content,
            "chat_id": ai_message.chat_id,
            "is_user": ai_message.is_user,
            "created_at": ai_message.created_at
        }
        
    except Exception as e:
        logging.error(f"Fehler bei AI-Response: {e}")
        raise HTTPException(status_code=500, detail=f"Interner Server-Fehler: {str(e)}")
```

## 🎯 Frontend Integration

### API Call für AI-Response (api.ts)
```typescript
// =============================================================================
// AI-INTEGRATION - Ollama Kommunikation
// =============================================================================

/**
 * Generiert eine AI-Antwort für eine Benutzernachricht
 * Kommuniziert mit dem Backend, welches wiederum mit Ollama spricht
 */
export const generateAIResponse = async (chatId: number, userMessage: string): Promise<Message> => {
  try {
    const response = await fetch(`${API_BASE_URL}/chats/${chatId}/ai-response`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_message: userMessage,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to generate AI response');
    }

    return response.json();
  } catch (error) {
    console.error('AI Response Error:', error);
    throw error;
  }
};
```

### Chat Integration (chat.ts)
```typescript
// =============================================================================
// CHAT-WORKFLOW MIT AI-INTEGRATION
// =============================================================================

/**
 * Sendet eine Nachricht und generiert automatisch eine AI-Antwort
 */
const handleSendMessage = async () => {
  const messageText = messageInput.value.trim();
  if (!messageText) return;

  try {
    // Input leeren und deaktivieren
    messageInput.value = '';
    messageInput.disabled = true;
    sendButton.disabled = true;

    // 1. Benutzernachricht senden und anzeigen
    const userMessage = await sendMessage(currentChatId, messageText);
    appendMessage({
      ...userMessage,
      content: messageText,
      is_user: true,
      created_at: new Date().toISOString()
    });

    // 2. Typing-Indikator für AI anzeigen
    showTypingIndicator();

    // 3. AI-Antwort generieren
    const aiMessage = await generateAIResponse(currentChatId, messageText);
    
    // 4. Typing-Indikator entfernen und AI-Antwort anzeigen
    hideTypingIndicator();
    appendMessage(aiMessage);

    // 5. Scroll zu neuester Nachricht
    scrollToBottom();

  } catch (error) {
    console.error('Error in message workflow:', error);
    
    // Fehlerbehandlung
    hideTypingIndicator();
    appendMessage({
      id: Date.now(),
      content: `❌ Fehler: ${error.message}`,
      chat_id: currentChatId,
      is_user: false,
      created_at: new Date().toISOString()
    });
  } finally {
    // Input wieder aktivieren
    messageInput.disabled = false;
    sendButton.disabled = false;
    messageInput.focus();
  }
};

/**
 * Zeigt einen Typing-Indikator für die AI an
 */
const showTypingIndicator = () => {
  const typingDiv = document.createElement('div');
  typingDiv.id = 'typing-indicator';
  typingDiv.className = 'message message-incoming typing-indicator';
  typingDiv.innerHTML = `
    <div class="message-content">
      <div class="typing-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  `;
  messagesContainer.appendChild(typingDiv);
  scrollToBottom();
};

/**
 * Entfernt den Typing-Indikator
 */
const hideTypingIndicator = () => {
  const typingIndicator = document.getElementById('typing-indicator');
  if (typingIndicator) {
    typingIndicator.remove();
  }
};
```

## 🔍 Troubleshooting

### Häufige Probleme und Lösungen:

#### 1. "Ollama nicht verfügbar" Fehler
```bash
# Prüfen ob Ollama läuft
ps aux | grep ollama

# Ollama starten
ollama serve

# Oder als Service starten (macOS)
brew services start ollama
```

#### 2. "Modell nicht gefunden"
```bash
# Verfügbare Modelle anzeigen
ollama list

# Modell herunterladen
ollama pull llama3.2:3b

# Modell testen
ollama run llama3.2:3b "Hallo, wie geht es dir?"
```

#### 3. Langsame Antworten
```bash
# Kleineres Modell verwenden
ollama pull llama3.2:1b

# In ai_service.py das Modell ändern:
# self.model = "llama3.2:1b"
```

#### 4. Speicherprobleme
```bash
# RAM-Verbrauch prüfen
ollama ps

# Nicht verwendete Modelle entfernen
ollama rm mistral:7b
```

## ⚙️ Konfiguration & Optimierung

### Backend-Konfiguration anpassen:
```python
# In ai_service.py verschiedene Einstellungen testen:

# Für kreativere Antworten:
"options": {
    "temperature": 0.9,  # Höher = kreativer
    "top_p": 0.8,
    "top_k": 60
}

# Für präzisere Antworten:
"options": {
    "temperature": 0.3,  # Niedriger = präziser  
    "top_p": 0.95,
    "top_k": 20
}
```

### Performance-Optimierung:
```python
# Konversationshistorie begrenzen (ai_service.py)
recent_messages = self.conversations[chat_id][-5:]  # Nur letzte 5 Nachrichten

# Timeout anpassen
async with httpx.AsyncClient(timeout=60.0) as client:  # Kürzer für schnellere Fehlerbehandlung
```

## 🚀 Erweiterte Features

### 1. Modell-Wechsel zur Laufzeit:
```python
@app.post("/ai/change-model")
async def change_model(model_name: str):
    """Ändert das verwendete AI-Modell"""
    available_models = await ollama_service.get_available_models()
    if model_name not in available_models:
        raise HTTPException(status_code=400, detail="Modell nicht verfügbar")
    
    ollama_service.model = model_name
    return {"message": f"Modell geändert zu {model_name}"}
```

### 2. System-Prompt anpassen:
```python
# Verschiedene Persönlichkeiten definieren
SYSTEM_PROMPTS = {
    "helpful": "Du bist ein hilfsreicher AI-Assistent.",
    "creative": "Du bist ein kreativer AI-Assistent, der gerne Geschichten erzählt.",
    "technical": "Du bist ein technischer AI-Assistent mit Fokus auf Programmierung.",
}
```

### 3. Streaming-Antworten (Echtzeit):
```python
# Für Live-Antworten während der Generierung
"stream": True  # In der Ollama-Anfrage
```

## 📊 Monitoring & Logging

### Performance überwachen:
```python
import time
import logging

class OllamaService:
    async def generate_response(self, chat_id: int, user_message: str) -> str:
        start_time = time.time()
        
        try:
            # ... AI-Generierung ...
            response_time = time.time() - start_time
            logging.info(f"AI-Response generiert in {response_time:.2f}s für Chat {chat_id}")
            
        except Exception as e:
            logging.error(f"AI-Fehler nach {time.time() - start_time:.2f}s: {e}")
```

## 🎉 Fertig!

Mit dieser Anleitung hast du:
✅ Ollama installiert und konfiguriert  
✅ Backend AI-Service implementiert  
✅ Frontend AI-Integration erstellt  
✅ Error-Handling und Monitoring eingerichtet  
✅ Performance-Optimierungen angewendet  

Deine CrudAiApp kann jetzt offline mit lokalen AI-Modellen chatten! 🚀
