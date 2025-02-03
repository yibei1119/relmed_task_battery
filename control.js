// Configuration object for the control condition
const ctrlConfig = {
  baseRule: {
    banana: "coconut",
    coconut: "grape",
    grape: "orange",
    orange: "banana"
  },
  controlRule: {
    green: "coconut",
    blue: "grape",
    red: "orange",
    yellow: "banana",
  }
};

const ctrlTrials = [
  {"left": "green", "right": "blue", "near": "coconut", "current": 3}, 
  {"left": "red", "right": "yellow", "near": "orange", "current": 1}
];

function generateCtrlTrial(left, right, near, current) {
  const far = ctrlConfig.baseRule[near];
  const stimulus = `
    <main class="main-stage">
      <img class="background" src="imgs/ocean.png" alt="Background"/>
      <section class="scene">
        <img class="island-far" src="imgs/island_${far}.png" alt="Farther island" />
        <div class="overlap-group">
          <div class="choice-left">
            <div class="fuel-container-left">
              <div class="fuel-indicator-container">
                <div class="fuel-indicator-bar"></div>
              </div>
            </div>
            <img class="ship-left" src="imgs/ship_${left}.png" alt="Left ship" />
            <img class="arrow-left" src="imgs/left.png" alt="Left arrow" />
          </div>
          <img class="island-near" src="imgs/island_${near}.png" alt="Nearer island" />
          <div class="choice-right">
            <div class="fuel-container-right">
              <div class="fuel-indicator-container">
                <div class="fuel-indicator-bar"></div>
              </div>
            </div>
            <img class="ship-right" src="imgs/ship_${right}.png" alt="Right ship" />
            <img class="arrow-right" src="imgs/left.png" alt="Right arrow" />
          </div>
        </div>
        ${createOceanCurrents(current)}
      </section>
    </main>
  `;
  return stimulus;
}

// Define the base structure for the game interface with enhanced interaction
const exploreTrial = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: () => {
    return generateCtrlTrial(
      jsPsych.evaluateTimelineVariable('left'), 
      jsPsych.evaluateTimelineVariable('right'), 
      jsPsych.evaluateTimelineVariable('near'),
      jsPsych.evaluateTimelineVariable('current')
    );
  },
  choices: "NO_KEYS",
  response_ends_trial: false,
  trial_duration: 4000,  // 3 second time limit
  post_trial_gap: 300,
  save_timeline_variables: true,
  data: {
    trialphase: "ctrl_explore",
    responseTime: () => {return window.responseTime},
    choice: () => {return window.choice},
    choice_rt: () => {return window.choice_rt},
    trial_presses: () => { return window.responseTime.length},
  },
  on_load: () => {
    let selectedKey = null;
    let lastPressTime = 0;
    let trial_presses = 0;
    window.responseTime = [];
    window.choice = null;
    window.choice_rt = 0;
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
        if (info.key === 'ArrowLeft') {
          selectedKey = 'left';
          leftArrow.classList.add('highlight');
          document.querySelector('.choice-right').style.visibility = 'hidden';
          // Show the progress bar
          document.querySelector('.fuel-container-left .fuel-indicator-container').style.opacity = '1';
          setupRepeatedKeypress('ArrowLeft');
        } else if (info.key === 'ArrowRight') {
          selectedKey = 'right';
          rightArrow.classList.add('highlight');
          document.querySelector('.choice-left').style.visibility = 'hidden';
          // Show the progress bar
          document.querySelector('.fuel-container-right .fuel-indicator-container').style.opacity = '1';
          setupRepeatedKeypress('ArrowRight');
        }
        window.choice = selectedKey;
        window.choice_rt = info.rt;
        jsPsych.pluginAPI.cancelKeyboardResponse(firstKey_listener);
      }
    }

    // Function to handle repeated keypresses
    function handleRepeatedKeypress(info) {
      trial_presses++;
      window.responseTime.push(info.rt - lastPressTime);
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
    }

    // Function to set up listener for repeated keypresses
    function setupRepeatedKeypress(key) {
      jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: handleRepeatedKeypress,
        valid_responses: [key],
        rt_method: 'performance',
        persist: true,
        allow_held_key: false,
        minimum_valid_rt: 0
      });
    }

    // Initial keyboard listener for the first choice
    var firstKey_listener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: handleKeypress,
        valid_responses: ['ArrowLeft', 'ArrowRight'],
        rt_method: 'performance',
        persist: false,
        allow_held_key: false,
        minimum_valid_rt: 100
      });
    },
    on_finish: () => {
      jsPsych.pluginAPI.cancelAllKeyboardResponses();
      console.log(jsPsych.data.getLastTrialData().values()[0]);
    }
};

function generateCtrlFeedback() {
  // Get last trial's data
  const lastTrial = jsPsych.data.getLastTrialData().values()[0];
  const choice = lastTrial.choice; // 'left' or 'right'
  const chosenColor = lastTrial.timeline_variables[choice]; // Get the color of the chosen side
  const nearIsland = lastTrial.timeline_variables.near; // Get the near island from last trial

  // Determine destination island
  let destinationIsland;
  let currentRule;
  if (currentRule === 'base') {
    // Use base rule - show opposite of near island
    destinationIsland = ctrlConfig.baseRule[nearIsland];
  } else {
    // Use control rule - based on chosen ship's color
    destinationIsland = ctrlConfig.controlRule[chosenColor];
  }

  // Generate HTML for the feedback
  const html = `
    <main class="main-stage">
      <img class="background" src="imgs/ocean_above.png" alt="Background"/>
      <section class="scene">
        <svg class="trajectory-path">
          <line x1="0" y1="100%" x2="0" y2="0" 
                stroke="rgba(255,255,255,0.5)" 
                stroke-width="2" 
                class="path-animation"/>
        </svg>
        <img class="destination-island" 
            src="imgs/island_icon_${destinationIsland}.png" 
            alt="Destination island" />
      <div class="ship-container">
        <img class="ship-feedback" 
              src="imgs/ship_icon_${chosenColor}.png" 
              alt="Chosen ship" />
        </div>
      </section>
    </main>
  `;

  return html;
}

const exploreFeedback = {
  timeline: [{
  type: jsPsychHtmlKeyboardResponse,
  stimulus: () => {
    return generateCtrlFeedback()
  },
  choices: "NO_KEYS",
  trial_duration: 1500,
  post_trial_gap: 500,
  data: {
    trialphase: "ctrl_explore_feedback"
  },
  on_load: () => {
    // Clean up any leftover style elements from previous trials
    const oldStyles = document.querySelectorAll('style[data-feedback-animation]');
    oldStyles.forEach(style => style.remove());

    // Ensure the ship starts at the correct position
    const shipContainer = document.querySelector('.ship-container');
    if (shipContainer) {
      shipContainer.style.visibility = 'visible';
    }
  }
}],
  conditional_function: function () {
    const last_trial_choice = jsPsych.data.get().last(1).select('choice').values[0];
    return last_trial_choice !== null;
  }
};

// Warnings for unresponsive trials
// Function to create and show warning
function showTemporaryWarning(message, duration = 800) {
  // Create warning element
  const warningElement = document.createElement('div');
  warningElement.id = 'vigour-warning-temp';
  warningElement.innerText = message;

  // Style the warning
  warningElement.style.cssText = `
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 9999;
    background-color: rgba(244, 206, 92, 0.9);
    padding: 15px 25px;
    border-radius: 8px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    font-size: 24px;
    font-weight: 500;
    color: #182b4b;
    opacity: 0;
    transition: opacity 0.2s ease;
    text-align: center;
    letter-spacing: 0.0px;
  `;

  // Add to document body
  document.body.appendChild(warningElement);

  // Force reflow to ensure transition works
  warningElement.offsetHeight;

  // Show warning
  warningElement.style.opacity = '1';

  // Remove after duration
  setTimeout(() => {
    warningElement.style.opacity = '0';
    setTimeout(() => {
      warningElement.remove();
    }, 200); // Wait for fade out transition
  }, duration);
}
const noChoiceWarning = {
  timeline: [{
    type: jsPsychHtmlKeyboardResponse,
    choices: "NO_KEYS",
    stimulus: "",
    data: {
      trialphase: "no_choice_warning"
    },
    trial_duration: 1000,
    on_load: function () {
      showTemporaryWarning("Don't forget to participate!", 800);
    }
  }],
  conditional_function: function () {
    const last_trial_choice = jsPsych.data.get().last(1).select('choice').values[0];
    return last_trial_choice === null;
  }
};

// Prediction trial
function generateCtrlPrediction(ship, near, current, fuel) {
  const stimulus = `
  <div class="instruction-stage">
            <img class="background" src="imgs/ocean.png" alt="Background"/>
            <section class="scene">
                <div class="overlap-group">
                    <div class="choice-left">
                      <img class="ship-left" src="imgs/ship_${ship}.png" alt="Prediction ship" />
                    </div>
                    <img class="island-near" src="imgs/island_${near}.png" alt="Nearer island" />
                    <div class="choice-right" style="visibility:hidden;">
                      <img class="ship-right" src="imgs/ship_${ship}.png" alt="Prediction ship" />
                    </div>
                    <!-- Current Strength Indicator -->
                    <div style="position:absolute; top:170px; right:60px; width: 150px; height: 60px; background:white; padding:10px; border-radius:5px; z-index: 3;">
                        <div>Current Strength</div>
                        <div style="color:#1976D2; font-weight:bold;">Level ${current}</div>
                    </div>
                    <!-- Fuel Level Indicator -->
                    <div style="position:absolute; top:70px; right:60px; width: 150px; height: 60px; background:white; padding:10px; border-radius:5px; z-index: 3">
                        <div>Fuel Level: ${fuel}%</div>
                        <div style="width:150px; height:20px; background: #ddd; border: 2px solid rgba(255, 255, 255, 0.8); border-radius:10px;">
                            <div style="width:${fuel}%; height:100%; background:#ffd700; border-radius:10px;"></div>
                        </div>
                    </div>
                </div>
                ${createOceanCurrents(current)}
            </section>
        </div>
    `;
    return stimulus
};

const predictTrial = {
  type: jsPsychHtmlButtonResponse,
  stimulus: () => {
    return generateCtrlPrediction(
      jsPsych.evaluateTimelineVariable('ship'), 
      jsPsych.evaluateTimelineVariable('near'), 
      jsPsych.evaluateTimelineVariable('current'),
      jsPsych.evaluateTimelineVariable('fuel')
    );
  },
  data: {
    trialphase: "ctrl_predict"
  },
  on_load: () => {
    function highlightChoice(event) {
        // Map arrow keys and letter keys to a data-choice value
      switch (event.key) {
        // Arrow keys
        case "ArrowLeft":
          choice = 0;
          break;
        case "ArrowUp":
          choice = 1;
          break;
        case "ArrowDown":
          choice = 2;
          break;
        case "ArrowRight":
          choice = 3;
          break;
        // Letter keys (assuming lowercase)
        case "d":
          choice = 0;
          break;
        case "f":
          choice = 1;
          break;
        case "j":
          choice = 2;
          break;
        case "k":
          choice = 3;
          break;
        default:
          break;
      }

      // If a valid key was pressed, select the button
      if (choice !== null) {
        // Using a CSS attribute selector to find the matching button
        const button = document.querySelector(`.destination-button[data-choice="${choice}"]`);

        if (button) {
          button.style.borderColor = "#f4ce5c";

          // Trigger the click event programmatically
          setTimeout(() => {
            button.click();
          }, 300)
        }
      }
    };
    jsPsych.pluginAPI.getKeyboardResponse({
      callback_function: highlightChoice,
      valid_responses: [
        'ArrowLeft', 'ArrowUp', 'ArrowDown', 'ArrowRight',
        'd', 'f', 'j', 'k'
      ],
      rt_method: 'performance',
      persist: false,
      allow_held_key: false,
      minimum_valid_rt: 0
    });
  },
  on_finish: () => {
    jsPsych.pluginAPI.cancelAllKeyboardResponses();
  },
  post_trial_gap: 300,
  choices: ['coconut', 'orange', 'grape', 'banana'],
  prompt: "<p>Based on the current strength and fuel level, where will this ship most likely dock?</p>",
  button_html: (choice) => `<div class="destination-button"><img src="imgs/island_icon_${choice}.png" style="width:100px;"></div>`
};

// Create trial variations
const predictionConditions = [
  {ship: "blue", near: "orange", current: 1, fuel: 75},
  {ship: "red", near: "grape", current: 2, fuel: 50},
  {ship: "yellow", near: "coconut", current: 3, fuel: 25}
];

// Add trials to timeline
var predictionTimeline = [];
predictionConditions.forEach(trial => {
  predictionTimeline.push({
    timeline: [predictTrial],
    timeline_variables: [trial]
  });
});

// Create the timeline
var expTimeline = [];
ctrlTrials.forEach(trial => {
  expTimeline.push({
    timeline: [exploreTrial, exploreFeedback, noChoiceWarning],
    timeline_variables: [trial]
  });
});