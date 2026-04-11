/**
 * TITANESS | TLE Engine
 * Integrates satellite.js for real-world debris tracking.
 */

import * as satellite from 'satellite.js';

/**
 * Propagates a TLE to a specific date.
 * @param {string} line1 
 * @param {string} line2 
 * @param {Date} date 
 * @returns {Object|null} {position, velocity} in ECI
 */
export const propagateDebris = (line1, line2, date = new Date()) => {
  try {
    const satrec = satellite.twoline2satrec(line1, line2);
    const positionAndVelocity = satellite.propagate(satrec, date);
    
    if (positionAndVelocity.position) {
      return positionAndVelocity;
    }
    return null;
  } catch (error) {
    console.error('TLE Propagation Error:', error);
    return null;
  }
};

/**
 * Converts ECI to Geodetic coordinates.
 * @param {Object} positionECI 
 * @param {Date} date 
 * @returns {Object} {longitude, latitude, height}
 */
export const eciToGeodetic = (positionECI, date = new Date()) => {
  const gmst = satellite.gstime(date);
  const positionGd = satellite.eciToGeodetic(positionECI, gmst);
  
  return {
    longitude: satellite.degreesLong(positionGd.longitude),
    latitude: satellite.degreesLat(positionGd.latitude),
    height: positionGd.height
  };
};

/**
 * Fetches debris TLE data from CelesTrak.
 * categories: 'active', 'debris', 'stations', etc.
 */
export const fetchDebrisData = async (category = 'active', limit = 50) => {
  // Use our internal Node.js proxy to bypass CORS issues
  const url = `http://localhost:8080/tle?GROUP=${category}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Proxy unreachable');
    const text = await response.text();
    const allDebris = parseTLE(text);
    return allDebris.slice(0, limit);
  } catch (error) {
    console.error('Fetch Error:', error);
    // Fallback to minimal data if fetch fails
    return [
      { name: 'ISS (ZARYA)', line1: '1 25544U 98067A   24101.52044321  .00016717  00000-0  30141-3 0  9990', line2: '2 25544  51.6416  11.7765 0004123  35.5398  74.4967 15.49607565450208' }
    ];
  }
};

const parseTLE = (tleString) => {
  const lines = tleString.split('\n').filter(line => line.trim().length > 0);
  const debris = [];
  for (let i = 0; i < lines.length; i += 3) {
    debris.push({
      name: lines[i].trim(),
      line1: lines[i+1],
      line2: lines[i+2]
    });
  }
  return debris;
};
