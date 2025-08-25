import { createPITCoreTimeline, PITPreloadImages } from './PIT-utils.js';
import { PITInstructions } from './PIT-instructions.js';
import { createPreloadTrial } from '../../core/utils/index.js';

/**
 * Creates the complete timeline for the PIT (Pavlovian-Instrumental Transfer) task
 * @param {Object} settings - Configuration object containing task parameters and session info
 * @returns {Array} Array of jsPsych timeline objects for the PIT task
 */
export function createPITTimeline(settings) {
    const PIT_timeline = [
        // Preload all images required for the PIT task
        createPreloadTrial(PITPreloadImages(settings), settings.task_name),
        // Show task instructions with option to review
        PITInstructions(settings),
        // Run the main PIT task trials
        createPITCoreTimeline(settings)
    ];

    return PIT_timeline;
}