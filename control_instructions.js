// Helper functions for creating instruction page elements
const createOceanCurrents = () => {
  return `
      <div class="ocean-current">
          <div class="current-group left-currents">
              <div class="current-line"></div>
              <div class="current-line"></div>
              <div class="current-line"></div>
          </div>
          <div class="current-group right-currents">
              <div class="current-line"></div>
              <div class="current-line"></div>
              <div class="current-line"></div>
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
          <div class="progress-bar" style="width: ${(current/total) * 100}%"></div>
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
                  <img class="island-far" src="imgs/island_coconut.png" alt="Farther island" />
                  <div class="overlap-group">
                      <div class="choice-left">
                          <img class="ship-left" src="imgs/ship_green.png" alt="Left ship" />
                      </div>
                      <img class="island-near" src="imgs/island_banana.png" alt="Nearer island" />
                      <div class="choice-right">
                          <img class="ship-right" src="imgs/ship_blue.png" alt="Right ship" />
                      </div>
                  </div>
                  ${createOceanCurrents()}
              </section>
              ${createInstructionDialog(`
                  <h2>Welcome to Captain's Quest!</h2>
                  <p>You're about to become a ship captain managing an important fruit trading network. Your mission is to transport valuable cargo between island factories while mastering the challenges of ocean currents.</p>
              `)}
              ${createProgressBar(1, 6)}
          </div>
      `
  },

  // Page 2: Islands Introduction
  {
      content: `
          <div class="instruction-stage">
              <img class="background" src="imgs/ocean.png" alt="Background"/>
              <section class="scene">
                  <img class="island-far" src="imgs/island_coconut.png" alt="Farther island" />
                  <div class="island-indicator far-indicator">
                      <span class="selection-dot"></span>
                      <div class="selection-label">Distant Island</div>
                  </div>
                  
                  <div class="overlap-group">
                      <img class="island-near" src="imgs/island_banana.png" alt="Nearer island" />
                      <div class="island-indicator near-indicator">
                          <span class="selection-dot"></span>
                          <div class="selection-label">Current Island</div>
                      </div>
                  </div>
              </section>
              ${createInstructionDialog(`
                  <p>Each of your journey begins at the main island, where you'll find a factory and two ships ready for departure. 
                  In the distance, you'll spot another island.</p>
                  <p>There are four factory types across the islands: 
                  Coconut, Orange, Grape, and Banana.</p>
              `)}
              ${createProgressBar(2, 6)}
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
                          <img class="ship-left" src="imgs/ship_green.png" alt="Left ship" />
                      </div>
                      <div class="choice-right">
                          <div class="selection-indicator">
                          <div class="selection-label">Press → to select</div>
                          <span class="selection-dot"></span>
                          </div>
                          <img class="ship-right" src="imgs/ship_blue.png" alt="Right ship" />
                      </div>
                  </div>
              </section>
              ${createInstructionDialog(`
                  <p>Your fleet consists of four distinct ships, each marked by unique colors and symbols.
                  Every ship has its intended destination factory. Choose your ship carefully - you cannot change selection once made.</p>
                  <p>Use the <strong>left</strong> and <strong>right</strong> arrow keys to select your ship.</p>
              `)}
              ${createProgressBar(3, 6)}
          </div>
      `
  },

  // Page 4: Ocean Currents
  {
      content: `
          <div class="instruction-stage">
              <img class="background" src="imgs/ocean.png" alt="Background"/>
              ${createOceanCurrents()}
              <div class="current-indicator">
                  <div class="label">Ocean Current Direction</div>
              </div>
              ${createInstructionDialog(`
                  <p>However, the journey isn't always straightforward...</p>
                  <p>The ocean's natural flow can affect your ship's course. Without sufficient fuel, your ship might drift to the distant island instead of its intended destination.</p>
                  <p>Watch the sea surface carefully - currents come in three different strength levels.</p>
              `)}
              ${createProgressBar(4, 6)}
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
                          <img class="ship-left" src="imgs/ship_green.png" alt="Left ship" />
                          <div class="label fuel-label">Added Fuel</div>
                      </div>
                  </div>
              </section>
              ${createInstructionDialog(`
                  <p>To ensure your ship reaches its intended destination, add fuel to your chosen ship by pressing keys. Each keypress adds fuel, helping your ship resist the currents.</p>
                  <p>You have three seconds from the start of each journey to add as much fuel as needed.</p>
              `)}
              ${createProgressBar(5, 6)}
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
              ${createProgressBar(6, 6)}
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
  data: { phase: 'ctrl_instructions' },
  post_trial_gap: 800
};

// Add instructions to the timeline
const addInstructionsToTimeline = (timeline) => {
  timeline.splice(1, 0, instructionTrial);
  return timeline;
};