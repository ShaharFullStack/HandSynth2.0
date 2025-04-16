/**
 * Hand tracking module for HandSynth
 * Uses MediaPipe Hands for detection and processing
 */

import { state, MIN_PINCH_DIST, MAX_PINCH_DIST } from '../config.js';
import { showMessage } from '../ui/messages.js';
import { updateNoteDisplay } from '../ui/controls.js';
import { getNoteFromPosition, getChordFromPosition } from '../audio/music-theory.js';
import { playMelodyNote, playChord, stopMelody, stopChord, setVolume, setReverb } from '../audio/synth.js';
import { calculateDistance } from '../utils/math.js';

// MediaPipe Hands instance
let hands;

// Canvas and video elements
let canvasCtx, canvasElement, videoElement;

/**
 * Setup hand tracking using MediaPipe Hands
 */
export function setupHandTracking() {
  // Get elements
  videoElement = document.querySelector('.input_video');
  canvasElement = document.querySelector('.output_canvas');
  
  if (!videoElement || !canvasElement) {
    console.error("Video or Canvas element not found - cannot initialize hand tracking.");
    showMessage("Video or Canvas element not found - cannot initialize hand tracking.", 3000);
    return;
  }
  
  // Check if elements are loaded
  if (canvasElement) {
    canvasCtx = canvasElement.getContext('2d');
  } else {
    console.error("Output canvas element not found!");
    return;
  }
  
  // Setup direct MediaPipe hand tracking
  try {
    hands = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      }
    });
    
    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.4, // Reduced for easier detection
      minTrackingConfidence: 0.3   // Reduced for easier tracking
    });
    
    // Set up callback
    hands.onResults(onHandResults);
    
    // Set up camera
    const camera = new Camera(videoElement, {
      onFrame: async () => {
        if (videoElement.readyState >= 2) {
          await hands.send({image: videoElement});
        }
      },
      width: 1280,
      height: 720
    });
    
    // Start camera
    camera.start()
      .then(() => {
        console.log("Camera started successfully.");
        showMessage("Camera started successfully. Move your hands to play!");
      })
      .catch(err => {
        console.error("Error starting webcam:", err);
        showMessage("Error starting webcam: " + err.message, 5000);
      });
    
  } catch (error) {
    console.error("Error setting up MediaPipe Hands:", error);
    showMessage("Error setting up MediaPipe Hands: " + error.message, 5000);
  }
}

/**
 * Process hand detection results
 * @param {Object} results - MediaPipe Hands results
 */
function onHandResults(results) {
  try {
    if (!canvasCtx || !canvasElement) return;
    
    // Display a message if hands are detected
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const handCount = results.multiHandLandmarks.length;
      if (!state.handDetected) {
        console.log(`Detected ${handCount} hands`);
        state.handDetected = true;
      }
    } else {
      state.handDetected = false;
    }
    
    // Reset hand states
    let wasLeftHandPresent = state.isLeftHandPresent;
    let wasRightHandPresent = state.isRightHandPresent;
    state.isLeftHandPresent = false;
    state.isRightHandPresent = false;
    state.leftHandLandmarks = null;
    state.rightHandLandmarks = null;
    
    // Drawing setup
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    
    // Process detected hands
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      for (let i = 0; i < results.multiHandLandmarks.length; i++) {
        if (!results.multiHandedness || !results.multiHandedness[i]) continue;
        
        const classification = results.multiHandedness[i];
        const landmarks = results.multiHandLandmarks[i];
        const isLeft = classification.label === 'Left';
        
        // Process based on handedness
        if (!isLeft) {
          processLeftHand(landmarks);
        } else {
          processRightHand(landmarks);
        }
        
        // Draw hand landmarks and connections
        const color = isLeft ? 'rgba(0, 255, 200, 0.8)' : 'rgb(231, 150, 0)';
        drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, { color: color, lineWidth: 10 });
        drawLandmarks(canvasCtx, landmarks, { color: color, lineWidth: 3, radius: 4 });
      }
    } else {
      // No hands detected, stop playing
      stopMelody();
      stopChord();
    }
    
    // Stop sounds if hands disappear
    if (!state.isLeftHandPresent && wasLeftHandPresent) {
      stopChord();
    }
    
    if (!state.isRightHandPresent && wasRightHandPresent) {
      stopMelody();
    }
    
    canvasCtx.restore();
  } catch (error) {
    console.error("Error in hand tracking:", error);
    // Try to restore the state in case of error
    canvasCtx && canvasCtx.restore();
  }
}

/**
 * Process left hand (controls harmony/chords)
 * @param {Array} landmarks - Hand landmarks from MediaPipe
 */
function processLeftHand(landmarks) {
  state.isLeftHandPresent = true;
  state.leftHandLandmarks = landmarks;
  
  // LEFT HAND: Vertical position controls harmony/chords
  if (landmarks && landmarks.length > 8) {
    const wrist = landmarks[0];
    
    // Ensure wrist position is valid
    if (wrist && typeof wrist.y === 'number') {
      const thumbTip = landmarks[4];
      const indexTip = landmarks[8];
      const pinchDist = calculateDistance(thumbTip, indexTip);
      
      // Reverb control with pinch distance
      setReverb('left', mapPinchToReverb(pinchDist));
      
      // Volume control with ring and middle fingers
      const middleFinger = landmarks[12];
      const fingerDist = calculateDistance(middleFinger, thumbTip);
      setVolume('left', mapFingerToVolume(fingerDist));
      
      // Get chord based on hand height
      const chord = getChordFromPosition(wrist.y);
      
      // Playing or not based on hand presence
      playChord(chord);
      
      // Draw chord name above hand
      drawChordName(chord, wrist);
      
      // Draw visualizations for controls
      drawReverbVisualization(thumbTip, indexTip, pinchDist);
      drawVolumeVisualization(thumbTip, middleFinger, fingerDist);
    }
  }
}

/**
 * Process right hand (controls melody)
 * @param {Array} landmarks - Hand landmarks from MediaPipe
 */
function processRightHand(landmarks) {
  state.isRightHandPresent = true;
  state.rightHandLandmarks = landmarks;
  
  if (landmarks && landmarks.length > 8) {
    const wrist = landmarks[0];
    
    // Ensure wrist position is valid
    if (wrist && typeof wrist.y === 'number') {
      const thumbTip = landmarks[4];
      const indexTip = landmarks[8];
      const pinchDist = calculateDistance(thumbTip, indexTip);
      
      // Reverb control with pinch distance
      setReverb('right', mapPinchToReverb(pinchDist));
      
      // Volume control with ring and middle fingers
      const middleFinger = landmarks[12];
      const fingerDist = calculateDistance(middleFinger, thumbTip);
      setVolume('right', mapFingerToVolume(fingerDist));
      
      // Get melody note based on hand height
      const note = getNoteFromPosition(wrist.y, state.selectedScale);
      
      // Play the note
      playMelodyNote(note);
      
      // Draw note name above hand
      drawNoteName(note, thumbTip);
      
      // Draw visualizations for controls
      drawReverbVisualization(thumbTip, indexTip, pinchDist, 'rgba(255, 0, 255, 0.8)');
      drawVolumeVisualization(thumbTip, middleFinger, fingerDist, 'rgb(0, 255, 100)');
    }
  }
}

/**
 * Map pinch distance to reverb amount (inverted)
 * @param {number} pinchDist - Distance between thumb and index finger
 * @returns {number} Reverb wet level (0.0-1.0)
 */
function mapPinchToReverb(pinchDist) {
  let wetLevel = (pinchDist - MIN_PINCH_DIST) / (MAX_PINCH_DIST - MIN_PINCH_DIST);
  return Math.max(0, Math.min(wetLevel, 1)); // Clamp between 0 and 1
}

/**
 * Map finger distance to volume level
 * @param {number} fingerDist - Distance between thumb and middle finger
 * @returns {number} Volume level (0.0-1.0)
 */
function mapFingerToVolume(fingerDist) {
  let volume = (fingerDist - MIN_PINCH_DIST) / (MAX_PINCH_DIST - MIN_PINCH_DIST);
  return Math.max(0, Math.min(volume, 1)); // Clamp between 0 and 1
}

/**
 * Draw chord name above wrist
 * @param {Object} chord - Chord object
 * @param {Object} wrist - Wrist position
 */
function drawChordName(chord, wrist) {
  canvasCtx.font = 'bold 24px Arial';
  canvasCtx.fillStyle = 'white';
  canvasCtx.fillText(chord.name, 
    (wrist.x * canvasElement.width) - 15,
    (wrist.y * canvasElement.height) - 30);
}

/**
 * Draw note name above hand
 * @param {string} note - Note name
 * @param {Object} thumbTip - Thumb position
 */
function drawNoteName(note, thumbTip) {
  canvasCtx.font = 'bold 24px Arial';
  canvasCtx.fillStyle = 'magenta';
  canvasCtx.fillText(note, 
    (thumbTip.x * canvasElement.width) - 15,
    (thumbTip.y * canvasElement.height) - 30);
}

/**
 * Draw reverb visualization between thumb and index finger
 * @param {Object} thumbTip - Thumb position
 * @param {Object} indexTip - Index finger position
 * @param {number} pinchDist - Distance between fingers
 * @param {string} color - Stroke color (default: yellow)
 */
function drawReverbVisualization(thumbTip, indexTip, pinchDist, color = 'rgb(255, 230, 0)') {
  const reverbLevel = mapPinchToReverb(pinchDist);
  
  // Draw circle for reverb level
  canvasCtx.beginPath();
  canvasCtx.arc(
    (thumbTip.x + indexTip.x) / 2 * canvasElement.width,
    (thumbTip.y + indexTip.y) / 2 * canvasElement.height,
    20 * reverbLevel, 0, Math.PI * 2
  );
  canvasCtx.fillStyle = `rgba(255, 90, 94, ${reverbLevel})`;
  canvasCtx.fill();
  
  // Draw line between thumb and index finger
  canvasCtx.beginPath();
  canvasCtx.moveTo(thumbTip.x * canvasElement.width, thumbTip.y * canvasElement.height);
  canvasCtx.lineTo(indexTip.x * canvasElement.width, indexTip.y * canvasElement.height);
  canvasCtx.strokeStyle = color;
  canvasCtx.lineWidth = 5;
  canvasCtx.stroke();
}

/**
 * Draw volume visualization between thumb and middle finger
 * @param {Object} thumbTip - Thumb position
 * @param {Object} middleFinger - Middle finger position
 * @param {number} fingerDist - Distance between fingers
 * @param {string} color - Stroke color (default: green)
 */
function drawVolumeVisualization(thumbTip, middleFinger, fingerDist, color = 'rgb(0, 255, 100)') {
  const volumeLevel = mapFingerToVolume(fingerDist);
  
  // Draw circle for volume level
  canvasCtx.beginPath();
  canvasCtx.arc(
    (middleFinger.x + thumbTip.x) / 2 * canvasElement.width,
    (middleFinger.y + thumbTip.y) / 2 * canvasElement.height,
    20 * volumeLevel, 0, Math.PI * 2
  );
  canvasCtx.fillStyle = `rgba(255, 90, 94, ${volumeLevel})`;
  canvasCtx.fill();
  
  // Draw line between thumb and middle finger
  canvasCtx.beginPath();
  canvasCtx.moveTo(middleFinger.x * canvasElement.width, middleFinger.y * canvasElement.height);
  canvasCtx.lineTo(thumbTip.x * canvasElement.width, thumbTip.y * canvasElement.height);
  canvasCtx.strokeStyle = color;
  canvasCtx.lineWidth = 5;
  canvasCtx.stroke();
}

export default {
  setupHandTracking
};