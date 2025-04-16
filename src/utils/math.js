/**
 * Math utility functions for HandSynth
 */

/**
 * Map a value from one range to another
 * @param {number} value - The value to map
 * @param {number} inMin - Input range minimum
 * @param {number} inMax - Input range maximum
 * @param {number} outMin - Output range minimum
 * @param {number} outMax - Output range maximum
 * @returns {number} Mapped value
 */
export function mapRange(value, inMin, inMax, outMin, outMax) {
    // Ensure value is within range
    value = Math.max(inMin, Math.min(inMax, value));
    // Perform the mapping
    const result = ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    return result;
  }
  
  /**
   * Calculate distance between two 3D points
   * @param {Object} point1 - Point with x, y, z coordinates
   * @param {Object} point2 - Point with x, y, z coordinates
   * @returns {number} Distance between points
   */
  export function calculateDistance(point1, point2) {
    if (!point1 || !point2) return Infinity;
    
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    const dz = (point1.z || 0) - (point2.z || 0); // Handle optional z coordinate
    
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
  
  /**
   * Linear interpolation
   * @param {number} start - Start value
   * @param {number} end - End value
   * @param {number} t - Interpolation factor (0-1)
   * @returns {number} Interpolated value
   */
  export function lerp(start, end, t) {
    return start * (1 - t) + end * t;
  }
  
  /**
   * Clamp a value between min and max
   * @param {number} value - The value to clamp
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} Clamped value
   */
  export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
  
  /**
   * Convert gain value (0-1) to decibels
   * @param {number} gain - Gain value (0-1)
   * @returns {number} Decibel value
   */
  export function gainToDb(gain) {
    // Avoid log(0)
    if (gain <= 0) return -Infinity;
    return 20 * Math.log10(gain);
  }
  
  /**
   * Convert decibels to gain (0-1)
   * @param {number} db - Decibel value
   * @returns {number} Gain value
   */
  export function dbToGain(db) {
    return Math.pow(10, db / 20);
  }
  
  export default {
    mapRange,
    calculateDistance,
    lerp,
    clamp,
    gainToDb,
    dbToGain
  };