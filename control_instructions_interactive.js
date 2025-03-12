// Helper functions for creating instruction page elements
const createOceanCurrents = (level = 3) => {
    // Helper function to create current lines based on level and direction
    const createCurrentLines = (isTrace = false, isLeft = true) => {
        let lines = '';
        const positions = {
            1: [{ top: 49, offset: 20 }],
            2: [
                { top: 45, offset: 50 },
                { top: 55, offset: 30 }
            ],
            3: [
                { top: 45, offset: 50 },
                { top: 49, offset: 20 },
                { top: 55, offset: 30 }
            ]
        };

        const currentPositions = positions[level] || positions[3];

        currentPositions.forEach(({ top, offset }) => {
            const position = isLeft ? 'right' : 'left';
            const styles = `top: ${top}%; ${position}: calc(5% + ${offset}px);`;

            if (isTrace) {
                lines += `<div class="current-trace" style="${styles}"></div>`;
            } else {
                lines += `<div class="current-line" style="${styles}"></div>`;
            }
        });
        return lines;
    };

    return `
        <div class="ocean-current">
            <div class="current-group left-currents">
                <!-- Static traces -->
                ${createCurrentLines(true, true)}
                <!-- Animated lines -->
                ${createCurrentLines(false, true)}
            </div>
            <div class="current-group right-currents">
                <!-- Static traces -->
                ${createCurrentLines(true, false)}
                <!-- Animated lines -->
                ${createCurrentLines(false, false)}
            </div>
        </div>
    `;
};
const createInstructionDialog = (content) => {
    return `
    <div class="instruction-dialog">
        <div class="instruction-content">
            ${content}
        </div>
    </div>
`;
};

const createProgressBar = (current, total) => {
    return `
    <div class="progress-bar-container">
        <div class="progress-bar" style="width: ${(current / total) * 100}%"></div>
    </div>
`;
};

// Create key press animation element
const createKeyAnimation = (direction) => {
    return `
    <div class="key-animation ${direction}-key">
        <div class="key-icon">←</div>
        <div class="press-animation"></div>
    </div>
`;
};

// New helper to abstract the fuel trial common behavior
function setupFuelTrial(config) {
    let selectedKey = null;
    let trialPresses = 0;
    const leftArrow = document.querySelector('.arrow-left');
    const rightArrow = document.querySelector('.arrow-right');
    const leftContainer = document.querySelector('.fuel-container-left');
    const rightContainer = document.querySelector('.fuel-container-right');

    document.getElementById("jspsych-instructions-next").disabled = true;
    document.getElementById(jsPsych.getDisplayContainerElement().id).focus();

    // Listener for the first key press
    const firstKeyListener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: handleFirstKey,
        valid_responses: ['ArrowRight'],
        rt_method: 'performance',
        persist: false,
        allow_held_key: false,
        minimum_valid_rt: 100
    });
    
    function createFuelIcon(container) {
        const fuelIcon = document.createElement('img');
        fuelIcon.src = 'imgs/fuel.png';
        fuelIcon.className = 'fuel-icon fuel-animation';
        container.appendChild(fuelIcon);
        fuelIcon.addEventListener('animationend', () => {
            container.removeChild(fuelIcon);
        });
    }
    
    function handleFirstKey(info) {
        jsPsych.pluginAPI.cancelKeyboardResponse(firstKeyListener);
        const selectionIndicator = document.querySelector('.selection-indicator');
        if (selectionIndicator) { selectionIndicator.remove(); }
        if (info.key === 'ArrowLeft') {
            selectedKey = 'left';
            leftArrow.classList.add('highlight');
            document.querySelector('.choice-right').style.visibility = 'hidden';
            document.querySelector('.fuel-container-left .fuel-indicator-container').style.opacity = '1';
        } else if (info.key === 'ArrowRight') {
            selectedKey = 'right';
            rightArrow.classList.add('highlight');
            document.querySelector('.choice-left').style.visibility = 'hidden';
            document.querySelector('.fuel-container-right .fuel-indicator-container').style.opacity = '1';
        }
        document.querySelector('.instruction-content').innerHTML = config.initialMessage;
        setupRepeatedKeyListener();
    }
    
    let repeatedKeyListener = null;
    function setupRepeatedKeyListener() {
        repeatedKeyListener = jsPsych.pluginAPI.getKeyboardResponse({
            callback_function: handleRepeatedKeypress,
            valid_responses: selectedKey === 'left' ? ['ArrowLeft'] : ['ArrowRight'],
            rt_method: 'performance',
            persist: true,
            allow_held_key: false,
            minimum_valid_rt: 0
        });
    }
    
    function handleRepeatedKeypress(info) {
        trialPresses++;
        const container = selectedKey === 'left' ?
            document.querySelector('.fuel-container-left') :
            document.querySelector('.fuel-container-right');
        const fuelBar = container.querySelector('.fuel-indicator-bar');
        // Update progress via a progressCalculation function
        const progress = Math.min(config.progressCalculation(trialPresses), 100);
        fuelBar.style.width = `${progress}%`;

        if (progress === 100) {
            fuelBar.style.backgroundColor = '#00ff00';
        }

        createFuelIcon(selectedKey === 'left' ? leftContainer : rightContainer);
        // When finishCondition returns true, finish the trial.
        if (config.finishCondition(trialPresses, progress)) {
            jsPsych.pluginAPI.cancelKeyboardResponse(repeatedKeyListener);
            document.querySelector('.instruction-content').innerHTML = config.finishMessage;
            jsPsych.pluginAPI.setTimeout(() => {
                document.getElementById("jspsych-instructions-next").disabled = false;
            }, config.finishDelay || 1000);
        }
    }
}

// Main instruction pages configuration
const nPages = 9;
const controlInstructionPages = [
    // Page 1: Initial Welcome
    {
        content: `
        <div class="instruction-stage">
            <img class="background" src="imgs/ocean.png" alt="Background"/>
            <section class="scene">
            <div class="overlap-group">
                <img class="island-near" src="imgs/simple_island_banana.png" alt="Nearer island" />
            </div>
            ${createOceanCurrents(2)}
            </section>
            ${createInstructionDialog(`
                <h2>Welcome to Your New Position!</h2>
                <p>You have just started as the manager of a shipping network, trading different types of fruits.</p>
                <p>Your role is to oversee the transportation of valuable cargo between islands.</p>
                `)}
            ${createProgressBar(1, nPages)}
        </div>
        `
    },

    // Page 2: Interactive Ship Selection, and adding fuel
    {
        content: `
        <div class="instruction-stage">
            <img class="background" src="imgs/ocean.png" alt="Background"/>
            <section class="scene">
            <div class="overlap-group">
                <div class="choice-left">
                    <img class="ship-left" src="imgs/simple_ship_green.png" alt="Left ship" />
                </div>
                <img class="island-near" src="imgs/simple_island_banana.png" alt="Nearer island" />
                <div class="choice-right">
                    <div class="selection-indicator">
                        <div class="selection-label">Press ➡️ to select</div>
                        <span class="selection-dot"></span>
                    </div>
                    <div class="fuel-container-right">
                    <div class="fuel-indicator-container">
                        <div class="fuel-indicator-bar"></div>
                    </div>
                    </div>
                    <img class="ship-right" src="imgs/simple_ship_blue.png" alt="Right ship" />
                    <img class="arrow-right" src="imgs/left.png" alt="right arrow" />
                </div>
            </div>
            ${createOceanCurrents(2)}
            </section>
            ${createInstructionDialog(`
                <p>As a manager, you will need to choose the right ship, and decide how much fuel to load it up with.</p>
                <p>Choose one of the ships by pressing the left or right arrow key.</p>
                <p>Let's try it out to <strong>select the blue ship by pressing the right arrow key.</strong></p>
            `)}
            ${createProgressBar(2, nPages)}
        </div>
        `
    },

    // Page 3: Ending up on the next island
    {
        content: `
        <div class="instruction-stage">
            <img class="background" src="imgs/ocean_above.png" alt="Background"/>
            <section class="scene">
                <svg class="trajectory-path">
                    <line x1="0" y1="100%" x2="0" y2="0" 
                    stroke="rgba(255,255,255,0.5)" 
                    stroke-width="2" 
                    class="path-animation"/>
                </svg>
                <img class="destination-island" 
                    src="imgs/island_icon_coconut.png" 
                    alt="Destination island" />
                <div class="ship-container">
                    <img class="ship-feedback" 
                    src="imgs/simple_ship_icon_blue.png" 
                    alt="Chosen ship" />
                </div>
            </section>
            ${createInstructionDialog(`
                <p>The ship didn't have enough fuel and ran out of fuel midway. Luckily, the ocean currents tend to carry ships with insufficient fuel to the next island in the chain.</p>
                <p>So the ship just drifted from the <span style="color: gold">banana island</span>🍌 to the <span style="color: brown">coconut island</span>🥥, which is the next island in the chain.</p>`)}
            ${createProgressBar(3, nPages)}
        </div>
        `
    },

    // Page 4: Islands in the Chain
    {
        content: `
        <div class="instruction-stage">
            <img class="background" src="imgs/default_islands.png" alt="Background"/>
            ${createInstructionDialog(`
                <p>Thanks to many former managers, this is a map of the four islands in the network. The arrows show how the ocean currents work.</p>
                <p><strong>When a ship does not have sufficient fuel, the current carries it to the next island along the arrows.</strong></p>
                <p>For example, without fuel, a ship leaving the <span style="color: orange">orange island</span>🍊 will end up on the <span style="color: gold">banana island</span>🍌.</p>
            `)}
            ${createProgressBar(4, nPages)}
        </div>
    `
    },

    // Page 5: Let's try again
    {
        content: `
        <div class="instruction-stage">
            <img class="background" src="imgs/ocean.png" alt="Background"/>
            <section class="scene">
            <img class="island-far" src="imgs/simple_island_coconut.png" alt="Farther island" />
            <div class="overlap-group">
                <div class="choice-left">
                    <img class="ship-left" src="imgs/simple_ship_green.png" alt="Left ship" />
                </div>
                <img class="island-near" src="imgs/simple_island_banana.png" alt="Nearer island" />
                <div class="choice-right">
                    <div class="selection-indicator">
                        <div class="selection-label">Press ➡️ to select</div>
                        <span class="selection-dot"></span>
                    </div>
                    <div class="fuel-container-right">
                    <div class="fuel-indicator-container">
                        <div class="fuel-indicator-bar"></div>
                    </div>
                    </div>
                    <img class="ship-right" src="imgs/simple_ship_blue.png" alt="Right ship" />
                    <img class="arrow-right" src="imgs/left.png" alt="right arrow" />
                </div>
            </div>
            ${createOceanCurrents(2)}
            </section>
            ${createInstructionDialog(`
                <p>Let's try it again. <strong>Now in the distance, you can see the next island in the chain.</strong> This is where you'll end up if you don't fuel up enough.</p>
                <p>Try to fuel up fully this time by rapidly pressing the arrow key repeatedly.</p>
                <p>Don't worry! We'll give you some extra time.</p>
            `)}
            ${createProgressBar(5, nPages)}
        </div>
        `
    },


    // Page 6: Ending up on the homebase
    {
        content: `
        <div class="instruction-stage">
            <img class="background" src="imgs/ocean_above.png" alt="Background"/>
            <section class="scene">
                <svg class="trajectory-path">
                    <line x1="0" y1="100%" x2="0" y2="0" 
                    stroke="rgba(255,255,255,0.5)" 
                    stroke-width="2" 
                    class="path-animation"/>
                </svg>
                <img class="destination-island" 
                    src="imgs/island_icon_grape.png" 
                    alt="Destination island" />
                <div class="ship-container">
                    <img class="ship-feedback" 
                    src="imgs/simple_ship_icon_blue.png" 
                    alt="Chosen ship" />
                </div>
            </section>
            ${createInstructionDialog(`
                <p>Great, the ship had enough fuel this time! When a ship have enough fuel, it will try to return to its homebase.</p>
                <p>This <span style="color: royalblue">blue ship</span> has a <span style="color: purple">grape island</span>🍇 as the homebase. Because it's fueled up this time, it went to its homebase island instead of drifting with the current to the next island.</p>
                <p><strong>Note that the ships can also start from and sail back to their home bases.</strong></p>
            `)}
            ${createProgressBar(6, nPages)}
        </div>
        `
    },

    // Page 7: Home Base Explanation
    {
        content: `
        <div class="instruction-stage">
            <img class="background" src="imgs/ocean.png" alt="Background"/>
            ${createOceanCurrents(2)}
            <div class="current-indicator">
                <div class="label">Ocean Current level: 2 = Mid</div>
            </div>
            ${createInstructionDialog(`
                <p>So now, please keep trying these out. We will always give you information on how strong the ocean currents are that day (<span style="color: darkgray">1 = Low</span>, <span style="color: dimgray">2 = Mid</span>, and <span style="color: black">3 = High</span>).</p>
                <p>The stronger the current, the more you'll have to fuel the ship <strong>if you want it to go to its homebase.</strong></p>
                <p>Your first job as a new manager is to get a sense of all of this.</p>
            `)}
            ${createProgressBar(7, nPages)}
        </div>
        `
    },

    // Page 8: Quest trial explanation
    {
        content: `
        <div class="instruction-stage">
            <img class="background" src="imgs/ocean.png" alt="Background"/>
            <section class="scene">
            <div class="quest-scroll">
                <p style="position: absolute; z-index: 4; top: 15px; font-size: 18px; color: maroon">Target Island</p>
                <img class="quest-scroll-img" src="imgs/scroll.png" alt="Quest scroll" />
                <img class="island-target" src="imgs/island_icon_coconut.png" alt="Target island" />
                <p style="position: absolute; z-index: 4; top: 125px; font-size: 18px; color: maroon">Quest reward: 5p</p>
            </div>
            <div class="overlap-group">
                <div class="choice-left">
                    <img class="ship-left" src="imgs/simple_ship_green.png" alt="Left ship" />
                </div>
                <img class="island-near" src="imgs/simple_island_banana.png" alt="Nearer island" />
                <div class="choice-right">
                    <img class="ship-right" src="imgs/simple_ship_blue.png" alt="Right ship" />
                </div>
            </div>
            ${createOceanCurrents(2)}
            </section>
            ${createInstructionDialog(`
                <p>Once in a while in your job, you will receive rewarded quests like this.</p>
                <p>When you see the quest scroll, you should use your knowledge of the shipping network to choose the proper ship and add the fuel level you want.</p>
                <p>You can earn extra money by completing the quests successfully.</p>
            `)}
            ${createProgressBar(8, nPages)}
        </div>
        `
    },

    // Page 9: End of instructions
    {
        content: `
        <div class="instruction-stage">
            <img class="background" src="imgs/ocean_above.png" alt="Background"/>
            <div class="instruction-dialog" style="bottom:30%; min-width: 600px;">
                <div class="instruction-content" style="font-size: 1.2em; text-align: center;">
                    <p>😊 <strong>Great job!</strong> You've successfully completed the instructions.</p>
                    <p>You're now ready to start managing the shipping network.</p>
                    <p>Press <span class="spacebar-icon">Next</span> to continue, or press <span class="spacebar-icon">Restart</span> if you'd like to review the instructions again.</p>
                </div>
            </div>
        </div>
        `
    }
];

// Create the instruction trial

var controlInstructionTrial = [];
controlInstructionTrial = {
    type: jsPsychInstructions,
    css_classes: ['instructions'],
    pages: controlInstructionPages.map(page => page.content),
    allow_keys: false,
    show_clickable_nav: true,
    show_page_number: false,
    data: {trialphase: "control_instructions"},
    on_page_change: function(current_page) {
        if (current_page === 1) {
            setupFuelTrial({
                initialMessage: `<p>You can now load up fuel by <strong>pressing the same arrow key again and again.</strong> The fuel gauge will fill up as you press the key.</p>
                <p>Give it a try!</p>`,
                progressCalculation: (trialPresses) => (trialPresses / 30) * 100,
                // Finish trial when 6 fuel presses have been recorded.
                finishCondition: (trialPresses, progress) => trialPresses >= 6,
                finishMessage: `<p>Fueling time is limited. The ship has to leave now!</p>`
            });
        }

        if (current_page === 4) {
            setupFuelTrial({
                initialMessage: `<p>Keep adding fuel to the ship until it's full!</p>`,
                // Update progress based on 30 presses (i.e. progress runs from 0 to 100%).
                progressCalculation: (trialPresses) => (trialPresses / 30) * 100,
                // Finish trial when the fuel bar reaches 100% width.
                finishCondition: (trialPresses, progress) => progress >= 100,
                finishMessage: `<p>Now the fuel is full for this ship, and it's about to leave now!</p>`
            });
        }

        if (current_page === 8) {
            const navigationElement = document.querySelector('.jspsych-instructions-nav');
            const firstButton = navigationElement.querySelector('button:first-child');
            const newButton = document.createElement('button');
            newButton.id = 'jspsych-instructions-restart';
            newButton.textContent = 'Restart';
            newButton.className = 'jspsych-btn';
            newButton.style.backgroundColor = '#ff7875';
            newButton.addEventListener('click', () => {
                jsPsych.finishTrial({restart: true});
            });
            navigationElement.insertBefore(newButton, firstButton.nextSibling);

        }
    }
};

// Comprehension check
let controlIntroComprehension = [];
controlIntroComprehension.push({
    type: jsPsychSurveyMultiChoice,
    preamble: `<div class=instructions><p>For each statement, please indicate whether it is true or false:</p></div>`,
    data: {trialphase: "control_instruction_quiz"},
    questions: [
        {
            prompt: "My main task is to learn each ship’s home island and the amount of fuel required at each current level.",
            name: "objective",
            options: ["True", "False"],
            required: true
        },
        {
            prompt: "From time to time, my knowledge of the shipping task will be tested, and I can earn rewards for correct answers and completing quests.",
            name: "reward",
            options: ["True", "False"],
            required: true
        },
        {
            prompt: "Grape island is the home base for the blue ship.",
            name: "homebase",
            options: ["True", "False"],
            required: true
        },
        {
            prompt: "Different current levels require different amounts of fuel for a ship to reach its home base.",
            name: "currents",
            options: ["True", "False"],
            required: true
        },
        {
            prompt: "If a ship lacks sufficient fuel, the currents will carry it to the next island.",
            name: "drift",
            options: ["True", "False"],
            required: true
        }
    ],
    simulation_options: {
        data: {
            response: {
                Q0: `True`,
                Q1: `True`,
                Q2: `True`,
                Q3: `True`,
                Q4: `True`,
            }
        }
    }
});

controlIntroComprehension.push(
    {
        type: jsPsychInstructions,
        css_classes: ['instructions'],
        timeline: [
            {
                pages: [
                `<p>You did not answer all the quiz questions correctly.</p>
                <p>Please read the instructions again before you continue.</p>`
                ]
            }
        ],
        conditional_function: () => {
            const data = jsPsych.data.get().filter({trialphase: "control_instruction_quiz"}).last(1).select('response').values[0];

            return !Object.values(data).every(value => value === "True");
        },
        show_clickable_nav: true,
        data: {
            trialphase: "control_instruction_quiz_failure"
        }
    }
)

// Add looping functionality to the instruction trial
const controlInstructions = {
    timeline: [controlInstructionTrial],
    loop_function: () => {
        const restart = jsPsych.data.get().filter({trialphase: "control_instructions"}).last(1).select('restart').values[0];
        return restart;
    }
};

const controlInstructionsLoop = {
    timeline: [controlInstructions, controlIntroComprehension],
    loop_function: () => {
        const data = jsPsych.data.get().filter({trialphase: "control_instruction_quiz"}).last(1).select('response').values[0];

        return !Object.values(data).every(value => value === "True");
    }
};

const controlInstructionsTimeline = [
    controlInstructionsLoop,
    {
        type: jsPsychHtmlKeyboardResponse,
        css_classes: ['instructions'],
        stimulus: `<p><strong>Great! You're now ready to begin the real game.</strong></p>
        <p>You'll play multiple rounds, which typically takes about <strong>20 minutes</strong> to complete.</p>
        <p>When you're ready, place your fingers comfortably on the <strong>left and right arrow keys</strong> as shown below. Press either arrow key to begin.</p>
        <img src='imgs/PILT_keys.jpg' style='width:250px;'></img>`,
        choices: ['arrowright', 'arrowleft'],
        data: {trialphase: "control_instruction_end"}
    }
];