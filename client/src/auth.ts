/**
 * Auth0 Authentication Service
 * Handles user login, logout, token management, and authentication state
 */

import { createAuth0Client, Auth0Client, User } from '@auth0/auth0-spa-js';

interface Auth0Config {
  domain: string;
  clientId: string;
  audience: string;
  redirectUri: string;
}

class AuthService {
  private auth0Client: Auth0Client | null = null;
  private user: User | null = null;
  private isAuthenticated: boolean = false;
  private isLoading: boolean = true;

  /**
   * Initialize Auth0 client with configuration
   */
  async initialize(): Promise<void> {
    try {
      // Get Auth0 configuration from environment variables
      const config: Auth0Config = {
        domain: import.meta.env.VITE_AUTH0_DOMAIN,
        clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
        audience: import.meta.env.VITE_AUTH0_AUDIENCE, // Re-enable API audience
        redirectUri: import.meta.env.VITE_AUTH0_REDIRECT_URI || window.location.origin
      };

      // Validate configuration
      if (!config.domain || !config.clientId) {
        throw new Error('Auth0 configuration missing. Please check your environment variables.');
      }

      // Create Auth0 client
      this.auth0Client = await createAuth0Client({
        domain: config.domain,
        clientId: config.clientId,
        authorizationParams: {
          audience: config.audience, // Re-enable API audience
          redirect_uri: config.redirectUri,
          scope: 'openid profile email read:profile write:profile read:chats write:chats delete:chats read:messages write:messages read:ai'
        },
        cacheLocation: 'localstorage',
        useRefreshTokens: true
      });

      // Handle redirect callback
      if (window.location.search.includes('code=') && window.location.search.includes('state=')) {
        await this.auth0Client.handleRedirectCallback();
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      // Check if user is authenticated
      this.isAuthenticated = await this.auth0Client.isAuthenticated();

      if (this.isAuthenticated) {
        const userData = await this.auth0Client.getUser();
        this.user = userData || null;
      }

      this.isLoading = false;

      console.log('✅ Auth0 initialized successfully');
      console.log('Authenticated:', this.isAuthenticated);
      if (this.user) {
        console.log('User:', this.user.email);
      }

    } catch (error) {
      console.error('❌ Auth0 initialization failed:', error);
      this.isLoading = false;
      throw error;
    }
  }

  /**
   * Login with redirect to Auth0
   */
  async login(): Promise<void> {
    if (!this.auth0Client) {
      throw new Error('Auth0 client not initialized');
    }

    try {
      await this.auth0Client.loginWithRedirect({
        authorizationParams: {
          redirect_uri: window.location.origin,
          scope: 'openid profile email read:profile write:profile read:chats write:chats delete:chats read:messages write:messages read:ai'
        },
        appState: { returnTo: window.location.pathname }
      });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  /**
   * Logout and clear session
   */
  async logout(): Promise<void> {
    if (!this.auth0Client) {
      throw new Error('Auth0 client not initialized');
    }

    try {
      await this.auth0Client.logout({
        logoutParams: {
          returnTo: window.location.origin
        }
      });
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }

  /**
   * Get access token for API calls
   */
  async getAccessToken(): Promise<string | null> {
    if (!this.auth0Client || !this.isAuthenticated) {
      return null;
    }

    try {
      const token = await this.auth0Client.getTokenSilently();
      return token;
    } catch (error) {
      console.error('Failed to get access token:', error);
      // If token refresh fails, user needs to login again
      this.isAuthenticated = false;
      this.user = null;
      return null;
    }
  }

  /**
   * Get current user information
   */
  getUser(): User | null {
    return this.user;
  }

  /**
   * Check if user is authenticated
   */
  getIsAuthenticated(): boolean {
    return this.isAuthenticated;
  }

  /**
   * Check if Auth0 is still loading
   */
  getIsLoading(): boolean {
    return this.isLoading;
  }

  /**
   * Subscribe to authentication state changes
   */
  onAuthStateChanged(callback: (isAuthenticated: boolean, user: User | null) => void): void {
    // Simple implementation - in a real app you might want to use events
    const checkState = () => {
      callback(this.isAuthenticated, this.user);
    };

    // Call immediately
    checkState();

    // Set up periodic check (you might want to use events instead)
    setInterval(checkState, 1000);
  }
}

// Create singleton instance
export const authService = new AuthService();

// Initialize Auth0 on module load
authService.initialize().catch(console.error);
