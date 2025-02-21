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
        <p id="keypress-prompt">Press <span class="spacebar-icon"><strong>J</strong></span> to continue</p>
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

// Main instruction pages configuration
const nPages = 7;
const instructionPages = [
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
                <h2>Welcome to Your New Job!</h2>
                <p>You have just started as the manager of a shipping network trading different types of fruits.</p>
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
                <p>As a manager, you will need to choose the right boat, and decide how much fuel to load it up with.</p>
                <p>Choose one of the boats by pressing the left or right arrow key.</p>
                <p><strong>Let's try it out by pressing the right arrow key to select the blue boat.</strong></p>
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
            ${createInstructionDialog(`<p>The boat ran out of fuel midway. Luckily, the ocean currents tend to carry boats with insufficient fuel to the next island in the chain...</p>`)}
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
                <p>When a ship does not have sufficient fuel, the current carries it to the next island along the arrows.</p>
                <p>For example, without fuel, a boat leaving the banana island will end up on the coconut island.</p>
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
                <p>Let's try it again. In the distance, you can see the next island in the chain. This is where you'll end up if you don't fuel up enough.</p>
                <p>Try to fuel up fully now. We'll give you some extra time.</p>
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
            ${createInstructionDialog(`<p>Great, the boat had enough fuel this time! When boats have enough fuel, they will return to their homebase. This <span class="highlight-txt">blue boat</span> has the <strong>grape island</strong> as a homebase.</p>`)}
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
                <div class="label">Ocean Current level: Mid</div>
            </div>
            ${createInstructionDialog(`
                <p>So now, please keep trying this out. We will always give you information on how strong the ocean currents are that day (Low, Mid, and High).</p>
                <p>The stronger the current, the more you'll have to fuel the boat if you want it to go to its homebase.</p>
                <p>Your first job as a new manager is to get a sense of all of this. When you're ready, press the button to start.</p>
            `)}
            ${createProgressBar(7, nPages)}
        </div>
        `
    }
];

// Create the instruction trial
var instructionTrial = instructionPages.map((page, i) => {
    return {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: page.content,
        choices: "j",
        trial_duration: null,
        on_finish: () => {
            jsPsych.pluginAPI.clearAllTimeouts()
            jsPsych.pluginAPI.cancelAllKeyboardResponses();
        }
    };
});


instructionTrial[1] = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: instructionPages[1].content,
    choices: "NO_KEYS",
    trial_duration: null,
    on_load: () => {
        document.querySelector('#keypress-prompt').style.visibility = 'hidden';

        // Initial keyboard listener for the first choice
        var selectedKey = null;
        var trial_presses = 0;

        const leftArrow = document.querySelector('.arrow-left');
        const rightArrow = document.querySelector('.arrow-right');
        const leftContainer = document.querySelector('.fuel-container-left');
        const rightContainer = document.querySelector('.fuel-container-right');

        // Function to create and animate a fuel icon
        function createFuelIcon(container) {
            const fuelIcon = document.createElement('img');
            fuelIcon.src = 'imgs/fuel.png';
            fuelIcon.className = 'fuel-icon fuel-animation';
            container.appendChild(fuelIcon);

            // Remove the fuel icon after animation completes
            fuelIcon.addEventListener('animationend', () => {
                container.removeChild(fuelIcon);
            });
        }

        // Function to handle keyboard responses
        function handleKeypress(info) {
            if (!selectedKey) {  // First key press - only select the ship
                jsPsych.pluginAPI.cancelKeyboardResponse(firstKey_listener);

                const selectionIndicator = document.querySelector('.selection-indicator');
                if (selectionIndicator) {
                    selectionIndicator.remove();
                }
                if (info.key === 'ArrowLeft') {
                    selectedKey = 'left';
                    leftArrow.classList.add('highlight');
                    document.querySelector('.choice-right').style.visibility = 'hidden';
                    // Show the progress bar
                    document.querySelector('.fuel-container-left .fuel-indicator-container').style.opacity = '1';
                    repeatedKey_listener = setupRepeatedKeypress('ArrowLeft');
                } else if (info.key === 'ArrowRight') {
                    selectedKey = 'right';
                    rightArrow.classList.add('highlight');
                    document.querySelector('.choice-left').style.visibility = 'hidden';
                    // Show the progress bar
                    document.querySelector('.fuel-container-right .fuel-indicator-container').style.opacity = '1';
                    repeatedKey_listener = setupRepeatedKeypress('ArrowRight');
                }
                // Update instruction text
                document.querySelector('.instruction-content').innerHTML =
                    `<p>You can now load up fuel by pressing the same key again and again.</p>
                    <p><strong>Give it a try!</strong></p>`;
            }
        }

        // Function to handle repeated keypresses
        function handleRepeatedKeypress(info) {
            trial_presses++;
            lastPressTime = info.rt;

            // Create and animate fuel icon
            createFuelIcon(selectedKey === 'left' ? leftContainer : rightContainer);

            // Update fuel indicator bar
            const container = selectedKey === 'left' ?
                document.querySelector('.fuel-container-left') :
                document.querySelector('.fuel-container-right');
            const fuelBar = container.querySelector('.fuel-indicator-bar');

            // Calculate progress (40 presses = 100%)
            const progress = Math.min((trial_presses / 40) * 100, 100);
            fuelBar.style.width = `${progress}%`;

            // Optional: Change color when full
            if (progress === 100) {
                fuelBar.style.backgroundColor = '#00ff00';
            }

            if (trial_presses >= 6) {
                jsPsych.pluginAPI.cancelKeyboardResponse(this.repeatedKey_listener);
                document.querySelector('.instruction-content').innerHTML =
                    `<p>Fueling time is limited. The boat has to leave now!</p>`;
                jsPsych.pluginAPI.setTimeout(() => {
                    jsPsych.finishTrial();
                }, 2000);
            }
        }

        // Function to set up listener for repeated keypresses
        function setupRepeatedKeypress(key) {
            var listener = jsPsych.pluginAPI.getKeyboardResponse({
                callback_function: handleRepeatedKeypress,
                valid_responses: [key],
                rt_method: 'performance',
                persist: true,
                allow_held_key: false,
                minimum_valid_rt: 0
            });
            return listener;
        }

        // Initial keyboard listener for the first choice
        const firstKey_listener = jsPsych.pluginAPI.getKeyboardResponse({
            callback_function: handleKeypress,
            valid_responses: ['ArrowRight'],
            rt_method: 'performance',
            persist: false,
            allow_held_key: false,
            minimum_valid_rt: 100
        });
    },
    on_finish: () => {
        jsPsych.pluginAPI.clearAllTimeouts()
        jsPsych.pluginAPI.cancelAllKeyboardResponses();
    }
};

instructionTrial[4] = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: instructionPages[4].content,
    choices: "NO_KEYS",
    trial_duration: null,
    on_load: () => {
        document.querySelector('#keypress-prompt').style.visibility = 'hidden';

        // Initial keyboard listener for the first choice
        var selectedKey = null;
        var trial_presses = 0;

        const leftArrow = document.querySelector('.arrow-left');
        const rightArrow = document.querySelector('.arrow-right');
        const leftContainer = document.querySelector('.fuel-container-left');
        const rightContainer = document.querySelector('.fuel-container-right');

        // Function to create and animate a fuel icon
        function createFuelIcon(container) {
            const fuelIcon = document.createElement('img');
            fuelIcon.src = 'imgs/fuel.png';
            fuelIcon.className = 'fuel-icon fuel-animation';
            container.appendChild(fuelIcon);

            // Remove the fuel icon after animation completes
            fuelIcon.addEventListener('animationend', () => {
                container.removeChild(fuelIcon);
            });
        }

        // Function to handle keyboard responses
        function handleKeypress(info) {
            if (!selectedKey) {  // First key press - only select the ship
                jsPsych.pluginAPI.cancelKeyboardResponse(firstKey_listener);

                const selectionIndicator = document.querySelector('.selection-indicator');
                if (selectionIndicator) {
                    selectionIndicator.remove();
                }
                if (info.key === 'ArrowLeft') {
                    selectedKey = 'left';
                    leftArrow.classList.add('highlight');
                    document.querySelector('.choice-right').style.visibility = 'hidden';
                    // Show the progress bar
                    document.querySelector('.fuel-container-left .fuel-indicator-container').style.opacity = '1';
                    repeatedKey_listener = setupRepeatedKeypress('ArrowLeft');
                } else if (info.key === 'ArrowRight') {
                    selectedKey = 'right';
                    rightArrow.classList.add('highlight');
                    document.querySelector('.choice-left').style.visibility = 'hidden';
                    // Show the progress bar
                    document.querySelector('.fuel-container-right .fuel-indicator-container').style.opacity = '1';
                    repeatedKey_listener = setupRepeatedKeypress('ArrowRight');
                }
                // Update instruction text
                document.querySelector('.instruction-content').innerHTML =
                    `<p>Keep adding fuel to the boat until it's full!</p>`;
            }
        }

        // Function to handle repeated keypresses
        function handleRepeatedKeypress(info) {
            trial_presses++;
            lastPressTime = info.rt;

            // Create and animate fuel icon
            createFuelIcon(selectedKey === 'left' ? leftContainer : rightContainer);

            // Update fuel indicator bar
            const container = selectedKey === 'left' ?
                document.querySelector('.fuel-container-left') :
                document.querySelector('.fuel-container-right');
            const fuelBar = container.querySelector('.fuel-indicator-bar');

            // Calculate progress (40 presses = 100%)
            const progress = Math.min((trial_presses / 40) * 100, 100);
            fuelBar.style.width = `${progress}%`;

            // Optional: Change color when full
            if (progress === 100) {
                fuelBar.style.backgroundColor = '#00ff00';
                jsPsych.pluginAPI.cancelKeyboardResponse(this.repeatedKey_listener);
                document.querySelector('.instruction-content').innerHTML =
                    `<p>Now the fuel is full for this boat, and it's about to leave now!</p>`;
                jsPsych.pluginAPI.setTimeout(() => {
                    jsPsych.finishTrial();
                }, 2000);
            }
        }

        // Function to set up listener for repeated keypresses
        function setupRepeatedKeypress(key) {
            var listener = jsPsych.pluginAPI.getKeyboardResponse({
                callback_function: handleRepeatedKeypress,
                valid_responses: [key],
                rt_method: 'performance',
                persist: true,
                allow_held_key: false,
                minimum_valid_rt: 0
            });
            return listener;
        }

        // Initial keyboard listener for the first choice
        const firstKey_listener = jsPsych.pluginAPI.getKeyboardResponse({
            callback_function: handleKeypress,
            valid_responses: ['ArrowRight'],
            rt_method: 'performance',
            persist: false,
            allow_held_key: false,
            minimum_valid_rt: 100
        });
    },
    on_finish: () => {
        jsPsych.pluginAPI.clearAllTimeouts()
        jsPsych.pluginAPI.cancelAllKeyboardResponses();
    }
};