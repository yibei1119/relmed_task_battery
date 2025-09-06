import { createCoreControlTimeline, controlPreload } from "./utils.js"
import { createControlInstructionsTimeline } from "./instructions.js"

/**
 * Creates the complete control task timeline including preload, instructions, and core task
 * @param {Object} settings - Task configuration object containing session info and parameters
 * @returns {Array} Complete jsPsych timeline array for the control task
 */
export function createControlTimeline(settings) {

    // Start with asset preloading
    let procedure = [controlPreload(settings)];
    
    // Instructions
    procedure = procedure.concat(createControlInstructionsTimeline(settings));

    // Add the main control task trials (explore, predict, reward phases)
    procedure = procedure.concat(createCoreControlTimeline(settings));

    return procedure;
}
