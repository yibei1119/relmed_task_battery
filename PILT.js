// Function setting up PILT blocks
window.pilt_test_confidence_every = 4;

window.skipThisBlock = false;

// First preload for task
const preload_PILT = {
    type: jsPsychPreload,
    images: [
        [
            "1penny.png", "1pennybroken.png",
            "1pound.png", "1poundbroken.png",
            "50pence.png", "50pencebroken.png",
            "safe.png","PILT_keys.jpg"
        ].map(s => "imgs/" + s),
        window.session === "screening" ? [] : [
            "PIT1.png", "PIT2.png", "PIT3.png", "PIT4.png", "PIT5.png", "PIT6.png"
        ].map(s => "imgs/Pav_stims/" + window.session + "/" + s)
    ],
    post_trial_gap: 800,
    data: {
        trialphase: "preload_PILT"
    },
    on_finish: () => {

        // Report to tests
        console.log("load_successful")

        // Report to relmed.ac.uk
        postToParent({message: "load_successful"})
    }
}

const preload_wm_ltm = {
    type: jsPsychPreload,
    images: [
        "1penny.png", 
        "1pound.png", 
        "50pence.png",
        "safe.png", "WM_keys.jpg"
    ].map(s => "imgs/" + s),
    post_trial_gap: 800,
    data: {
        trialphase: "preload_WM_LTM"
    },
    on_finish: () => {

        // Report to tests
        console.log("load_successful")

        // Report to relmed.ac.uk
        postToParent({message: "load_successful"})
    }
}


// Message between blocks
const inter_block_msg = {
    type: jsPsychHtmlKeyboardResponse,
    choices: () => {

        const n_stimuli = jsPsych.data.get().filter({ trial_type: "PILT" }).last(1).select("n_stimuli").values[0];

        return n_stimuli === 2 ? ['arrowright', 'arrowleft'] : ['arrowright', 'arrowleft', 'arrowup']
    },
    css_classes: ['instructions'],
    stimulus: inter_block_stimulus,
    data: {
        trialphase: "pilt_inter_block",
    },
    on_start: saveDataREDCap,
    on_finish: () => { window.skipThisBlock = false }
}

// Post-PILT test trial
const id_from_stimulus = () => {
    const is_pit = jsPsych.evaluateTimelineVariable('stimulus_left').includes("PIT");

    return is_pit ? "imgPIT" : "imgPILT"
}

const test_trial = (task) => {
    return {
        timeline: [
            kick_out,
            fullscreen_prompt,
            // Test trial
            {
                type: jsPsychPILT,
                stimulus_right: jsPsych.timelineVariable('stimulus_right'),
                stimulus_left: jsPsych.timelineVariable('stimulus_left'),
                stimulus_middle: '',
                feedback_left: jsPsych.timelineVariable('feedback_left'),
                feedback_right: jsPsych.timelineVariable('feedback_right'),
                feedback_middle: '',
                optimal_right: false,
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
                    magnitude_left: jsPsych.timelineVariable("magnitude_left"),
                    magnitude_right: jsPsych.timelineVariable("magnitude_right"),
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
                post_trial_gap: 600
            },
            {
                timeline: [
                    {
                        type: jsPsychHtmlButtonResponse,
                        stimulus: `<p><strong><span class="highlight-txt">How confident are you that your last choice was correct?</span></strong></p>`,
                        choices: ["1<br>Not at all", "2", "3", "4", "5<br>Very confident"],
                        trial_duration: 10000,
                        post_trial_gap: 800,                    
                        data: {
                            trialphase: "pilt_confidence"
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
                    noChoiceWarning("response")
                ],
                conditional_function: () => {
                    let missed = jsPsych.data.get().last(1).select("response").values[0] == null
    
                    let n_trials = jsPsych.data.get().filterCustom((trial) => /^[a-zA-Z]+_test$/.test(trial.trialphase)).count()
    
                    return !missed && ((n_trials % window.pilt_test_confidence_every) === (window.pilt_test_confidence_every - 1))
                }
            }
        ]
    };
}
    

// Post-PILT test confidence trial

// Build post_PILT test block
function build_post_PILT_test(structure, task_name = "pilt") {

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
                test_trial(task_name)
            ],
            timeline_variables: structure[i]
        });
    }

    return test
}


// PILT trial
const pavlovian_images_f = () => {
    let PIT_imgs = {
        0.01: "PIT3.png",
        1.0: "PIT1.png",
        0.5: "PIT2.png",
        "-0.01": "PIT4.png",
        "-1": "PIT6.png",
        "-0.5": "PIT5.png"
    };
    PIT_imgs = Object.fromEntries(Object.entries(PIT_imgs).map(([k, v]) => [k, "Pav_stims/" + window.session + "/" + v]));
    return PIT_imgs;
};

const PILT_trial = (task) => {
    return {
        timeline: [
            kick_out,
            fullscreen_prompt,
        {
            type: jsPsychPILT,
            stimulus_right: () => 'imgs/PILT_stims/'+ jsPsych.evaluateTimelineVariable('stimulus_right'),
            stimulus_left: () => 'imgs/PILT_stims/'+ jsPsych.evaluateTimelineVariable('stimulus_left'),
            stimulus_middle: () => 'imgs/PILT_stims/'+ jsPsych.evaluateTimelineVariable('stimulus_middle'),
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
                if (can_be_warned(task)){
                    return window.default_response_deadline
                } else {
                    return window.default_long_response_deadline
                }
            },
            show_warning: () => {
                return can_be_warned(task)
            },
            n_stimuli: jsPsych.timelineVariable('n_stimuli'),
            present_pavlovian: jsPsych.timelineVariable('present_pavlovian'),
            pavlovian_images: pavlovian_images_f(),
            data: {
                trialphase: task,
                block: jsPsych.timelineVariable('block'),
                trial: jsPsych.timelineVariable('trial'),
                stimulus_group: jsPsych.timelineVariable('stimulus_group'),
                stimulus_group_id: jsPsych.timelineVariable('stimulus_group_id'),
                valence: jsPsych.timelineVariable('valence'),
                n_groups: jsPsych.timelineVariable('n_groups'),
                rest_1pound: jsPsych.timelineVariable('rest_1pound'),
                rest_50pence: jsPsych.timelineVariable('rest_50pence'),
                rest_1penny: jsPsych.timelineVariable('rest_1penny')
            },
            on_finish: function(data) {
                if (data.response === "noresp") {
                    var up_to_now = parseInt(jsPsych.data.get().last(1).select('n_warnings').values);
                    jsPsych.data.addProperties({
                        n_warnings: up_to_now + 1
                    });
                }

                if (data.response_deadline_warning) {
                    const up_to_now = parseInt(jsPsych.data.get().last(1).select(`${task}_n_warnings`).values);
                    jsPsych.data.addProperties({
                        [`${task}_n_warnings`]: up_to_now + 1
                    });
                }
            },
            post_trial_gap: 400
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

// Coin lottery trial
const coin_lottery = {
    type: jsPsychCoinLottery,
    coins: () => {

        // Get the updates safe
        const updated_safe = updateSafeFrequencies();

        // Compute the coin proportions
        const coin_proportions = calculateProportions(updated_safe);

        return createProportionalArray(coin_proportions, 35).sort()
    },
    props: () => {

        // Get the updates safe
        const updated_safe = updateSafeFrequencies();

        // Compute the coin proportions
        let raw_props = calculateProportions(updated_safe);

        raw_props = [raw_props[0.01], raw_props[0.5], raw_props[1], raw_props["-0.01"], raw_props["-0.5"], raw_props["-1"]]

        const prior = [0.1, 0.3, 0.5, 0.1 / 3, 0.1 / 3, 0.1 / 3];

        // Take weighted average
        const weight_data = 0.6;

        let weightedSum = raw_props.map((value, index) => {
            return (value * weight_data) + (prior[index] * (1 - weight_data));
        });

        // Normalize and return
        let sum = weightedSum.reduce((acc, value) => acc + value, 0);
        return weightedSum.map(value => value / sum);
    },
    on_finish: (data) => {
        const bonus = data.outcomes.reduce((acc, num) => acc + num, 0);

        postToParent({bonus: bonus});

        updateState("coin_lottery_end");
    }
}

// Build PILT task block
function build_PILT_task(structure, insert_msg = true, task_name = "pilt") {

    let PILT_task = [];
    for (let i = 0; i < structure.length; i++) {

        // Skip this block if task is pilt, and was relaunched
        if (task_name === "pilt"){
            // Extract the block number from the state string
            const state_match = window.last_state.match(/pilt_block_(\d+)_start/);

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
        preload_images = [...new Set(preload_images)].map(value => `imgs/PILT_stims/${value}`);

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
                {
                    type: jsPsychHtmlKeyboardResponse,
                    stimulus: `
                        <h3>Round ${i + 1} out of ${structure.length}</h3>
                        <p>On the next round you will play to <b>${valence > 0 ? "win" : "avoid losing"} coins</b>.<p>` + 
                       ( n_stimuli === 2 ? `<p>Place your fingers on the left and right arrow keys, and <b>press both</b> to continue.</p>` :
                        `<p>Place your fingers on the left, right, and up arrow keys, and press either one to continue.</p>`),
                    choices: n_stimuli === 2 ? ['arrowright', 'arrowleft'] : ['arrowright', 'arrowleft', 'arrowup'],
                    css_classes: ['instructions'],
                    data: {
                        trialphase: "pre_block",
                    },
                    response_ends_trial: n_stimuli !== 2,
                    simulation_options: {simulate: n_stimuli !== 2},
                    on_load: n_stimuli === 2 ? function() {
                        const start = performance.now();
                        const multiKeysListener = setupMultiKeysListener(
                            ['ArrowRight', 'ArrowLeft'], 
                            function() {
                                jsPsych.finishTrial({
                                    rt: Math.floor(performance.now() - start)
                                });
                                // Clean up the event listeners to prevent persistining into the next trial
                                multiKeysListener.cleanup();
                            }
                        );
                    } : () => {}
        
                }
            )
        }
            
        block.push(
            {
                timeline: [
                    PILT_trial(task_name)
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

        PILT_task = PILT_task.concat(block)
    }

    return PILT_task
}

// Load PILT sequences from json file
async function fetchJSON(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${url}`);
        }

        data = await response.json();
        return data
    } catch (error) {
        console.error(`Error fetching ${url}:`, error);
        throw error;
    }
}

function adjustStimuliPaths(structure, folder) {

    // Return null if null
    if (structure == null) {
        return null
    }
    
    // Adjust stimuli paths otherwise
    structure.forEach(block => {
        block.forEach(trial => {
            trial.stimulus_left = `imgs/${folder}/${trial.stimulus_left}`;
            trial.stimulus_right = `imgs/${folder}/${trial.stimulus_right}`;
        });
    });
}

async function load_sequences(session) {
    try {

        // Load json
        const [
            PILT_structure, PILT_test_structure, pav_test_structure,
            WM_structure, LTM_structure,
            WM_test_structure, LTM_test_structure
        ] = await Promise.all([
            fetchJSON('trial1_PILT.json'),
            fetchJSON('trial1_PILT_test.json'),
            fetchJSON('pavlovian_test.json'),
            fetchJSON('trial1_WM.json'),
            fetchJSON('trial1_LTM.json'),
            fetchJSON('trial1_WM_test.json'),
            fetchJSON('trial1_LTM_test.json')
        ]);

        // Select session
        let PILT_sess = PILT_structure[session];
        let PILT_test_sess = PILT_test_structure[session];
        let WM_sess = WM_structure[session];
        let LTM_sess = LTM_structure[session];
        let WM_test_sess = WM_test_structure[session];
        let LTM_test_sess = LTM_test_structure[session];

        if (window.demo) {
            PILT_sess = PILT_sess.slice(0, 6);
            PILT_test_sess = [PILT_test_sess[0].slice(0, 25)];
            WM_sess = WM_sess.slice(0, 3);
            LTM_sess = LTM_sess.slice(0, 3);
        }
        
        adjustStimuliPaths(PILT_test_sess, 'PILT_stims');
        adjustStimuliPaths(WM_test_sess, 'PILT_stims');
        adjustStimuliPaths(LTM_test_sess, 'PILT_stims');

        pav_test_structure.forEach(trial => {
            trial.stimulus_left = `imgs/Pav_stims/${window.session}/${trial.stimulus_left}`;
            trial.stimulus_right = `imgs/Pav_stims/${window.session}/${trial.stimulus_right}`;
            trial.block = "pavlovian";
            trial.feedback_left = trial.magnitude_left;
            trial.feedback_right = trial.magnitude_right;
        });

        if (!window.demo) {
            PILT_test_sess = [pav_test_structure].concat(PILT_test_sess);
        }

        run_full_experiment(PILT_sess, PILT_test_sess, WM_sess, WM_test_sess, LTM_sess, LTM_test_sess);
    } catch (error) {
        console.error('Error loading sequences:', error);
    }
}


function return_PILT_full_sequence(PILT_structure, PILT_test_structure, WM_structure, WM_test_structure, LTM_structure, LTM_test_structure) {
    // Compute best-rest
    computeBestRest(PILT_structure);
    computeBestRest(WM_structure);
    computeBestRest(LTM_structure);

    let PILT_procedure = [];

    // Add instructions
    PILT_procedure = PILT_procedure.concat(prepare_PILT_instructions());

    // Add PILT
    if (PILT_structure != null){
        let PILT_blocks = build_PILT_task(PILT_structure);
        console.log(PILT_blocks)
        if (PILT_blocks.length === 0){
            console.log("No blocks to add");
            PILT_procedure = []
        } else { 
            PILT_blocks[0]["on_start"] = () => {
                updateState("pilt_task_start")
            };
            PILT_procedure = PILT_procedure.concat(PILT_blocks);  
        }  
    } else {
       PILT_procedure = []
    }

    // Add test
    function generateTestProcedure(structure, name) {

        let procedure;
        if ((structure != null) && (structure.length == 1 || structure[1] != null)) {
            procedure = [];
            procedure.push(test_instructions(name));
            let test_blocks = build_post_PILT_test(structure, name);
            test_blocks[0]["on_start"] = () => {

                if (!(["wk24", "wk28"].includes(window.session)) && (name !== "ltm")) {
                    updateState("no_resume");
                }
                updateState(`${name}_test_task_start`);
            };
            procedure = procedure.concat(test_blocks);    
        } else {
            procedure = [];
        }

        return procedure 
    }

   const PILT_test_procedure = generateTestProcedure(PILT_test_structure, "pilt");
    
    // WM block
    let WM_procedure;
    if (WM_structure != null){
        let WM_blocks = build_PILT_task(WM_structure, true, "wm");
        WM_blocks[0]["on_start"] = () => {

            if (!(["wk24", "wk28"].includes(window.session))) {
                updateState("no_resume_10_minutes");
            }
            
            updateState("wm_task_start");
        };
        WM_procedure = WM_instructions.concat(WM_blocks);    
    } else {
        WM_procedure = [];
    }

    // LTM block
    let LTM_procedure;
    if (LTM_structure != null) {
        let LTM_blocks = build_PILT_task(LTM_structure, true, "ltm");
        LTM_blocks[0]["on_start"] = () => {
            updateState("ltm_task_start");
        };
        LTM_procedure = LTM_instructions.concat(LTM_blocks);    
    } else {
        LTM_procedure = []
    }

    // WM test block
    const WM_test_procedure = generateTestProcedure(WM_test_structure, "wm");

    // LTM test block
    const LTM_test_procedure = generateTestProcedure(LTM_test_structure, "ltm");    


    return {
        PILT_procedure: PILT_procedure,
        PILT_test_procedure: PILT_test_procedure,
        WM_procedure: WM_procedure,
        WM_test_procedure: WM_test_procedure,
        LTM_procedure: LTM_procedure,
        LTM_test_procedure: LTM_test_procedure
    }
}
