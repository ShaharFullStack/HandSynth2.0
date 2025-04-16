/**
 * HandSynth - Gesture-Based Musical Instrument
 * Main entry point
 */

import { initBlackHole } from './visual/blackhole.js';
import { setupHandTracking } from './tracking/hand-detector.js';
import { createUI } from './ui/controls.js';
import { createNoteMarkers, createVisualKeyboard } from './visual/keyboard.js';
import { addStartAudioButton } from './ui/controls.js';
import { showMessage } from './ui/messages.js';
import { updateInstructions } from './ui/controls.js';
import { initAuth, getAuthState } from './auth/auth.js';
import { createLoginPage, addLoginStyles } from './pages/login.js';

// Authentication state
let authState = { isAuthenticated: false, user: null, isLoading: true };

// Initialize the application when window loads
window.addEventListener('load', init);

function init() {
  try {
    // Add login page styles
    addLoginStyles();
    
    // Create app container
    const appContainer = document.createElement('div');
    appContainer.id = 'app-container';
    document.body.appendChild(appContainer);
    
    // Initialize authentication
    initAuth(handleAuthChange);
    
    // Check initial auth state
    checkAuthAndRender();
    
  } catch (error) {
    console.error("Error initializing application:", error);
    showMessage("Error initializing application: " + error.message, 5000);
  }
}

/**
 * Handle authentication state changes
 */
function handleAuthChange(newAuthState) {
  console.log("Auth state changed:", newAuthState);
  authState = newAuthState;
  checkAuthAndRender();
}

/**
 * Check authentication state and render appropriate view
 */
function checkAuthAndRender() {
  const appContainer = document.getElementById('app-container');
  
  // Clear app container
  appContainer.innerHTML = '';
  
  if (authState.isAuthenticated) {
    // User is authenticated, render the app
    renderApp();
  } else {
    // User is not authenticated, render login page
    const loginPage = createLoginPage();
    appContainer.appendChild(loginPage);
  }
}

/**
 * Render the main application
 */
function renderApp() {
  // Create app elements first
  createAppElements();
  
  // Then initialize components that depend on those elements
  initBlackHole();
  // Hide the login container if it exists
  const loginContainer = document.querySelector('.login-container');
  if (loginContainer) {
    loginContainer.style.display = 'none';
  }
  
  // Create UI elements
  createUI();
  
  // Create note position markers and visual keyboard
  createNoteMarkers();
  createVisualKeyboard();
  
  // Setup hand tracking
  setupHandTracking();
  
  // Display initial instructions
  updateInstructions();
  
  // Add audio start button
  addStartAudioButton();
  
  // Hide loading screen
  setTimeout(() => hideLoadingScreen(), 2000);
}

/**
 * Create necessary app elements
 */
function createAppElements() {
  // Create container
  let container = document.getElementById('container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'container';
    document.body.appendChild(container);
  }
  
  // Create video and canvas elements for hand tracking
  let videoElement = document.querySelector('.input_video');
  if (!videoElement) {
    videoElement = document.createElement('video');
    videoElement.className = 'input_video';
    videoElement.width = 1280;
    videoElement.height = 720;
    document.body.appendChild(videoElement);
  }
  
  let canvasElement = document.querySelector('.output_canvas');
  if (!canvasElement) {
    canvasElement = document.createElement('canvas');
    canvasElement.className = 'output_canvas';
    canvasElement.width = 1280;
    canvasElement.height = 720;
    document.body.appendChild(canvasElement);
  }
  
  // Add user info/logout button if authenticated
  if (authState.isAuthenticated && authState.user) {
    const userInfo = document.createElement('div');
    userInfo.className = 'user-info';
    userInfo.innerHTML = `
      <div class="user-profile">
        ${authState.user.picture ? `<img src="${authState.user.picture}" alt="Profile" class="user-avatar">` : ''}
        <span class="user-name">${authState.user.name}</span>
      </div>
      <button id="logout-button">Logout</button>
    `;
    document.body.appendChild(userInfo);
    
    // Add logout handler
    document.getElementById('logout-button').addEventListener('click', () => {
      import('./auth/auth.js').then(module => {
        module.logout();
      });
    });
    
    // Add user info styles
    const style = document.createElement('style');
    style.textContent = `
      .user-info {
        position: fixed;
        top: 20px;
        right: 20px;
        display: flex;
        align-items: center;
        background-color: var(--ui-background);
        padding: 8px 15px;
        border-radius: var(--ui-radius);
        box-shadow: var(--ui-shadow);
        backdrop-filter: blur(8px);
        border: 1px solid var(--ui-border);
        z-index: 1000;
      }
      
      .user-profile {
        display: flex;
        align-items: center;
        margin-right: 15px;
      }
      
      .user-avatar {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        margin-right: 10px;
      }
      
      .user-name {
        color: var(--text-light);
        font-size: 14px;
        max-width: 120px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      #logout-button {
        background-color: rgba(255, 255, 255, 0.1);
        color: var(--text-light);
        border: 1px solid var(--ui-border);
        border-radius: 4px;
        padding: 5px 10px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      
      #logout-button:hover {
        background-color: rgba(255, 255, 255, 0.2);
      }
      
      @media (max-width: 768px) {
        .user-info {
          top: 10px;
          right: 10px;
          padding: 5px 10px;
        }
        
        .user-avatar {
          width: 25px;
          height: 25px;
        }
        
        .user-name {
          font-size: 12px;
          max-width: 80px;
        }
        
        #logout-button {
          padding: 3px 8px;
          font-size: 11px;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

/**
 * Hide the loading screen
 */
function hideLoadingScreen() {
  const loadingScreen = document.getElementById('loading');
  if (loadingScreen) {
    loadingScreen.style.transition = 'opacity 0.8s ease-out';
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
      loadingScreen.style.display = 'none';
      console.log('Loading screen hidden');
    }, 800);
  }
}

export default { init };