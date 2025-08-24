import { createVigourCoreTimeline, preloadVigour } from './utils.js';
import { vigour_instructions } from './instructions.js';

export function createVigourTimeline(settings) {
    const vigourTimeline = [
        preloadVigour(settings),
        vigour_instructions,
        ...createVigourCoreTimeline(settings),
    ];
    
    return vigourTimeline;
}