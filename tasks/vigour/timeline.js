import { fullscreen_prompt, kick_out, updateState } from '/core/utils/index.js';
import { createCoreVigourTimeline } from './utils.js';
import { vigour_instructions } from './instructions.js';

function createVigourTimeline(settings) {
    const vigourTimeline = [
        preloadVigour(settings),
        vigour_instructions,
        ...createCoreVigourTimeline(settings),
    ];
    
    return vigourTimeline;
}