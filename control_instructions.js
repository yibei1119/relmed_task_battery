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

// Main instruction pages configuration
const instructionPages = [
    // Page 1: Overview with all elements
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
                        <img class="ship-right" src="imgs/simple_ship_blue.png" alt="Right ship" />
                    </div>
                </div>
                ${createOceanCurrents(3)}
            </section>
            ${createInstructionDialog(`
                <h2>Welcome to Captain's Quest!</h2>
                <p>You're about to become a ship captain managing an important fruit trading network. Your mission is to transport valuable cargo between island factories while mastering the challenges of ocean currents.</p>
            `)}
            ${createProgressBar(1, 7)}
        </div>
    `
    },

    // Page 2: Islands Introduction
    {
        content: `
        <div class="instruction-stage">
            <img class="background" src="imgs/ocean.png" alt="Background"/>
            <section class="scene">
                <img class="island-far" src="imgs/simple_island_coconut.png" alt="Farther island" />
                <div class="island-indicator far-indicator">
                    <span class="selection-dot"></span>
                    <div class="selection-label">Distant Island</div>
                </div>
                
                <div class="overlap-group">
                    <img class="island-near" src="imgs/simple_island_banana.png" alt="Nearer island" />
                    <div class="island-indicator near-indicator">
                        <span class="selection-dot"></span>
                        <div class="selection-label">Current Island</div>
                    </div>
                </div>
            </section>
            ${createInstructionDialog(`
                <p>Each of your journey begins at the current island, where you'll find a fruit sign and usually two ships ready for departure. 
                In the distance, you'll spot another island, which is the closest one to the current island.</p>
                <p>There are four types of islands: 
                Coconut, Orange, Grape, and Banana.</p>
            `)}
            ${createProgressBar(2, 7)}
        </div>
    `
    }
    ,

    // Page 3: Ships and Selection
    {
        content: `
        <div class="instruction-stage">
            <img class="background" src="imgs/ocean.png" alt="Background"/>
            <section class="scene">
                <div class="overlap-group">
                    <div class="choice-left">
                        <div class="selection-indicator">
                        <div class="selection-label">Press ← to select</div>
                        <span class="selection-dot"></span>
                        </div>
                        <img class="ship-left" src="imgs/simple_ship_green.png" alt="Left ship" />
                    </div>
                    <div class="choice-right">
                        <div class="selection-indicator">
                        <div class="selection-label">Press → to select</div>
                        <span class="selection-dot"></span>
                        </div>
                        <img class="ship-right" src="imgs/simple_ship_blue.png" alt="Right ship" />
                    </div>
                </div>
            </section>
            ${createInstructionDialog(`
                <p>Your fleet consists of four distinct ships, each marked by unique colors and symbols.
                Every ship has a home base—its intended destination island. Choose your ship carefully! You cannot change selection once made.</p>
                <p>Use the <strong>left</strong> and <strong>right</strong> arrow keys to select your ship.</p>
            `)}
            ${createProgressBar(3, 7)}
        </div>
    `
    },

    // Page 4: Ocean Currents
    {
        content: `
        <div class="instruction-stage">
            <img class="background" src="imgs/ocean.png" alt="Background"/>
            ${createOceanCurrents(2)}
            <div class="current-indicator">
                <div class="label">Ocean Current level: 2 (Mid)</div>
            </div>
            ${createInstructionDialog(`
                <p>However, the journey isn't always straightforward...</p>
                <p>The ocean's natural flow can affect your ship's course. Without sufficient fuel, your ship might drift to the closest island instead of its intended destination.</p>
                <p>Watch the sea surface carefully - currents come in three different strength levels: 1 (Low), 2 (Mid), and 3 (High).</p>
            `)}
            ${createProgressBar(4, 7)}
        </div>
    `
    },

    // Page 4.5: Introduction of default closet island
    {
        content: `
        <div class="instruction-stage">
            <img class="background" src="imgs/default_islands.png" alt="Background"/>
            ${createInstructionDialog(`
                <p>Thanks to many former captains, the ocean’s natural flow has been thoroughly investigated and mapped, as shown above.</p>
                <p>For example, if you start from the Banana Islands without enough fuel, your ship will drift to the Coconut Islands.</p>
            `)}
            ${createProgressBar(5, 7)}
        </div>
    `
    },

    // Page 5: Fuel System with Key Animation
    {
        content: `
        <div class="instruction-stage">
            <img class="background" src="imgs/ocean.png" alt="Background"/>
            <section class="scene">
                <div class="overlap-group">
                    <div class="choice-left">
                        <div class="fuel-container-left">
                            <img class="fuel-icon fuel-animation repeating" src="imgs/fuel.png" alt="Fuel" />
                        </div>
                        ${createKeyAnimation('left')}
                        <img class="ship-left" src="imgs/simple_ship_green.png" alt="Left ship" />
                        <div class="label fuel-label">Added Fuel</div>
                    </div>
                </div>
            </section>
            ${createInstructionDialog(`
                <p>To ensure your ship reaches its intended destination, add fuel to your chosen ship by pressing keys. Each keypress adds fuel, helping your ship resist the currents.</p>
                <p>You have three seconds from the start of each journey to add as much fuel as needed.</p>
            `)}
            ${createProgressBar(6, 7)}
        </div>
    `
    },

    // Page 6: Final Instructions
    {
        content: `
        <div class="instruction-stage">
            <img class="background" src="imgs/ocean.png" alt="Background"/>
            ${createInstructionDialog(`
                <p>During your command, you'll encounter two types of special missions:</p>
                <ul>
                    <li><strong>Captain's Forecast:</strong> Predict where ships will dock based on their type, currents, and fuel levels</li>
                    <li><strong>Priority Delivery:</strong> Complete special delivery requests to specific factories for extra rewards</li>
                </ul>
                <p>Success in these missions depends on your understanding of ship routes and ocean currents.</p>
                <p>Ready to set sail?</p>
            `)}
            ${createProgressBar(7, 7)}
        </div>
    `
    }
];

// Create the instruction trial
const instructionTrial = {
    type: jsPsychInstructions,
    pages: instructionPages.map(page => page.content),
    show_clickable_nav: true,
    button_label_next: "Next",
    button_label_previous: "Previous",
    show_page_number: true,
    data: { phase: 'control_instructions' },
    post_trial_gap: 800
};

// Add instructions to the timeline
const addInstructionsToTimeline = (timeline) => {
    timeline.splice(1, 0, instructionTrial);
    return timeline;
};