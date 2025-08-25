import { createPITCoreTimeline } from './utils.js';
import { PIT_instructions } from './instructions.js';

export function createPITTimeline(settings) {
    const PIT_timeline = [
        PIT_instructions,
        createPITCoreTimeline(settings)
    ];

    return PIT_timeline;
}