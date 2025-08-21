// ===============================================================================
// CRUD AI CHAT APP - MAIN APPLICATION ENTRY POINT
// ===============================================================================
// Initializes the application and loads all modules
// Sets up the main app container and imports sidebar and chat components

import './style.css';

// ===============================================================================
// APP CONTAINER SETUP
// ===============================================================================
// Create and configure the main application container
const appElement = document.getElementById('app')!;
appElement.className = 'app-container';

// ===============================================================================
// MODULE IMPORTS
// ===============================================================================
// Import and initialize all application modules
import './sidebar.ts';  // Chat list and management
import './chat.ts';     // Chat window and messaging
