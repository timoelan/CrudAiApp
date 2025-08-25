// ===============================================================================
// CRUD AI CHAT APP - API CLIENT WITH AUTH0 INTEGRATION
// ===============================================================================
// HTTP client for all backend API communication with JWT authentication
// Handles Chat, Message, and AI API endpoints with Auth0 tokens

import { authService } from './auth.js';

// ===============================================================================
// TYPE DEFINITIONS
// ===============================================================================
// TypeScript interfaces for API data structures

interface User {
  id: number;
  auth0_user_id: string;
  username: string;
  email: string;
  name?: string;
  picture?: string;
  created_at: string;
  updated_at: string;
}

interface Chat {
  id: number;
  title: string;
  user_id: number;
  created_at: string;
  updated_at: string;
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
// UTILITY FUNCTIONS
// ===============================================================================
// Helper functions for API requests with authentication

/**
 * Get headers with Auth0 JWT token
 */
async function getAuthHeaders(): Promise<HeadersInit> {
  const token = await authService.getAccessToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

/**
 * Make authenticated API request
 */
async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = await getAuthHeaders();
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });
  
  // Handle unauthorized responses
  if (response.status === 401) {
    console.warn('Unauthorized API request - user may need to login');
    // Could trigger re-login here if needed
  }
  
  return response;
}

// ===============================================================================
// USER API FUNCTIONS
// ===============================================================================
// User profile management with Auth0

export async function getCurrentUser(): Promise<User | null> {
  try {
    if (!authService.getIsAuthenticated()) {
      return null;
    }
    
    const response = await authenticatedFetch(`${API_BASE}/users/me`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const user = await response.json();
    return user;
  } catch (error) {
    console.error('Fehler beim Laden des Benutzerprofils:', error);
    return null;
  }
}

export async function updateCurrentUser(userData: { username?: string; name?: string }): Promise<User | null> {
  try {
    const response = await authenticatedFetch(`${API_BASE}/users/me`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const user = await response.json();
    return user;
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Benutzerprofils:', error);
    return null;
  }
}

// ===============================================================================
// CHAT API FUNCTIONS WITH AUTH0
// ===============================================================================
// CRUD operations for chat management with authentication

export async function loadChats(): Promise<Chat[]> {
  try {
    if (!authService.getIsAuthenticated()) {
      return [];
    }
    
    const response = await authenticatedFetch(`${API_BASE}/chats`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Fehler beim Laden der Chats:', error);
    return [];
  }
}

export async function createChat(title: string): Promise<Chat | null> {
  try {
    const response = await authenticatedFetch(`${API_BASE}/chats`, {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const chat = await response.json();
    return chat;
  } catch (error) {
    console.error('Fehler beim Erstellen des Chats:', error);
    return null;
  }
}

export async function updateChat(chatId: number, title: string): Promise<Chat | null> {
  try {
    const response = await authenticatedFetch(`${API_BASE}/chats/${chatId}`, {
      method: 'PUT',
      body: JSON.stringify({ title }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const chat = await response.json();
    return chat;
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Chats:', error);
    return null;
  }
}

export async function deleteChat(chatId: number): Promise<boolean> {
  try {
    const response = await authenticatedFetch(`${API_BASE}/chats/${chatId}`, {
      method: 'DELETE',
    });
    
    return response.ok;
  } catch (error) {
    console.error('Fehler beim Löschen des Chats:', error);
    return false;
  }
}

// ===============================================================================
// MESSAGE API FUNCTIONS WITH AUTH0
// ===============================================================================
// Send and receive messages in chats with authentication

export async function loadMessages(chatId: number): Promise<Message[]> {
  try {
    if (!authService.getIsAuthenticated()) {
      return [];
    }
    
    const response = await authenticatedFetch(`${API_BASE}/messages/${chatId}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
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
    const response = await authenticatedFetch(`${API_BASE}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        chat_id: chatId,
        content: content,
        is_from_user: isFromUser
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Fehler beim Senden der Nachricht:', error);
    return null;
  }
}

// ===============================================================================
// AI API FUNCTIONS WITH AUTH0
// ===============================================================================
// Generate AI responses using Ollama with authentication

export async function generateAIResponse(chatId: number): Promise<Message | null> {
  try {
    const response = await authenticatedFetch(`${API_BASE}/ai/generate/${chatId}`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
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
export type { Chat, Message, User };
