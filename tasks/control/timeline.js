import { createCoreControlTimeline, controlPreload } from "./utils.js"

export function createControlTimeline(settings) {

    let procedure = [controlPreload(settings)];
    
    procedure.push(controlInstructionsTimeline);

    procedure = procedure.concat(createCoreControlTimeline(settings));

    return procedure;
}
