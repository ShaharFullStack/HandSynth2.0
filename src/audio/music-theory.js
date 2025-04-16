/**
 * Music theory utilities for HandSynth
 * Converts hand positions to notes and chords
 */

import { state, scales, notes, chordTypes } from '../config.js';
import { mapRange } from '../utils/math.js';

/**
 * Get a note name from vertical hand position
 * @param {number} y - Vertical position (0.0-1.0)
 * @param {string} scale - Scale name (e.g., 'major', 'minor')
 * @returns {string} Note name with octave (e.g., "C4")
 */
export function getNoteFromPosition(y, scale) {
  // Track position change
  const positionChanged = Math.abs(y - state.lastRightHandY) > 0.03;
  state.lastRightHandY = y;
  
  // Inverted mapping - higher hand position (lower y value) = higher note
  // Map from full range (0.0-1.0) to positions (0-14), but inverted
  const position = Math.floor(mapRange(y, 0.0, 1.0, 14, 0));
  
  const scaleArray = scales[scale];
  const octaveOffset = Math.floor(position / scaleArray.length);
  const indexInScale = position % scaleArray.length;
  
  const semitones = scaleArray[indexInScale];
  const rootIndex = notes.indexOf(state.selectedRoot);
  const midiBase = 60 + rootIndex;
  const midiNote = midiBase + semitones + (state.octave - 4 + octaveOffset) * 12;
  
  const noteIndex = midiNote % 12;
  const noteOctave = Math.floor(midiNote / 12) - 1;
  const noteName = notes[noteIndex] + noteOctave;
  
  return noteName;
}

/**
 * Get a chord from vertical hand position
 * @param {number} y - Vertical position (0.0-1.0)
 * @returns {Object} Chord object with root, type, notes and name
 */
export function getChordFromPosition(y) {
  // Track position change
  const positionChanged = Math.abs(y - state.lastLeftHandY) > 0.03;
  state.lastLeftHandY = y;
  
  // Inverted mapping - higher hand position (lower y value) = higher chord position
  // Map from full range (0.0-1.0) to chord positions (0-7), but inverted
  const position = Math.floor(mapRange(y, 0.0, 1.0, 7, 0));
  
  const scaleArray = scales[state.selectedScale];
  const scaleDegree = position % scaleArray.length;
  
  // Get root note for this scale degree
  const rootIndex = notes.indexOf(state.selectedRoot);
  const degreeOffset = scaleArray[scaleDegree];
  const chordRootIndex = (rootIndex + degreeOffset) % 12;
  const chordRoot = notes[chordRootIndex];
  
  // Determine chord type based on scale and scale degree
  let chordType;
  if (state.selectedScale === 'major') {
    const chordTypes = ['major', 'minor', 'minor', 'major', 'dominant7', 'minor', 'diminished'];
    chordType = chordTypes[scaleDegree % 7];
  } else if (state.selectedScale === 'minor') {
    const chordTypes = ['minor', 'diminished', 'major', 'minor', 'minor', 'major', 'major'];
    chordType = chordTypes[scaleDegree % 7];
  } else if (state.selectedScale === 'majorBlues') {
    const chordTypes = ['dominant7', 'diminished', 'dominant7', 'diminished', 'dominant7', 'minor', 'diminished'];
    chordType = chordTypes[scaleDegree % 7];
  } else if (state.selectedScale === 'minorBlues') {
    const chordTypes = ['minor7', 'dominant7', 'minor7', 'diminished', 'minor7', 'diminished', 'dominant7'];
    chordType = chordTypes[scaleDegree % 7];
  } else {
    chordType = scaleDegree % 2 === 0 ? 'major' : 'minor';
  }
  
  // Generate chord notes
  const chordNotes = [];
  const intervals = chordTypes[chordType];
  
  const octaveOffset = Math.floor(position / 7);
  const midiBase = 48 + chordRootIndex + (state.octave - 4 + octaveOffset) * 12;
  
  intervals.forEach(interval => {
    const midiNote = midiBase + interval;
    const noteIndex = midiNote % 12;
    const noteOctave = Math.floor(midiNote / 12) - 1;
    chordNotes.push(notes[noteIndex] + noteOctave);
  });
  
  // Format chord name
  const chordNameMap = {
    'major': '',
    'minor': 'm',
    'minor7': 'm7',
    'diminished': 'dim',
    'augmented': 'aug',
    'sus4': 'sus4',
    'dominant7': '7',
    'major7': 'maj7'
  };
  
  const chord = {
    root: chordRoot,
    type: chordType,
    notes: chordNotes,
    name: `${chordRoot}${chordNameMap[chordType] || chordType}`
  };
  
  return chord;
}

export default {
  getNoteFromPosition,
  getChordFromPosition
};