import { createCoreControlTimeline, controlPreload } from "./utils.js"
import { createControlInstructionsTimeline } from "./instructions.js"

export function createControlTimeline(settings) {

    let procedure = [controlPreload(settings)];
    
    // procedure = procedure.concat(createControlInstructionsTimeline(settings));

    procedure = procedure.concat(createCoreControlTimeline(settings));

    return procedure;
}
