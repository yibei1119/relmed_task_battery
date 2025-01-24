// Helper functions for creating instruction page elements
const createOceanCurrents = () => {
  return `
      <div class="ocean-current">
          <div class="current-line"></div>
          <div class="current-line"></div>
          <div class="current-line"></div>
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
                  <h2>Welcome to Captain's Route!</h2>
                  <p>Before we begin, let's look at the key elements you'll interact with in this task. 
                  You'll be navigating ships between islands, managing fuel, and mastering ocean currents.</p>
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
                      <div class="selection-label">Destination Island</div>
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
                  <p>Your journey begins at the main island, where you'll find a factory and two ships ready for departure. 
                  In the distance, you'll spot another island. There are four factory types across the islands: 
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
                              <span class="selection-dot"></span>
                              <div class="selection-label">Press ← to select</div>
                          </div>
                          <img class="ship-left" src="imgs/ship_green.png" alt="Left ship" />
                      </div>
                      <div class="choice-right">
                          <div class="selection-indicator">
                              <span class="selection-dot"></span>
                              <div class="selection-label">Press → to select</div>
                          </div>
                          <img class="ship-right" src="imgs/ship_blue.png" alt="Right ship" />
                      </div>
                  </div>
              </section>
              ${createInstructionDialog(`
                  <p>Use the <strong>left</strong> and <strong>right</strong> arrow keys to select your ship. 
                  Each ship has its own route and destination factory. Once selected, you cannot change ships during the journey.</p>
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
                  <p>Watch the ocean currents carefully! Without sufficient fuel, your ship might drift to the distant island. 
                  The white lines show the current's strength and direction.</p>
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
                  <p>After selecting your ship, rapidly press the same arrow key to add fuel. 
                  You have three seconds from the start of each journey to add as much fuel as needed.</p>
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
                  <p>During your journey, you'll encounter special missions:</p>
                  <ul>
                      <li><strong>Captain's Challenge:</strong> Predict ships' destinations based on their fuel levels</li>
                      <li><strong>Priority Delivery:</strong> Complete special delivery requests to specific factories</li>
                  </ul>
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
  show_page_number: true
};

// Add instructions to the timeline
const addInstructionsToTimeline = (timeline) => {
  timeline.splice(1, 0, instructionTrial);
  return timeline;
};