// This files creates the jsPsych timeline for the reversal task block

// Parameters
const rev_n_trials = window.demo ? 50 : 150; // N trials

// Parse json sequence
const reversal_timeline = JSON.parse(reversal_json);

// Assemble list of blocks - first load images
var reversal_blocks = [
    {
        type: jsPsychPreload,
        images: [
            "imgs/squirrels_empty.png",
            "imgs/squirrels_bg.png",
            "imgs/squirrels_fg.png",
            "imgs/1penny.png",
            "imgs/1pound.png"
        ],
        post_trial_gap: 400,
        data: {
            trialphase: "reversal_preload"
        },
        continue_after_error: true,
        on_finish: () => {
            updateState(`reversal_start_task`)
            updateState(`no_resumption`)
        }
    }
];
for (i=0; i<reversal_timeline.length; i++){
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
                            on_finish: () => {
                                n_trials = jsPsych.data.get().filter({trial_type: "reversal"}).count()
                                
                                if (n_trials % 40 == 0) {
                                    saveDataREDCap(retry = 3);
                                  }
                            }
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

                        return (n_trials < rev_n_trials) && (num_correct < criterion)
                },
                on_finish: function(data) {
                    if (data.response === null) {
                        var up_to_now = parseInt(jsPsych.data.get().last(1).select('n_warnings').values);
                        jsPsych.data.addProperties({
                            n_warnings: up_to_now + 1
                        });
                    }
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

// Reversal instructions
const reversal_instructions = [
    {
        type: jsPsychInstructions,
        css_classes: ['instructions'],
        pages: [
            `<p><b>Thank you for taking part in this study!</b></p>
            <p>The purpose of this study is to examine how people learn from positive and negative feedback while playing games.
            <p>In this study, you'll play a few simple trial-and-error learning games. Your goal in each game is to win as many coins as possible.</p>
            <p>The games may feel a bit fast-paced because we're interested in your quick, intuitive decisions. Since they're designed around learning from experience, making mistakes is completely expected. Over time, you'll figure out better choices and improve your performance.</p>
            <p>Let's start with the first game!</p>`,
            `<p>Next, you will meet two friendly squirrels, each with a bag of coins to share. 
            Use the arrow keys to choose either the left or right squirrel. 
            The squirrel you pick will give you a coin to add to your safe.</p>`,
            `<p>One squirrel has higher-value coins, and the other has lower-value coins. 
            But every few turns they secretly switch bags.</p>
            <p>Your goal is to figure out which squirrel has the better coins and collect as many high-value ones as possible.<p>`
        ],
        show_clickable_nav: true,
        data: {trialphase: "reversal_instruction"},
        on_start: () => {
            updateState(`reversal_start_instructions`)
        }
    },
    {
        type: jsPsychHtmlKeyboardResponse,
        css_classes: ['instructions'],
        stimulus: `
            <p>You will now play the squirrel game for about 5 minutes without breaks.</p>
            <p>Place your fingers on the left and right arrow keys as shown below, and press either one to start.</p>
            <img src='imgs/PILT_keys.jpg' style='width:250px;'></img>`,
        choices: ['arrowleft', 'arrowright'],
        data: {trialphase: "reversal_instruction"}
    },
]
