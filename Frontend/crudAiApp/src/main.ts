import './style.css'


fetch('http://localhost:8000')
.then(response => response.json())
.then(data => {
  document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    <div>
      <h1>${data.message}</h1>
    </div>
  `
})
