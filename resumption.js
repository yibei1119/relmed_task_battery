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
    "dd_instructions_start",
    "dd_task_start",
    "open_text_instructions_start",
    "open_text_task_start",
    "quests_instructions_start",
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
    "wm_instructions_start",
    "wm_task_start",
    "wm_block_1_start",
    "wm_test_instructions_start",
    "wm_test_task_start",
    "dd_instructions_start",
    "dd_task_start",
    "open_text_instructions_start",
    "open_text_task_start",
    "bonus_trial_end"
]

let pilt_to_test_order = [
    "prepilt_conditioning_start",
    "pavlovian_lottery_last",
    "pilt_instructions_start",
    "pilt_task_start"];

for (i=1; i<=20; i++){
    pilt_to_test_order.push(`pilt_block_${i}_start`);
}

pilt_to_test_order = pilt_to_test_order.concat([
    "pilt_last_block_start",
    "vigour_instructions_start",
    "vigour_task_start",
    "pit_instructions_start",
    "pit_task_start",
    `vigour_test_task_start`,
    "pilt_test_instructions_start",
    "pilt_test_task_start",
    "bonus_trial_end"
]);

const screening_order = [
    "max_press_rate_start",
    "max_press_rate_end",
    "pilt_instructions_start",
    "pilt_task_start",
    "pilt_block_1_start",
    "pilt_last_block_start",
    "control_task_start",
    "reversal_instructions_start",
    "reversal_task_start",
].concat(quests_order);