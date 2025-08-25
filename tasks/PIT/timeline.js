import { createPITCoreTimeline } from './utils.js';
import { PITInstructions } from './instructions.js';

export function createPITTimeline(settings) {
    const PIT_timeline = [
        PITInstructions(settings),
        createPITCoreTimeline(settings)
    ];

    return PIT_timeline;
}