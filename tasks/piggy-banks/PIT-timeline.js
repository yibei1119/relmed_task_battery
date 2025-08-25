import { createPITCoreTimeline } from './PIT-utils.js';
import { PITInstructions } from './PIT-instructions.js';

export function createPITTimeline(settings) {
    const PIT_timeline = [
        PITInstructions(settings),
        createPITCoreTimeline(settings)
    ];

    return PIT_timeline;
}