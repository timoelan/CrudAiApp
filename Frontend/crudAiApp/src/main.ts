import './style.css'

console.log("Main.ts wird geladen!");

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