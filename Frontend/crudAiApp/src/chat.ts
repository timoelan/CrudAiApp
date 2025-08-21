// ===============================================================================
// CRUD AI CHAT APP - CHAT COMPONENT
// ===============================================================================
// Main chat interface with message sending, AI responses, and real-time UI
// Handles message display, user input, and AI conversation management

import './style.css';
import type { Chat, Message } from './api.ts';
import { loadMessages, sendMessage, generateAIResponse } from './api.ts';

// ===============================================================================
// STATE MANAGEMENT
// ===============================================================================
// Current active chat state
let activeChat: Chat | null = null;

// ===============================================================================
// DOM ELEMENTS CREATION
// ===============================================================================
// Main chat window container
const chatWindow = document.createElement("div");
chatWindow.className = "chat-window";
const appContainer = document.getElementById('app')!;
appContainer.appendChild(chatWindow);

// Chat header with title
const chatHeader = document.createElement("div");
chatHeader.className = "chat-header";
chatWindow.appendChild(chatHeader);

const chatTitle = document.createElement("h2");
chatTitle.textContent = "Wähle einen Chat";
chatHeader.appendChild(chatTitle);

// Messages display container
const messagesContainer = document.createElement("div");
messagesContainer.className = "messages-container";
chatWindow.appendChild(messagesContainer);

// ===============================================================================
// INPUT AREA CREATION
// ===============================================================================
// Message input and send button
const chatInputContainer = document.createElement("div");
chatInputContainer.className = "chat-input-container";

const chatInput = document.createElement("input");
chatInput.type = "text";
chatInput.placeholder = "Nachricht eingeben...";
chatInput.className = "chat-input";

const sendButton = document.createElement("button");
sendButton.textContent = "➤";
sendButton.className = "send-button";

chatInputContainer.appendChild(chatInput);
chatInputContainer.appendChild(sendButton);
chatWindow.appendChild(chatInputContainer);

// ===============================================================================
// CORE CHAT FUNCTIONS
// ===============================================================================
// Chat switching and message loading

// Export functions
export async function setActiveChat(chat: Chat) {
  activeChat = chat;
  chatTitle.textContent = chat.title;
  
  // Load and display existing messages
  await loadChatMessages(chat.id);
}

// Load messages for a specific chat from API
async function loadChatMessages(chatId: number) {
  try {
    const messages = await loadMessages(chatId);
    messagesContainer.innerHTML = ""; // Clear container
    
    messages.forEach(message => {
      displayMessage(message);
    });
    
    // Scroll to bottom to show latest messages
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  } catch (error) {
    console.error('Fehler beim Laden der Nachrichten:', error);
  }
}

// ===============================================================================
// MESSAGE DISPLAY FUNCTIONS
// ===============================================================================
// Render messages in the chat interface

// Display a single message in the UI
function displayMessage(message: Message) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${message.is_from_user ? 'message-outgoing' : 'message-incoming'}`;
  
  const contentDiv = document.createElement("div");
  contentDiv.className = "message-content";
  contentDiv.textContent = message.content;
  
  const timeDiv = document.createElement("div");
  timeDiv.className = "message-time";
  const time = new Date(message.created_at).toLocaleTimeString('de-DE', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  timeDiv.textContent = time;
  
  messageDiv.appendChild(contentDiv);
  messageDiv.appendChild(timeDiv);
  messagesContainer.appendChild(messageDiv);
}

// ===============================================================================
// EVENT LISTENERS
// ===============================================================================
// Handle user interactions with input elements

// Send button click
sendButton.addEventListener("click", async () => {
  await handleSendMessage();
});

// Enter key to send message
chatInput.addEventListener("keypress", async (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    await handleSendMessage();
  }
});

// ===============================================================================
// MESSAGE SENDING FUNCTIONS
// ===============================================================================
// Handle user message sending and AI response generation

// Send user message and trigger AI response
async function handleSendMessage() {
  if (!activeChat || !chatInput.value.trim()) return;

  const messageContent = chatInput.value.trim();
  chatInput.value = "";
  chatInput.disabled = true;
  sendButton.disabled = true;
  
  try {
    // Send message to backend
    const newMessage = await sendMessage(activeChat.id, messageContent, true);
    
    if (newMessage) {
      // Display message in UI
      displayMessage(newMessage);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      
      // Generate AI response automatically
      await generateAndDisplayAIResponse(activeChat.id);
    } else {
      alert('Fehler beim Senden der Nachricht');
    }
  } catch (error) {
    console.error('Fehler beim Senden:', error);
    alert('Fehler beim Senden der Nachricht');
  } finally {
    // Re-enable input elements
    chatInput.disabled = false;
    sendButton.disabled = false;
    chatInput.focus();
  }
}

// ===============================================================================
// AI RESPONSE FUNCTIONS
// ===============================================================================
// Generate and display AI responses with visual feedback

// Generate AI response and show typing indicator
async function generateAndDisplayAIResponse(chatId: number) {
  // Show typing indicator while AI is thinking
  const typingDiv = document.createElement("div");
  typingDiv.className = "message message-incoming typing-indicator";
  typingDiv.innerHTML = `
    <div class="message-content">
      <div class="typing-dots">
        <span></span><span></span><span></span>
      </div>
    </div>
  `;
  messagesContainer.appendChild(typingDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  
  try {
    const aiResponse = await generateAIResponse(chatId);
    
    // Remove typing indicator
    messagesContainer.removeChild(typingDiv);
    
    if (aiResponse) {
      // Display AI response
      displayMessage(aiResponse);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    } else {
      // Show error message if AI is unavailable
      const errorDiv = document.createElement("div");
      errorDiv.className = "message message-incoming error";
      errorDiv.innerHTML = `
        <div class="message-content">
          Entschuldigung, ich kann gerade nicht antworten. Ist Ollama gestartet?
        </div>
      `;
      messagesContainer.appendChild(errorDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  } catch (error) {
    // Remove typing indicator if still present
    if (typingDiv.parentNode) {
      messagesContainer.removeChild(typingDiv);
    }
    console.error('Fehler bei AI-Antwort:', error);
  }
}