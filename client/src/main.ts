// ===============================================================================
// CRUD AI CHAT APP - MAIN APPLICATION ENTRY POINT WITH AUTH0
// ===============================================================================
// Initializes the application with Auth0 authentication
// Sets up the main app container and imports all modules

import './style.css';

// ===============================================================================
// APP CONTAINER SETUP
// ===============================================================================
// Create and configure the main application container
const appElement = document.getElementById('app')!;
appElement.className = 'app-container';

// Add main content wrapper for sidebar and chat
const mainContent = document.createElement('div');
mainContent.className = 'main-content';
appElement.appendChild(mainContent);

// ===============================================================================
// MODULE IMPORTS
// ===============================================================================
// Import and initialize all application modules
import { authUI } from './auth-ui.js';
import './sidebar.ts';  // Chat list and management  
import './chat.ts';     // Chat window and messaging

// ===============================================================================
// APPLICATION INITIALIZATION
// ===============================================================================
// Initialize Auth0 and start the application

async function initializeApp(): Promise<void> {
  try {
    console.log('🚀 Starting CRUD AI Chat App with Auth0...');
    
    // Initialize Auth0 UI
    await authUI.initialize();
    
    console.log('✅ App initialized successfully');
  } catch (error) {
    console.error('❌ App initialization failed:', error);
    
    // Show error message to user
    const errorDiv = document.createElement('div');
    errorDiv.className = 'app-error';
    errorDiv.innerHTML = `
      <div class="error-content">
        <h2>⚠️ Fehler beim Laden</h2>
        <p>Die Anwendung konnte nicht geladen werden:</p>
        <pre>${error}</pre>
        <button onclick="window.location.reload()">Seite neu laden</button>
      </div>
    `;
    appElement.appendChild(errorDiv);
  }
}

// Start the application
initializeApp();
