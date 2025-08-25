// ===============================================================================
// CRUD AI CHAT APP - CHAT COMPONENT
// ===============================================================================
// Main chat interface with message sending, AI responses, and real-time UI
// Handles message display, user input, AI conversation management, and welcome screen

import './style.css';
import type { Chat, Message } from './api.ts';
import { loadMessages, sendMessage, generateAIResponse, createChat } from './api.ts';

// ===============================================================================
// STATE MANAGEMENT
// ===============================================================================
// Current active chat state
let activeChat: Chat | null = null;
let isWelcomeMode: boolean = true; // Track if we're showing welcome screen

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
chatTitle.className = "chat-title";
chatTitle.textContent = "Wie kann ich dir helfen?";
chatHeader.appendChild(chatTitle);

// Welcome subtitle
const welcomeSubtitle = document.createElement("p");
welcomeSubtitle.className = "welcome-subtitle";
welcomeSubtitle.textContent = "Stell mir eine Frage oder beginne ein Gespräch";
chatHeader.appendChild(welcomeSubtitle);

// Messages display container
const messagesContainer = document.createElement("div");
messagesContainer.className = "messages-container";
chatWindow.appendChild(messagesContainer);

// ===============================================================================
// WELCOME SCREEN CREATION
// ===============================================================================
// Create welcoming start screen with centered input

// Welcome container (shows when no chat is active)
const welcomeContainer = document.createElement("div");
welcomeContainer.className = "welcome-container";

const welcomeIcon = document.createElement("div");
welcomeIcon.className = "welcome-icon";
welcomeIcon.textContent = "💬";
welcomeContainer.appendChild(welcomeIcon);

const welcomeMessage = document.createElement("div");
welcomeMessage.className = "welcome-message";
welcomeMessage.innerHTML = `
  <h3>Willkommen bei deinem AI-Chat!</h3>
  <p>Ich bin dein persönlicher AI-Assistent. Stell mir Fragen, bitte um Hilfe oder führe einfach ein Gespräch mit mir.</p>
`;
welcomeContainer.appendChild(welcomeMessage);

messagesContainer.appendChild(welcomeContainer);

// ===============================================================================
// INPUT AREA CREATION
// ===============================================================================
// Message input and send button - now with welcome mode styling

const chatInputContainer = document.createElement("div");
chatInputContainer.className = "chat-input-container welcome-input";

const chatInput = document.createElement("input");
chatInput.type = "text";
chatInput.placeholder = "Schreibe deine erste Nachricht...";
chatInput.className = "chat-input welcome-input-field";

const sendButton = document.createElement("button");
sendButton.textContent = "➤";
sendButton.className = "send-button";

chatInputContainer.appendChild(chatInput);
chatInputContainer.appendChild(sendButton);
chatWindow.appendChild(chatInputContainer);

// ===============================================================================
// WELCOME MODE FUNCTIONS
// ===============================================================================
// Handle the transition from welcome screen to active chat

function showWelcomeMode() {
  isWelcomeMode = true;
  chatTitle.textContent = "Wie kann ich dir helfen?";
  welcomeSubtitle.style.display = "block";
  messagesContainer.innerHTML = "";
  messagesContainer.appendChild(welcomeContainer);
  chatInputContainer.className = "chat-input-container welcome-input";
  chatInput.className = "chat-input welcome-input-field";
  chatInput.placeholder = "Schreibe deine erste Nachricht...";
}

function hideWelcomeMode() {
  isWelcomeMode = false;
  welcomeSubtitle.style.display = "none";
  chatInputContainer.className = "chat-input-container";
  chatInput.className = "chat-input";
  chatInput.placeholder = "Nachricht eingeben...";
}

// ===============================================================================
// CORE CHAT FUNCTIONS
// ===============================================================================
// Chat switching and message loading

// Export functions
export async function setActiveChat(chat: Chat) {
  activeChat = chat;
  hideWelcomeMode();
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

// Send user message and trigger AI response (with auto-chat creation)
async function handleSendMessage() {
  if (!chatInput.value.trim()) return;

  const messageContent = chatInput.value.trim();
  chatInput.value = "";
  chatInput.disabled = true;
  sendButton.disabled = true;
  
  try {
    // If in welcome mode, create new chat first
    if (isWelcomeMode && !activeChat) {
      const chatTitle = messageContent.length > 50 ? 
        messageContent.substring(0, 50) + "..." : 
        messageContent;
      
      const newChat = await createChat(chatTitle);
      if (!newChat) {
        alert('Fehler beim Erstellen des Chats');
        return;
      }
      
      activeChat = newChat;
      hideWelcomeMode();
      
      // Update sidebar by triggering a re-render
      window.dispatchEvent(new CustomEvent('chatCreated', { detail: newChat }));
    }
    
    if (!activeChat) {
      alert('Kein aktiver Chat verfügbar');
      return;
    }

    // Send message to backend
    const newMessage = await sendMessage(activeChat.id, messageContent, true);
    
    if (newMessage) {
      // Clear welcome screen and show messages
      if (messagesContainer.contains(welcomeContainer)) {
        messagesContainer.removeChild(welcomeContainer);
      }
      
      // Display message in UI
      displayMessage(newMessage);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      
      // Update chat title in header
      chatTitle.textContent = activeChat.title || `Chat ${activeChat.id}`;
      
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

// ===============================================================================
// EXPORTS AND INITIALIZATION
// ===============================================================================
// Export functions and initialize welcome screen

// Listen for welcome screen requests
window.addEventListener('showWelcome', () => {
  activeChat = null;
  showWelcomeMode();
});

// Initialize with welcome screen on load
showWelcomeMode();