/**
 * TITANESS | MdEC M-ID Generator
 * Generates cryptographically secure serials for verified orbital debris.
 * Format: SDEC-MD-XXXX-XXXX-XXXX
 */

/**
 * Generates a new M-ID for a debris object.
 * @returns {string} The unique M-ID
 */
export const generateMID = () => {
  const timestamp = Date.now().toString(16).toUpperCase();
  const randomSuffix = crypto.randomUUID().split('-')[0].toUpperCase();
  return `SDEC-MD-${timestamp}-${randomSuffix}`;
};

/**
 * Verifies if an M-ID follows the SDEC protocol format.
 * @param {string} mid 
 * @returns {boolean}
 */
export const verifyMID = (mid) => {
  const midRegex = /^SDEC-MD-[0-9A-F]+-[0-9A-F]+$/;
  return midRegex.test(mid);
};
