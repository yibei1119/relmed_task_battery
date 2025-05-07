// Helper functions for creating instruction page elements
const createOceanCurrents = (level = 3, choice = "right", matchBaseRule = true) => {
    // Invert the choice for feedback display
    const feedbackChoice = choice === 'left' ? 'right' : 'left';

    // Helper function to create current lines based on level and direction
    const createCurrentLines = (matchBaseRule = true, isTrace = false, isLeft = true) => {
        let lines = '';
        if (matchBaseRule) {
            // Generate positions based on level
            const positions = {
                1: [{ top: 49, offset: 20 }],
                2: [
                    { top: 43, offset: 50 },
                    { top: 55, offset: 30 }
                ],
                3: [
                    { top: 43, offset: 50 },
                    { top: 49, offset: 20 },
                    { top: 55, offset: 30 }
                ]
            };

            const currentPositions = positions[level] || positions[3];

            currentPositions.forEach(({ top, offset }) => {
                const position = isLeft ? 'right' : 'left';
                const styles = `top: ${top}%; ${position}: calc(5% + ${offset}px);`;

                if (isTrace) {
                    lines += `<div class="current-trace" style="${styles};"></div>`;
                } else {
                    lines += `<div class="current-line" style="${styles};"></div>`;
                }
            });
        } else {
            const positions = {
                1: [{ top: 80, offset: 20 }],
                2: [
                    { top: 70, offset: 50 },
                    { top: 90, offset: 30 }
                ],
                3: [
                    { top: 70, offset: 50 },
                    { top: 80, offset: 20 },
                    { top: 90, offset: 30 }
                ]
            };

            const currentPositions = positions[level] || positions[3];

            currentPositions.forEach(({ top, offset }) => {
                const position = isLeft ? 'right' : 'left';
                const styles = `top: ${top}%; ${position}: calc(15% + ${offset}px);`;

                if (isTrace) {
                    lines += `<div class="current-trace" style="${styles}; width: 70%"></div>`;
                } else {
                    lines += `<div class="current-line" style="${styles}; width: 75%"></div>`;
                }
            });
        }

        return lines;
    };

    if (matchBaseRule) {
        return `
        <div class="ocean-current">
            <div class="current-group left-currents">
                ${createCurrentLines(true, true, true)}
                ${createCurrentLines(true, false, true)}
            </div>
            <div class="current-group right-currents">
                ${createCurrentLines(true, true, false)}
                ${createCurrentLines(true, false, false)}
            </div>
            </div>
        `;
    } else {
        return `
        <div class="ocean-current">
            <div class="current-group ${feedbackChoice}-horizon-currents">
            ${createCurrentLines(false, true, feedbackChoice === 'left')}
            ${createCurrentLines(false, false, feedbackChoice === 'left')}
            </div>
        `;
    }
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

// New helper to abstract the fuel trial common behavior
function setupFuelTrial(config) {
    jsPsych.pluginAPI.cancelAllKeyboardResponses();
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
        if (document.querySelector('.selection-indicator')) { selectionIndicator.remove(); }
        const islandIndicator = document.querySelector('.island-indicator');
        if (islandIndicator) { islandIndicator.remove(); }

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

            // Apply fade-out animation to the selected ship
            if (selectedKey === 'left') {
                display_element.querySelector('.ship-left').classList.add('fade-out-left');
            } else if (selectedKey === 'right') {
                display_element.querySelector('.ship-right').classList.add('fade-out-right');
            }

            document.querySelector('.instruction-content').innerHTML = config.finishMessage;
            jsPsych.pluginAPI.setTimeout(() => {
                document.getElementById("jspsych-instructions-next").disabled = false;
            }, config.finishDelay || 350);
            jsPsych.pluginAPI.cancelKeyboardResponse(repeatedKeyListener);
        }
    }
}

// Main instruction pages configuration
const nPages = 12;
const leftShip = "green";
const rightShip = "blue";
const downstreamIsland = "orange";
const homebaseIsland = CONTROL_CONFIG.controlRule[rightShip];

const controlInstructionPages = [
    // Page 0: Initial Welcome
    {
        content: `
        <div class="instruction-stage">
            <img class="background" src="imgs/ocean.png" alt="Background"/>
            <section class="scene">
            <img class="island-far" src="imgs/simple_island_${downstreamIsland}.png" alt="Farther island" />
            <div class="overlap-group">
                <div class="choice-left">
                    <div class="fuel-container-left" style="visibility: hidden;">
                        <div class="fuel-indicator-container">
                            <div class="fuel-indicator-bar"></div>
                        </div>
                    </div>
                    <img class="ship-left" src="imgs/simple_ship_${leftShip}.png" alt="Left ship" />
                    <img class="arrow-left" style="visibility: hidden;" src="imgs/left.png" alt="Left arrow" />
                </div>
                <img class="island-near" src="imgs/simple_island.png" alt="Nearer island" />
                <div class="choice-right">
                    <div class="fuel-container-right">
                        <div class="fuel-indicator-container">
                            <div class="fuel-indicator-bar"></div>
                        </div>
                    </div>
                    <img class="ship-right" src="imgs/simple_ship_${rightShip}.png" alt="Right ship" />
                    <img class="arrow-right" style="visibility: hidden;" src="imgs/left.png" alt="right arrow" />
                </div>
            </div>
            ${createOceanCurrents(2)}
            </section>
            ${createInstructionDialog(`
                <h2>Welcome to shipping game!</h2>
                <p>In this game, there are <strong>ships</strong> and <strong>fruit islands</strong>.</p>
                `)}
            ${createProgressBar(1, nPages)}
        </div>
        `
    },

    // Page 1: Main properties
    {
        content: `
        <div class="instruction-stage">
            <img class="background" src="imgs/ocean.png" alt="Background"/>
            <section class="scene">
            <img class="island-far" src="imgs/simple_island_${downstreamIsland}.png" alt="Farther island" />
            <div class="overlap-group">
                <div class="choice-left">
                    <div class="fuel-container-left" style="visibility: hidden;">
                        <div class="fuel-indicator-container">
                            <div class="fuel-indicator-bar"></div>
                        </div>
                    </div>
                    <img class="ship-left" src="imgs/simple_ship_${leftShip}.png" alt="Left ship" />
                    <img class="arrow-left" style="visibility: hidden;" src="imgs/left.png" alt="Left arrow" />
                </div>
                <img class="island-near" src="imgs/simple_island.png" alt="Nearer island" />
                <div class="choice-right">
                    <div class="fuel-container-right">
                        <div class="fuel-indicator-container">
                            <div class="fuel-indicator-bar"></div>
                        </div>
                    </div>
                    <img class="ship-right" src="imgs/simple_ship_${rightShip}.png" alt="Right ship" />
                    <img class="arrow-right" style="visibility: hidden;" src="imgs/left.png" alt="right arrow" />
                </div>
            </div>
            ${createOceanCurrents(2)}
            </section>
            ${createInstructionDialog(`
                <p>Each ship has one <strong>home</strong> fruit island.</p>
                <p>Each ship will go to its home fruit island if it has <strong>enough fuel</strong> to overcome the <strong>ocean currents</strong>.</p>
            `)}
            ${createProgressBar(2, nPages)}
        </div>
        `
    },

    // Page 2: Without fuel...
    {
        content: `
        <div class="instruction-stage">
            <img class="background" src="imgs/ocean.png" alt="Background"/>
            <section class="scene">
            <img class="island-far" src="imgs/simple_island_${downstreamIsland}.png" alt="Farther island" />
            <div class="overlap-group">
                <div class="choice-left">
                    <div class="fuel-container-left" style="visibility: hidden;">
                        <div class="fuel-indicator-container">
                            <div class="fuel-indicator-bar"></div>
                        </div>
                    </div>
                    <img class="ship-left" src="imgs/simple_ship_${leftShip}.png" alt="Left ship" />
                    <img class="arrow-left" style="visibility: hidden;" src="imgs/left.png" alt="Left arrow" />
                </div>
                <img class="island-near" src="imgs/simple_island.png" alt="Nearer island" />
                <div class="choice-right">
                    <div class="fuel-container-right">
                        <div class="fuel-indicator-container">
                            <div class="fuel-indicator-bar"></div>
                        </div>
                    </div>
                    <img class="ship-right" src="imgs/simple_ship_${rightShip}.png" alt="Right ship" />
                    <img class="arrow-right" style="visibility: hidden;" src="imgs/left.png" alt="right arrow" />
                </div>
            </div>
            ${createOceanCurrents(2)}
            </section>
            ${createInstructionDialog(`
                <p>During <strong>learning</strong> periods, your aim is to <strong>learn</strong> the home fruit island for each ship.</p>
                <p>You <strong>learn</strong> by simply trying out different ships: just pick either of the ships on offer and see where it goes.</p>
            `)}
            ${createProgressBar(3, nPages)}
        </div>
        `
    },

    // Page 3: Let's try that out...
    {
        content: `
        <div class="instruction-stage">
            <img class="background" src="imgs/ocean.png" alt="Background"/>
            <section class="scene">
            <img class="island-far" src="imgs/simple_island_${downstreamIsland}.png" alt="Farther island" />
            <div class="overlap-group">
                <div class="choice-left">
                    <div class="fuel-container-left">
                    <div class="fuel-indicator-container">
                        <div class="fuel-indicator-bar"></div>
                    </div>
                    </div>
                    <img class="ship-left" src="imgs/simple_ship_${leftShip}.png" alt="Left ship" />
                    <img class="arrow-left" src="imgs/left.png" alt="left arrow" />
                </div>
                <img class="island-near" src="imgs/simple_island.png" alt="Nearer island" />
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
                    <img class="ship-right" src="imgs/simple_ship_${rightShip}.png" alt="Right ship" />
                    <img class="arrow-right" src="imgs/left.png" alt="right arrow" />
                </div>
            </div>
            ${createOceanCurrents(2)}
            </section>
            ${createInstructionDialog(`
                <p>Ok, let's give this a try! Press the <strong>right arrow key</strong> to choose the right ship.</p>
            `)}
            ${createProgressBar(4, nPages)}
        </div>
        `
    },

    // Page 4: Ending up on the next island
    {
        content: `
        <div class="instruction-stage">
            <img class="background" src="imgs/ocean.png" alt="Background"/>
            <section class="scene">
                <div class="overlap-group" style="justify-content: space-between;">
                    <div class="choice-left">
                        <img class="ship-left" src="imgs/simple_ship_${rightShip}.png" alt="Ship" style="opacity: 0;" />
                    </div>
                    <img class="island-near" style="visibility: hidden;" src="imgs/simple_island_grape.png" alt="Hidden island" />
                    <div class="choice-right">
                        <img class="island-near" src="imgs/simple_island_${CONTROL_CONFIG.controlRule[rightShip]}.png" alt="Destination island" style="top: -10%;" />
                    </div>
                </div>
            </section>
            ${createInstructionDialog(`
                <p>Great, so with enough fuel, this ${rightShip} ship can overcome the ocean currents to reach its home fruit island - ${CONTROL_CONFIG.controlRule[rightShip]} island.</p>
                `)}
            ${createProgressBar(5, nPages)}
        </div>
        `
    },

        // Page 5: Let's try again
        {
            content: `
            <div class="instruction-stage">
                <img class="background" src="imgs/ocean.png" alt="Background"/>
                <section class="scene">
                <img class="island-far" src="imgs/simple_island_${downstreamIsland}.png" alt="Farther island" />
                <div class="overlap-group">
                    <div class="choice-left">
                        <div class="fuel-container-left" style="visibility: hidden;">
                            <div class="fuel-indicator-container">
                                <div class="fuel-indicator-bar"></div>
                            </div>
                        </div>
                        <img class="ship-left" src="imgs/simple_ship_${leftShip}.png" alt="Left ship" />
                        <img class="arrow-left" src="imgs/left.png" alt="Left arrow" />
                    </div>
                    <img class="island-near" src="imgs/simple_island.png" alt="Nearer island" />
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
                        <img class="ship-right" src="imgs/simple_ship_${rightShip}.png" alt="Right ship" />
                        <img class="arrow-right" src="imgs/left.png" alt="right arrow" />
                    </div>
                </div>
                ${createOceanCurrents(2)}
                </section>
                ${createInstructionDialog(`
                    <p>Let's try again, this time press only a few times to add only a little fuel.</p>
                `)}
                ${createProgressBar(6, nPages)}
            </div>
            `
        },

    // Page 6: Ending up on the homebase
    {
        content: `
        <div class="instruction-stage">
            <img class="background" src="imgs/ocean.png" alt="Background"/>
            <section class="scene">
                <img class="island-far" src="imgs/simple_island_${downstreamIsland}.png" alt="Farther island" />
                <img class="feedback-ship" src="imgs/simple_ship_${rightShip}.png" alt="Ship" style="opacity: 0;" />
            ${createOceanCurrents(2)}
            </section>
            ${createInstructionDialog(`
                <p>The ship ran out of fuel midway.</p>
                <p>Now the ship drifted to the island at the top of the screen and did <strong>not</strong> reach its home fruit island.</p>

            `)}
            ${createProgressBar(7, nPages)}
        </div>
        `
    },

    // Page 7: Current level explanation: High
    {
        content: `
        <div class="instruction-stage">
            <img class="background" src="imgs/ocean.png" alt="Background"/>
            ${createOceanCurrents(3)}
            <div class="current-indicator">
                <div class="label"><strong>Strong current</strong>:<br> A lot of fuel needed</div>
            </div>
            ${createInstructionDialog(`
                <p>Ships need more fuel to reach their home fruit island when ocean currents are stronger.</p>
                <p>Three lines mean strong currents - you'll need a lot of fuel.</p>
            `)}
            ${createProgressBar(8, nPages)}
        </div>
        `
    },

    // Page 8: Current level explanation: Mid
    {
        content: `
        <div class="instruction-stage">
            <img class="background" src="imgs/ocean.png" alt="Background"/>
            ${createOceanCurrents(2)}
            <div class="current-indicator">
                <div class="label"><strong>Medium current</strong>:<br> Moderate fuel needed</div>
            </div>
            ${createInstructionDialog(`
                <p>Two lines mean medium current strength - you'll need a moderate amount of fuel.</p>
            `)}
            ${createProgressBar(9, nPages)}
        </div>
        `
    },

    // Page 9: Current level explanation: low
    {
        content: `
        <div class="instruction-stage">
            <img class="background" src="imgs/ocean.png" alt="Background"/>
            ${createOceanCurrents(1)}
            <div class="current-indicator">
                <div class="label"><strong>Weak current</strong>:<br> Only a little fuel needed</div>
            </div>
            ${createInstructionDialog(`
                <p>One line means the currents are weak. You don't have to put a lot of effort into fuelling up the ship.</p>
                <p>So you can be strategic and put in effort only when you think it's worth it.</p>
            `)}
            ${createProgressBar(10, nPages)}
        </div>
        `
    },

    // Page 13: Recap for training
    {
        content: `
        <div class="instruction-stage">
            <img class="background" src="imgs/ocean.png" alt="Background"/>
            <section class="scene">
            <img class="island-far" src="imgs/simple_island_${downstreamIsland}.png" alt="Farther island" />
            <div class="overlap-group">
                <div class="choice-left">
                    <div class="fuel-container-left" style="visibility: hidden;">
                        <div class="fuel-indicator-container">
                            <div class="fuel-indicator-bar"></div>
                        </div>
                    </div>
                    <img class="ship-left" src="imgs/simple_ship_${leftShip}.png" alt="Left ship" />
                    <img class="arrow-left" src="imgs/left.png" alt="Left arrow" />
                </div>
                <img class="island-near" src="imgs/simple_island.png" alt="Nearer island" />
                <div class="choice-right">
                    <div class="fuel-container-right">
                        <div class="fuel-indicator-container">
                            <div class="fuel-indicator-bar"></div>
                        </div>
                    </div>
                    <img class="ship-right" src="imgs/simple_ship_${rightShip}.png" alt="Right ship" />
                    <img class="arrow-right" src="imgs/left.png" alt="right arrow" />
                </div>
            </div>
            ${createOceanCurrents(2)}
            </section>
            ${createInstructionDialog(`
                <p>To recap, during <strong>learning</strong>, you will learn each ship's home fruit island and fuel requirements for different current strengths</strong>.</p>
            `)}
            ${createProgressBar(11, nPages)}
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
    simulation_options: {simulate: false},
    on_page_change: function(current_page) {
        if (current_page === 3) {
            setupFuelTrial({
                initialMessage: `<p>Now press the same <strong>right arrow key</strong> multiple times to give it a lot of fuel.</p>`,
                // Update progress based on 30 presses (i.e. progress runs from 0 to 100%).
                progressCalculation: (trialPresses) => (trialPresses / 30) * 100,
                // Finish trial when the fuel bar reaches 100% width.
                finishCondition: (trialPresses, progress) => progress >= 75,
                finishMessage: `<p>Now the fuel is sufficient for this ship, and it's leaving now!</p>`
            });
        }

        if (current_page === 4) {
            const choice = 'right';
            const feedbackChoice = choice === 'left' ? 'right' : 'left';
            const islandSide = feedbackChoice === 'left' ? 'right' : 'left';

            // Add animation styles
            const shipImg = display_element.querySelector(`.ship-${feedbackChoice}`);
            const islandImg = display_element.querySelector(`.choice-${islandSide} .island-near`);
            
            // Calculate the distance to move the ship
            const distance = islandImg.offsetWidth + shipImg.offsetWidth / 4;

            // Determine if ship should be flipped based on which side it starts from
            // Ships on the left are already flipped with scaleX(-1) in the CSS
            // As long as it's flipped here, it will move in the correct direction
            const shouldFlip = feedbackChoice === 'left';
            const scaleX = shouldFlip ? '-1' : '1';

            const animationStyle = document.createElement('style');
            animationStyle.setAttribute('data-feedback-animation', 'true');


            // Create the animation CSS with proper scale preservation
            animationStyle.textContent = `
                @keyframes moveShip {
                    0% { 
                        opacity: 0;
                        transform: scaleX(${scaleX}) translateX(0);
                    }
                    100% { 
                        opacity: 1;
                        transform: scaleX(${scaleX}) translateX(-${distance}px);
                    }
                }
                    
                .ship-animate {
                animation: moveShip 600ms ease-out forwards;
                }
            `;
            document.head.appendChild(animationStyle);

            // Apply the animation class after a small delay to ensure DOM is ready
            setTimeout(() => {
                shipImg.classList.add('ship-animate');
            }, 50);
        }

        if (current_page === 5) {
            setupFuelTrial({
                initialMessage: `<p>Try again, this time press only a few times to add only a little fuel.</p>`,
                progressCalculation: (trialPresses) => (trialPresses / 30) * 100,
                // Finish trial when 5 fuel presses have been recorded.
                finishCondition: (trialPresses, progress) => trialPresses >= 5,
                finishMessage: `<p>Fueling time is limited. The ship has gone now!</p>`
            });
        }

        if (current_page === 6) {
            const choice = 'right';

            // Add animation styles
            const shipImg = display_element.querySelector(`.feedback-ship`);
            const islandImg = display_element.querySelector(`.island-far`);
            
            // Calculate the distance to move the ship
            const distance = islandImg.offsetWidth/2 + shipImg.offsetWidth;

            // Determine if ship should be flipped based on which side it starts from
            // Ships on the left are already flipped with scaleX(-1) in the CSS
            // As long as it's flipped here, it will move in the correct direction
            const shouldFlip = choice === 'left';
            const scaleX = shouldFlip ? '-1' : '1';

            // Remove any existing animation style elements
            const existingAnimationStyle = document.querySelector('style[data-feedback-animation="true"]');
            if (existingAnimationStyle) {
                existingAnimationStyle.remove();
            }
            
            const animationStyle = document.createElement('style');
            animationStyle.setAttribute('data-feedback-animation', 'true');


            // Create the animation CSS with proper scale preservation
            animationStyle.textContent = `
                @keyframes moveShip {
                    0% { 
                        opacity: 0;
                        transform: scaleX(${scaleX}) translateX(${distance}px) translateY(${shipImg.offsetHeight/2}px);
                    }
                    100% { 
                        opacity: 1;
                        transform: scaleX(${scaleX * 0.9}) scaleY(0.9) translateX(${shipImg.offsetWidth/3 + islandImg.offsetWidth/2}px);
                    }
                    }
                    
                    .ship-animate {
                    animation: moveShip 600ms ease-out forwards;
                    }
            `;
            document.head.appendChild(animationStyle);

            // Apply the animation class after a small delay to ensure DOM is ready
            setTimeout(() => {
                shipImg.classList.add('ship-animate');
            }, 100);
        }
    }
};

const controlInstructionLastPage = {
    type: jsPsychInstructions,
    css_classes: ['instructions'],
    pages: [
            `
            <div class="instruction-stage">
                <img class="background" src="imgs/ocean.png" alt="Background"/>
                <div class="instruction-dialog" style="bottom:40%; min-width: 600px;">
                    <div class="instruction-content" style="font-size: 1.2em; text-align: center;">
                        <p>😊 Well done! You've completed the instructions and are ready to start.</p>
                        <p>First <strong>learning</strong> period will begin soon.</p>
                        <p>Before you start playing, you'll answer a few questions about the instructions you just read.</p>
                        <p>You must answer all questions correctly to begin the game.</p>
                        <p>Press <span class="spacebar-icon">Next</span> to continue or <span class="spacebar-icon">Restart</span> to review these instructions again.</p>
                    </div>
                </div>
            </div>
            `
    ],
    allow_keys: false,
    show_clickable_nav: true,
    show_page_number: false,
    data: {trialphase: "control_instructions"},
    simulation_options: {simulate: false},
    on_load: function() {
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
};

// Prediction trial
let controlInstructionPredTrials = [];
controlInstructionPredTrials.push({
    type: jsPsychPredictHomeBase,
    ship: "blue",
    predict_decision: null,
    post_trial_gap: 0,
    data: {trialphase: "control_instruction_prediction"},
    on_load: function () {
        // Remove the icon-row element if it exists
        const iconRow = document.querySelector('.icon-row');
        if (iconRow) {
            iconRow.remove();
        }
        const instructionStage = document.querySelector('.instruction-stage');
        // Add a brief instruction dialog at the top of the prediction screen
        const instructionDialog = document.createElement('div');
        instructionDialog.className = 'instruction-dialog';
        instructionStage.appendChild(instructionDialog);
        // Position the instruction dialog in the center of the screen
        instructionDialog.style.position = "absolute";
        instructionDialog.style.bottom = "25%";
        instructionDialog.style.left = "50%";
        instructionDialog.style.transform = "translate(-50%, -50%)";
        instructionDialog.style.zIndex = "10";
        instructionDialog.innerHTML = `
            <div class="instruction-content" style="font-size: 1.2em; ">
                <p>Every now and then, we will ask you to tell us what you have learned.</p>
                <p>Make sure to pay attention to the home fruit island of each ship during <strong>learning</strong>.</p>
                <p>Now, finish this example test to continue.</p>
            </div>
        `;
    }
});


// Comprehension check
let controlIntroComprehension = [];
controlIntroComprehension.push({
    type: jsPsychSurveyMultiChoice,
    preamble: `<div class=instructions><p>For each statement, please indicate whether it is true or false:</p></div>`,
    data: {trialphase: "control_instruction_quiz"},
    questions: [
        {
            prompt: "During <strong>learning</strong> periods, I need to learn about the home fruit island for each ship and how much to fuel for different current strengths.",
            name: "learning",
            options: ["True", "False"],
            required: true
        },
        {
            prompt: "When a ship doesn't have enough fuel, it will drift to the island at the top of the screen following ocean currents.",
            name: "drift",
            options: ["True", "False"],
            required: true
        },
        {
            prompt: "The amount of fuel needed to reach a ship's home fruit island depends on the ocean current strength.",
            name: "current_fuel",
            options: ["True", "False"],
            required: true
        },
        {
            prompt: `The ${rightShip} ship has ${CONTROL_CONFIG.controlRule[rightShip]} island as its home fruit island.`,
            name: "homebase",
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
                Q3: `True`
            }
        }
    }
});

const controlQuizExplanation = [
    {
        prompt: "During <strong>learning</strong> periods, I need to learn about the home fruit island for each ship and how much to fuel for different current strengths.",
        explanation: "Learning the home fruit island for each ship and the fuel to overcome different current strengths is the main goal during learning periods."
    },
    {
        prompt: "When a ship doesn't have enough fuel, it will drift to the island at the top of the screen following ocean currents.",
        explanation: "Ships that are not fueled enough to overcome the currents will drift to the island at the top of the screen."
    },
    {
        prompt: "The amount of fuel needed to reach a ship's home fruit island depends on the ocean current strength.",
        explanation: "Stronger currents (indicated by more lines) require more fuel to reach the home fruit island."
    },
    {
        prompt: `The ${rightShip} ship has ${CONTROL_CONFIG.controlRule[rightShip]} island as its home fruit island.`,
        explanation: `The ${rightShip} ship's home fruit island in this game is ${CONTROL_CONFIG.controlRule[rightShip]}.`
    }
]



controlIntroComprehension.push(
    {   
        type: jsPsychInstructions,
        css_classes: ['instructions'],
        allow_keys: false,
        show_page_number: false,
        show_clickable_nav: true,
        simulation_options: {simulate: false},
        data: {
            trialphase: "control_instruction_quiz_review"
        },
        timeline: [
            {
                pages: [
                `
                <p>You did not answer all the quiz questions correctly.</p>
                <p>Press <span class="spacebar-icon">Next</span> to review the questions answered wrong.</p>
                `
                ]
            },
            {
                pages: () => {
                    const data = jsPsych.data.get().filter({trialphase: "control_instruction_quiz"}).last(1).select('response').values[0];
                    console.log(data);
                    return controlQuizExplanation.filter((item, index) => {
                        return Object.values(data)[index] !== "True";
                    }).map(item => `
                        <p>You've answered wrong for the following question:</p>
                        <h3 style="color: darkred;">Question: ${item.prompt}</h3>
                        <p><strong>Your answer:</strong> False</p>
                        <p><strong>Explanation:</strong> ${item.explanation}</p>
                    `);
                }
            }
        ],
        conditional_function: () => {
            const data = jsPsych.data.get().filter({trialphase: "control_instruction_quiz"}).last(1).select('response').values[0];
            console.log(data);
            return !Object.values(data).every(value => value === "True");
        }
    }
)

controlIntroComprehension.push(
    {   
        type: jsPsychInstructions,
        css_classes: ['instructions'],
        allow_keys: false,
        show_page_number: false,
        show_clickable_nav: true,
        simulation_options: {simulate: false},
        data: {
            trialphase: "control_instruction_quiz_failure"
        },
        timeline: [
            {
                pages: [
                `
                <p>Press <span class="spacebar-icon">Next</span> to re-take the quiz questions</p>
                <p>or <span class="spacebar-icon">Restart</span> to review the full instructions again.</p>
                `
                ]
            }
        ],
        on_load: function() {
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
        },
        conditional_function: () => {
            const data = jsPsych.data.get().filter({trialphase: "control_instruction_quiz"}).last(1).select('response').values[0];

            return !Object.values(data).every(value => value === "True");
        }
    }
)

// Add looping functionality to the instruction trial
const controlInstructions = {
    timeline: [
        controlInstructionTrial, 
        controlInstructionPredTrials, 
        controlInstructionLastPage
    ],
    loop_function: () => {
        const restart = jsPsych.data.get().filter({trialphase: "control_instructions"}).last(1).select('restart').values[0];
        return restart;
    }
};

const controlComprehensionLoop = {
    timeline: [controlIntroComprehension],
    loop_function: () => {
        const data = jsPsych.data.get().filter({trialphase: "control_instruction_quiz"}).last(1).select('response').values[0];
        const restart = jsPsych.data.get().filter({trialphase: "control_instruction_quiz_failure"}).last(1).select('restart').values[0];

        return !Object.values(data).every(value => value === "True") && !restart;
    }
}

const controlInstructionsLoop = {
    timeline: [controlInstructions, controlComprehensionLoop],
    loop_function: () => {
        const data = jsPsych.data.get().filter({trialphase: "control_instruction_quiz"}).last(1).select('response').values[0];
        const restart = jsPsych.data.get().filter({trialphase: "control_instruction_quiz_failure"}).last(1).select('restart').values[0];
        return !Object.values(data).every(value => value === "True") && restart;
    }
};

const controlInstructionsTimeline = [
    controlInstructionsLoop,
    {
        type: jsPsychHtmlKeyboardResponse,
        css_classes: ['instructions'],
        stimulus: `<p><strong>Great! You're now ready to begin the real game.</strong></p>
        <p>You'll play multiple rounds, which typically takes about <strong>20 minutes</strong> to complete.</p>
        <p>When you're ready, place your fingers comfortably on the <strong>left and right arrow keys</strong> as shown below. Press down <strong> both left and right arrow keys at the same time </strong> to begin.</p>
        <img src='imgs/PILT_keys.jpg' style='width:250px;'></img>`,
        // choices: ['arrowright', 'arrowleft'],
        data: {trialphase: "control_instruction_end"},
        response_ends_trial: false,
        simulation_options: {simulate: false},
        on_load: function() {
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
        }
    }
];