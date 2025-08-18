import './style.css'

console.log("Main.ts wird geladen!");

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="container">
    <h1 class="title">Test</h1>
    <button id="test-btn" class="new-chat-button">Click me</button>
  </div>
`

document.getElementById('test-btn')?.addEventListener('click', () => {
  console.log("Button clicked!");
  alert("Es funktioniert!");
});