/**
 * Experiment setup and initialization utilities
 * Handles dynamic script loading and experiment launch coordination
 */

/**
 * Dynamically loads a JavaScript file and runs the experiment once loaded
 * Used for loading task-specific sequence files before experiment execution
 * @param {string} scriptSrc - Path to the JavaScript file to load
 */
function loadSequence(scriptSrc) {
    // Create a new script element for dynamic loading
    const script = document.createElement("script");

    // Set the src attribute to the provided script path
    script.src = scriptSrc;

    // Optionally, set the type attribute (default is "text/javascript")
    script.type = "text/javascript";

    // Ensure the script is loaded before running experiment
    script.onload = () => {
        console.log("Script loaded successfully, running experiment.");
        
        // Execute the main experiment function once sequence is loaded
        run_full_experiment();
    };
    
    // Append the script to the document's head to trigger loading
    document.head.appendChild(script); 

}

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
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadSequence,
        createPreloadTrial
    };
}
