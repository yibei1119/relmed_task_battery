import { createPITCoreTimeline, PITPreloadImages } from './PIT-utils.js';
import { PITInstructions } from './PIT-instructions.js';
import { createPreloadTrial } from '../../core/utils/index.js';

export function createPITTimeline(settings) {
    const PIT_timeline = [
        createPreloadTrial(PITPreloadImages(settings), settings.task_name),
        PITInstructions(settings),
        createPITCoreTimeline(settings)
    ];

    return PIT_timeline;
}