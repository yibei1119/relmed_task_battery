/**
 * Checks whether last_state appears before task in the order array.
 * If so, task should run, otherwise, it should not.
 * @param {Array} order - Array of strings representing the ordering
 * @param {string} last_state - String to check if it appears after task
 * @param {string} task - String to compare against
 * @returns {boolean} - True if last_state appears after task, false otherwise
 */
function resumptionRule(order, last_state, task) {

    // If first time, run all tasks
    if (last_state === "none"){
        return true;
    }

    const taskIndex = order.indexOf(task);
    const lastStateIndex = order.indexOf(last_state);
    
    // If either element is not found in the array
    if (taskIndex === -1 || lastStateIndex === -1) {
        console.log(`Resumption rule error.`);
        console.log(`Either ${task} or ${last_state} is not in the order array.`);
    }
    
    // Return true if last_state appears after task
    return lastStateIndex < taskIndex;
}

const quests_order = [
    "dd_start_instructions",
    "dd_task_start",
    "open_text_start_instructions",
    "open_text_task_start",
    "quests_start_instructions",
    "quests_start",
    "PHQ9_start",
    "GAD7_start",
    "WSAS_start",
    "ICECAP_start",
    "PVSS_start",
    "BADS_start",
    "hopelessness_start",
    "RRS_brooding_start",
    "PERS_negAct_start",
    "BFI_start"
]

const wm_order = [
    "ltm_start_instructions",
    "ltm_task_start",
    "wm_start_instructions",
    "wm_task_start",
    "dd_start_instructions",
    "dd_task_start",
    "open_text_start_instructions",
    "open_text_task_start"
]