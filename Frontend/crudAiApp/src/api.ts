
// ===============================================================================
// CRUD AI CHAT APP - API CLIENT
// ===============================================================================
// HTTP client for all backend API communication
// Handles Chat, Message, and AI API endpoints

// ===============================================================================
// TYPE DEFINITIONS
// ===============================================================================
// TypeScript interfaces for API data structures

interface Chat {
  id: number;
  title: string;
}

interface Message {
  id: number;
  chat_id: number;
  content: string;
  is_from_user: boolean;
  created_at: string;
}

// ===============================================================================
// API CONFIGURATION
// ===============================================================================
// Base URL for all API requests
const API_BASE = 'http://localhost:8000';

// ===============================================================================
// CHAT API FUNCTIONS
// ===============================================================================
// CRUD operations for chat management

export async function loadChats(): Promise<Chat[]> {
  try {
    const response = await fetch(`${API_BASE}/chats`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Fehler beim Laden der Chats:', error);
    return [];
  }
}

export async function createChat(title: string): Promise<Chat | null> {
  try {
    const response = await fetch(`${API_BASE}/chats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title }),
    });
    return await response.json();
  } catch (error) {
    console.error('Fehler beim Erstellen des Chats:', error);
    return null;
  }
}

export async function deleteChat(id: number): Promise<boolean> {
  try {
    await fetch(`${API_BASE}/chats/${id}`, {
      method: 'DELETE'
    });
    return true;
  } catch (error) {
    console.error('Fehler beim Löschen des Chats:', error);
    return false;
  }
}

export async function updateChat(id: number, title: string): Promise<Chat | null> {
  try {
    const response = await fetch(`${API_BASE}/chats/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title }),
    });
    return await response.json();
  } catch (error) {
    console.error('Fehler beim Updaten des Chats:', error);
    return null;
  }
}

// ===============================================================================
// MESSAGE API FUNCTIONS
// ===============================================================================
// Send and receive messages in chats

export async function loadMessages(chatId: number): Promise<Message[]> {
  try {
    const response = await fetch(`${API_BASE}/messages/${chatId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Fehler beim Laden der Nachrichten:', error);
    return [];
  }
}

export async function sendMessage(chatId: number, content: string, isFromUser: boolean = true): Promise<Message | null> {
  try {
    const response = await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: chatId,
        content: content,
        is_from_user: isFromUser
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Fehler beim Senden der Nachricht:', error);
    return null;
  }
}

// ===============================================================================
// AI API FUNCTIONS
// ===============================================================================
// Generate AI responses using Ollama

export async function generateAIResponse(chatId: number): Promise<Message | null> {
  try {
    const response = await fetch(`${API_BASE}/ai/generate/${chatId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Fehler beim Generieren der AI-Antwort:', error);
    return null;
  }
}

// ===============================================================================
// TYPE EXPORTS
// ===============================================================================
// Export types for use in other modules
export type { Chat, Message };