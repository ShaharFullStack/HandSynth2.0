/**
 * Visual keyboard and note marker utilities
 * Provides visual feedback for music interaction
 */

import { state, scales, notes } from '../config.js';
import { mapRange } from '../utils/math.js';
import { getNoteFromPosition } from '../audio/music-theory.js';

/**
 * Create visual note position markers
 */
export function createNoteMarkers() {
  // Check if container exists, create if not
  let markerContainer = document.getElementById('note-markers');
  if (!markerContainer) {
    markerContainer = document.createElement('div');
    markerContainer.id = 'note-markers';
    markerContainer.className = 'note-markers';
    document.body.appendChild(markerContainer);
  }
  
  // Clear existing markers
  markerContainer.innerHTML = '';
  
  const gridLines = 14; // Two octaves
  
  for (let i = 0; i <= gridLines; i++) {
    // Distribute markers across full screen height
    const y = mapRange(i, 0, gridLines, 5, 95); // % of screen height
    
    const marker = document.createElement('div');
    marker.className = i === 7 ? 'marker octave-divider' : 'marker';
    marker.style.top = `${y}%`;
    
    // Add label for every other marker
    if (i % 2 === 0 && i < gridLines) {
      const label = document.createElement('div');
      label.className = 'marker-label';
      // Apply inverted mapping (higher hand = higher pitch)
      const note = getNoteFromPosition(mapRange(i, 0, gridLines, 1.0, 0.0), state.selectedScale);
      label.textContent = note;
      label.style.top = `${y}%`;
      markerContainer.appendChild(label);
    }
    
    markerContainer.appendChild(marker);
  }
}

/**
 * Create visual keyboard representation
 */
export function createVisualKeyboard() {
  // Check if container exists, create if not
  let keyboardContainer = document.getElementById('keyboard-visual');
  if (!keyboardContainer) {
    keyboardContainer = document.createElement('div');
    keyboardContainer.id = 'keyboard-visual';
    keyboardContainer.className = 'keyboard-visual';
    document.body.appendChild(keyboardContainer);
  }
  
  // Clear existing keys
  keyboardContainer.innerHTML = '';
  
  // Create keys for two octaves
  const scaleArray = scales[state.selectedScale];
  const totalKeys = scaleArray.length * 2;
  
  for (let i = 0; i < totalKeys; i++) {
    const key = document.createElement('div');
    key.className = 'key';
    key.dataset.noteIndex = i;
    
    // Calculate the note for this key
    const octaveOffset = Math.floor(i / scaleArray.length);
    const indexInScale = i % scaleArray.length;
    const semitones = scaleArray[indexInScale];
    
    const rootIndex = notes.indexOf(state.selectedRoot);
    const midiBase = 60 + rootIndex;
    const midiNote = midiBase + semitones + (state.octave - 4 + octaveOffset) * 12;
    
    const noteIndex = midiNote % 12;
    const noteOctave = Math.floor(midiNote / 12) - 1;
    const noteName = notes[noteIndex] + noteOctave;
    
    key.dataset.note = noteName;
    
    keyboardContainer.appendChild(key);
  }
}

/**
 * Update the visual keyboard when a note is played
 */
export function updateVisualKeyboard() {
  const keyboardContainer = document.getElementById('keyboard-visual');
  if (!keyboardContainer) return;
  
  // Reset all keys
  const keys = keyboardContainer.querySelectorAll('.key');
  keys.forEach(key => key.classList.remove('active'));
  
  // Highlight active keys
  if (state.currentMelodyNote && state.rightHandIsPlaying) {
    const melodyKey = keyboardContainer.querySelector(`.key[data-note="${state.currentMelodyNote}"]`);
    if (melodyKey) melodyKey.classList.add('active');
  }
  
  if (state.currentChord && state.leftHandIsPlaying) {
    state.currentChord.notes.forEach(note => {
      const chordKey = keyboardContainer.querySelector(`.key[data-note="${note}"]`);
      if (chordKey) chordKey.classList.add('active');
    });
  }
}

/**
 * Update note markers to reflect current scale selection
 */
export function updateNoteMarkers() {
  const markerContainer = document.getElementById('note-markers');
  if (!markerContainer) return;
  
  // Remove existing labels
  const labels = markerContainer.querySelectorAll('.marker-label');
  labels.forEach(label => label.remove());
  
  // Add new labels with updated notes
  const gridLines = 14;
  for (let i = 0; i <= gridLines; i += 2) {
    if (i < gridLines) {
      const y = mapRange(i, 0, gridLines, 5, 95);
      const label = document.createElement('div');
      label.className = 'marker-label';
      // Apply inverted mapping
      const note = getNoteFromPosition(mapRange(i, 0, gridLines, 1.0, 0.0), state.selectedScale);
      label.textContent = note;
      label.style.top = `${y}%`;
      markerContainer.appendChild(label);
    }
  }
}

export default {
  createNoteMarkers,
  createVisualKeyboard,
  updateVisualKeyboard,
  updateNoteMarkers
};