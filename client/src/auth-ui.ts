/**
 * Auth0 Authentication UI Component
 * Handles login/logout buttons and user profile display
 */

import { authService } from './auth.js';
import { getCurrentUser } from './api.js';
import type { User } from './api.js';

class AuthUI {
  private authContainer: HTMLElement | null = null;
  private user: User | null = null;

  /**
   * Initialize the authentication UI
   */
  async initialize(): Promise<void> {
    this.createAuthContainer();
    await this.updateAuthState();
    
    // Listen for auth state changes
    authService.onAuthStateChanged(async () => {
      await this.updateAuthState();
    });

    console.log('🔐 Auth UI initialized');
  }

  /**
   * Create the authentication container in the DOM
   */
  private createAuthContainer(): void {
    const app = document.getElementById('app');
    if (!app) return;

    // Create auth header container
    const authHeader = document.createElement('div');
    authHeader.className = 'auth-header';
    authHeader.innerHTML = `
      <div class="auth-container">
        <div class="auth-loading">
          <div class="loading-spinner"></div>
          <span>Auth0 wird geladen...</span>
        </div>
      </div>
    `;

    // Insert at the top of the app
    app.insertBefore(authHeader, app.firstChild);
    this.authContainer = authHeader.querySelector('.auth-container');
  }

  /**
   * Update the authentication state and UI
   */
  private async updateAuthState(): Promise<void> {
    if (!this.authContainer) return;

    const isLoading = authService.getIsLoading();
    const isAuthenticated = authService.getIsAuthenticated();

    if (isLoading) {
      this.showLoadingState();
      return;
    }

    if (isAuthenticated) {
      // Get user profile from API
      this.user = await getCurrentUser();
      this.showAuthenticatedState();
    } else {
      this.showUnauthenticatedState();
    }
  }

  /**
   * Show loading state
   */
  private showLoadingState(): void {
    if (!this.authContainer) return;

    this.authContainer.innerHTML = `
      <div class="auth-loading">
        <div class="loading-spinner"></div>
        <span>Auth0 wird geladen...</span>
      </div>
    `;
  }

  /**
   * Show authenticated user state
   */
  private showAuthenticatedState(): void {
    if (!this.authContainer || !this.user) return;

    const auth0User = authService.getUser();
    
    this.authContainer.innerHTML = `
      <div class="auth-user">
        <div class="user-profile">
          <img src="${this.user.picture || auth0User?.picture || '/default-avatar.png'}" 
               alt="Profile" class="user-avatar" onerror="this.style.display='none'">
          <div class="user-info">
            <div class="user-name">${this.user.name || this.user.username}</div>
            <div class="user-email">${this.user.email}</div>
          </div>
        </div>
        <button class="auth-button logout-button" id="logout-btn">
          Abmelden
        </button>
      </div>
    `;

    // Add logout event listener
    const logoutBtn = this.authContainer.querySelector('#logout-btn');
    logoutBtn?.addEventListener('click', () => this.handleLogout());
  }

  /**
   * Show unauthenticated state
   */
  private showUnauthenticatedState(): void {
    if (!this.authContainer) return;

    this.authContainer.innerHTML = `
      <div class="auth-guest">
        <div class="auth-message">
          <h3>🔐 Anmeldung erforderlich</h3>
          <p>Melde dich an, um deine Chats zu verwalten und KI-Features zu nutzen.</p>
        </div>
        <button class="auth-button login-button" id="login-btn">
          Mit Auth0 anmelden
        </button>
      </div>
    `;

    // Add login event listener
    const loginBtn = this.authContainer.querySelector('#login-btn');
    loginBtn?.addEventListener('click', () => this.handleLogin());
  }

  /**
   * Handle login button click
   */
  private async handleLogin(): Promise<void> {
    try {
      console.log('🔐 Starting login process...');
      await authService.login();
    } catch (error) {
      console.error('❌ Login failed:', error);
      alert('Anmeldung fehlgeschlagen. Bitte versuche es erneut.');
    }
  }

  /**
   * Handle logout button click
   */
  private async handleLogout(): Promise<void> {
    try {
      console.log('🔐 Starting logout process...');
      await authService.logout();
    } catch (error) {
      console.error('❌ Logout failed:', error);
      alert('Abmeldung fehlgeschlagen. Bitte versuche es erneut.');
    }
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    return authService.getIsAuthenticated();
  }

  /**
   * Get current user
   */
  public getCurrentUser(): User | null {
    return this.user;
  }
}

// Create and export singleton instance
export const authUI = new AuthUI();
