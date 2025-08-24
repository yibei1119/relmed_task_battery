import { createCoreVigourTimeline } from './utils.js';
import { vigour_instructions } from './instructions.js';

export function createVigourTimeline(settings) {
    const vigourTimeline = [
        preloadVigour(settings),
        vigour_instructions,
        ...createCoreVigourTimeline(settings),
    ];
    
    return vigourTimeline;
}