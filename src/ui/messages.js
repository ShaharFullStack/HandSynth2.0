/**
 * Message display utilities for HandSynth
 */

/**
 * Show a temporary message overlay
 * @param {string} message - Message text to display
 * @param {number} duration - Duration in milliseconds (default: 2000ms)
 */
export function showMessage(message, duration = 2000) {
    // If a message with the same content is already showing, don't create a duplicate
    const existingMessages = document.querySelectorAll('.message-overlay');
    for (const existing of existingMessages) {
      if (existing.textContent === message) {
        return;
      }
    }
    
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = 'message-overlay fadeIn';
    messageEl.style.position = 'fixed';
    messageEl.style.top = '50%';
    messageEl.style.left = '50%';
    messageEl.style.transform = 'translate(-50%, -50%)';
    messageEl.style.backgroundColor = 'rgba(0,0,0,0.8)';
    messageEl.style.color = 'white';
    messageEl.style.padding = '20px';
    messageEl.style.borderRadius = '10px';
    messageEl.style.zIndex = '1000';
    messageEl.style.fontSize = '24px';
    messageEl.style.fontFamily = 'Arial, sans-serif';
    messageEl.style.textAlign = 'center';
    messageEl.style.direction = 'ltr'; // Left-to-right text direction
    messageEl.textContent = message;
    
    // Add animation
    messageEl.style.animation = 'fadeIn 0.3s ease-in-out';
    document.body.appendChild(messageEl);
    
    // Remove message after specified duration
    setTimeout(() => {
      // Add fadeout animation
      messageEl.style.animation = 'fadeOut 0.5s ease-in-out';
      messageEl.style.opacity = '0';
      
      // Remove from DOM after animation completes
      setTimeout(() => {
        if (messageEl.parentNode) {
          document.body.removeChild(messageEl);
        }
      }, 500);
    }, duration);
  }
  
  /**
   * Show a loading message with spinner
   * @param {string} message - Loading message to display
   * @returns {Object} The loading message element (for reference to remove it)
   */
  export function showLoading(message = 'Loading...') {
    // Create loading element
    const loadingEl = document.createElement('div');
    loadingEl.className = 'loading-overlay';
    loadingEl.style.position = 'fixed';
    loadingEl.style.top = '0';
    loadingEl.style.left = '0';
    loadingEl.style.width = '100%';
    loadingEl.style.height = '100%';
    loadingEl.style.backgroundColor = 'rgba(0,0,0,0.8)';
    loadingEl.style.color = 'white';
    loadingEl.style.display = 'flex';
    loadingEl.style.flexDirection = 'column';
    loadingEl.style.justifyContent = 'center';
    loadingEl.style.alignItems = 'center';
    loadingEl.style.zIndex = '2000';
    
    // Create spinner
    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    spinner.style.width = '50px';
    spinner.style.height = '50px';
    spinner.style.border = '5px solid rgba(255,255,255,0.3)';
    spinner.style.borderRadius = '50%';
    spinner.style.borderTop = '5px solid white';
    spinner.style.animation = 'spin 1s linear infinite';
    
    // Create spinner animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
    `;
    document.head.appendChild(style);
    
    // Create message text
    const textEl = document.createElement('div');
    textEl.textContent = message;
    textEl.style.marginTop = '20px';
    textEl.style.fontSize = '24px';
    
    // Assemble and show
    loadingEl.appendChild(spinner);
    loadingEl.appendChild(textEl);
    document.body.appendChild(loadingEl);
    
    // Return element reference for later removal
    return loadingEl;
  }
  
  /**
   * Hide a loading message
   * @param {Object} loadingEl - The loading element to remove
   */
  export function hideLoading(loadingEl) {
    if (loadingEl && loadingEl.parentNode) {
      // Animate out
      loadingEl.style.animation = 'fadeOut 0.5s ease-in-out';
      loadingEl.style.opacity = '0';
      
      // Remove after animation
      setTimeout(() => {
        if (loadingEl.parentNode) {
          document.body.removeChild(loadingEl);
        }
      }, 500);
    }
  }
  
  export default {
    showMessage,
    showLoading,
    hideLoading
  };