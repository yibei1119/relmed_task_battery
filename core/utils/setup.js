/**
 * Experiment setup and initialization utilities
 * Handles dynamic script loading and experiment launch coordination
 */

// Import communication utility for sending messages to parent window
import { postToParent } from './data_handling.js';

/**
 * Dynamically loads a JavaScript file with Promise-based interface
 * More robust than fetch() for loading sequence files
 * @param {string} scriptSrc - Path to the JavaScript file to load
 * @returns {Promise} Resolves when script is loaded successfully
 */
function loadSequence(scriptSrc) {
    return new Promise((resolve, reject) => {
        // Create a new script element for dynamic loading
        const script = document.createElement("script");
        
        // Set the src attribute to the provided script path
        script.src = scriptSrc;
        script.type = "text/javascript";
        
        // Success handler
        script.onload = () => {
            console.log("Script loaded successfully:", scriptSrc);
            resolve();
        };
        
        // Error handler
        script.onerror = () => {
            console.error("Failed to load script:", scriptSrc);
            reject(new Error(`Failed to load sequence script: ${scriptSrc}`));
        };
        
        // Append the script to the document's head to trigger loading
        document.head.appendChild(script);
    });
}
/**
 * Creates a jsPsych preload trial for loading images before task execution
 * @param {string[]} images - Array of image file paths to preload
 * @param {string} task_name - Name of the task for trial identification
 * @returns {Object} jsPsych preload trial configuration object
 */
function createPreloadTrial(images, task_name) {
    return {
        type: jsPsychPreload,
        images: images,
        post_trial_gap: 800,
        data: {
            trialphase: `${task_name}_preload`,
        },
        on_start: () => {
            console.log("load_successful");
            postToParent({ message: "load_successful" });
        },
        continue_after_error: true
    };
}

// Export functions for use in other modules
export {
    loadSequence,
    createPreloadTrial
};

