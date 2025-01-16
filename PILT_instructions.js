// Instructions for the PILT
const small_coin_size = 100;

function prepare_PILT_instructions() {
    const inter_block_instruct = {
        type: jsPsychInstructions,
        css_classes: ['instructions'],
        pages: () => [inter_block_stimulus()],
        show_clickable_nav: true,
        data: {trialphase: "instruction"}
    }

    let inst =  [
        {
            type: jsPsychInstructions,
            css_classes: ['instructions'],
            pages: () => {

                let pages = [
                    ` <p>Welcome!</p>
                    <p>In this study, you'll play a few simple games of learning from trial and error.</p>
                    <p>Your goal in each game is to win as many coins as possible.</p>
                    <p>The games might feel a bit fast-paced because we're interested in your quick, intuitive judgments.</p>
                    <p>Since the games are about learning from trial and error, everyone is expected to make quite a few mistakes when they play.</p>
                    <p>Let's start with the first game.</p>
                    `
                ];

                pages = pages.concat([
                `<p><b>THE CARD CHOOSING GAME</b></p>
                    <p>In this game, you own a safe.</p>
                    <img src='imgs/safe.png' style='width:100px; height:100px;'>
                    <p>At the start, your safe contains:</p>
                    <div style='display: grid'><table><tr><td><img src='imgs/1pound.png' style='width:${small_coin_size}px; height:${small_coin_size}px;'></td>
                    <td><img src='imgs/50pence.png' style='width:${small_coin_size}px; height:${small_coin_size}px;'</td>
                    <td><img src='imgs/1penny.png' style='width:${small_coin_size}px; height:${small_coin_size}px;'></td></tr>
                    <tr><td>60x one pound coins</td><td>60x fifty pence coins</td><td>60x one penny coins</td></tr></table></div>
                    <p>At the end of the game, you will draw one coin from your safe, and that will be your bonus payment.</p>
                    <p><b>Your goal:</b> Add coins to your safe and avoid losing the ones already in it.</p>`,
                `<p>On each turn, you will see two cards.
                    You have four seconds to flip one of the two cards.</p>
                    <p>Flipping a card reveals a coin you collect: £1, 50 pence, or 1 penny.</p>
                    <div style='display: grid;'><table style='width: 200px; grid-column: 2;'><tr>
                    <td><img src='imgs/1pound.png' style='width:${small_coin_size}px; height:${small_coin_size}px;'></td>
                    <td><img src='imgs/50pence.png' style='width:${small_coin_size}px; height:${small_coin_size}px;'></td>
                    <td><img src='imgs/1penny.png' style='width:${small_coin_size}px; height:${small_coin_size}px;'></td></tr></table></div>`,
                `<p>Sometimes, you might lose coins. This happens if you uncover a broken coin:</p>\
                    <div style='display: grid;'><table style='width: 200px; grid-column: 2;'><tr>
                    <td><img src='imgs/1poundbroken.png' style='width:${small_coin_size}px; height:${small_coin_size}px;'></td>
                    <td><img src='imgs/50pencebroken.png' style='width:${small_coin_size}px; height:${small_coin_size}px;'></td>
                    <td><img src='imgs/1pennybroken.png' style='width:${small_coin_size}px; height:${small_coin_size}px;'></td></tr></table></div>`,
                `<p>Your goal is to collect high-value coins and avoid losing them.</p>`
            ]);
            return pages
            },
        show_clickable_nav: true,
        data: {trialphase: "instruction"},
        on_start: () => {updateState("pilt_start_instructions")}
    }
    ];

    if (window.sessionNum == 1) {
        inst.push(
            {
                type: jsPsychHtmlKeyboardResponse,
                css_classes: ['instructions'],
                stimulus: `<p>Choose a card by pressing the <b>left</b> or <b>right arrow key</b> on your keyboard.</p>
                        <p>Let's practice! On the next screen, flip a card.</p>
                        <p>Place your fingers on the left and right arrow keys, then press either one to continue.</p>`,
                choices: ['arrowleft', 'arrowright'],
                data: {trialphase: "instruction"}
            },
            {
                timeline: build_PILT_task(
                    [[
                        {
                            stimulus_left: "ukulele1.jpg",
                            stimulus_right: "envelope1.jpg",
                            stimulus_middle: "",
                            feedback_middle: "",
                            n_stimuli: 2,
                            present_pavlovian: true,
                            pavlovian_images: pavlovian_images_f(),
                            optimal_side: "",
                            feedback_left: 1,
                            feedback_right: 1,
                            optimal_right: 1,
                            block: "practice1",
                            trial: 1,
                            valence: 1,
                            response_deadline: -1,
                            stimulus_group: 1,
                            stimulus_group_id: 1,
                            n_groups: 1,
                            rest_1pound: 0,
                            rest_50pence: 0,
                            rest_1penny: 0
                        }
                    ]],
                    false
                )
            }
        );
    }
  
    inst = inst.concat([{
        type: jsPsychInstructions,
        css_classes: ['instructions'],
        pages: [
            `${window.sessionNum == 1 ? `<p>You found a <b>£1 coin!</b></p>` : ``}
            <p>Some cards are better than others, but even good cards can sometimes give only a penny or break a £1 coin.</p>`
        ],
        show_clickable_nav: true,
        data: {trialphase: "instruction"}
    },
    {
        type: jsPsychHtmlKeyboardResponse,
        css_classes: ['instructions'],
        stimulus: `<p>Let's practice collecting coins. 
            On the next screen, choose a card to collect as much money as possible.</p>
            <p>Place your fingers on the left and right arrow keys, then press either one to start.</p>`,
        choices: ['arrowleft', 'arrowright'],
        data: {trialphase: "instruction"}
    }]);

    let dumbbell_on_right = [true, true, false, true, false, false];
    let reward_magnitude = [0.5, 1, 1, 0.5, 1, 0.5];

    if (window.sessionNum > 1){
        dumbbell_on_right = [1, 3, 4, 0].map(i => dumbbell_on_right[i])
        reward_magnitude = [3, 4, 0, 1].map(i => reward_magnitude[i])
    }

    inst.push(
        {
            timeline: build_PILT_task(
                [
                    dumbbell_on_right.map((e, i) => 
                        ({
                            stimulus_left: e ? "strainer1.jpg" : "can2.jpg",
                            stimulus_right: e ? "can2.jpg" : "strainer1.jpg",
                            stimulus_middle: "",
                            feedback_middle: "",
                            present_pavlovian: true,
                            pavlovian_images: pavlovian_images_f(),
                            n_stimuli: 2,
                            optimal_side: "",
                            feedback_left: e ? 0.01 : reward_magnitude[i],
                            feedback_right: e ? reward_magnitude[i] : 0.01,
                            optimal_right: e,
                            block: "practice2",
                            trial: i,
                            valence: 1,
                            stimulus_group: 1,
                            stimulus_group_id: 1,
                            n_groups: 1,
                            rest_1pound: 0,
                            rest_50pence: 0,
                            rest_1penny: 0
                        })
                    )
                ],
                false
            )
        }
    )


    inst = inst.concat([
        inter_block_instruct,
        {
            type: jsPsychHtmlKeyboardResponse,
            css_classes: ['instructions'],
            stimulus: `<p>Now, let's practice <b>avoiding losing coins</b>!</p>
            <p>On the next screen, choose a card to lose as little money as possible.</p>
            <p>Place your fingers on the left and right arrow keys, then press either one to start.</p>`,
            choices: ['arrowright', 'arrowleft'],
            data: {trialphase: "instruction"}
        }
    ]);

    let hammer_on_right = [false, true, false, true, false, false];
    let punishment_magnitude = [-0.01, -0.5, -0.5, -0.01, -0.01, -0.5];

    if (window.sessionNum > 1){
        hammer_on_right = [1, 3, 4, 0].map(i => hammer_on_right[i])
        punishment_magnitude = [3, 4, 0, 1].map(i => punishment_magnitude[i])
    }


    inst.push(
        {
            timeline: build_PILT_task(
                [
                    hammer_on_right.map((e, i) => 
                        ({
                            stimulus_left: e ? "harp1.jpg" : "cantaloupe1.jpg",
                            stimulus_right: e ? "cantaloupe1.jpg" : "harp1.jpg",
                            stimulus_middle: "",
                            feedback_middle: "",
                            present_pavlovian: true,
                            pavlovian_images: pavlovian_images_f(),
                            n_stimuli: 2,
                            optimal_side: "",
                            feedback_left: e ? -1 : punishment_magnitude[i],
                            feedback_right: e ? punishment_magnitude[i] : -1,
                            optimal_right: e,
                            block: "practice3",
                            trial: i,
                            valence: -1,
                            stimulus_group: 1,
                            stimulus_group_id: 1,
                            n_groups: 1,
                            rest_1pound: 0,
                            rest_50pence: 0,
                            rest_1penny: 0
                        })
                    )
                ],
                false
            )
        }
    );

    inst = inst.concat(
        [
            inter_block_instruct,
            {
                type: jsPsychInstructions,
                css_classes: ['instructions'],
                pages: [`<p>Before you start playing, you'll answer a few questions about the instructions you just read.</p>
                        <p>You must answer all questions correctly to begin the game.</p>\
                        <p>If not, you can review the instructions and try again.</p>`],
                show_clickable_nav: true,
                data: {trialphase: "instruction"}
            }
    ]);

    let quiz_questions = [
        {
            prompt: "Some cards are better than others, but even the best cards might only give a penny or break a £1 coin.",
            options: ["True", "False"],
            required: true
        },
        {
            prompt: "If I find a broken coin, that means I lost that coin.",
            options: ["True", "False"],
            required: true
        },
        {
            prompt: "My goal is to collect as many high-value coins as I can and avoid breaking them.",
            options: ["True", "False"],
            required: true
        },
    ];

    inst.push(
        {
            type: jsPsychSurveyMultiChoice,
            questions: quiz_questions,
            preamble: `<div class=instructions><p>For each statement, please indicate whether it is true or false:</p></div>`,
            data: {
                trialphase: "instruction_quiz"
            },
            simulation_options: {
                data: {
                    response: {
                        Q0: `True`,
                        Q1: `True`,
                        Q2: `True`,
                    }
                }
            }   
        }
    );

    inst.push(
        {
            type: jsPsychInstructions,
            css_classes: ['instructions'],
            timeline: [
                {
                    pages: [
                    `<p>You did not answer all the quiz questions correctly. 
                    Please read the instructions again before you continue</p>`
                    ]
                }
            ],
            conditional_function: check_quiz_failed,
            show_clickable_nav: true,
            data: {
                trialphase: "quiz_failure"
            }
        }
    );

    const inst_loop = {
        timeline: inst,
        loop_function: check_quiz_failed
    }


    const inst_total = [
        inst_loop,
        {
            type: jsPsychHtmlKeyboardResponse,
            css_classes: ['instructions'],
            stimulus: `<p>Great! Let's start playing for real.</p>
            <p>Place your fingers on the left and right arrow keys, then press either one to start.</p>`,
            choices: ['arrowright', 'arrowleft'],
            data: {trialphase: "instruction"}
        }
    ]

    return inst_total
} 

function check_quiz_failed() {
    const data = jsPsych.data.get().filter({trialphase: "instruction_quiz"}).last(1).select('response').values[0];

    return !Object.values(data).every(value => value === "True");
}

const lottery_instructions = {
    type: jsPsychInstructions,
    css_classes: ['instructions'],
    pages: [
        '<p>You have completed the card choosing game!</p>\
            <p>Next, your bonus payment will be determined.</p>\
            <p>On the next page, you will be presented with a representative sample of the conents \
            your safe. After flipping the cards and shuffling, you will get to chose one card, and reveal the coin that will be paid to you as a bonus.</p>\
            <p>If you select a broken coin, no bonus payment will be paid to you today.</p>'
    ],
    show_clickable_nav: true,
    data: {trialphase: "lottery_instructions"}
}

// Post-PILT test instructions
const test_instructions = {
    type: jsPsychInstructions,
    css_classes: ['instructions'],
    pages: [
        '<p>You will now continue to another round of the card choosing game.</p>\
            <p>The game proceeds the same as before, except you won\'t be able to see the coins you discover and collect.</p>\
            <p>You will be presented with cards you already know. Do you best to choose the best card possible on each turn.</p>'
    ],
    show_clickable_nav: true,
    data: {trialphase: "post-PILT_test_instructions"}
}

// WM instructions
const WM_instructions = [
    {
        type: jsPsychInstructions,
        css_classes: ['instructions'],
        pages: [
            `<p>Welcome back!</p>
            <p>Next, you will return to the card choosing game.</p>\
                <p>Your goal remains to collect and keep from breaking as many high-value coins as you can.</p>
                <p>As before, this game is a little fast-paced, and everyone is expected to make more than a few mistakes.</p>`,
            `<p>This time, you will choose between three cards on every turn.<p>
            <p>Use the right arrow key to choose the card on the right, the left arrow key to choose the card on the left, 
            and <b>use the upwards arrow key to choose the card in the middle.</b>
            `
        ],
        show_clickable_nav: true,
        data: {trialphase: "WM_instructions"}
    },
    {
        type: jsPsychHtmlKeyboardResponse,
        css_classes: ['instructions'],
        stimulus: `<p>Let's start playing!</p>
        <p>Place your fingers on the left, right, and up arrow keys, and press the up arrow key to start playing.</p>`,
        choices: ['arrowup'],
        data: {trialphase: "WM_instructions"}
    }
]

