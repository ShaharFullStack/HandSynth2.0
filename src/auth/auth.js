/**
 * Authentication module for HandSynth
 * Handles Google Sign-In integration
 */

// Auth state and configuration
const authState = {
    isAuthenticated: false,
    user: null,
    isLoading: true
  };
  
  // Google client ID - Replace with your actual client ID
  const CLIENT_ID = '583943130175-mk2hsss4k9rsfgunh4qdakfjsp7k2ono.apps.googleusercontent.com';
  
  /**
   * Initialize authentication system
   * @param {Function} onAuthChange - Callback when auth state changes
   */
  export function initAuth(onAuthChange) {
    // Create script tag for Google API
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => configureGoogleAuth(onAuthChange);
    document.head.appendChild(script);
    
    // Check for existing session
    const storedUser = localStorage.getItem('handsynth_user');
    if (storedUser) {
      try {
        authState.user = JSON.parse(storedUser);
        authState.isAuthenticated = true;
        if (onAuthChange) onAuthChange(authState);
      } catch (e) {
        console.error('Failed to parse stored user data', e);
        localStorage.removeItem('handsynth_user');
      }
    }
    
    authState.isLoading = false;
  }
  
  /**
   * Configure Google authentication
   */
  function configureGoogleAuth(onAuthChange) {
    window.onGoogleLibraryLoad = () => {
      // Initialize Google Sign-In
      google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true
      });
      
      // Display the Google Sign-In button
      google.accounts.id.renderButton(
        document.getElementById('google-signin-button'), 
        { 
          theme: 'filled_blue', 
          size: 'large',
          type: 'standard',
          shape: 'rectangular',
          text: 'continue_with',
          logo_alignment: 'left'
        }
      );
      
      // Also display One Tap UI
      google.accounts.id.prompt();
    };
    
    /**
     * Handle the credential response from Google
     */
    function handleCredentialResponse(response) {
      // Decode the credential response
      if (response.credential) {
        // Parse JWT to get user info
        const payload = parseJwt(response.credential);
        
        // Set auth state
        authState.isAuthenticated = true;
        authState.user = {
          id: payload.sub,
          name: payload.name,
          email: payload.email,
          picture: payload.picture,
          locale: payload.locale,
          token: response.credential
        };
        
        // Store in local storage for persistence
        localStorage.setItem('handsynth_user', JSON.stringify(authState.user));
        
        // Notify about auth change
        if (onAuthChange) onAuthChange(authState);
      }
    }
  }
  
  /**
   * Log the user out
   */
  export function logout() {
    // Clear auth state
    authState.isAuthenticated = false;
    authState.user = null;
    
    // Clear local storage
    localStorage.removeItem('handsynth_user');
    
    // Reload page to reinitialize auth
    window.location.reload();
  }
  
  /**
   * Get current authentication state
   */
  export function getAuthState() {
    return { ...authState };
  }
  
  /**
   * Parse JWT token
   * @param {string} token - JWT token
   * @returns {Object} Decoded payload
   */
  function parseJwt(token) {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  }
  
  export default {
    initAuth,
    logout,
    getAuthState
  };