/**
 * Audio synthesis module for HandSynth
 * Handles Tone.js audio creation and management
 */

import { state, soundPresets } from '../config.js';
import { showMessage } from '../ui/messages.js';
import { updateNoteDisplay } from '../ui/controls.js';
import { pulseBlackHole } from '../visual/blackhole.js';

// Audio components
let melodySynth, harmonySynth, filter, reverb;

/**
 * Initialize audio system
 * Only called after user interaction to comply with audio autoplay policies
 */
export function setupAudio() {
  try {
    // Set overall audio quality parameters
    Tone.setContext(new Tone.Context({ 
      latencyHint: 'balanced',
      lookAhead: 0.2  // Increase lookAhead for better scheduling
    }));
    
    // Create a limiter to prevent audio clipping
    const limiter = new Tone.Limiter(-3).toDestination();
    
    // Improve overall sound with a gentle compressor
    const compressor = new Tone.Compressor(-12, 3).toDestination();
    
    // Configure reverb with a low initial value
    reverb = new Tone.Reverb({
      decay: 2.0,
      wet: 0.1,  // Lower initial reverb value
      preDelay: 0.07,
    });
    
    limiter.connect(reverb);  
    
    // Create filter
    filter = new Tone.Filter({
      type: "lowpass",
      frequency: 18000,
      Q: 0.5,
      rolloff: -12
    });
    
    // Connect filter
    filter.connect(reverb);
    reverb.connect(compressor);
    
    // Create melody synth
    melodySynth = createMelodySynth();
    
    // Create harmony synth
    harmonySynth = createHarmonySynth();
    
    // Create or update note display
    updateNoteDisplay();
    
    console.log("Audio system initialized successfully");
    return true;
  } catch (error) {
    console.error("Error setting up audio:", error);
    showMessage("Error setting up audio: " + error.message, 5000);
    return false;
  }
}

/**
 * Create a new melody synth with current sound settings
 */
function createMelodySynth() {
  const preset = soundPresets[state.selectedSound];
  
  const synth = new Tone.Synth({
    oscillator: {
      type: preset.oscillator.type,
      modulationType: "sine",
      harmonicity: 1
    },
    envelope: {
      attack: preset.envelope.attack,
      decay: preset.envelope.decay,
      sustain: preset.envelope.sustain,
      release: preset.envelope.release,
    },
    portamento: 0.02
  });
  
  synth.connect(filter);
  synth.volume.value = -10;
  
  return synth;
}

/**
 * Create a new harmony synth with current sound settings
 */
function createHarmonySynth() {
  const preset = soundPresets[state.selectedSound];
  
  const synth = new Tone.PolySynth({
    maxPolyphony: 6,
    voice: Tone.Synth,
    options: {
      oscillator: {
        type: preset.oscillator.type,
        modulationType: "sine",
        harmonicity: 1
      },
      envelope: {
        attack: preset.envelope.attack * 1.2,
        decay: preset.envelope.decay,
        sustain: preset.envelope.sustain,
        release: preset.envelope.release * 1.5,
      },
      portamento: 0.02
    }
  });
  
  synth.connect(filter);
  synth.volume.value = -14;
  
  return synth;
}

/**
 * Update synths when sound selection changes
 */
export function updateSynths() {
  try {
    // Stop all current sounds first
    if (melodySynth) melodySynth.triggerRelease();
    if (harmonySynth) harmonySynth.releaseAll();
    
    // Wait for release to complete
    setTimeout(() => {
      // Dispose old synths if they exist
      if (melodySynth) melodySynth.dispose();
      if (harmonySynth) harmonySynth.dispose();
      
      // Create new synths
      melodySynth = createMelodySynth();
      harmonySynth = createHarmonySynth();
      
      // Restore volumes
      if (melodySynth) melodySynth.volume.value = Tone.gainToDb(state.rightHandVolume);
      if (harmonySynth) harmonySynth.volume.value = Tone.gainToDb(state.leftHandVolume * 0.6);
      
      // Reset playing states
      state.rightHandIsPlaying = false;
      state.leftHandIsPlaying = false;
      state.currentMelodyNote = null;
      state.currentChord = null;
      
      updateNoteDisplay();
      showMessage(`Switched sound to ${state.selectedSound}`);
    }, 100);
  } catch (error) {
    console.error("Error updating synths:", error);
    showMessage("Error updating synths: " + error.message, 3000);
  }
}

/**
 * Play a melody note
 * @param {string} note - Note name with octave (e.g., "C4")
 */
export function playMelodyNote(note) {
  if (!state.audioStarted || !melodySynth) return;
  
  // Check if the note has actually changed
  const noteChanged = note !== state.lastMelodyNote;
  state.lastMelodyNote = note;
  
  try {
    if (!state.rightHandIsPlaying) {
      // First time playing a note
      melodySynth.triggerAttack(note, Tone.now(), 0.8);
      state.rightHandIsPlaying = true;
      state.currentMelodyNote = note;
      
      // Trigger black hole animation effect for new note
      pulseBlackHole(1.0);
      
      console.log("Started playing melody note:", note);
    } else if (noteChanged) {
      // Use proper scheduled timing for clean note transitions
      const now = Tone.now();
      
      // Release the current note with a precise timestamp
      melodySynth.triggerRelease(now + 0.02);
      
      // Schedule the attack of the new note with a slight delay
      melodySynth.triggerAttack(note, now + 0.07, 0.7);
      state.currentMelodyNote = note;
      
      // Trigger black hole animation effect for note change
      pulseBlackHole(0.8);
    }
    
    updateNoteDisplay();
  } catch (error) {
    console.error("Error playing melody note:", error);
  }
}

/**
 * Play a chord
 * @param {Object} chord - Chord object with root, type, notes and name
 */
export function playChord(chord) {
  if (!state.audioStarted || !harmonySynth) return;
  
  // Check if the chord has actually changed by comparing note arrays
  const chordChanged = !state.lastChord || 
                      JSON.stringify(chord.notes) !== JSON.stringify(state.lastChord.notes);
  
  try {
    if (!state.leftHandIsPlaying) {
      // First-time playing
      harmonySynth.triggerAttack(chord.notes, Tone.now(), 0.6);
      state.leftHandIsPlaying = true;
      state.currentChord = chord;
      state.lastChord = {...chord}; // Make a copy to prevent reference issues
      
      // Trigger black hole animation effect for new chord
      pulseBlackHole(1.0);
      
      console.log("Started playing chord:", chord.name, chord.notes);
    } else if (chordChanged) {
      // CRITICAL FIX: Using proper sequence to eliminate distortion
      
      // 1. Release all current notes with a slight future timestamp to ensure clean release
      harmonySynth.releaseAll(Tone.now() - 0.005);
      
      // 2. Wait a moment for the release to complete
      setTimeout(() => {
        // 3. Completely dispose of the old synth to clear any lingering audio problems
        harmonySynth.dispose();
        
        // 4. Create a fresh instance with the same settings
        harmonySynth = createHarmonySynth();
        
        // 5. Set volume
        harmonySynth.volume.value = Tone.gainToDb(state.leftHandVolume * 0.6);
        
        // 6. Play the new chord with a short delay to ensure clean start
        setTimeout(() => {
          // Using a precise scheduled time with Tone.js for better timing
          const startTime = Tone.now() + 0.05;
          harmonySynth.triggerAttack(chord.notes, startTime, 0.6);
          state.currentChord = chord;
          state.lastChord = {...chord}; // Make a copy
          state.leftHandIsPlaying = true;
          
          // Trigger black hole animation effects for chord change
          const pulseIntensity = chord.type.includes('7') ? 1.0 : 
                              chord.type === 'diminished' ? 1.2 : 0.8;
          pulseBlackHole(pulseIntensity);
        }, 50);
      }, 150);
    }
    
    updateNoteDisplay();
  } catch (error) {
    console.error("Error playing chord:", error);
  }
}

/**
 * Stop playing melody
 */
export function stopMelody() {
  if (state.rightHandIsPlaying && melodySynth) {
    melodySynth.triggerRelease();
    state.rightHandIsPlaying = false;
    state.currentMelodyNote = null;
    updateNoteDisplay();
    console.log("Stopped melody");
  }
}

/**
 * Stop playing chord
 */
export function stopChord() {
  if (state.leftHandIsPlaying && harmonySynth) {
    // Use releaseAll instead of triggerRelease for PolySynth
    harmonySynth.releaseAll();
    
    // More aggressive approach to ensure sound stops
    setTimeout(() => {
      // If sound is still playing, rebuild the synth
      if (state.leftHandIsPlaying && harmonySynth) {
        harmonySynth.dispose();
        harmonySynth = createHarmonySynth();
      }
    }, 100);
    
    state.leftHandIsPlaying = false;
    state.currentChord = null;
    updateNoteDisplay();
    console.log("Stopped chord");
  }
}

/**
 * Set the volume for a particular hand
 * @param {string} hand - 'left' or 'right'
 * @param {number} volume - Volume level (0.0 to 1.0)
 */
export function setVolume(hand, volume) {
  if (!state.audioStarted) return;
  
  volume = Math.max(0, Math.min(volume, 1)); // Clamp between 0 and 1
  
  try {
    if (hand === 'left') {
      if (state.rightHandVolume !== volume) {
        state.rightHandVolume = volume;
        if (harmonySynth) {
          harmonySynth.volume.value = Tone.gainToDb(volume * 0.6);
        }
      }
    } else if (hand === 'right') {
      if (state.leftHandVolume !== volume) {
        state.leftHandVolume = volume;
        if (melodySynth) {
          melodySynth.volume.value = Tone.gainToDb(volume);
        }
      }
    }
  } catch (error) {
    console.error("Error setting volume:", error);
  }
}

/**
 * Set reverb level
 * @param {string} hand - 'left' or 'right' (both affect the same reverb)
 * @param {number} wetLevel - Reverb wet level (0.0 to 1.0)
 */
export function setReverb(hand, wetLevel) {
  if (!state.audioStarted || !reverb) return;
  
  wetLevel = Math.max(0, Math.min(wetLevel, 1)); // Clamp between 0 and 1
  
  try {
    reverb.wet.value = wetLevel;
  } catch (error) {
    console.error("Error setting reverb:", error);
  }
}

export default {
  setupAudio,
  updateSynths,
  playMelodyNote,
  playChord,
  stopMelody,
  stopChord,
  setVolume,
  setReverb
};