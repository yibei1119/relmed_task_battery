import { createVigourCoreTimeline, preloadVigour } from './vigour-utils.js';
import { vigour_instructions } from './vigour-instructions.js';

export function createVigourTimeline(settings) {
    const vigourTimeline = [
        preloadVigour(settings),
        vigour_instructions,
        ...createVigourCoreTimeline(settings),
    ];
    
    return vigourTimeline;
}