import './style.css';

interface Chat {
  id: number;
  title: string;
}

const chats: Chat[] = [
  { id: 1, title: "Chat mit Timo" },
  { id: 2, title: "Projektbesprechung" },
];

// Sidebar erstellen
const sidebar = document.createElement("div");
sidebar.className = "sidebar";
document.body.appendChild(sidebar);

// Toggle Button
const toggleButton = document.createElement("button");
toggleButton.className = "toggle-button";
toggleButton.textContent = "☰";
document.body.appendChild(toggleButton);

// Button für neuen Chat
const newChatButton = document.createElement("button");
newChatButton.className = "new-chat-button";
newChatButton.textContent = "+ Neuer Chat";
sidebar.appendChild(newChatButton);

// Liste
const ul = document.createElement("ul");
ul.className = "chat-list";
sidebar.appendChild(ul);

// Render-Funktion
function renderChats() {
  ul.innerHTML = "";
  chats.forEach(chat => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = "#";
    a.textContent = chat.title;
    a.className = "chat-item";
    li.appendChild(a);
    ul.appendChild(li);
  });
}

// Button Events
newChatButton.addEventListener("click", () => {
  const newChat: Chat = {
    id: chats.length + 1,
    title: `Neuer Chat ${chats.length + 1}`
  };
  chats.unshift(newChat);
  renderChats();
});

// Sidebar Toggle
toggleButton.addEventListener("click", () => {
  sidebar.classList.toggle("collapsed");
});

renderChats();

const app = document.querySelector('#app');
if (app) app.appendChild(sidebar);
