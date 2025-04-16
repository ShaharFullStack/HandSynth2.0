/**
 * Utility functions for hand gesture analysis
 */

import { calculateDistance } from './math.js';
import { MIN_PINCH_DIST, MAX_PINCH_DIST } from '../config.js';

/**
 * Check if a hand is performing a pinch gesture (thumb and index finger close)
 * @param {Array} landmarks - Hand landmarks from MediaPipe
 * @returns {Object} Pinch info: { isPinching, distance, strength }
 */
export function detectPinch(landmarks) {
  if (!landmarks || landmarks.length < 21) {
    return { isPinching: false, distance: Infinity, strength: 0 };
  }
  
  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  
  const distance = calculateDistance(thumbTip, indexTip);
  const isPinching = distance < MAX_PINCH_DIST * 0.5;
  
  // Calculate pinch strength (0 = open hand, 1 = tight pinch)
  let strength = 1 - (distance - MIN_PINCH_DIST) / (MAX_PINCH_DIST - MIN_PINCH_DIST);
  strength = Math.max(0, Math.min(1, strength)); // Clamp to 0-1
  
  return {
    isPinching,
    distance,
    strength
  };
}

/**
 * Detect if fingers are curled (closed) or extended
 * @param {Array} landmarks - Hand landmarks from MediaPipe
 * @returns {Object} Finger states (true = extended, false = curled)
 */
export function getFingerStates(landmarks) {
  if (!landmarks || landmarks.length < 21) {
    return { thumb: false, index: false, middle: false, ring: false, pinky: false };
  }
  
  // Calculate finger curl for each finger
  const wrist = landmarks[0];
  
  // Index finger curl
  const indexMCP = landmarks[5];
  const indexPIP = landmarks[6];
  const indexDIP = landmarks[7];
  const indexTip = landmarks[8];
  
  // Check if tip is extended beyond PIP joint (simplified approach)
  const indexExtended = indexTip.y < indexPIP.y;
  
  // Middle finger curl
  const middleMCP = landmarks[9];
  const middlePIP = landmarks[10];
  const middleDIP = landmarks[11];
  const middleTip = landmarks[12];
  
  const middleExtended = middleTip.y < middlePIP.y;
  
  // Ring finger curl
  const ringMCP = landmarks[13];
  const ringPIP = landmarks[14];
  const ringDIP = landmarks[15];
  const ringTip = landmarks[16];
  
  const ringExtended = ringTip.y < ringPIP.y;
  
  // Pinky curl
  const pinkyMCP = landmarks[17];
  const pinkyPIP = landmarks[18];
  const pinkyDIP = landmarks[19];
  const pinkyTip = landmarks[20];
  
  const pinkyExtended = pinkyTip.y < pinkyPIP.y;
  
  // Thumb (more complex)
  const thumbCMC = landmarks[1];
  const thumbMCP = landmarks[2];
  const thumbIP = landmarks[3];
  const thumbTip = landmarks[4];
  
  // Check if thumb is extended (simplified)
  const thumbExtended = calculateDistance(thumbTip, wrist) > 
                      calculateDistance(thumbMCP, wrist) * 1.2;
  
  return {
    thumb: thumbExtended,
    index: indexExtended,
    middle: middleExtended,
    ring: ringExtended,
    pinky: pinkyExtended
  };
}

/**
 * Recognize common hand gestures
 * @param {Array} landmarks - Hand landmarks from MediaPipe
 * @returns {Object} Detected gesture information
 */
export function recognizeGesture(landmarks) {
  if (!landmarks || landmarks.length < 21) {
    return { name: 'unknown', confidence: 0 };
  }
  
  const fingers = getFingerStates(landmarks);
  const pinch = detectPinch(landmarks);
  
  // Detect gestures based on finger states
  if (pinch.isPinching) {
    return { name: 'pinch', confidence: pinch.strength };
  }
  
  if (fingers.index && !fingers.middle && !fingers.ring && !fingers.pinky) {
    return { name: 'point', confidence: 0.9 };
  }
  
  if (fingers.index && fingers.middle && !fingers.ring && !fingers.pinky) {
    return { name: 'peace', confidence: 0.9 };
  }
  
  if (fingers.thumb && fingers.pinky && !fingers.index && !fingers.middle && !fingers.ring) {
    return { name: 'call', confidence: 0.9 };
  }
  
  if (fingers.index && fingers.middle && fingers.ring && fingers.pinky && !fingers.thumb) {
    return { name: 'four', confidence: 0.9 };
  }
  
  if (fingers.index && fingers.middle && fingers.ring && fingers.pinky && fingers.thumb) {
    return { name: 'open', confidence: 0.9 };
  }
  
  if (!fingers.index && !fingers.middle && !fingers.ring && !fingers.pinky && !fingers.thumb) {
    return { name: 'fist', confidence: 0.9 };
  }
  
  return { name: 'unknown', confidence: 0.5 };
}

export default {
  detectPinch,
  getFingerStates,
  recognizeGesture
};