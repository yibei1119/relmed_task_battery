// This files creates the jsPsych timeline for the reversal task block

import { 
    createPreloadTrial, 
    createPressBothTrial, 
    kick_out, 
    fullscreen_prompt, 
    canBeWarned, 
    updateState, 
    updateBonusState, 
    saveDataREDCap } from "/core/utils/index.js"

// First preload for task
const reversal_preload = createPreloadTrial(
    [
        "/reversal/squirrels_empty.png",
        "/reversal/squirrels_bg.png",
        "/reversal/squirrels_fg.png",
        "/reversal/1penny.png",
        "/reversal/1pound.png",
        "2_finger_keys.jpg"
    ].map(img => `/assets/images/${img}`),
    "reversal"
);

function generateReversalBlocks(settings) {

    // Parse json sequence
    let reversal_timeline = JSON.parse(reversal_json);

    // Remove blocks and trials from the timeline if this is a resumption
    if (window.last_state && window.last_state.includes("reversal_block_")) {
        const last_block = parseInt(window.last_state.split("_")[2]) - 1;
        const last_trial = parseInt(window.last_state.split("_")[4]);

        // Remove blocks before the last one
        reversal_timeline = reversal_timeline.slice(last_block);
        
        // Remove trials before the last one
        reversal_timeline[0] = reversal_timeline[0].slice(last_trial);
    }
    
    
    // Assemble list of blocks
    var reversal_blocks = [
    ];
    for (let i=0; i<reversal_timeline.length; i++){
        reversal_blocks.push([
            {
                timeline: [
                    {
                        timeline: [
                            kick_out,
                            fullscreen_prompt,
                            {
                                type: jsPsychReversal,
                                feedback_right: jsPsych.timelineVariable('feedback_right'),
                                feedback_left: jsPsych.timelineVariable('feedback_left'),
                                optimal_right: jsPsych.timelineVariable('optimal_right'),
                                response_deadline: () => {
                                    if (canBeWarned(settings)){
                                        // console.log(window.default_response_deadline)
                                        return window.default_response_deadline
                                    } else {
                                        // console.log(window.default_long_response_deadline)
                                        return window.default_long_response_deadline
                                    }
                                },
                                show_warning: () => {
                                    return canBeWarned(settings)
                                },
                                on_finish: (data) => {
                                    const trial_number = jsPsych.data.get().last(1).select('trial').values[0];
                                    const block_number = jsPsych.data.get().last(1).select('block').values[0];

                                    updateState(`reversal_block_${block_number}_trial_${trial_number}`, false)

                                    updateBonusState(settings);

                                    const n_trials = jsPsych.data.get().filter({trial_type: "reversal"}).count()
                                    
                                    if (n_trials % 40 == 0) {
                                        saveDataREDCap(3);
                                    }

                                                            console.log(data);
                                    if (data.response === null) {
                                        const up_to_now = parseInt(jsPsych.data.get().last(1).select('n_warnings').values);
                                        jsPsych.data.addProperties({
                                            n_warnings: up_to_now + 1
                                        });
                                    }

                                    console.log(data.response_deadline_warning);    
                                    if (data.response_deadline_warning) {
                                        const up_to_now = parseInt(jsPsych.data.get().last(1).select('reversal_n_warnings').values);
                                        jsPsych.data.addProperties({
                                            reversal_n_warnings: up_to_now + 1
                                        });
                                    }

                                },
                            }
                        ],
                        conditional_function: () => {

                            // Check whether participants are up to crtierion
                            const criterion = jsPsych.evaluateTimelineVariable('criterion');

                            let num_correct = jsPsych.data.get()
                                .filter({block: jsPsych.evaluateTimelineVariable('block'), trial_type: 'reversal'})
                                .select('response_optimal').sum()

                            // Check whether trial limit reached
                            let n_trials = jsPsych.data.get()
                            .filter({trial_type: 'reversal'})
                            .count()
                            
                            return (n_trials < settings.n_trials) && (num_correct < criterion)
                    },
                }
                ],
                timeline_variables: reversal_timeline[i],
                data: {
                    block: jsPsych.timelineVariable('block'),
                    trial: jsPsych.timelineVariable('trial'),
                    trialphase: "reversal"
                }
            }
        ]);
    }

    return reversal_blocks;
}


// Reversal instructions
function reversalInstructions(settings) {
    return [
        {
            type: jsPsychInstructions,
            css_classes: ['instructions'],
            pages: [
                `${window.session !== "screening" ? "<p>Let's start with the first game!</p>" : ""}
                <p>Next, you will meet two friendly squirrels, each with a bag of coins to share. 
                Use the arrow keys to choose either the left or right squirrel. 
                The squirrel you pick will give you a coin to add to your safe.</p>`,
                `<p>One squirrel has higher-value coins, and the other has lower-value coins. 
                But every few turns they secretly switch bags.</p>
                <p>Your goal is to figure out which squirrel has the better coins and collect as many high-value ones as possible.<p>`
            ],
            show_clickable_nav: true,
            data: {trialphase: "reversal_instruction"},
            on_start: () => {
                updateState(`reversal_instructions_start`)
            },
            on_finish: () => {
                if (window.session !== "screening") {
                    updateState(`no_resume_10_minutes`)
                }
                updateState(`reversal_task_start`)    
            }
        },
        createPressBothTrial(`
            <p>You will now play the squirrel game for about ${settings.n_trials == 50 ? "three" : "five"} minutes without breaks.</p>
            <p>When you're ready, place your fingers comfortably on the <strong>left and right arrow keys</strong> as shown below. Press down <strong> both left and right arrow keys at the same time </strong> to begin.</p>
            <img src='/assets/images/2_finger_keys.jpg' style='width:250px;'></img>`,
            "reversal_instruction"
        )
    ]
} 

const computeRelativeReversalBonus = () => {

    const reversal_data = jsPsych.data.get().filter({trial_type: "reversal"});

    const n_trials = reversal_data.values().length;

    // Compute maximal possible earnings
    const max_sum = n_trials; // Best and luckiest participant gets one pound on every trial

    const min_sum = n_trials * 0.01; // Worst and most unfortunate participant gets one penny on every trial

    // Compute the actual sum of coins
    const earned_sum = reversal_data.select("chosen_feedback").sum();

    return {
        earned: earned_sum, 
        min: min_sum, 
        max: max_sum
    }
}

function createReversalTimeline(settings) {
    
    let procedure = [];
    
    // Preload
    procedure.push(reversal_preload);
    
    // Add reversal timeline
    procedure = procedure.concat(reversalInstructions(settings));
    procedure = procedure.concat(generateReversalBlocks(settings));
    
    return procedure;
}

export { createReversalTimeline, computeRelativeReversalBonus }