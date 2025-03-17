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
            document.querySelector('.instruction-content').innerHTML = config.finishMessage;
            jsPsych.pluginAPI.setTimeout(() => {
                document.getElementById("jspsych-instructions-next").disabled = false;
            }, config.finishDelay || 1000);
        }
    }
}

// Main instruction pages configuration
const nPages = 16;
const controlInstructionPages = [
    // Page 0: Initial Welcome
    {
        content: `
        <div class="instruction-stage">
            <img class="background" src="imgs/ocean.png" alt="Background"/>
            <section class="scene">
            <div class="overlap-group">
                <img class="island-near" src="imgs/simple_island_banana.png" alt="Nearer island" />
            </div>
            ${createOceanCurrents(3)}
            </section>
            ${createInstructionDialog(`
                <h2>Welcome to the Island Explorer Game!</h2>
                <p>You are an explorer of tropical islands, each famous for the unique fruit that grows there.</p>
                <p>In this game, you'll sail from island to island, with the goal of discovering how the islands and the shipping routes connecting them are arranged.</p>
                `)}
            ${createProgressBar(1, nPages)}
        </div>
        `
    },

    // Page 1: You start on this coconut island
    {
        content: `
        <div class="instruction-stage">
            <img class="background" src="imgs/ocean.png" alt="Background"/>
            <section class="scene">
            <div class="overlap-group">
                <img class="island-near" src="imgs/simple_island_banana.png" alt="Nearer island" />
                <div class="island-indicator near-indicator">
                    <span class="selection-dot"></span>
                    <div class="selection-label">Current Island</div>
                </div>
            </div>
            ${createOceanCurrents(3)}
            </section>
            ${createInstructionDialog(`
                <p>As an explorer, you choose which ship to take and how much fuel to provide it.</p>
                <p>You will start each turn from one of four islands.</p>
                <p>Currently, you're starting on <span style="color: gold">Banana Island</span>🍌...</p>
            `)}
            ${createProgressBar(2, nPages)}
        </div>
        `
    },

    // Page 2: The ships are docked at the island.
    {
        content: `
        <div class="instruction-stage">
            <img class="background" src="imgs/ocean.png" alt="Background"/>
            <section class="scene">
            <div class="overlap-group">
                <div class="choice-left">
                    <div class="selection-indicator">
                        <div class="selection-label">The green ship...</div>
                        <span class="selection-dot"></span>
                    </div>
                    <img class="ship-left" src="imgs/simple_ship_green.png" alt="Left ship" />
                    <img class="arrow-left" src="imgs/left.png" alt="Left arrow" />
                </div>
                <img class="island-near" src="imgs/simple_island_banana.png" alt="Nearer island" />
                <div class="choice-right">
                    <div class="selection-indicator">
                        <div class="selection-label">...and blue ship</div>
                        <span class="selection-dot"></span>
                    </div>
                    <img class="ship-right" src="imgs/simple_ship_blue.png" alt="Right ship" />
                    <img class="arrow-right" src="imgs/left.png" alt="right arrow" />
                </div>
            </div>
            ${createOceanCurrents(3)}
            </section>
            ${createInstructionDialog(`
                <p>Now, two ships are docked here:</p>
                <ul>
                    <li>A <span style="color: ForestGreen">green ship</span> on the left</li>
                    <li>A <span style="color: royalblue">blue ship</span> on the right</li>
                </ul>
            `)}
            ${createProgressBar(3, nPages)}
        </div>
        `
    },

    // Page 3: Start trying with the ship on the right
    {
        content: `
        <div class="instruction-stage">
            <img class="background" src="imgs/ocean.png" alt="Background"/>
            <section class="scene">
            <div class="overlap-group">
                <div class="choice-left">
                    <img class="ship-left" src="imgs/simple_ship_green.png" alt="Left ship" />
                    <img class="arrow-left" src="imgs/left.png" alt="Left arrow" />
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
            ${createOceanCurrents(3)}
            </section>
            ${createInstructionDialog(`
                <p>Each ship has a specific home island. If you provide enough fuel, the ship will take you directly to its home island.</p>
                <p>Let's try it out! <strong>Select the blue ship by pressing the right arrow key.</strong></p>
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
                <div class="overlap-group">
                    <div class="choice-left">
                        <img class="island-near" src="imgs/simple_island_coconut.png">
                    </div>
                    <img class="island-near" style="visibility: hidden;" src="imgs/simple_island_grape.png" alt="Nearer island" />
                    <div class="choice-right">
                        <img class="ship-right" src="imgs/simple_ship_blue.png">
                    </div>
                </div>
            </section>
            ${createInstructionDialog(`
                <p>The ship didn't have enough fuel and ran out of fuel midway. Luckily, the ocean currents tend to carry ships with insufficient fuel to the next island.</p>
                <p>So the ship just drifted from the <span style="color: gold">banana island</span>🍌 to the <span style="color: brown">coconut island</span>🥥, which is the next island.</p>`)}
            ${createProgressBar(5, nPages)}
        </div>
        `
    },

    // Page 5: Islands in the Chain
    {
        content: `
        <div class="instruction-stage">
            <img class="background" src="imgs/default_islands.png" alt="Background"/>
            ${createInstructionDialog(`
                <p>Thanks to many former explorers, this is a map of the four islands in the network. The arrows show how the ocean currents work.</p>
                <p><strong>When a ship does not have sufficient fuel, the current carries it to the next island along the arrows.</strong></p>
                <p>For example, without fuel, a ship leaving the <span style="color: orange">orange island</span>🍊 will end up on the <span style="color: gold">banana island</span>🍌.</p>
            `)}
            ${createProgressBar(6, nPages)}
        </div>
    `
    },

    // Page 6: Let's try again
    {
        content: `
        <div class="instruction-stage">
            <img class="background" src="imgs/ocean.png" alt="Background"/>
            <section class="scene">
            <img class="island-far" src="imgs/simple_island_coconut.png" alt="Farther island" />
            <div class="island-indicator far-indicator">
                <span class="selection-dot"></span>
                <div class="selection-label">This is the next island<br>(and will always be visible)</div>
            </div>
            <div class="overlap-group">
                <div class="choice-left">
                    <img class="ship-left" src="imgs/simple_ship_green.png" alt="Left ship" />
                    <img class="arrow-left" src="imgs/left.png" alt="Left arrow" />
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
            ${createOceanCurrents(3)}
            </section>
            ${createInstructionDialog(`
                <p>Let's try it again. <strong>In the distance, you can see the next island is <span style="color: brown">Coconut Island</span>🥥.</strong> This is where you'll end up if you don't provide enough fuel.</p>
                <p>Now, try to fully fuel the ship by rapidly pressing the arrow key repeatedly.</p>
                <p>Don't worry! We'll give you some extra time.</p>
            `)}
            ${createProgressBar(7, nPages)}
        </div>
        `
    },


    // Page 7: Ending up on the homebase
    {
        content: `
        <div class="instruction-stage">
            <img class="background" src="imgs/ocean.png" alt="Background"/>
            <section class="scene">
                <div class="overlap-group">
                    <div class="choice-left">
                        <img class="island-near" src="imgs/simple_island_grape.png">
                    </div>
                    <img class="island-near" style="visibility: hidden;" src="imgs/simple_island_grape.png" alt="Nearer island" />
                    <div class="choice-right">
                        <img class="ship-right" src="imgs/simple_ship_blue.png">
                    </div>
                </div>
            </section>
            ${createInstructionDialog(`
                <p>Great, the ship had enough fuel this time! When a ship have enough fuel, it will try to return to its home base.</p>
                <p>This <span style="color: royalblue">blue ship</span> has a <span style="color: purple">grape island</span>🍇 as the home base. Because it's fueled up this time, it went to its home base island instead of drifting with the current to the next island.</p>
                <p><strong>Note that the ships can also start from and sail back to their home bases.</strong></p>
            `)}
            ${createProgressBar(8, nPages)}
        </div>
        `
    },

    // Page 8: Current level explanation: low
    {
        content: `
        <div class="instruction-stage">
            <img class="background" src="imgs/ocean.png" alt="Background"/>
            ${createOceanCurrents(1)}
            <div class="current-indicator">
                <div class="label">Low current:<br> a little fuel needed</div>
            </div>
            ${createInstructionDialog(`
                <p>But how much fuel is enough? This depends on the ocean current. You can check the current strength each day:</p>
                <p>One stripe means low current: only a little fuel is needed...</p>
            `)}
            ${createProgressBar(9, nPages)}
        </div>
        `
    },

    // Page 9: Current level explanation: Mid
    {
        content: `
        <div class="instruction-stage">
            <img class="background" src="imgs/ocean.png" alt="Background"/>
            ${createOceanCurrents(2)}
            <div class="current-indicator">
                <div class="label">Medium current:<br> a moderate amount of fuel needed</div>
            </div>
            ${createInstructionDialog(`
                <p>Two stripes mean medium current: a moderate amount of fuel is needed...</p>
            `)}
            ${createProgressBar(10, nPages)}
        </div>
        `
    },

    // Page 10: Current level explanation: High
    {
        content: `
        <div class="instruction-stage">
            <img class="background" src="imgs/ocean.png" alt="Background"/>
            ${createOceanCurrents(3)}
            <div class="current-indicator">
                <div class="label">Strong current:<br> a lot of fuel needed</div>
            </div>
            ${createInstructionDialog(`
                <p>Three stripes indicate a strong current: you will need a lot of fuel.</p>
                <p>The stronger the current, the more fuel you'll have to fuel the ship <strong>if you want it to go to its home base</strong>.</p>
            `)}
            ${createProgressBar(11, nPages)}
        </div>
        `
    },

    // Page 11: Quest trial explanation
    {
        content: `
        <div class="instruction-stage">
            <img class="background" src="imgs/ocean.png" alt="Background"/>
            <section class="scene">
            <img class="island-far" src="imgs/simple_island_coconut.png" alt="Farther island" />
            <div class="quest-scroll">
                <p style="position: absolute; z-index: 4; top: 15px; font-size: 18px; color: maroon">Target Island</p>
                <img class="quest-scroll-img" src="imgs/scroll.png" alt="Quest scroll" />
                <img class="island-target" src="imgs/island_icon_grape.png" alt="Target island" />
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
            ${createOceanCurrents(3)}
            </section>
            ${createInstructionDialog(`
                <p>Once in a while in your job, you will receive rewarded quests like this.</p>
                <p>When you see a quest scroll, use your knowledge of the shipping network to choose the appropriate ship and decide how much fuel to provide.</p>
                <p>Successfully completing quests earns you extra money!</p>
            `)}
            ${createProgressBar(12, nPages)}
        </div>
        `
    },

    // Page 12: Quest trial tryout
    {
        content: `
        <div class="instruction-stage">
            <img class="background" src="imgs/ocean.png" alt="Background"/>
            <section class="scene">
            <img class="island-far" src="imgs/simple_island_coconut.png" alt="Farther island" />
            <div class="quest-scroll">
                <p style="position: absolute; z-index: 4; top: 15px; font-size: 18px; color: maroon">Target Island</p>
                <img class="quest-scroll-img" src="imgs/scroll.png" alt="Quest scroll" />
                <img class="island-target" src="imgs/island_icon_grape.png" alt="Target island" />
                <p style="position: absolute; z-index: 4; top: 125px; font-size: 18px; color: maroon">Quest reward: 5p</p>
            </div>
            <div class="overlap-group">
                <div class="choice-left">
                    <img class="ship-left" src="imgs/simple_ship_green.png" alt="Left ship" />
                    <img class="arrow-left" src="imgs/left.png" alt="Left arrow" />
                </div>
                <img class="island-near" src="imgs/simple_island_banana.png" alt="Nearer island" />
                <div class="choice-right">
                    <div class="fuel-container-right">
                    <div class="fuel-indicator-container">
                        <div class="fuel-indicator-bar"></div>
                    </div>
                    </div>
                    <img class="ship-right" src="imgs/simple_ship_blue.png" alt="Right ship" />
                    <img class="arrow-right" src="imgs/left.png" alt="right arrow" />
                </div>
            </div>
            ${createOceanCurrents(3)}
            </section>
            ${createInstructionDialog(`
                <p>Let's give it a try!</p>
                <p>Remember, you've already learned that <strong>the <span style="color: royalblue">blue ship</span>'s home base is <span style="color: purple">grape island</span>🍇</strong>. So, if you provide it with enough fuel, it will take you directly to the target island.</p>
                <p>Now, try the blue ship and fuel it up to reach the target island.</p>
            `)}
            ${createProgressBar(13, nPages)}
        </div>
        `
    },

    // Page 13: Quest trial outcome
    {
        content: `
        <div class="instruction-stage">
            <img class="background" src="imgs/ocean_above.png" alt="Background"/>
            <div class="instruction-dialog" style="bottom:50%; min-width: 600px; width: 50%;">
                <div class="instruction-content" style="font-size: 24px; text-align: center;">
                <p>🎉Congratulations!</p><p>You successfully transport the cargo to the target island.</p>
                </div>
            </div>
            ${createInstructionDialog(`
                <p>Great job! You've successfully completed the quest and earned a reward of 5p.</p>
                <p>The more quests you complete, the more money you'll earn!</p>
            `)}
            ${createProgressBar(14, nPages)}
        </div>
        `
    },

    // Page 14: Other types of questions
    {
        content: `
        <div class="instruction-stage">
            <img class="background" src="imgs/ocean.png" alt="Background"/>
            <section class="scene">
                <div class="overlap-group">
                    <div class="choice-left">
                        <div class="selection-indicator" style="top: 50%;">
                            <div class="selection-label">What's the home base of this ship?</div>
                            <span class="selection-dot"></span>
                        </div>
                        <img class="island-near" src="imgs/simple_island_banana.png" style="visibility:hidden;" alt="Nearer island" />
                        <img class="ship-left" src="imgs/simple_ship_blue.png" style="top:-20%" alt="Prediction ship" />
                    </div>
                </div>
            </section>
            ${createInstructionDialog(`
                <p>Sometimes we'll also check your knowledge directly. We'll show you a ship and simply ask you to identify its home island.</p>
            `)}
            ${createProgressBar(15, nPages)}
        </div>
        `
    },

    // Page 15: End of instructions
    {
        content: `
        <div class="instruction-stage">
            <img class="background" src="imgs/ocean_above.png" alt="Background"/>
            <div class="instruction-dialog" style="bottom:30%; min-width: 600px;">
                <div class="instruction-content" style="font-size: 1.2em; text-align: center;">
                    <p>😊 <strong>Perfect!</strong> You've successfully completed the instructions.</p>
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
    simulation_options: {simulate: false},
    on_page_change: function(current_page) {
        if (current_page === 3) {
            setupFuelTrial({
                initialMessage: `<p>You can now load up fuel by <strong>pressing the same arrow key again and again.</strong> The fuel gauge will fill up as you press the key.</p>
                <p>Give it a try!</p>`,
                progressCalculation: (trialPresses) => (trialPresses / 30) * 100,
                // Finish trial when 5 fuel presses have been recorded.
                finishCondition: (trialPresses, progress) => trialPresses >= 5,
                finishMessage: `<p>Fueling time is limited. The ship has to leave now!</p>`
            });
        }

        if (current_page === 4 || current_page === 7) {
            // Add animation styles
            const animationStyle = document.createElement('style');
            animationStyle.setAttribute('data-feedback-animation', 'true');

            const shipImg = document.querySelector('.ship-right');
            
            // Determine if ship should be flipped based on which side it starts from
            // Ships on the left are already flipped with scaleX(-1) in the CSS
            // As long as it's flipped here, it will move in the correct direction
            const choice = 'right';
            const shouldFlip = choice === 'left';
            const scaleX = shouldFlip ? '-1' : '1';
            
            // Calculate the distance to move the ship
            const distance = document.querySelector('.island-near').offsetWidth - shipImg.offsetWidth/2;

            // Create the animation CSS with proper scale preservation
            animationStyle.textContent = `
                @keyframes moveShip {
                0% { 
                    transform: scaleX(${scaleX}) translateX(0);
                }
                100% { 
                    transform: scaleX(${scaleX}) translateX(-${distance}px);
                }
                }
                
                .ship-animate {
                animation: moveShip 0.95s ease-in-out forwards;
                }
            `;
            document.head.appendChild(animationStyle);

            // Apply the animation class after a small delay to ensure DOM is ready
            setTimeout(() => {
                shipImg.classList.add('ship-animate');
            }, 50);
        }

        if (current_page === 6) {
            setupFuelTrial({
                initialMessage: `<p>Keep adding fuel to the ship until it's full!</p>`,
                // Update progress based on 30 presses (i.e. progress runs from 0 to 100%).
                progressCalculation: (trialPresses) => (trialPresses / 30) * 100,
                // Finish trial when the fuel bar reaches 100% width.
                finishCondition: (trialPresses, progress) => progress >= 100,
                finishMessage: `<p>Now the fuel is full for this ship, and it's about to leave now!</p>`
            });
        }

        if (current_page === 12) {
            setupFuelTrial({
                initialMessage: `<p>Keep adding fuel to the ship until it's full just in case!</p>`,
                // Update progress based on 30 presses (i.e. progress runs from 0 to 100%).
                progressCalculation: (trialPresses) => (trialPresses / 30) * 100,
                // Finish trial when the fuel bar reaches 100% width.
                finishCondition: (trialPresses, progress) => progress >= 100,
                finishMessage: `<p>The ship is now fully fueled and ready to depart! Let’s see if you successfully complete this quest!</p>`
            });
        }

        if (current_page === 15) {
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
        simulation_options: {simulate: false},
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
    },
    on_timeline_start: () => {
        updateState(`control_start_instructions`)
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