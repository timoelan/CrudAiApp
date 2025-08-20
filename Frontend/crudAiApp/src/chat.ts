import './style.css';
import type { Chat } from './sidebar.ts';

let activeChat: Chat | null = null;

// Chat Window erstellen
const chatWindow = document.createElement("div");
chatWindow.className = "chat-window";
const appContainer = document.getElementById('app')!;
appContainer.appendChild(chatWindow);

// Header
const chatHeader = document.createElement("div");
chatHeader.className = "chat-header";
chatWindow.appendChild(chatHeader);

const chatTitle = document.createElement("h2");
chatTitle.textContent = "Wähle einen Chat";
chatHeader.appendChild(chatTitle);

// Nachrichten Container
const messagesContainer = document.createElement("div");
messagesContainer.className = "messages-container";
chatWindow.appendChild(messagesContainer);

// Input-Bereich
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

// Export functions
export function setActiveChat(chat: Chat) {
  activeChat = chat;
  chatTitle.textContent = chat.title;
  messagesContainer.innerHTML = ""; // später: Nachrichten laden
}

// Send message event
sendButton.addEventListener("click", () => {
  if (!activeChat || !chatInput.value.trim()) return;

  const msg = document.createElement("div");
  msg.className = "message message-outgoing";
  msg.textContent = chatInput.value;
  messagesContainer.appendChild(msg);

  chatInput.value = "";
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
});