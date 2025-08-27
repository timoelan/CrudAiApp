// ===============================================================================
// CRUD AI CHAT APP - SIDEBAR COMPONENT WITH AUTH0
// ===============================================================================
// Chat list management with CRUD operations and authentication
// Handles chat creation, deletion, renaming, and selection

import { loadChats, createChat, deleteChat, updateChat } from './api.js';
import type { Chat } from './api.js';
import { setActiveChat } from './chat.js';

// ===============================================================================
// STATE MANAGEMENT
// ===============================================================================
// Local state for chat list
let chats: Chat[] = [];

// ===============================================================================
// DOM ELEMENTS CREATION
// ===============================================================================
// Create sidebar container - FIRST in main-content (vor dem Chat Window)
const sidebar = document.createElement("div");
sidebar.className = "sidebar";

// Wait for main-content to be created then add sidebar FIRST
setTimeout(() => {
  const mainContent = document.querySelector('.main-content');
  if (mainContent) {
    // Sidebar soll als ERSTES Element in main-content eingefügt werden
    mainContent.insertBefore(sidebar, mainContent.firstChild);
  }
}, 0);

// Create toggle button for sidebar collapse
const toggleButton = document.createElement("button");
toggleButton.className = "toggle-button";
toggleButton.textContent = "☰";
document.body.appendChild(toggleButton);

// Create new chat button
const newChatButton = document.createElement("button");
newChatButton.className = "new-chat-button";
newChatButton.textContent = "+ Neuer Chat";
sidebar.appendChild(newChatButton);

// Create home/welcome button
const homeButton = document.createElement("button");
homeButton.className = "home-button";
homeButton.textContent = "🏠 Startseite";
sidebar.appendChild(homeButton);

// Create chat list container
const ul = document.createElement("ul");
ul.className = "chat-list";
sidebar.appendChild(ul);

// ===============================================================================
// EVENT LISTENERS
// ===============================================================================
// Sidebar toggle functionality
toggleButton.addEventListener("click", () => {
  sidebar.classList.toggle("collapsed");
});

// New chat creation
newChatButton.addEventListener("click", async () => {
  const title = `Neuer Chat ${chats.length + 1}`;
  const newChat = await createChat(title);
  if (newChat) {
    chats.unshift(newChat);
    renderChats();
  }
});

// Home button - return to welcome screen
homeButton.addEventListener("click", () => {
  // Trigger welcome screen
  window.dispatchEvent(new CustomEvent('showWelcome'));
});

// ===============================================================================
// CORE FUNCTIONS
// ===============================================================================
// Load chats from API and render them

async function loadAndRenderChats() {
  chats = await loadChats();
  renderChats();
}

// Render all chats in the sidebar with interactive elements
function renderChats() {
  ul.innerHTML = "";
  chats.forEach(chat => {
    // ===============================================================================
    // CHAT ENTRY CREATION
    // ===============================================================================
    // Create individual chat list item with menu
    const li = document.createElement("li");
    li.className = "chat-entry";

    // Chat clickable link
    const a = document.createElement("a");
    a.href = "#";
    a.textContent = chat.title;
    a.className = "chat-item";
    a.addEventListener("click", () => {
      setActiveChat(chat);  // Switch to this chat
    });
    li.appendChild(a);

    // ===============================================================================
    // CHAT CONTEXT MENU
    // ===============================================================================
    // Three-dots menu for chat actions
    const menuButton = document.createElement("button");
    menuButton.textContent = "⋮";
    menuButton.className = "menu-button";
    li.appendChild(menuButton);

    const menu = document.createElement("div");
    menu.className = "menu hidden";

    // Menu action buttons
    const rename = document.createElement("button");
    rename.textContent = "✏️ Umbenennen";
    rename.addEventListener("click", async () => {
      const newName = prompt("Neuen Namen eingeben:", chat.title);
      if (newName) {
        const updatedChat = await updateChat(chat.id, newName);
        if (updatedChat) {
          chat.title = updatedChat.title;
          renderChats();
        }
      }
    });

    const del = document.createElement("button");
    del.textContent = "🗑️ Löschen";
    del.addEventListener("click", async () => {
      if (await deleteChat(chat.id)) {
        chats = chats.filter(c => c.id !== chat.id);
        renderChats();
      }
    });

    menu.appendChild(rename);
    menu.appendChild(del);
    li.appendChild(menu);

    // ===============================================================================
    // MENU EVENT HANDLING
    // ===============================================================================
    // Toggle menu visibility and handle clicks
    menuButton.addEventListener("click", (e) => {
      e.stopPropagation();
      menu.classList.toggle("hidden");
    });

    // Close menu when clicking outside
    document.addEventListener("click", () => {
      menu.classList.add("hidden");
    });

    ul.appendChild(li);
  });
}

// ===============================================================================
// EXPORTS AND INITIALIZATION
// ===============================================================================
// Export functions and types, then initialize the component

export { setActiveChat };
export type { Chat };

// Wait for Auth0 to be ready before loading chats
import { authService } from './auth.js';

// Track if we already loaded chats to prevent endless loop
let chatsLoaded = false;

// Initialize sidebar after auth is ready
authService.onAuthStateChanged(async (isAuthenticated) => {
  if (isAuthenticated && !chatsLoaded) {
    console.log('🔄 Auth state changed - loading chats (first time)');
    await loadAndRenderChats();
    chatsLoaded = true;
  } else if (!isAuthenticated) {
    // Clear chats when not authenticated and reset flag
    chats = [];
    renderChats();
    chatsLoaded = false;
  }
});

// ===============================================================================
// CUSTOM EVENT LISTENERS
// ===============================================================================
// Listen for chat creation events from the main chat window
window.addEventListener('chatCreated', (event: Event) => {
  const customEvent = event as CustomEvent;
  const newChat = customEvent.detail;
  chats.unshift(newChat);  // Add to beginning of list
  renderChats();
  
  // Auto-select the new chat
  setActiveChat(newChat);
});
