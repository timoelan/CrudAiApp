import { loadChats, createChat, deleteChat, updateChat } from './api.ts';
import { setActiveChat } from './chat.ts';

export interface Chat {
  id: number;
  title: string;
}

let chats: Chat[] = [];

// Sidebar erstellen
const sidebar = document.createElement("div");
sidebar.className = "sidebar";
const appContainer = document.getElementById('app')!;
appContainer.appendChild(sidebar);

// Toggle Button
const toggleButton = document.createElement("button");
toggleButton.className = "toggle-button";
toggleButton.textContent = "☰";
document.body.appendChild(toggleButton);

// Neuer Chat Button
const newChatButton = document.createElement("button");
newChatButton.className = "new-chat-button";
newChatButton.textContent = "+ Neuer Chat";
sidebar.appendChild(newChatButton);

// Chatliste
const ul = document.createElement("ul");
ul.className = "chat-list";
sidebar.appendChild(ul);

// Event Listeners
toggleButton.addEventListener("click", () => {
  sidebar.classList.toggle("collapsed");
});

newChatButton.addEventListener("click", async () => {
  const title = `Neuer Chat ${chats.length + 1}`;
  const newChat = await createChat(title);
  if (newChat) {
    chats.unshift(newChat);
    renderChats();
  }
});

// Functions
async function loadAndRenderChats() {
  chats = await loadChats();
  renderChats();
}

function renderChats() {
  ul.innerHTML = "";
  chats.forEach(chat => {
    const li = document.createElement("li");
    li.className = "chat-entry";

    // Chat Link
    const a = document.createElement("a");
    a.href = "#";
    a.textContent = chat.title;
    a.className = "chat-item";
    a.addEventListener("click", () => {
      setActiveChat(chat);
    });
    li.appendChild(a);

    // Drei-Punkte Menü
    const menuButton = document.createElement("button");
    menuButton.textContent = "⋮";
    menuButton.className = "menu-button";
    li.appendChild(menuButton);

    const menu = document.createElement("div");
    menu.className = "menu hidden";

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

    // Menü toggle
    menuButton.addEventListener("click", (e) => {
      e.stopPropagation();
      menu.classList.toggle("hidden");
    });

    document.addEventListener("click", () => {
      menu.classList.add("hidden");
    });

    ul.appendChild(li);
  });
}

export { setActiveChat };

// Initialize
loadAndRenderChats();
