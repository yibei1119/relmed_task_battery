// tasks/card_choosing.js
import { card_choosing_instructions } from './card_choosing_instructions.js';
import jsPsychPreload from '@jspsych/plugin-preload';
import jsPsychHtmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';
import jsPsychHtmlButtonResponse from '@jspsych/plugin-html-button-response';
import jsPsychCardChoosing from './plugin-card-choosing.js'; 
import { 
  postToParent, 
  saveDataREDCap, 
  updateBonusState,
  can_be_warned,
  noChoiceWarning,
  kick_out,
  fullscreen_prompt,
  createPressBothTrial,
  updateState,
  isValidNumber,
  computeBestRest
} from '../utils/index.js'; // Adjust path as needed

// CONSTANTS AND PRELOAD
const preload_card_choosing = {
    type: jsPsychPreload,
    images: (() => {
        // Base coin images
        let images = [
            "1penny.png", "1pound.png", "50pence.png", "safe.png"
        ];

        // Add broken coins if valence is "both" or "mixed"
        if (["both", "mixed"].includes(settings.valence)) {
            images.push("1pennybroken.png", "1poundbroken.png", "50pencebroken.png").map(s => `card_chosing/outcomes/${s}`);
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
            ].map(s => `pavlovian_stims/${window.session}/${s}`));
        }

        // Add any extra media assets
        if (Array.isArray(settings.extra_media_assets)) {
            images = images.concat(settings.extra_media_assets);
        }

        // Prefix all with assets/images/
        return images.map(s => `assets/images/${s}`);
    })(),
    post_trial_gap: 800,
    data: {
        trialphase: "preload_card_choosing"
    },
    on_start: () => {
        console.log("load_successful");
        postToParent({ message: "load_successful" });
    },
    continue_after_error: true
};

// UTILITY FUNCTIONS
function getPavlovianImages() {
    let PIT_imgs = {
        0.01: "PIT3.png",
        1.0: "PIT1.png",
        0.5: "PIT2.png",
        "-0.01": "PIT4.png",
        "-1": "PIT6.png",
        "-0.5": "PIT5.png"
    };
    PIT_imgs = Object.fromEntries(Object.entries(PIT_imgs).map(([k, v]) => [k, "assets/images/pavlovian_stims/" + window.session + "/" + v]));
    return PIT_imgs;
}

function adjustStimuliPaths(structure, folder) {
    // Return null if null
    if (structure == null) {
        return null
    }
    
    // Adjust stimuli paths otherwise
    structure.forEach(block => {
        block.forEach(trial => {
            trial.stimulus_left = `assets/images/${folder}/${trial.stimulus_left}`;
            trial.stimulus_right = `assets/images/${folder}/${trial.stimulus_right}`;
        });
    });
}

function interBlockStimulus(){

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
        txt += `<p><img src='imgs/safe.png' style='width:100px; height:100px;'></p>
        <p>These coins ${isValidNumber(block) ? "were" : "would have been"} 
        ${valence == 1 ? "added to your safe" : "broken in your safe"} on this round:</p>`
    }

    if (valence == 1){

        txt += `<div style='display: grid'><table><tr>
            <td><img src='imgs/1pound.png' style='width:${small_coin_size}px; height:${small_coin_size}px;'></td>`
        
        if (fifty){
            txt +=  `<td><img src='imgs/50pence.png' style='width:${small_coin_size}px; height:${small_coin_size}px;'</td>`
        }
           
        txt += `<td><img src='imgs/1penny.png' style='width:${small_coin_size}px; height:${small_coin_size}px;'></td>
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
            <tr><td><img src='imgs/1poundbroken.png' style='width:${small_coin_size}px; height:${small_coin_size}px;'></td>`
            
        if (fifty){
            txt += `<td><img src='imgs/50pencebroken.png' style='width:${small_coin_size}px; height:${small_coin_size}px;'</td>`;
        }
            
        txt += `<td><img src='imgs/1pennybroken.png' style='width:${small_coin_size}px; height:${small_coin_size}px;'></td>
            </tr>
            <tr>
            <td>${isValidNumber(chosen_outcomes[-1]) ? chosen_outcomes[-1] : 0}</td>`

        if (fifty){
            txt += `<td>${isValidNumber(chosen_outcomes[-0.5]) ? chosen_outcomes[-0.5] : 0}</td>`;
        }
            
        txt += `<td>${isValidNumber(chosen_outcomes[-0.01]) ? chosen_outcomes[-0.01] : 0}</td>
            </tr></table></div>`;
    } else {
        const earnings = Object.entries(chosen_outcomes).reduce((sum, [value, count]) => {
            // Convert string keys to numbers explicitly for reliable calculation
            return sum + (Number(value) * count);
        }, 0);

        txt += `<p>Altogether on this round, you've ${earnings >= 0 ? "collected" : "lost"} coins worth £${Math.abs(earnings).toFixed(2)}.</p>`;
        
    }

    if (isValidNumber(block)){
        txt += n_stimuli === 2 ? `<p>Press the right arrow to continue.</p>` :
         `<p>Place your fingers on the left, right, and up arrow keys, and press either one to continue.</p>`
    }

    return txt
}

// TRIAL COMPONENTS
// Message between blocks
const inter_block_msg = {
    type: jsPsychHtmlKeyboardResponse,
    choices: () => {

        const n_stimuli = jsPsych.data.get().filter({ trial_type: "card-choosing" }).last(1).select("n_stimuli").values[0];

        return n_stimuli === 2 ? ['arrowright'] : ['arrowright', 'arrowleft', 'arrowup']
    },
    css_classes: ['instructions'],
    stimulus: interBlockStimulus,
    data: {
        trialphase: "card_choosing_inter_block",
    },
    on_start: () => {
        saveDataREDCap();
        updateBonusState();
    },
    on_finish: () => { window.skipThisBlock = false }
}

// Trial for post-learning test phase at notional extinction
const testTrial = (task, test_confidence_every = 4) => {
    return {
        timeline: [
            kick_out,
            fullscreen_prompt,
            // Test trial
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
                    if (can_be_warned(`${task}_test`)){
                        return window.default_response_deadline
                    } else {
                        return window.default_long_response_deadline
                    }
                },
                show_warning: () => {
                    return can_be_warned(`${task}_test`)
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
                    if (data.response === "noresp") {
                        var up_to_now = parseInt(jsPsych.data.get().last(1).select('n_warnings').values);
                        jsPsych.data.addProperties({
                            n_warnings: up_to_now + 1
                        });
                    }

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
                    let missed = jsPsych.data.get().last(1).select("response").values[0] == null
    
                    let n_trials = jsPsych.data.get().filterCustom((trial) => /^[a-zA-Z]+_test$/.test(trial.trialphase)).count()
    
                    return !missed && ((n_trials % test_confidence_every) === (test_confidence_every - 1))
                }
            }
        ]
    };
}
    

// BUILDING TASK FUNCTIONS
// Build post-learning test phase block
function buildPostLearningTest(structure, task_name = "pilt", settings = {test_confidence_every: 4}) {

    // Preload images
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

    // Push blocks from structure
    for (let i = 0; i < structure.length; i++) {

        // Push block                
        test.push({
            timeline: [
                testTrial(task_name, settings.test_confidence_every)
            ],
            timeline_variables: structure[i]
        });
    }

    return test
}

// Build card-choosing task block
function buildCardChoosingTask(structure, insert_msg = true, task_name = "pilt") {

    let card_choosing_task = [];
    for (let i = 0; i < structure.length; i++) {

        // Skip this block if task is pilt, and was relaunched
        if (task_name === "pilt"){
            // Extract the block number from the state string
            const state_match = window.last_state.match(new RegExp(`${task_name}_block_(\\d+)_start`));

            if (state_match){
                const last_block = parseInt(state_match[1]);
                const this_block = structure[i][0]["block"];

                if (typeof this_block === "number" && this_block <= last_block){
                    continue;
                }
            }
        }

        // Print adding block
        console.log(`Adding block ${structure[i][0]["block"]} of ${task_name} to the timeline.`);

        // Get list of unique images in block to preload
        let preload_images = structure[i].flatMap(item => [item.stimulus_right, item.stimulus_left]);
        preload_images = [...new Set(preload_images)].map(value => `assets/images/card_choosing/stimuli/${value}`);

        // Get valence for the block
        const valence = structure[i][0]["valence"];

        // Get n_stimuli for this block
        const n_stimuli = structure[i][0]["n_stimuli"];

        // Get block number
        const block_number = structure[i][0]["block"];

        // Build block
        block = [
            {
                type: jsPsychPreload,
                images: preload_images,
                post_trial_gap: 800,
                continue_after_error: true
            }
        ];

        if (isValidNumber(block_number) & task_name === "pilt" && (window.session !== "screening")){
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
            
        block.push(
            {
                timeline: [
                    cardChoosingTrial(task_name)
                ],
                timeline_variables: structure[i],
                on_start: (i === (structure.length - 1)) ? () => {

                    const block = jsPsych.evaluateTimelineVariable('block');

                    if ((jsPsych.evaluateTimelineVariable('trial') == 1) && (typeof block === "number")){
                        updateState(`${task_name}_block_${block}_start`)

                        // Add last block message
                        updateState(`${task_name}_last_block_start`)
                    }
                } : () => {

                    const block = jsPsych.evaluateTimelineVariable('block');

                    if ((jsPsych.evaluateTimelineVariable('trial') == 1) && (typeof block === "number")){
                        updateState(`${task_name}_block_${block}_start`)
                    }
                }
            }
        );
        
        // Add message
        if (insert_msg) {
            block.push(inter_block_msg);
        }

        card_choosing_task = card_choosing_task.concat(block)
    }

    return card_choosing_task
}


// MAIN EXPORT FUNCTIONS
export function runCardChoosing(settings) {
  let timeline = [];
  
  // Parse json sequence based on task_name
  let structure, instructions;
  if (settings.task_name === "pilt") {
    structure = typeof PILT_json !== "undefined" ? JSON.parse(PILT_json) : null;
    instructions = prepare_PILT_instructions();
  } else if (settings.task_name === "wm") {
    structure = typeof WM_json !== "undefined" ? JSON.parse(WM_json) : null;
    instructions = WM_instructions;
  } else {
    return timeline; // Return empty timeline for unknown task
  }

  // Compute best-rest
  if (structure != null) {
    computeBestRest(structure);
  }

  // Add instructions
  timeline = timeline.concat(instructions);

  // Add task blocks
  if (structure != null) {
    let task_blocks = buildCardChoosingTask(structure, true, settings.task_name);
    if (task_blocks.length === 0) {
      console.log("No blocks to add");
      timeline = [];
    } else {
      // Set on_start for first block
      if (settings.task_name === "pilt") {
        task_blocks[0]["on_start"] = () => {
          updateState("pilt_task_start");
        };
      } else if (settings.task_name === "wm") {
        task_blocks[0]["on_start"] = () => {
          if (!(["wk24", "wk28"].includes(window.session))) {
            updateState("no_resume_10_minutes");
          }
          updateState("wm_task_start");
        };
      }
      timeline = timeline.concat(task_blocks);
    }
  } else {
    timeline = [];
  }
  
  return timeline;
}

export function runPostLearningTest(settings) {
  let timeline = [];
  
  // Parse json sequence based on task_name
  let test_structure;
  if (settings.task_name === "pilt") {
    test_structure = typeof PILT_test_json !== "undefined" ? JSON.parse(PILT_test_json) : null;
    let pav_test_structure = typeof pav_test_json !== "undefined" ? JSON.parse(pav_test_json) : null;
    
    // Adjust stimuli paths
    adjustStimuliPaths(test_structure, 'card_choosing/stimuli');
    
    // Process pavlovian test structure
    if (pav_test_structure) {
      pav_test_structure.forEach(trial => {
        trial.stimulus_left = `assets/images/pavlovian_stims/${window.session}/${trial.stimulus_left}`;
        trial.stimulus_right = `assets/images/pavlovian_stims/${window.session}/${trial.stimulus_right}`;
        trial.block = "pavlovian";
        trial.feedback_left = trial.magnitude_left;
        trial.feedback_right = trial.magnitude_right;
        trial.EV_left = trial.magnitude_left;
        trial.EV_right = trial.magnitude_right;
        trial.optimal_right = trial.magnitude_right > trial.magnitude_left;
      });
      
      if (!window.demo) {
        test_structure = [pav_test_structure].concat(test_structure);
      }
    }
  } else if (settings.task_name === "wm") {
    test_structure = typeof WM_test_json !== "undefined" ? JSON.parse(WM_test_json) : null;
    adjustStimuliPaths(test_structure, 'card_choosing/stimuli');
  } else {
    return timeline; // Return empty timeline for unknown task
  }

  // Generate test procedure
  if ((test_structure != null) && (test_structure.length == 1 || test_structure[1] != null)) {
    timeline.push(test_instructions(settings.task_name));
    let test_blocks = buildPostLearningTest(test_structure, settings.task_name, settings);
    test_blocks[0]["on_start"] = () => {
      updateState(`${settings.task_name}_test_task_start`);
    };
    timeline = timeline.concat(test_blocks);
  }

  return timeline;
}


export const computeRelativeCardChoosingBonus = () => {

    // Compute lowest and highest sum of coins possible to earn
    // Get all relevant trials: card choosing plugin, and numeric block
    const trials = jsPsych.data.get().filter({trial_type: "card_choosing"}).filterCustom((trial) => {return typeof trial["block"] === "number"}).values();

    let max_sum = 0;
    let min_sum = 0;

    trials.forEach(trial => {
        let feedbacks = [];
        if (trial.n_stimuli === 2) {
            feedbacks = [trial.feedback_left, trial.feedback_right];
        } else if (trial.n_stimuli !== 2) {
            feedbacks = [trial.feedback_left, trial.feedback_right, trial.feedback_middle];
        }
        // Only consider numeric feedbacks
        feedbacks = feedbacks.filter(f => typeof f === "number" && !isNaN(f));
        if (feedbacks.length > 0) {
            max_sum += Math.max(...feedbacks);
            min_sum += Math.min(...feedbacks);
        }
    });

    // Compute the actual sum of coins
    const earned_sum = jsPsych.data.get().filter({trial_type: "card-choosing"}).filterCustom((trial) => {return typeof trial["block"] === "number"}).select("chosen_feedback").sum();

    return {
        earned: earned_sum, 
        min: min_sum, 
        max: max_sum
    }
}