import './style.css'

console.log("Main.ts wird geladen!");

interface Chat {
  id: number;
  title: string;
}

const chats: Chat[] = [
  { id: 1, title: "Chat mit Timo" },
  { id: 2, title: "Projektbesprechung" },
];

 const container = document.createElement("div");
container.className = "max-w-md mx-auto mt-10 p-4 bg-white shadow rounded-lg";

 const title = document.createElement("h1");
title.className = "text-2xl font-bold mb-4";
title.textContent = "Chats";
container.appendChild(title);

 const button = document.createElement("button");
button.className = "w-full mb-4 py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition";
button.textContent = "+ Neuer Chat";
container.appendChild(button);

 const ul = document.createElement("ul");
ul.className = "space-y-2";
container.appendChild(ul);

 function renderChats() {
  ul.innerHTML = "";
  chats.forEach(chat => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = "#";
    a.textContent = chat.title;
    a.className = "block p-3 bg-gray-100 rounded hover:bg-gray-200 transition";
    li.appendChild(a);
    ul.appendChild(li);
  });
}

 button.addEventListener("click", () => {
  const newChat: Chat = {
    id: chats.length + 1,
    title: `Neuer Chat ${chats.length + 1}`
  };
  chats.unshift(newChat);
  renderChats();
});

 renderChats();
const app = document.querySelector('#app');
if (app) {
    app.appendChild(container);
}

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>Test</h1>
    <button id="test-btn">Click me</button>
  </div>
`

document.getElementById('test-btn')?.addEventListener('click', () => {
  console.log("Button clicked!");
  alert("Es funktioniert!");
});

console.log("Chat geladen!");
