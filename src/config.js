/**
 * Configuration and constants for the HandSynth application
 */

// Tracking constants
export const MIN_PINCH_DIST = 0.01; // Minimum pinch distance for detection
export const MAX_PINCH_DIST = 0.1;  // Maximum pinch distance (open hand)

// Music theory variables
export const DEFAULT_SCALE = 'major';
export const DEFAULT_ROOT = 'C';
export const DEFAULT_OCTAVE = 4;
export const DEFAULT_SOUND = 'pad';

// Scales definition
export const scales = {
  major: [0, 2, 4, 5, 7, 9, 11, 12],
  minor: [0, 2, 3, 5, 7, 8, 10, 12],
  pentatonic: [0, 2, 4, 7, 9, 12],
  majorBlues: [0, 3, 5, 6, 7, 10, 12],
  minorBlues: [0, 3, 5, 6, 7, 10, 12],
  chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
};

// Notes and chord types
export const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const chordTypes = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  minor7: [0, 3, 7, 10],
  diminished: [0, 3, 6],
  augmented: [0, 4, 8],
  sus4: [0, 5, 7],
  dominant7: [0, 4, 7, 10],
  major7: [0, 4, 7, 11]
};

// Sound presets with optimized settings to reduce distortion
export const soundPresets = {
  synth: {
    oscillator: { type: 'sine' },
    envelope: { attack: 0.05, decay: 0.2, sustain: 0.6, release: 0.8 }
  },
  bell: {
    oscillator: { type: 'sine4' },
    envelope: { attack: 0.01, decay: 0.3, sustain: 0.2, release: 1.5 }
  },
  pad: {
    oscillator: { type: 'sine8' },
    envelope: { attack: 0.4, decay: 0.7, sustain: 0.6, release: 2 }
  },
  pluck: {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.01, decay: 0.1, sustain: 0.1, release: 0.3 }
  },
  piano: {
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.001, decay: 0.05, sustain: 0.7, release: 0.3 }
  }
};

// App state (shared between modules)
export const state = {
  // Hand tracking state
  handDetected: false,
  isLeftHandPresent: false,
  isRightHandPresent: false,
  leftHandLandmarks: null,
  rightHandLandmarks: null,
  
  // Debugging variables for tracking changes
  lastRightHandY: 0,
  lastLeftHandY: 0,
  lastMelodyNote: null,
  lastChord: null,
  
  // Audio state
  audioStarted: false,
  
  // Music parameters 
  selectedScale: DEFAULT_SCALE,
  selectedRoot: DEFAULT_ROOT,
  octave: DEFAULT_OCTAVE,
  selectedSound: DEFAULT_SOUND,
  
  // Audio playing states
  leftHandIsPlaying: false,
  rightHandIsPlaying: false,
  currentMelodyNote: null,
  currentChord: null,
  leftHandVolume: 0.5,
  rightHandVolume: 0.5,
  
  // UI state
  activeUIElement: null
};

export default {
  MIN_PINCH_DIST,
  MAX_PINCH_DIST,
  scales,
  notes,
  chordTypes,
  soundPresets,
  state
};