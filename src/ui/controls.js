/**
 * UI Controls for HandSynth
 * Creates and manages UI elements
 */

import { state, notes, scales, soundPresets } from '../config.js';
import { setupAudio, updateSynths } from '../audio/synth.js';
import { showMessage } from './messages.js';
import { createNoteMarkers, updateNoteMarkers, createVisualKeyboard, updateVisualKeyboard } from '../visual/keyboard.js';

/**
 * Create UI elements for scale and sound selection
 */
export function createUI() {
  const uiContainer = document.createElement('div');
  uiContainer.className = 'ui-container';
  document.body.appendChild(uiContainer);
  
  // Root note selector
  const rootSelector = document.createElement('select');
  rootSelector.className = 'ui-select';
  rootSelector.id = 'root-select';
  
  notes.forEach(note => {
    const option = document.createElement('option');
    option.value = note;
    option.textContent = note;
    if (note === state.selectedRoot) option.selected = true;
    rootSelector.appendChild(option);
  });
  
  // Scale selector
  const scaleSelector = document.createElement('select');
  scaleSelector.className = 'ui-select';
  scaleSelector.id = 'scale-select';
  
  Object.keys(scales).forEach(scale => {
    const option = document.createElement('option');
    option.value = scale;
    option.textContent = scale.charAt(0).toUpperCase() + scale.slice(1);
    if (scale === state.selectedScale) option.selected = true;
    scaleSelector.appendChild(option);
  });
  
  // Sound selector
  const soundSelector = document.createElement('select');
  soundSelector.className = 'ui-select';
  soundSelector.id = 'sound-select';
  
  Object.keys(soundPresets).forEach(sound => {
    const option = document.createElement('option');
    option.value = sound;
    option.textContent = sound.charAt(0).toUpperCase() + sound.slice(1);
    if (sound === state.selectedSound) option.selected = true;
    soundSelector.appendChild(option);
  });
  
  // Octave selector
  const octaveSelector = document.createElement('select');
  octaveSelector.className = 'ui-select';
  octaveSelector.id = 'octave-select';
  
  for (let i = 2; i <= 6; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = `Octave ${i}`;
    if (i === state.octave) option.selected = true;
    octaveSelector.appendChild(option);
  }
  
  // Create labels and add everything to UI container
  const createLabeledControl = (label, element) => {
    const container = document.createElement('div');
    container.className = 'ui-control';
    
    const labelEl = document.createElement('label');
    labelEl.textContent = label;
    
    container.appendChild(labelEl);
    container.appendChild(element);
    return container;
  };
  
  uiContainer.appendChild(createLabeledControl('Root Note:', rootSelector));
  uiContainer.appendChild(createLabeledControl('Scale:', scaleSelector));
  uiContainer.appendChild(createLabeledControl('Octave:', octaveSelector));
  uiContainer.appendChild(createLabeledControl('Sound:', soundSelector));
  
  // Add title to the app
  const titleElement = document.createElement('div');
  titleElement.id = 'patternName';
  titleElement.textContent = 'HandSynth';
  document.body.appendChild(titleElement);
  
  // Add event listeners after creating the elements
  rootSelector.addEventListener('change', function() {
    state.selectedRoot = this.value;
    updateUI();
  });
  
  scaleSelector.addEventListener('change', function() {
    state.selectedScale = this.value;
    updateUI();
  });
  
  octaveSelector.addEventListener('change', function() {
    state.octave = parseInt(this.value);
    updateUI();
  });
  
  soundSelector.addEventListener('change', function() {
    state.selectedSound = this.value;
    updateSynths();
  });
  
  // Create note indicator
  const noteEl = document.createElement('div');
  noteEl.id = 'note-display';
  noteEl.className = 'note-indicator';
  document.body.appendChild(noteEl);
}

/**
 * Add prominent start audio button
 * @param {boolean} forceShow - Force showing the button even if it already exists
 */
export function addStartAudioButton(forceShow = false) {
  // Check if button already exists
  let startButton = document.querySelector('button');
  if (startButton && !forceShow) return;
  
  // Create the button
  startButton = document.createElement('button');
  startButton.textContent = 'Start Audio';
  startButton.style.position = 'fixed';
  startButton.style.top = '50%';
  startButton.style.left = '50%';
  startButton.style.transform = 'translate(-50%, -50%)';
  startButton.style.zIndex = '1000';
  startButton.style.padding = '20px';
  startButton.style.fontSize = '24px';
  startButton.style.backgroundColor = '#4CAF50';
  startButton.style.color = 'white';
  startButton.style.border = 'none';
  startButton.style.borderRadius = '10px';
  startButton.style.cursor = 'pointer';
  startButton.style.fontFamily = 'Arial, sans-serif';
  startButton.style.boxShadow = '0 5px 8px rgba(0, 0, 0, 0.6)';

  document.body.appendChild(startButton);

  startButton.addEventListener('click', function() {
    try {
      if (Tone.context.state !== 'running') {
        Tone.start().then(() => {
          state.audioStarted = true;
          document.body.removeChild(startButton);
          showMessage('Move your hands to play!');
          
          // Set up audio system
          setupAudio();
          
          // Hide instructions
          updateInstructions();
        }).catch(error => {
          console.error("Error starting audio:", error);
          showMessage("Error starting audio: " + error.message, 5000);
        });
      }
    } catch (error) {
      console.error("Error in start audio button:", error);
      showMessage("Error starting audio: " + error.message, 5000);
    }
  });
}

/**
 * Update UI elements when scale or root changes
 */
export function updateUI() {
  updateNoteDisplay();
  updateNoteMarkers();
  updateVisualKeyboard();
  createVisualKeyboard(); // Recreate the keyboard with new notes
  console.log("UI updated with scale:", state.selectedScale, "root:", state.selectedRoot, "octave:", state.octave);
}

/**
 * Update note display to show current note/chord
 */
export function updateNoteDisplay() {
  const noteEl = document.getElementById('note-display');
  if (!noteEl) return;
  
  let displayText = '';
  
  if (state.currentChord && state.leftHandIsPlaying) {
    displayText += `Chord: ${state.currentChord.name}`;
  }
  
  if (state.currentMelodyNote && state.rightHandIsPlaying) {
    if (displayText) displayText += ' | ';
    displayText += `Note: ${state.currentMelodyNote}`;
  }
  
  if (!displayText) {
    displayText = `Scale: ${state.selectedRoot} ${state.selectedScale}`;
  }
  
  noteEl.textContent = displayText;
  noteEl.style.direction = 'ltr'; // Left-to-right text direction
  noteEl.className = 'note-indicator' + ((state.leftHandIsPlaying || state.rightHandIsPlaying) ? ' playing' : '');
}

/**
 * Display instructions - updated for English
 */
export function updateInstructions() {
  // Create instructions element if it doesn't exist
  let instructionsEl = document.getElementById('instructions');
  if (!instructionsEl) {
    instructionsEl = document.createElement('div');
    instructionsEl.id = 'instructions';
    instructionsEl.className = 'instructions';
    document.body.appendChild(instructionsEl);
  }
  
  instructionsEl.innerHTML = `
    <h2>Instructions</h2> 
    <p>Move your hands to play music!</p>
    <p>Right hand: Plays melody</p>
    <p>Left hand: Plays harmony/chords</p>
    <p>Pinch gesture: Controls reverb</p>
    <p>Ring & middle fingers: Control volume</p>
    <p>Select scale and sound from the UI</p>
    <p>Click 'Start Audio' to start</p>
  `;
  
  if (!state.audioStarted) {
    instructionsEl.style.display = 'block';
  } else {
    instructionsEl.style.display = 'none';
  }
}

export default {
  createUI,
  addStartAudioButton,
  updateUI,
  updateNoteDisplay,
  updateInstructions
};