/**
 * Mathematical and utility calculation functions
 * Provides date formatting, sequence computation, and randomization utilities
 */

/**
 * Formats a date string into a standardized YYYY-MM-DD_HH:MM:SS format
 * @param {string} s - Date string to format
 * @returns {string} Formatted date string with underscore separator
 */
function formatDateString(s){
    const dateTime = new Date(s);

    // Get individual components
    const year = dateTime.getFullYear();
    const month = String(dateTime.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const day = String(dateTime.getDate()).padStart(2, '0');
    const hours = String(dateTime.getHours()).padStart(2, '0');
    const minutes = String(dateTime.getMinutes()).padStart(2, '0');
    const seconds = String(dateTime.getSeconds()).padStart(2, '0');

    // Format the date and time
    const formattedDate = `${year}-${month}-${day}`;
    const formattedTime = `${hours}:${minutes}:${seconds}`;

    return formattedDate + "_" + formattedTime
}

/**
 * Computes optimal rest values for experimental trial structures
 * Calculates reverse cumulative sums of optimal outcomes for decision-making tasks
 * @param {Array} structure - Array of trial blocks, each containing trial objects
 * @returns {void} Modifies the structure array in-place, adding 'rest' properties
 */
function computeBestRest(structure){

    // Pass null if null
    if (structure == null) {
        return null
    }

    for (let b=0; b<structure.length; b++){

        // Initiate counter at last trial as zero
        structure[b][structure[b].length - 1].rest = {};

        // Compute reverse cumulative sums
        for (let i = structure[b].length - 2; i >= 0; i--) {
            // Determine the optimal outcome for the next trial
            const next_optimal_outcome = (structure[b][i + 1].n_stimuli === 2) ? 
            (structure[b][i + 1].optimal_right ? structure[b][i + 1].feedback_right : structure[b][i + 1].feedback_left) :
            (structure[b][i + 1][`feedback_${structure[b][i + 1].optimal_side}`]);

            // Copy the rest object from the next trial
            structure[b][i].rest = { ...structure[b][i + 1].rest };

            // Update the count for the next optimal outcome
            const outcomeKey = next_optimal_outcome.toString();
            if (structure[b][i].rest[outcomeKey]) {
            structure[b][i].rest[outcomeKey]++;
            } else {
            structure[b][i].rest[outcomeKey] = 1;
            }
        }
    }
}

/**
 * Counts the number of occurrences of each unique value in an array
 * @param {Array} array - Array of values to count
 * @returns {Object} Object with values as keys and their counts as values
 */
function countOccurrences(array) {
    const counts = new Map();
  
    array.forEach(float => {
      if (counts.has(float)) {
        counts.set(float, counts.get(float) + 1);
      } else {
        counts.set(float, 1);
      }
    });
  
    return Object.fromEntries(counts);
}

/**
 * Validates if a value is a valid number (not NaN)
 * @param {*} value - Value to validate
 * @returns {boolean} True if value is a valid number, false otherwise
 */
function isValidNumber(value) {
    return typeof value === 'number' && !isNaN(value);
}

// Seeded randomization utilities for consistent pseudo-random sequences

/**
 * Converts a string to a numeric seed for pseudo-random number generation
 * @param {string} str - Input string to convert to seed
 * @returns {number} Numeric seed derived from string hash
 */
function stringToSeed(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
    }
    return hash;
}

/**
 * Creates a seeded pseudo-random number generator using Linear Congruential Generator
 * @param {number} seed - Initial seed value
 * @returns {Function} Function that returns pseudo-random numbers between 0 and 1
 */
function seededRandom(seed) {
    return function() {
        seed = (seed * 1664525 + 1013904223) % 4294967296;
        return (seed >>> 16) / 65536;
    };
}

/**
 * Shuffles an array using Fisher-Yates algorithm with seeded random number generator
 * Ensures reproducible randomization for experimental consistency
 * @param {Array} arr - Array to shuffle
 * @param {string} seedString - String to generate consistent random seed
 * @returns {Array} New shuffled array (original array is not modified)
 */
function shuffleArray(arr, seedString) {
    let seed = stringToSeed(seedString);
    let random = seededRandom(seed);
    let shuffled = arr.slice(); // Clone the array to avoid mutation

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatDateString,
        computeBestRest,
        countOccurrences,
        isValidNumber,
        stringToSeed,
        seededRandom,
        shuffleArray
    };
}


