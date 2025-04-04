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
        }
    }
}

// Main instruction pages configuration
const nPages = 13;
const controlInstructionPages = [
    // Page 0: Initial Welcome
    {
        content: `
        <div class="instruction-stage">
            <img class="background" src="imgs/ocean.png" alt="Background"/>
            <section class="scene">
            <img class="island-far" src="imgs/simple_island_coconut.png" alt="Farther island" />
            <div class="overlap-group">
                <div class="choice-left">
                    <div class="fuel-container-left" style="visibility: hidden;">
                        <div class="fuel-indicator-container">
                            <div class="fuel-indicator-bar"></div>
                        </div>
                    </div>
                    <img class="ship-left" src="imgs/simple_ship_green.png" alt="Left ship" />
                    <img class="arrow-left" style="visibility: hidden;" src="imgs/left.png" alt="Left arrow" />
                </div>
                <img class="island-near" src="imgs/simple_island_banana.png" alt="Nearer island" />
                <div class="choice-right">
                    <div class="fuel-container-right">
                        <div class="fuel-indicator-container">
                            <div class="fuel-indicator-bar"></div>
                        </div>
                    </div>
                    <img class="ship-right" src="imgs/simple_ship_blue.png" alt="Right ship" />
                    <img class="arrow-right" style="visibility: hidden;" src="imgs/left.png" alt="right arrow" />
                </div>
            </div>
            ${createOceanCurrents(2)}
            </section>
            ${createInstructionDialog(`
                <h2>Welcome to your new position as Fruit Shipping Manager!</h2>
                <p>You're responsible for the transportation of valuable fruit cargo between islands.</p>
                <p>With proper training, you'll earn rewards and become a skilled manager.</p>
                `)}
            ${createProgressBar(1, nPages)}
        </div>
        `
    },

    // Page 1: Main responsibility
    {
        content: `
        <div class="instruction-stage">
            <img class="background" src="imgs/ocean.png" alt="Background"/>
            <section class="scene">
            <div class="icon-container" style="display: flex; flex-direction: column; align-items: left; justify-content: center; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: rgba(255,255,255,0.8); padding: 20px; border-radius: 10px; width: 60%; max-width: 500px;">
                <h3>As a manager, you have three duties:</h3>
                <div class="icon-row" style="display: flex; align-items: center; margin: 10px 0;">
                    <img src="imgs/icon-explore.png" alt="Training Voyages" style="width: 50px; height: 50px; margin-right: 15px;"><p style="text-align: left;"><strong>Running Training Voyages</strong></br><span style="font-size: 18px;">Go on practice runs to learn how ships and ocean currents behave</span></p>
                </div>
                <div class="icon-row" style="display: flex; align-items: center; margin: 10px 0;">
                    <img src="imgs/icon-reward.png" alt="Reward Missions" style="width: 50px; height: 50px; margin-right: 15px;"><p style="text-align: left;"><strong>Completing Reward Missions</strong></br><span style="font-size: 18px;">Official cargo deliveries where you'll earn rewards by sending the ship to the target island</span></p>
                </div>
                <div class="icon-row" style="display: flex; align-items: center; margin: 10px 0;">
                    <img src="imgs/icon-predict.png" alt="Knowledge Assessments:" style="width: 50px; height: 50px; margin-right: 15px;"><p style="text-align: left;"><strong>Showing Your Knowledge</strong></br><span style="font-size: 18px;">Brief tests to confirm your understanding of shipping routes</span></p>
                </div>
            </div>
            </section>
            ${createInstructionDialog(`
                <p>You will alternate between these duties. You will always be told what your current duty is.</p>
                <p>Let's start with <strong>Training Voyages</strong> so you can learn the basics before taking on real assignments.</p>
            `)}
            ${createProgressBar(2, nPages)}
        </div>
        `
    },

    // Page 2: The Training Voyages
    {
        content: `
        <div class="instruction-stage">
            <img class="background" src="imgs/ocean.png" alt="Background"/>
            <section class="scene">
            <div class="nav-map">
                <img class="nav-map-img" src="imgs/map.png" alt="Navigation map" />
                <img class="nav-map-island" src="imgs/map_islands.png" alt="Map islands" />
            </div>
            <div class="icon-row" style="position: absolute; display: flex; align-items: center; top: 0%;">
                <img src="imgs/icon-explore.png" alt="Training Voyages" style="width: 40px; height: 40px; margin-right: 15px;"><p style="width: auto; text-align: left; color: #0F52BA;">Training Voyage</p>
            </div>
            <img class="island-far" src="imgs/simple_island_coconut.png" alt="Farther island" />
            <div class="overlap-group">
                <div class="choice-left">
                    <div class="selection-indicator">
                        <div class="selection-label">Green Ship</div>
                        <span class="selection-dot"></span>
                    </div>
                    <div class="fuel-container-left" style="visibility: hidden;">
                        <div class="fuel-indicator-container">
                            <div class="fuel-indicator-bar"></div>
                        </div>
                    </div>
                    <img class="ship-left" src="imgs/simple_ship_green.png" alt="Left ship" />
                    <img class="arrow-left" style="visibility: hidden;" src="imgs/left.png" alt="Left arrow" />
                </div>
                <img class="island-near" src="imgs/simple_island_banana.png" alt="Nearer island" />
                <div class="choice-right">
                    <div class="selection-indicator"">
                        <div class="selection-label">Blue Ship</div>
                        <span class="selection-dot"></span>
                    </div>
                    <div class="fuel-container-right">
                        <div class="fuel-indicator-container">
                            <div class="fuel-indicator-bar"></div>
                        </div>
                    </div>
                    <img class="ship-right" src="imgs/simple_ship_blue.png" alt="Right ship" />
                    <img class="arrow-right" style="visibility: hidden;" src="imgs/left.png" alt="right arrow" />
                </div>
            </div>
            ${createOceanCurrents(2)}
            </section>
            ${createInstructionDialog(`
                <p>Every ship in our fleet has two important properties:</p>
                <ul>
                    <li>Every ship has a <strong>home island</strong> it can reach when properly fueled</li>
                    <li>Every ship needs sufficient fuel to overcome the ocean currents</li>
                </ul>
            `)}
            ${createProgressBar(3, nPages)}
        </div>
        `
    },

    // Page 3: Without fuel...
    {
        content: `
        <div class="instruction-stage">
            <img class="background" src="imgs/ocean.png" alt="Background"/>
            <section class="scene">
            <div class="nav-map">
                <img class="nav-map-img" src="imgs/map.png" alt="Navigation map" />
                <img class="nav-map-island" src="imgs/map_islands.png" alt="Map islands" />
            </div>
            <div class="icon-row" style="position: absolute; display: flex; align-items: center; top: 0%;">
                <img src="imgs/icon-explore.png" alt="Training Voyages" style="width: 40px; height: 40px; margin-right: 15px;"><p style="width: auto; text-align: left; color: #0F52BA;">Training Voyage</p>
            </div>
            <div class="selection-indicator" style="top: 38%;left: 15%;">
                <span class="selection-dot"></span>
                <div class="selection-label">Ocean Map</div>
            </div>
            <div class="icon-row" style="position: absolute; display: flex; align-items: center; top: 0%;">
                <img src="imgs/icon-explore.png" alt="Training Voyages" style="width: 40px; height: 40px; margin-right: 15px;"><p style="width: auto; text-align: left; color: #0F52BA;">Training Voyage</p>
            </div>
            <div class="selection-indicator" style="top: 20%;left: 65%;flex-direction: row-reverse;">
                <div class="selection-label">Drift Island</div>
                <span class="selection-dot"></span>
            </div>
            <img class="island-far" src="imgs/simple_island_coconut.png" alt="Farther island" />
            <div class="overlap-group">
                <div class="choice-left">
                    <div class="fuel-container-left" style="visibility: hidden;">
                        <div class="fuel-indicator-container">
                            <div class="fuel-indicator-bar"></div>
                        </div>
                    </div>
                    <img class="ship-left" src="imgs/simple_ship_green.png" alt="Left ship" />
                    <img class="arrow-left" style="visibility: hidden;" src="imgs/left.png" alt="Left arrow" />
                </div>
                <div class="selection-indicator" style="top: -30%">
                    <div class="selection-label">Departure Island</div>
                    <span class="selection-dot"></span>
                </div>
                <img class="island-near" src="imgs/simple_island_banana.png" alt="Nearer island" />
                <div class="choice-right">
                    <div class="fuel-container-right">
                        <div class="fuel-indicator-container">
                            <div class="fuel-indicator-bar"></div>
                        </div>
                    </div>
                    <img class="ship-right" src="imgs/simple_ship_blue.png" alt="Right ship" />
                    <img class="arrow-right" style="visibility: hidden;" src="imgs/left.png" alt="right arrow" />
                </div>
            </div>
            ${createOceanCurrents(2)}
            </section>
            ${createInstructionDialog(`
                <p>Without enough fuel, ships simply drift with the current from the <strong>Departure Island</strong> to the <strong>Drift Island</strong> you can always see in the distance.</p>
                <p>You can also check the Ocean Map to see where ships will end up.</p>
            `)}
            ${createProgressBar(4, nPages)}
        </div>
        `
    },

    // Page 4: Let's try that out...
    {
        content: `
        <div class="instruction-stage">
            <img class="background" src="imgs/ocean.png" alt="Background"/>
            <section class="scene">
            <div class="nav-map">
                <img class="nav-map-img" src="imgs/map.png" alt="Navigation map" />
                <img class="nav-map-island" src="imgs/map_islands.png" alt="Map islands" />
            </div>
            <div class="icon-row" style="position: absolute; display: flex; align-items: center; top: 0%;">
                <img src="imgs/icon-explore.png" alt="Training Voyages" style="width: 40px; height: 40px; margin-right: 15px;"><p style="width: auto; text-align: left; color: #0F52BA;">Training Voyage</p>
            </div>
            <img class="island-far" src="imgs/simple_island_coconut.png" alt="Farther island" />
            <div class="overlap-group">
                <div class="choice-left">
                    <div class="fuel-container-left" style="visibility: hidden;">
                        <div class="fuel-indicator-container">
                            <div class="fuel-indicator-bar"></div>
                        </div>
                    </div>
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
            ${createOceanCurrents(2)}
            </section>
            ${createInstructionDialog(`
                <p><strong>Let's try it! Send the blue ship by pressing the right arrow key.</strong></p>
            `)}
            ${createProgressBar(5, nPages)}
        </div>
        `
    },

    // Page 5: Ending up on the next island
    {
        content: `
        <div class="instruction-stage">
            <img class="background" src="imgs/ocean.png" alt="Background"/>
            <section class="scene">
                <div class="nav-map">
                    <img class="nav-map-img" src="imgs/map.png" alt="Navigation map" />
                    <img class="nav-map-island" src="imgs/map_islands.png" alt="Map islands" />
                </div>
                <div class="icon-row" style="position: absolute; display: flex; align-items: center; top: 0%;">
                    <img src="imgs/icon-explore.png" alt="Training Voyages" style="width: 40px; height: 40px; margin-right: 15px;"><p style="width: auto; text-align: left; color: #0F52BA;">Training Voyage</p>
                </div>
                <img class="island-far" src="imgs/simple_island_coconut.png" alt="Farther island" />
                <img class="feedback-ship" src="imgs/simple_ship_blue.png" alt="Ship" style="opacity: 0;" />
            ${createOceanCurrents(2)}
            </section>
            ${createInstructionDialog(`
                <p>The ship ran out of fuel midway.</p>
                <p>As you can see, it drifted from <span style="color: gold">Banana Island</span>🍌 to <span style="color: brown">Coconut Island</span>🥥 with the currents.</p>
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
            <div class="nav-map">
                <img class="nav-map-img" src="imgs/map.png" alt="Navigation map" />
                <img class="nav-map-island" src="imgs/map_islands.png" alt="Map islands" />
            </div>
            <div class="icon-row" style="position: absolute; display: flex; align-items: center; top: 0%;">
                <img src="imgs/icon-explore.png" alt="Training Voyages" style="width: 40px; height: 40px; margin-right: 15px;"><p style="width: auto; text-align: left; color: #0F52BA;">Training Voyage</p>
            </div>
            <img class="island-far" src="imgs/simple_island_coconut.png" alt="Farther island" />
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
            ${createOceanCurrents(2)}
            </section>
            ${createInstructionDialog(`
                <p>Let's try again. This time, add more fuel by rapidly pressing the arrow key multiple times.</p>
                <p>Don't worry! We'll give you extra time.</p>
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
                    <div class="nav-map">
                    <img class="nav-map-img" src="imgs/map.png" alt="Navigation map" />
                    <img class="nav-map-island" src="imgs/map_islands.png" alt="Map islands" />
                </div>
                <div class="icon-row" style="position: absolute; display: flex; align-items: center; top: 0%;">
                    <img src="imgs/icon-explore.png" alt="Training Voyages" style="width: 40px; height: 40px; margin-right: 15px;"><p style="width: auto; text-align: left; color: #0F52BA;">Training Voyage</p>
                </div>
                <div class="overlap-group" style="justify-content: space-between;">
                    <div class="choice-left">
                        <img class="ship-left" src="imgs/simple_ship_blue.png" alt="Ship" style="opacity: 0;" />
                    </div>
                    <img class="island-near" style="visibility: hidden;" src="imgs/simple_island_grape.png" alt="Hidden island" />
                    <div class="choice-right">
                        <img class="island-near" src="imgs/simple_island_grape.png" alt="Destination island" style="top: -10%;" />
                    </div>
                </div>
            </section>
            ${createInstructionDialog(`
                <p>Great job!</p>
                <p>As you can see, with enough fuel, the <span style="color: royalblue">blue ship</span> reached its <strong>Home Base</strong> at <span style="color: purple">Grape Island</span>🍇 against the currents.</p>
            `)}
            ${createProgressBar(8, nPages)}
        </div>
        `
    },

    // Page 8: Ending up on the homebase
    {
        content: `
        <div class="instruction-stage">
            <img class="background" src="imgs/ocean.png" alt="Background"/>
                <section class="scene">
                    <div class="nav-map">
                    <img class="nav-map-img" src="imgs/map.png" alt="Navigation map" />
                    <img class="nav-map-island" src="imgs/map_islands.png" alt="Map islands" />
                </div>
                <div class="icon-row" style="position: absolute; display: flex; align-items: center; top: 0%;">
                    <img src="imgs/icon-explore.png" alt="Training Voyages" style="width: 40px; height: 40px; margin-right: 15px;"><p style="width: auto; text-align: left; color: #0F52BA;">Training Voyage</p>
                </div>
                <div class="overlap-group" style="justify-content: space-between;">
                    <div class="choice-left">
                        <img class="ship-left" src="imgs/simple_ship_blue.png" alt="Ship" style="opacity: 0;" />
                    </div>
                    <img class="island-near" style="visibility: hidden;" src="imgs/simple_island_grape.png" alt="Hidden island" />
                    <div class="choice-right">
                        <img class="island-near" src="imgs/simple_island_grape.png" alt="Destination island" style="top: -10%;" />
                    </div>
                </div>
            </section>
            ${createInstructionDialog(`
                <p><strong>Remember: Ships can start from their home base, in which case they would sail back to their home base if fueled enough.</strong></p>
            `)}
            ${createProgressBar(8, nPages)}
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
                <div class="label"><strong>Low current</strong>:<br> Only a little fuel needed</div>
            </div>
            ${createInstructionDialog(`
                <p>The fuel needed to reach the home base depends on ocean current strength:</p>
                <p>One stripe means low current - you'll need just a little fuel.</p>
            `)}
            ${createProgressBar(9, nPages)}
        </div>
        `
    },

    // Page 10: Current level explanation: Mid
    {
        content: `
        <div class="instruction-stage">
            <img class="background" src="imgs/ocean.png" alt="Background"/>
            ${createOceanCurrents(2)}
            <div class="current-indicator">
                <div class="label"><strong>Medium current</strong>:<br> Moderate fuel needed</div>
            </div>
            ${createInstructionDialog(`
                <p>Two stripes mean medium current - you'll need a moderate amount of fuel.</p>
            `)}
            ${createProgressBar(9, nPages)}
        </div>
        `
    },

    // Page 11: Current level explanation: High
    {
        content: `
        <div class="instruction-stage">
            <img class="background" src="imgs/ocean.png" alt="Background"/>
            ${createOceanCurrents(3)}
            <div class="current-indicator">
                <div class="label"><strong>Strong current</strong>:<br> A lot of fuel needed</div>
            </div>
            ${createInstructionDialog(`
                <p>Three stripes mean strong current - you'll need a lot of fuel.</p>
                <p>Current strength is always shown. <strong>Stronger currents require more fuel to reach a ship's home base!</strong></p>
            `)}
            ${createProgressBar(9, nPages)}
        </div>
        `
    },

    // Page 12 & 13: Managing your energy
    {
        content: `
        <div class="instruction-stage">
            <img class="background" src="imgs/ocean.png" alt="Background"/>
            <div class="instruction-dialog" style="bottom:40%; min-width: 600px;">
                <div class="instruction-content" style="font-size: 1.2em; text-align: center;">
                    <p>Careful! Adding fuel requires repeated key presses, which can be tiring...</p>
                    <p>Be strategic - use the fuel you think is necessary, based on your destination and the current strength.</p>
                </div>
            </div>
            ${createProgressBar(10, nPages)}
        </div>
        `
    },

    {
        content: `
        <div class="instruction-stage">
            <img class="background" src="imgs/ocean.png" alt="Background"/>
            <div class="instruction-dialog" style="bottom:40%; min-width: 600px;">
                <div class="instruction-content" style="font-size: 1.2em; text-align: center;">
                    <p>The Drift Island may be the home base of one of the two ships.</p>
                    <p>When it is, the ship can actually reach its home base simply by drifting in the currents.</p>
                </div>
            </div>
            ${createProgressBar(10, nPages)}
        </div>
        `
    },

    // Page 14: Recap
    {
        content: `
        <div class="instruction-stage">
            <img class="background" src="imgs/ocean.png" alt="Background"/>
            <section class="scene">
            <div class="nav-map">
                <img class="nav-map-img" src="imgs/map.png" alt="Navigation map" />
                <img class="nav-map-island" src="imgs/map_islands.png" alt="Map islands" />
            </div>
            <div class="icon-row" style="position: absolute; display: flex; align-items: center; top: 0%;">
                <img src="imgs/icon-explore.png" alt="Training Voyages" style="width: 40px; height: 40px; margin-right: 15px;"><p style="width: auto; text-align: left; color: #0F52BA;">Training Voyage</p>
            </div>
            <img class="island-far" src="imgs/simple_island_coconut.png" alt="Farther island" />
            <div class="overlap-group">
                <div class="choice-left">
                    <div class="fuel-container-left" style="visibility: hidden;">
                        <div class="fuel-indicator-container">
                            <div class="fuel-indicator-bar"></div>
                        </div>
                    </div>
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
            ${createOceanCurrents(2)}
            </section>
            ${createInstructionDialog(`
                <p>To recap, during <strong>Training Voyages</strong>, you will:</p>
                <ul>
                    <li>Select ships using arrow keys</li>
                    <li>Add fuel by repeatedly pressing the same key</li>
                    <li><strong>Learn each ship's home base and fuel requirements for different current strengths</strong></li>
                </ul>
                <p><span class="highlight-txt">This training will help you succeed in Reward Missions and Knowledge Assessments.</span></p>
            `)}
            ${createProgressBar(11, nPages)}
        </div>
        `
    },

    // Page 15: End of instructions
    {
        content: `
        <div class="instruction-stage">
            <img class="background" src="imgs/ocean.png" alt="Background"/>
            <div class="instruction-dialog" style="bottom:40%; min-width: 600px;">
                <div class="instruction-content" style="font-size: 1.2em; text-align: center;">
                    <p>😊 <strong>Well done!</strong> You've completed the instructions and are ready to start.</p>
                    <p>Training voyages will begin soon, followed by reward missions and knowledge tests.</p>
                    <p>Press <span class="spacebar-icon">Next</span> to continue or <span class="spacebar-icon">Restart</span> to review these instructions again.</p>
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
        if (current_page === 4) {
            setupFuelTrial({
                initialMessage: `<p>You can now load up fuel by <strong>pressing the same arrow key again and again.</strong> The fuel gauge will fill up as you press the key.</p>
                <p>Give it a try!</p>`,
                progressCalculation: (trialPresses) => (trialPresses / 30) * 100,
                // Finish trial when 5 fuel presses have been recorded.
                finishCondition: (trialPresses, progress) => trialPresses >= 5,
                finishMessage: `<p>Fueling time is limited. The ship has to leave now!</p>`
            });
        }

        if (current_page === 5) {
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

        if (current_page === 6) {
            setupFuelTrial({
                initialMessage: `<p>Please keep adding fuel to the ship...</p>`,
                // Update progress based on 30 presses (i.e. progress runs from 0 to 100%).
                progressCalculation: (trialPresses) => (trialPresses / 30) * 100,
                // Finish trial when the fuel bar reaches 100% width.
                finishCondition: (trialPresses, progress) => progress >= 75,
                finishMessage: `<p>Now the fuel is sufficient for this ship, and it's about to leave now!</p>`
            });
        }

        if (current_page === 7) {
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
            }, 100);
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
            prompt: "As a shipping network manager, I have three main duties: Training Voyages, Knowledge Assessments, and Reward Missions.",
            name: "duties",
            options: ["True", "False"],
            required: true
        },
        {
            prompt: "When a ship doesn't have enough fuel, it will drift to the destination following the ocean current.",
            name: "drift",
            options: ["True", "False"],
            required: true
        },
        {
            prompt: "The amount of fuel needed to reach a ship's home base depends on the ocean current strength level.",
            name: "current_fuel",
            options: ["True", "False"],
            required: true
        },
        {
            prompt: "In Reward Missions, I need to select the proper ship and provide appropriate fuel to deliver cargo to specific target islands.",
            name: "reward",
            options: ["True", "False"],
            required: true
        },
        {
            prompt: "Blue ship uses Grape island as the home base.",
            name: "blue_homebase",
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
                Q4: `True`
            }
        }
    }
});

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
                <p>You did not answer all the quiz questions correctly.</p>
                <p>Press <span class="spacebar-icon">Next</span> to re-take the questions</br>or</br><span class="spacebar-icon">Restart</span> to review the full instructions again.</p>
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
    timeline: [controlInstructionTrial],
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
        const restart = jsPsych.data.get().filter({trialphase: "control_instruction_quiz_failure"}).last(1).select('restart').values[0];

        return restart;
    },
    on_timeline_start: () => {
        updateState(`control_instructions_start`)
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