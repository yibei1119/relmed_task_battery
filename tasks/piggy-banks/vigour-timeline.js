import { createVigourCoreTimeline, VIGOUR_PRELOAD_IMAGES } from './vigour-utils.js';
import { vigour_instructions } from './vigour-instructions.js';
import { createPreloadTrial } from '../../core/utils/index.js';

export function createVigourTimeline(settings) {
    const vigourTimeline = [
        createPreloadTrial(VIGOUR_PRELOAD_IMAGES, settings.task_name),
        vigour_instructions,
        ...createVigourCoreTimeline(settings),
    ];
    
    return vigourTimeline;
}