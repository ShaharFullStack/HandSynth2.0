/**
 * Login page component for HandSynth
 */

import { getAuthState } from '../auth/auth.js';

/**
 * Create and render the login page
 * @returns {HTMLElement} The login page container
 */
export function createLoginPage() {
  // Create login container
  const loginContainer = document.createElement('div');
  loginContainer.className = 'login-container';
  
  // Add logo/title
  const logo = document.createElement('div');
  logo.className = 'login-logo';
  logo.innerHTML = `
    <h1>HandSynth</h1>
    <p class="login-tagline">Make music with your hands</p>
  `;
  
  // Create login card
  const loginCard = document.createElement('div');
  loginCard.className = 'login-card';
  
  // Add welcome message
  const welcomeMsg = document.createElement('div');
  welcomeMsg.className = 'login-welcome';
  welcomeMsg.innerHTML = `
    <h2>Welcome</h2>
    <p>Sign in to continue to HandSynth</p>
  `;
  
  // Add sign-in button container
  const signInButtonContainer = document.createElement('div');
  signInButtonContainer.id = 'google-signin-button';
  signInButtonContainer.className = 'google-signin-button';
  
  // Add loading indicator
  const loadingIndicator = document.createElement('div');
  loadingIndicator.className = 'login-loading';
  loadingIndicator.innerHTML = `
    <div class="spinner"></div>
    <p>Connecting...</p>
  `;
  
  // Add feature highlights
  const featureHighlights = document.createElement('div');
  featureHighlights.className = 'login-features';
  featureHighlights.innerHTML = `
    <h3>Features</h3>
    <ul>
      <li>Play music with hand gestures</li>
      <li>Interactive visualizations</li>
      <li>Multiple musical scales</li>
      <li>Various instrument sounds</li>
    </ul>
  `;
  
  // Assemble login card
  loginCard.appendChild(welcomeMsg);
  loginCard.appendChild(signInButtonContainer);
  loginCard.appendChild(loadingIndicator);
  
  // Assemble container
  loginContainer.appendChild(logo);
  loginContainer.appendChild(loginCard);
  loginContainer.appendChild(featureHighlights);
  
  // Add credits/footer
  const footer = document.createElement('div');
  footer.className = 'login-footer';
  footer.innerHTML = `
    <p>© ${new Date().getFullYear()} HandSynth</p>
    <p><a href="#" id="privacy-link">Privacy Policy</a> | <a href="#" id="terms-link">Terms of Service</a></p>
  `;
  loginContainer.appendChild(footer);
  
  // Show/hide loading based on auth state
  const authState = getAuthState();
  loadingIndicator.style.display = authState.isLoading ? 'flex' : 'none';
  
  return loginContainer;
}

/**
 * Add login page styles to document
 */
export function addLoginStyles() {
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    .login-container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: var(--primary-dark);
      background-image: radial-gradient(circle at 50% 50%, var(--primary-light-blue) 0%, var(--primary-dark) 100%);
      padding: 20px;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 1000;
    }
    
    .login-logo {
      text-align: center;
      margin-bottom: 30px;
    }
    
    .login-logo h1 {
      font-family: 'Martian Mono', monospace;
      font-size: 48px;
      color: var(--text-light);
      text-shadow: 0 0 15px rgba(100, 160, 255, 0.5);
      letter-spacing: 2px;
      margin-bottom: 5px;
    }
    
    .login-tagline {
      font-size: 18px;
      color: var(--text-faded);
    }
    
    .login-card {
      background-color: var(--ui-background);
      padding: 30px;
      border-radius: var(--ui-radius);
      box-shadow: var(--ui-shadow),
                  0 0 20px rgba(90, 140, 255, 0.15);
      backdrop-filter: blur(8px);
      border: 1px solid var(--ui-border);
      width: 100%;
      max-width: 400px;
      margin-bottom: 30px;
      text-align: center;
    }
    
    .login-welcome {
      margin-bottom: 25px;
    }
    
    .login-welcome h2 {
      font-size: 24px;
      color: var(--text-light);
      margin-bottom: 8px;
    }
    
    .login-welcome p {
      color: var(--text-faded);
      font-size: 16px;
    }
    
    .google-signin-button {
      display: flex;
      justify-content: center;
      margin: 20px 0;
      min-height: 40px;
    }
    
    .login-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin: 20px 0;
      display: none;
    }
    
    .login-loading .spinner {
      width: 40px;
      height: 40px;
      margin-bottom: 10px;
    }
    
    .login-features {
      background-color: var(--ui-background);
      padding: 20px;
      border-radius: var(--ui-radius);
      box-shadow: var(--ui-shadow);
      backdrop-filter: blur(8px);
      border: 1px solid var(--ui-border);
      width: 100%;
      max-width: 400px;
    }
    
    .login-features h3 {
      color: var(--text-light);
      font-size: 18px;
      margin-bottom: 15px;
      text-align: center;
    }
    
    .login-features ul {
      color: var(--text-faded);
      list-style-type: none;
      padding: 0;
    }
    
    .login-features li {
      margin-bottom: 10px;
      padding-left: 20px;
      position: relative;
    }
    
    .login-features li:before {
      content: "•";
      color: rgba(100, 140, 255, 0.8);
      position: absolute;
      left: 0;
    }
    
    .login-footer {
      margin-top: 30px;
      color: var(--text-faded);
      font-size: 14px;
      text-align: center;
    }
    
    .login-footer a {
      color: var(--text-faded);
      text-decoration: none;
    }
    
    .login-footer a:hover {
      text-decoration: underline;
      color: var(--text-light);
    }
    
    @media (max-width: 480px) {
      .login-logo h1 {
        font-size: 36px;
      }
      
      .login-card, .login-features {
        padding: 20px;
      }
    }
  `;
  document.head.appendChild(styleElement);
}

export default {
  createLoginPage,
  addLoginStyles
};