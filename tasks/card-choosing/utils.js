import { 
  saveDataREDCap, 
  updateBonusState,
  canBeWarned,
  noChoiceWarning,
  kick_out,
  fullscreen_prompt,
  createPressBothTrial,
  updateState,
  isValidNumber,
  countOccurrences
} from '/core/utils/index.js'; // Adjust path as needed


// CONSTANTS
const STIMULI_PATH = '/assets/images/card-choosing/stimuli/';

const preload_assets = (settings) => {
            // Base coin images
            let images = [
                "1penny.png", "1pound.png", "50pence.png"
            ].map(s => `card-choosing/outcomes/${s}`);

            // Add broken coins if valence is "both" or "mixed"
            if (["both", "mixed"].includes(settings.valence)) {
                images.push(...["1pennybroken.png", "1poundbroken.png", "50pencebroken.png"].map(s => `card-choosing/outcomes/${s}`));
            }

            // Add key images according to n_choices
            if (settings.n_choices === 2) {
                images.push("2_finger_keys.jpg");
            } else if (settings.n_choices === 3) {
                images.push("3_finger_keys.jpg");
            }

            // Add PIT images if present_pavlovian is true
            if (settings.present_pavlovian) {
                images = images.concat([
                    "PIT1.png", "PIT2.png", "PIT3.png", "PIT4.png", "PIT5.png", "PIT6.png"
                ].map(s => `pavlovian-stims/${settings.session}/${s}`));
            }

            // Add any extra media assets
            if (Array.isArray(settings.extra_media_assets)) {
                images = images.concat(settings.extra_media_assets);
            }

            // Prefix all with assets/images/
            return images.map(s => `/assets/images/${s}`);
};

// UTILITY FUNCTIONS
/**
 * Get mapping of pavlovian image magnitudes to file paths
 * @returns {Object} Object mapping magnitude values to image paths
 */
function getPavlovianImages(settings) {
    let PIT_imgs = {
        0.01: "PIT3.png",
        1.0: "PIT1.png",
        0.5: "PIT2.png",
        "-0.01": "PIT4.png",
        "-1": "PIT6.png",
        "-0.5": "PIT5.png"
    };
    PIT_imgs = Object.fromEntries(Object.entries(PIT_imgs).map(([k, v]) => [k, "/assets/images/pavlovian-stims/" + settings.session + "/" + v]));
    return PIT_imgs;
}

/**
 * Adjust stimulus paths by prefixing with assets/images folder
 * @param {Array|null} structure - Trial structure containing stimulus paths
 * @param {string} folder - Folder name to prefix paths with
 * @returns {null|undefined} Returns null if structure is null, otherwise modifies in place
 */
function adjustStimuliPaths(structure, folder) {
    // Return null if null
    if (structure == null) {
        return null
    }
    
    // Adjust stimuli paths otherwise
    structure.forEach(block => {
        block.forEach(trial => {
            trial.stimulus_left = `/assets/images/${folder}/${trial.stimulus_left}`;
            trial.stimulus_right = `/assets/images/${folder}/${trial.stimulus_right}`;
        });
    });
}

// TRIAL COMPONENTS
// Message between blocks - saves data and shows outcome summary
const inter_block_msg = {
    type: jsPsychHtmlKeyboardResponse,
    choices: () => {

        // Determine response keys based on number of stimuli in last trial
        const n_stimuli = jsPsych.data.get().filter({ trial_type: "card-choosing" }).last(1).select("n_stimuli").values[0];

        return n_stimuli === 2 ? ['arrowright'] : ['arrowright', 'arrowleft', 'arrowup']
    },
    css_classes: ['instructions'],
    stimulus: interBlockStimulus,
    data: {
        trialphase: "card_choosing_inter_block",
    },
    on_start: () => {
        // Save progress and update bonus calculations
        saveDataREDCap();
        updateBonusState();
    },
    on_finish: () => { 
        // Reset early stop flag for next block
        window.skipThisBlock = false 
    }
}

/**
 * Create a test trial for post-learning phase
 * @param {string} task - Task name (e.g., 'pilt', 'wm')
 * @param {number} test_confidence_every - Show confidence rating every N trials
 * @returns {Object} jsPsych timeline object for test trial
 */
const testTrial = (task, test_confidence_every = 4) => {
    return {
        timeline: [
            kick_out,
            fullscreen_prompt,
            // Main test trial - no feedback given
            {
                type: jsPsychCardChoosing,
                stimulus_right: jsPsych.timelineVariable('stimulus_right'),
                stimulus_left: jsPsych.timelineVariable('stimulus_left'),
                stimulus_middle: '',
                feedback_left: jsPsych.timelineVariable('feedback_left'),
                feedback_right: jsPsych.timelineVariable('feedback_right'),
                feedback_middle: '',
                optimal_right: jsPsych.timelineVariable('optimal_right'),
                optimal_side: '',
                response_deadline: window.defaul_response_deadline,
                n_stimuli: 2,
                present_pavlovian: false,
                present_feedback: false,
                response_deadline: () => {
                
                    // Try to get custom deadline from timeline variables
                    let deadline_from_timeline;
                    try {
                        deadline_from_timeline = jsPsych.evaluateTimelineVariable('response_deadline') ?? null;
                    } catch (error) {
                        deadline_from_timeline = null;
                    }
                    // Return custom deadline if found
                    if (deadline_from_timeline !== null){
                        
                        return deadline_from_timeline
                    } 
    
                    // Use default deadlines based on warning eligibility
                    if (canBeWarned(`${task}_test`)){
                        return window.default_response_deadline
                    } else {
                        return window.default_long_response_deadline
                    }
                },
                show_warning: () => {
                    return canBeWarned(`${task}_test`)
                },    
                data: {
                    trialphase: `${task}_test`,
                    block: jsPsych.timelineVariable("block"),
                    trial: jsPsych.timelineVariable("trial"),
                    stimulus_left: jsPsych.timelineVariable("stimulus_left"),
                    stimulus_right: jsPsych.timelineVariable("stimulus_right"),
                    same_valence: jsPsych.timelineVariable("same_valence"),
                    same_block: jsPsych.timelineVariable("same_block"),
                    EV_left: jsPsych.timelineVariable("EV_left"),
                    EV_right: jsPsych.timelineVariable("EV_right"),
                    original_block_left: jsPsych.timelineVariable("original_block_left"),
                    original_block_right: jsPsych.timelineVariable("original_block_right"),
                },
                on_finish: function(data) {
                    // Track missed responses
                    if (data.response === "noresp") {
                        var up_to_now = parseInt(jsPsych.data.get().last(1).select('n_warnings').values);
                        jsPsych.data.addProperties({
                            n_warnings: up_to_now + 1
                        });
                    }

                    // Track deadline warnings for this specific test
                    if (data.response_deadline_warning) {
                        const up_to_now = parseInt(jsPsych.data.get().last(1).select(`${task}_test_n_warnings`).values);
                        jsPsych.data.addProperties({
                            [`${task}_test_n_warnings`]: up_to_now + 1
                        });
                    }
                 },
                post_trial_gap: () => {return (window.simulating || false) ? 50 : 600}
            },
            {
                // Confidence rating - only shown periodically
                timeline: [
                    {
                        type: jsPsychHtmlButtonResponse,
                        stimulus: `<p><strong><span class="highlight-txt">How confident are you that your last choice was correct?</span></strong></p>`,
                        choices: ["1<br>Not at all", "2", "3", "4", "5<br>Very confident"],
                        trial_duration: 10000,
                        post_trial_gap: () => {return (window.simulating || false) ? 50 : 800},                    
                        data: {
                            trialphase: "test-confidence"
                        },
                        on_finish: function (data) {
                            // Track missed confidence ratings
                            if (data.response === null) {
                              var up_to_now = parseInt(jsPsych.data.get().last(1).select('n_warnings').values);
                              console.log("n_warnings: " + up_to_now);
                              jsPsych.data.addProperties({
                                  n_warnings: up_to_now + 1
                              });
                            }
                         }
                    },
                    noChoiceWarning("response", "", task)
                ],
                conditional_function: () => {
                    // Only show confidence rating if response was made and it's time for rating
                    let missed = jsPsych.data.get().last(1).select("response").values[0] == null
    
                    let n_trials = jsPsych.data.get().filterCustom((trial) => /^[a-zA-Z]+_test$/.test(trial.trialphase)).count()
    
                    return !missed && ((n_trials % test_confidence_every) === (test_confidence_every - 1))
                }
            }
        ]
    };
}


/**
 * Create a card choosing trial for the main task
 * @param {string} task - Task name (e.g., 'pilt', 'wm')
 * @returns {Object} jsPsych timeline object for card choosing trial
 */
const cardChoosingTrial = (settings) => {
    return {
        timeline: [
            kick_out,
            fullscreen_prompt,
        {
            type: jsPsychCardChoosing,
            // Construct stimulus paths dynamically
            stimulus_right: () => STIMULI_PATH + jsPsych.evaluateTimelineVariable('stimulus_right'),
            stimulus_left: () => STIMULI_PATH + jsPsych.evaluateTimelineVariable('stimulus_left'),
            stimulus_middle: () => STIMULI_PATH + jsPsych.evaluateTimelineVariable('stimulus_middle'),
            feedback_left: jsPsych.timelineVariable('feedback_left'),
            feedback_right: jsPsych.timelineVariable('feedback_right'),
            feedback_middle: jsPsych.timelineVariable('feedback_middle'),
            optimal_right: jsPsych.timelineVariable('optimal_right'),
            optimal_side: jsPsych.timelineVariable('optimal_side'),
            response_deadline: () => {
                
                // Try to fetch deadline from timeline
                let deadline_from_timeline;
                try {
                    deadline_from_timeline = jsPsych.evaluateTimelineVariable('response_deadline') ?? null;
                } catch (error) {
                    deadline_from_timeline = null;
                }
                // Return if found
                if (deadline_from_timeline !== null){
                    
                    return deadline_from_timeline
                } 

                // Use defaults otherwise
                if (canBeWarned(settings.task_name)){
                    return window.default_response_deadline
                } else {
                    return window.default_long_response_deadline
                }
            },
            show_warning: () => {
                return canBeWarned(settings.task_name)
            },
            n_stimuli: jsPsych.timelineVariable('n_stimuli'),
            present_pavlovian: jsPsych.timelineVariable('present_pavlovian'),
            pavlovian_images: getPavlovianImages(settings),
            data: {
                trialphase: settings.task_name,
                block: jsPsych.timelineVariable('block'),
                trial: jsPsych.timelineVariable('trial'),
                stimulus_group: jsPsych.timelineVariable('stimulus_group'),
                stimulus_group_id: jsPsych.timelineVariable('stimulus_group_id'),
                valence: jsPsych.timelineVariable('valence'),
                n_groups: jsPsych.timelineVariable('n_groups'),
                rest: jsPsych.timelineVariable('rest'),
            },
            on_finish: function(data) {
                if (data.response === "noresp") {
                    var up_to_now = parseInt(jsPsych.data.get().last(1).select('n_warnings').values);
                    jsPsych.data.addProperties({
                        n_warnings: up_to_now + 1
                    });
                }

                if (data.response_deadline_warning) {
                    const up_to_now = parseInt(jsPsych.data.get().last(1).select(`${settings.task_name}_n_warnings`).values);
                    jsPsych.data.addProperties({
                        [`${settings.task_name}_n_warnings`]: up_to_now + 1
                    });
                }
            },
            post_trial_gap: () => {
                return (window.simulating || false) ? 50 : 400
            }
        }
        ],
        conditional_function: function () {

            // Only consider stopping if this is an early stop task, if this is not a practice block, and if there had been at least five previous trials
            if (jsPsych.evaluateTimelineVariable('early_stop') &&
                Number.isInteger(jsPsych.evaluateTimelineVariable('block')) &&
                jsPsych.evaluateTimelineVariable('trial') > 5
            ) {

                // Block number
                const block = jsPsych.data.get().last(1).select('block').values[0];

                // Find all sitmulus-pairs in block
                let unique_stimulus_pairs = [...new Set(jsPsych.data.get().filter({
                    trial_type: "PILT",
                    block: block
                }).select('stimulus_group').values)]

                // Initialize a variable to store the result
                let all_optimal = true;

                // Iterate over each unique stimulus_group and check the last 5 choices
                unique_stimulus_pairs.forEach(g => {

                    // Filter data for the current stimulus_group
                    let num_optimal = jsPsych.data.get().filter({
                        trial_type: "PILT",
                        block: block,
                        stimulus_group: g
                    }).last(5).select('response_optimal').sum();

                    // Check if all last 5 choices for this group are correct
                    if (num_optimal < 5) {
                        all_optimal = false;
                    }
                });

                if (all_optimal) {
                    window.skipThisBlock = true;
                }

                return !all_optimal
            } else {
                return true
            }

        }
    }
}


// BUILDING TASK FUNCTIONS
/**
 * Build timeline for post-learning test phase
 * @param {Array} structure - Test trial structure
 * @param {string} task_name - Task name (default: 'pilt')
 * @param {Object} settings - Settings object with test_confidence_every property
 * @returns {Array} Timeline array for test phase
 */
function buildPostLearningTest(structure, task_name = "pilt", settings = {test_confidence_every: 4}) {
    // Preload all test images upfront
    let test = [
        {
            type: jsPsychPreload,
            images: [
                ...new Set(structure.flat().flatMap(obj => [obj.stimulus_right, obj.stimulus_left]))
            ],
            post_trial_gap: 800,
            continue_after_error: true
        }
    ];

    // Add each test block to timeline
    for (let i = 0; i < structure.length; i++) {
        test.push({
            timeline: [
                testTrial(task_name, settings.test_confidence_every)
            ],
            timeline_variables: structure[i]
        });
    }

    return test
}

/**
 * Generate HTML stimulus for inter-block feedback display
 * @returns {string} HTML string showing coin outcomes and instructions
 */
function interBlockStimulus(){
    // Get data from last card choosing trial
    const last_trial = jsPsych.data.get().filter({trial_type: "card-choosing"}).last(1);

    // Valence of block
    const valence = last_trial.select("valence").values[0];
    
    // Block number for filtering
    const block = last_trial.select('block').values[0];

    // Number of pairs in block
    const n_groups = last_trial.select("n_groups").values[0]

    // Number of stimuli in block
    const n_stimuli = last_trial.select("n_stimuli").values[0];

    // Are there 50pence coins in the block?
    const feedbacks = jsPsych.data.get().filter({trial_type: "card-choosing", block: block}).select("feedback_right").values;
    const fifty = feedbacks.includes(0.5) || feedbacks.includes(-0.5);
    console.log(fifty)

    // Find chosen outcomes for block
    let chosen_outcomes = jsPsych.data.get().filter({trial_type: "card-choosing",
        block: block
    }).select('chosen_feedback').values;

    // Summarize into counts
    chosen_outcomes = countOccurrences(chosen_outcomes);

    // Initiate text
    let txt = ``

    // Add text and tallies for early stop
    if (window.skipThisBlock && window.task !== "screening"){
        
        txt += `<p>You've found the better ${n_groups > 1 ? "cards" : "card"}.</p><p>You will skip the remaining turns and `;
        
        txt += valence >= 0 ? `collect the remaining coins hidden under ` : 
            `lose only the remaining coins hidden under `;

        txt +=  n_groups > 1 ? "these cards." : "this card."
        
        if (valence != 0){
             txt += `<p>Altogether, these coins were ${valence == 1 ? "added to your safe" : "broken in your safe"} on this round:<p>`;
        }
       
        
        // Add rest to outcomes
        if (window.task !== "screening"){
            Object.keys(last_trial.select('rest').values[0]).forEach(key => {
                chosen_outcomes[key] += last_trial.select('rest').values[0][key];
            });
        }

    } else if (valence != 0) {
        // Show standard feedback for non-neutral valence blocks
        txt += `<p><img src='/assets/images/safe.png' style='width:100px; height:100px;'></p>
        <p>These coins ${isValidNumber(block) ? "were" : "would have been"} 
        ${valence == 1 ? "added to your safe" : "broken in your safe"} on this round:</p>`
    }

    // Display coin counts based on block valence
    if (valence == 1){

        txt += `<div style='display: grid'><table><tr>
            <td><img src='/assets/images/1pound.png' style='width:${small_coin_size}px; height:${small_coin_size}px;'></td>`
        
        if (fifty){
            txt +=  `<td><img src='/assets/images/50pence.png' style='width:${small_coin_size}px; height:${small_coin_size}px;'</td>`
        }
           
        txt += `<td><img src='/assets/images/1penny.png' style='width:${small_coin_size}px; height:${small_coin_size}px;'></td>
            </tr>
            <tr>
            <td>${isValidNumber(chosen_outcomes[1]) ? chosen_outcomes[1] : 0}</td>`;

        if (fifty) {
            txt += `<td>${isValidNumber(chosen_outcomes[0.5]) ? chosen_outcomes[0.5] : 0}</td>`
        }    
            
        txt += `<td>${isValidNumber(chosen_outcomes[0.01]) ? chosen_outcomes[0.01] : 0}</td>
            </tr></table></div>`;
    } else if (valence == -1) {
        txt += `<div style='display: grid'><table>
            <tr><td><img src='/assets/images/1poundbroken.png' style='width:${small_coin_size}px; height:${small_coin_size}px;'></td>`
            
        if (fifty){
            txt += `<td><img src='/assets/images/50pencebroken.png' style='width:${small_coin_size}px; height:${small_coin_size}px;'</td>`;
        }
            
        txt += `<td><img src='/assets/images/1pennybroken.png' style='width:${small_coin_size}px; height:${small_coin_size}px;'></td>
            </tr>
            <tr>
            <td>${isValidNumber(chosen_outcomes[-1]) ? chosen_outcomes[-1] : 0}</td>`

        if (fifty){
            txt += `<td>${isValidNumber(chosen_outcomes[-0.5]) ? chosen_outcomes[-0.5] : 0}</td>`;
        }
            
        txt += `<td>${isValidNumber(chosen_outcomes[-0.01]) ? chosen_outcomes[-0.01] : 0}</td>
            </tr></table></div>`;
    } else {
        // Calculate and display total earnings for neutral blocks
        const earnings = Object.entries(chosen_outcomes).reduce((sum, [value, count]) => {
            // Convert string keys to numbers explicitly for reliable calculation
            return sum + (Number(value) * count);
        }, 0);

        txt += `<p>Altogether on this round, you've ${earnings >= 0 ? "collected" : "lost"} coins worth £${Math.abs(earnings).toFixed(2)}.</p>`;
        
    }

    // Add continuation instructions based on number of stimuli
    if (isValidNumber(block)){
        txt += n_stimuli === 2 ? `<p>Press the right arrow to continue.</p>` :
         `<p>Place your fingers on the left, right, and up arrow keys, and press either one to continue.</p>`
    }

    return txt
}

/**
 * Build timeline for main card choosing task
 * @param {Array} structure - Task structure with blocks and trials
 * @param {boolean} insert_msg - Whether to insert inter-block messages
 * @param {string} task_name - Task name (default: 'pilt')
 * @returns {Array} Timeline array for main task
 */
function buildCardChoosingTask(structure, insert_msg = true, settings = {task_name: "pilt"}) {
    let card_choosing_task = [];
    
    for (let i = 0; i < structure.length; i++) {

        // Log block addition for debugging
        console.log(`Adding block ${structure[i][0]["block"]} of ${settings.task_name} to the timeline.`);

        // Extract unique images for preloading
        let preload_images = structure[i].flatMap(item => [item.stimulus_right, item.stimulus_left]);
        preload_images = [...new Set(preload_images)].map(value => `assets/images/card-choosing/stimuli//${value}`);

        // Extract block properties
        const valence = structure[i][0]["valence"];
        const n_stimuli = structure[i][0]["n_stimuli"];
        const block_number = structure[i][0]["block"];

        // Initialize block with preloading
        let block = [
            {
                type: jsPsychPreload,
                images: preload_images,
                post_trial_gap: 800,
                continue_after_error: true
            }
        ];

        // Add pre-block instructions for numbered blocks
        if (isValidNumber(block_number) & settings.task_name === "pilt" && (settings.session !== "screening")){
            block.push(
                createPressBothTrial(
                    `
                        <h3>Round ${i + 1} out of ${structure.length}</h3>` +
                        (valence != 0 ? `<p>On the next round you will play to <b>${valence > 0 ? "win" : "avoid losing"} coins</b>.<p>` : "") + 
                       ( n_stimuli === 2 ? `<p>Place your fingers on the left and right arrow keys, and <b>press both</b> to continue.</p>` :
                        `<p>Place your fingers on the left, right, and up arrow keys, and press either one to continue.</p>`),
                    "pre_block"
                )
            )
        }
        
        // Add main block trials
        block.push(
            {
                timeline: [
                    cardChoosingTrial(settings)
                ],
                timeline_variables: structure[i],
                // Set state tracking on block start
                on_start: (i === (structure.length - 1)) ? () => {
                    // Handle last block specially
                    const block = jsPsych.evaluateTimelineVariable('block');

                    if ((jsPsych.evaluateTimelineVariable('trial') == 1) && (typeof block === "number")){
                        updateState(`${settings.task_name}_block_${block}_start`)
                        updateState(`${settings.task_name}_last_block_start`)
                    }
                } : () => {
                    // Standard block start tracking
                    const block = jsPsych.evaluateTimelineVariable('block');

                    if ((jsPsych.evaluateTimelineVariable('trial') == 1) && (typeof block === "number")){
                        updateState(`${settings.task_name}_block_${block}_start`)
                    }
                }
            }
        );
        
        // Add inter-block message if requested
        if (insert_msg) {
            block.push(inter_block_msg);
        }

        card_choosing_task = card_choosing_task.concat(block)
    }

    console.log(`Built card choosing task with ${card_choosing_task.length} trials.`);
    return card_choosing_task
}


export { 
    preload_assets,
    getPavlovianImages,
    adjustStimuliPaths,
    inter_block_msg,
    testTrial,
    cardChoosingTrial,
    buildPostLearningTest,
    interBlockStimulus,
    buildCardChoosingTask
 };