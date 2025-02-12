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
  },
  keyList: {
    // "ArrowLeft": 0,
    // "ArrowUp": 1,
    // "ArrowDown": 2,
    // "ArrowRight": 3,
    "d": 0,
    "f": 1,
    "j": 2,
    "k": 3
  },
  islandKeyList: {
    'coconut': "d",
    'orange': "f",
    'grape': "j",
    'banana': "k"
  },
  effort_threshold: 10,
  scale: 0.6,
  explore_decision: 4000,
  explore_effort: 3000,
  explore_feedback: 2000,
  predict_decision: 4000,
  predict_choice: 500,
  reward_decision: 4000,
  reward_effort: 3000,
  reward_feedback: 2000,
  post_trial_gap: 300
};

function generateExploreTrial(left, right, near, current) {
  const far = ctrlConfig.baseRule[near];
  const stimulus = `
    <main class="main-stage">
      <img class="background" src="imgs/ocean.png" alt="Background"/>
      <section class="scene">
        <img class="island-far" src="imgs/simple_island_${far}.png" alt="Farther island" />
        <div class="overlap-group">
          <div class="choice-left">
            <div class="fuel-container-left">
              <div class="fuel-indicator-container">
                <div class="fuel-indicator-bar"></div>
              </div>
            </div>
            <img class="ship-left" src="imgs/simple_ship_${left}.png" alt="Left ship" />
            <img class="arrow-left" src="imgs/left.png" alt="Left arrow" />
          </div>
          <img class="island-near" src="imgs/simple_island_${near}.png" alt="Nearer island" />
          <div class="choice-right">
            <div class="fuel-container-right">
              <div class="fuel-indicator-container">
                <div class="fuel-indicator-bar"></div>
              </div>
            </div>
            <img class="ship-right" src="imgs/simple_ship_${right}.png" alt="Right ship" />
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
    return generateExploreTrial(
      jsPsych.evaluateTimelineVariable('left'),
      jsPsych.evaluateTimelineVariable('right'),
      jsPsych.evaluateTimelineVariable('near'),
      jsPsych.evaluateTimelineVariable('current')
    );
  },
  choices: "NO_KEYS",
  response_ends_trial: false,
  // trial_duration: () => {return ctrlConfig.explore_decision + ctrlConfig.explore_effort},  // Total duration of 5000ms
  post_trial_gap: ctrlConfig.post_trial_gap,
  save_timeline_variables: true,
  data: {
    trialphase: "ctrl_explore",
    responseTime: () => { return window.responseTime },
    response: () => { return window.choice },
    rt: () => { return window.choice_rt },
    trial_presses: () => { return window.responseTime.length },
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

        // Start the second timer for 3000ms
        jsPsych.pluginAPI.setTimeout(() => {
          jsPsych.finishTrial();
        }, ctrlConfig.explore_effort);
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

    // Start the first timer for 2000ms
    jsPsych.pluginAPI.setTimeout(() => {
      if (!selectedKey) {
        jsPsych.finishTrial();
      }
    }, ctrlConfig.explore_decision);
  },
  on_finish: () => {
    jsPsych.pluginAPI.cancelAllKeyboardResponses();
    console.log(jsPsych.data.getLastTrialData().values()[0]);
  }
};

// Control rule selection

function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

ctrlConfig.effort_threshold = 10;
ctrlConfig.scale = 0.6;
function chooseControlRule(effort, current) {
  const extra_effort = (effort - ctrlConfig.effort_threshold) * ctrlConfig.scale / current;
  const prob = sigmoid(extra_effort);
  return Math.random() < prob ? 'control' : 'base';
}

function probControlRule(effort, current) {
  const extra_effort = (effort - ctrlConfig.effort_threshold) * ctrlConfig.scale / current;
  return sigmoid(extra_effort);
}

function generateExploreFeedback() {
  // Get last trial's data
  const lastTrial = jsPsych.data.getLastTrialData().values()[0];
  const choice = lastTrial.response; // 'left' or 'right'
  const chosenColor = lastTrial.timeline_variables[choice]; // Get the color of the chosen side
  const nearIsland = lastTrial.timeline_variables.near; // Get the near island from last trial
  const currentStrength = lastTrial.timeline_variables.current; // Get the current strength from last trial
  const fuelLevel = lastTrial.trial_presses; // Get the fuel level from last trial
  console.log("Fuel Level: ", fuelLevel);
  console.log("Current Strength: ", currentStrength);

  // Determine destination island
  let destinationIsland;
  let currentRule = chooseControlRule(fuelLevel, currentStrength);
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
              src="imgs/simple_ship_icon_${chosenColor}.png" 
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
      return generateExploreFeedback()
    },
    choices: "NO_KEYS",
    trial_duration: ctrlConfig.explore_feedback,
    post_trial_gap: ctrlConfig.post_trial_gap,
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
    const last_trial_choice = jsPsych.data.get().last(1).select('response').values[0];
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
    const last_trial_choice = jsPsych.data.get().last(1).select('response').values[0];
    return last_trial_choice === null;
  }
};

// Prediction trial

function highlightHomeBaseChoice(event) {
  // Map arrow keys and letter keys to a data-choice value
  window.choice = ctrlConfig.keyList[event.key]
  window.choice_rt = event.rt;

  // If a valid key was pressed, select the button
  if (window.choice !== null) {
    // Using a CSS attribute selector to find the matching button
    const button = document.querySelector(`.destination-button[data-choice="${window.choice}"]`);

    if (button) {
      const ship = jsPsych.evaluateTimelineVariable('ship');
      const correct = ctrlConfig.controlRule[ship] === Object.keys(ctrlConfig.islandKeyList)[window.choice];
      // // Enable for feedback
      // if (correct) {
      //   button.style.borderColor = '#00ff00';
      //   msg = "Correct! You successfully found the home base of the ship.";
      // } else {
      //   button.style.borderColor = '#ff0000';
      //   msg = "This seems to be the wrong island. But don't worry, maybe next time!";
      // }

      // // Show feedback message
      // const instructionDialog = document.createElement('div');
      // instructionDialog.className = 'instruction-dialog';
      // instructionDialog.style.bottom = 'unset';

      // const instructionContent = document.createElement('div');
      // instructionContent.className = 'instruction-content';
      // instructionContent.innerHTML = msg;
      // instructionContent.style.fontSize = '24px';

      // instructionDialog.appendChild(instructionContent);
      // document.querySelector('.scene').appendChild(instructionDialog);

      button.style.borderColor = "#f4ce5c";
      // Trigger the click event programmatically
      setTimeout(() => {
        button.click();
      }, ctrlConfig.predict_choice)
    }
  }
};

function highlightDestChoice(event) {
  // Map arrow keys and letter keys to a data-choice value
  window.choice = ctrlConfig.keyList[event.key]
  window.choice_rt = event.rt;

  // If a valid key was pressed, select the button
  if (window.choice !== null) {
    // Using a CSS attribute selector to find the matching button
    const button = document.querySelector(`.destination-button[data-choice="${window.choice}"]`);

    if (button) {
      const ship = jsPsych.evaluateTimelineVariable('ship');
      const state = jsPsych.evaluateTimelineVariable('near');
      const current_strength = jsPsych.evaluateTimelineVariable('current');
      const fuel_level = jsPsych.evaluateTimelineVariable('fuel_lvl');
      const next_state = probControlRule(fuel_level / 100 * 40, current_strength) > 0.5 ? ctrlConfig.controlRule[ship] : ctrlConfig.baseRule[state];
      const correct = Object.keys(ctrlConfig.islandKeyList)[window.choice] === next_state;

      // // Enable for feedback
      // if (correct) {
      //   button.style.borderColor = '#00ff00';
      //   msg = "Correct! You successfully predicted the most likely destination to dock the ship.";
      // } else {
      //   button.style.borderColor = '#ff0000';
      //   msg = "Sorry! The ship has docked at another island. But don't worry, maybe next time!";
      // }

      // // Show feedback message
      // const instructionDialog = document.createElement('div');
      // instructionDialog.className = 'instruction-dialog';
      // instructionDialog.style.bottom = 'unset';

      // const instructionContent = document.createElement('div');
      // instructionContent.className = 'instruction-content';
      // instructionContent.innerHTML = msg;
      // instructionContent.style.fontSize = '24px';

      // instructionDialog.appendChild(instructionContent);
      // document.querySelector('.scene').appendChild(instructionDialog);

      button.style.borderColor = "#f4ce5c";
      // Trigger the click event programmatically
      setTimeout(() => {
        button.click();
      }, ctrlConfig.predict_choice)
    }
  }
};

function generatePredHomeBase(ship) {
  const stimulus = `
  <div class="instruction-stage" style="transform: unset;">
            <img class="background" src="imgs/ocean.png" alt="Background"/>
            <section class="scene">
                <div class="overlap-group">
                    <div class="choice-left">
                    <img class="island-near" src="imgs/simple_island_banana.png" style="visibility:hidden;" alt="Nearer island" />
                    <img class="ship-left" src="imgs/simple_ship_${ship}.png" style="top:-10%" alt="Prediction ship" />
                    </div>
                </div>
            </section>
            </div>
            <p>Which island is the home base of this ship?</p>
    `;
  return stimulus;
}

function generatePredDest(ship, near, current, fuel) {
  const level_text = { "1": "Low", "2": "Mid", "3": "High" };
  const stimulus = `
  <div class="instruction-stage" style="transform: unset;">
            <img class="background" src="imgs/ocean.png" alt="Background"/>
            <section class="scene">
                <div class="overlap-group">
                    <div class="choice-left">
                    <img class="island-near" src="imgs/simple_island_${near}.png" alt="Nearer island" />
                    <img class="ship-left" src="imgs/simple_ship_${ship}.png" style="top:-10%" alt="Prediction ship" />
                    </div>
                    <!-- Fuel Level Indicator -->
                    <div style="position:absolute; top:70px; right:60px; width: 150px; height: 60px; background:white; padding:10px; border-radius:5px; z-index: 3">
                        <div>Fuel Level</div>
                        <div style="width:150px; height:20px; background: #ddd; border: 2px solid rgba(255, 255, 255, 0.8); border-radius:10px;">
                            <div style="width:${fuel}%; height:100%; background:#ffd700; border-radius:10px;"></div>
                        </div>
                    </div>
                    <!-- Current Strength Indicator -->
                    <div style="position:absolute; top:170px; right:60px; width: 150px; height: 60px; background:white; padding:10px; border-radius:5px; z-index: 3;">
                        <div>Current Strength</div>
                        <div style="color:#1976D2; font-weight:bold;"> ${level_text[current]}</div>
                    </div>
                </div>
                ${createOceanCurrents(current)}
                </section>
                </div>
                <p>Based on the current strength and fuel level, where will this ship most likely dock?</p>
    `;
  return stimulus;
};

const predictHomeBaseTrial = {
  type: jsPsychHtmlButtonResponse,
  save_timeline_variables: true,
  trial_duration: ctrlConfig.predict_decision,
  stimulus: () => {
    return generatePredHomeBase(
      jsPsych.evaluateTimelineVariable('ship')
    )
  },
  data: {
    trialphase: "ctrl_predict_homebase",
    response: () => { return window.choice },
    rt: () => { return window.choice_rt }
  },
  on_load: () => {
    window.choice = null;
    window.choice_rt = null;
    jsPsych.pluginAPI.getKeyboardResponse({
      callback_function: highlightHomeBaseChoice,
      valid_responses: [
        // 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'ArrowRight',
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
  choices: ['coconut', 'orange', 'grape', 'banana'],
  button_html: (choice) => `<div class="destination-button"><img src="imgs/island_icon_${choice}.png" style="width:100px;"><img src="imgs/letter-${ctrlConfig.islandKeyList[choice]}.png" style="width:50px;"></div>`
};

// function generateCtrlHomeBaseFeedback() {
//   // Get last trial's data
//   const lastTrial = jsPsych.data.getLastTrialData().values()[0];
//   console.log(lastTrial);
//   const ship = lastTrial.timeline_variables["ship"];
//   const correct = ctrlConfig.controlRule[ship] === Object.keys(ctrlConfig.islandKeyList)[lastTrial.response];
//   console.log("Correct: ", correct);
//   if (correct) {
//     msg = "Correct! You found the home base of the ship.";
//   } else {
//     msg = "This seems to be the wrong island. Don't worry, maybe next time!";
//   }

//   const stimulus = `
//     <div class="instruction-dialog" style="bottom:50%;">
//                 <div class="instruction-content">
//                     ${msg}
//                 </div>
//             </div>
//     `;
//     return stimulus;
// }

// const predictHomeBaseFeedback = {
//   type: jsPsychHtmlKeyboardResponse,
//   stimulus: () => {
//     return generateCtrlHomeBaseFeedback();
//   },
//   choices: "NO_KEYS",
//   trial_duration: 1000,
//   post_trial_gap: 100,
//   data: {
//     trialphase: "ctrl_predict_homebase_feedback"
//   }
// };

const predictDestTrial = {
  type: jsPsychHtmlButtonResponse,
  trial_duration: ctrlConfig.predict_decision,
  stimulus: () => {
    return generatePredDest(
      jsPsych.evaluateTimelineVariable('ship'),
      jsPsych.evaluateTimelineVariable('near'),
      jsPsych.evaluateTimelineVariable('current'),
      jsPsych.evaluateTimelineVariable('fuel_lvl')
    );
  },
  data: {
    trialphase: "ctrl_predict_dest",
    response: () => { return window.choice },
    rt: () => { return window.choice_rt }
  },
  save_timeline_variables: true,
  on_load: () => {
    window.choice = null;
    window.choice_rt = null;
    jsPsych.pluginAPI.getKeyboardResponse({
      callback_function: highlightDestChoice,
      valid_responses: [
        // 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'ArrowRight',
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
  post_trial_gap: ctrlConfig.post_trial_gap,
  choices: ['coconut', 'orange', 'grape', 'banana'],
  button_html: (choice) => `<div class="destination-button"><img src="imgs/island_icon_${choice}.png" style="width:100px;"><img src="imgs/letter-${ctrlConfig.islandKeyList[choice]}.png" style="width:50px;"></div>`
};

// Reward trial
function generateRewardTrial(target, near, left, right, current) {
  const stimulus = `
    <main class="main-stage">
      <img class="background" src="imgs/ocean.png" alt="Background"/>
      <section class="scene">
        <div class="quest-scroll">
          <p style="position: absolute; z-index: 4; top: 9%; font-size: 2.5vh; color: maroon">Target Island</p>
          <img class="quest-scroll-img" src="imgs/scroll.png" alt="Quest scroll" />
          <img class="island-target" src="imgs/island_icon_${target}.png" alt="Target island" />
          <p style="position: absolute; z-index: 4; top: 55%; font-size: 2.5vh; color: maroon">Quest reward: [...]</p>
        </div>
        <div class="overlap-group">
          <div class="choice-left">
            <div class="fuel-container-left">
              <div class="fuel-indicator-container">
                <div class="fuel-indicator-bar"></div>
              </div>
            </div>
            <img class="ship-left" src="imgs/simple_ship_${left}.png" alt="Left ship" />
            <img class="arrow-left" src="imgs/left.png" alt="Left arrow" />
          </div>
          <img class="island-near" src="imgs/simple_island_${near}.png" alt="Nearer island" />
          <div class="choice-right">
            <div class="fuel-container-right">
              <div class="fuel-indicator-container">
                <div class="fuel-indicator-bar"></div>
              </div>
            </div>
            <img class="ship-right" src="imgs/simple_ship_${right}.png" alt="Right ship" />
            <img class="arrow-right" src="imgs/left.png" alt="Right arrow" />
          </div>
        </div>
        ${createOceanCurrents(current)}
      </section>
    </main>
  `;
  return stimulus;
};

const rewardTrial = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: () => {
    return generateRewardTrial(
      jsPsych.evaluateTimelineVariable('target'),
      jsPsych.evaluateTimelineVariable('near'),
      jsPsych.evaluateTimelineVariable('left'),
      jsPsych.evaluateTimelineVariable('right'),
      jsPsych.evaluateTimelineVariable('current')
    );
  },
  choices: "NO_KEYS",
  response_ends_trial: false,
  post_trial_gap: ctrlConfig.post_trial_gap,
  save_timeline_variables: true,
  data: {
    trialphase: "ctrl_reward",
    responseTime: () => { return window.responseTime },
    response: () => { return window.choice },
    rt: () => { return window.choice_rt },
    trial_presses: () => { return window.responseTime.length },
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

        // Start the second timer for 3000ms
        jsPsych.pluginAPI.setTimeout(() => {
          jsPsych.finishTrial();
        }, ctrlConfig.reward_effort);
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

    // Start the first timer for 2000ms
    jsPsych.pluginAPI.setTimeout(() => {
      if (!selectedKey) {
        jsPsych.finishTrial();
      }
    }, ctrlConfig.reward_decision);
  },
  on_finish: () => {
    jsPsych.pluginAPI.cancelAllKeyboardResponses();
    console.log(jsPsych.data.getLastTrialData().values()[0]);
  }
};

function generateRewardFeedback() {
  // Get last trial's data
  const lastTrial = jsPsych.data.getLastTrialData().values()[0];
  const choice = lastTrial.response; // 'left' or 'right'
  const chosenColor = lastTrial.timeline_variables[choice]; // Get the color of the chosen side
  const nearIsland = lastTrial.timeline_variables.near; // Get the near island from last trial
  const currentStrength = lastTrial.timeline_variables.current; // Get the current strength from last trial
  const fuelLevel = lastTrial.trial_presses; // Get the fuel level from last trial
  const targetIsland = lastTrial.timeline_variables.target; // Get the target island from last trial

  // Determine destination island
  let destinationIsland;
  let currentRule = chooseControlRule(fuelLevel, currentStrength);
  if (currentRule === 'base') {
    // Use base rule - show opposite of near island
    destinationIsland = ctrlConfig.baseRule[nearIsland];
  } else {
    // Use control rule - based on chosen ship's color
    destinationIsland = ctrlConfig.controlRule[chosenColor];
  }

  const correct = targetIsland === destinationIsland;
  if (correct) {
    msg = "<p>Congratulations!</p><p>You successfully transport the cargo to the target island.</p>";
  } else {
    msg = "<p>Sorry!</p><p>The cargo has been transported to the wrong island. But don't worry, maybe next time.</p>";
  }

  // Generate HTML for the feedback
  const html = `
    <main class="main-stage">
      <img class="background" src="imgs/ocean_above.png" alt="Background"/>
      <div class="instruction-dialog" style="bottom:50%;">
        <div class="instruction-content" style="font-size: 24px;">
            ${msg}
        </div>
      </div>
    </main>
  `;

  return html;
}

const rewardFeedback = {
  timeline: [{
    type: jsPsychHtmlKeyboardResponse,
    stimulus: () => {
      return generateRewardFeedback();
    },
    choices: "NO_KEYS",
    trial_duration: ctrlConfig.reward_feedback,
    post_trial_gap: ctrlConfig.post_trial_gap,
    data: {
      trialphase: "ctrl_reward_feedback"
    }
  }],
  conditional_function: function () {
    const last_trial_choice = jsPsych.data.get().last(1).select('response').values[0];
    return last_trial_choice !== null;
  }
};



// Self-report ratings
const controlRating = {
  timeline: [{
    type: jsPsychHtmlVasResponse,
    stimulus: "<p>How in control do you feel at this moment?</p>",
    prompt: "<p>Click on the slider to indicate your response.</p>",
    scale_width: 600,
    labels: ["Not at all in control", "I don't know", "Completely in control"],
    required: true
  }],
  conditional_function: function () {
    const last_trial_choice = jsPsych.data.get().last(1).select('response').values[0];
    return last_trial_choice !== null;
  }
};

const confidenceRating = {
  timeline: [{
    type: jsPsychHtmlVasResponse,
    stimulus: "<p>How confident are you that your last choice was correct?</p>",
    prompt: "<p>Click on the slider to indicate your response.</p>",
    scale_width: 600,
    labels: ["Not at all", "Very confident"],
    required: true
  }],
  conditional_function: function () {
    const last_trial_choice = jsPsych.data.get().last(1).select('response').values[0];
    return last_trial_choice !== null;
  }
};

// Create trial variations
const exploreConditions = [
  { "left": "green", "right": "blue", "near": "coconut", "current": 3 },
  { "left": "red", "right": "yellow", "near": "orange", "current": 1 }
];

const predictionConditions = [
  { ship: "blue", near: "orange", current: 1, fuel_lvl: 75 },
  // { ship: "red", near: "grape", current: 2, fuel_lvl: 50 },
  { ship: "yellow", near: "coconut", current: 3, fuel_lvl: 15 }
];

const rewardConditions = [
  { "target": "grape", "near": "banana", "left": "green", "right": "yellow", "current": 2 },
  { "target": "coconut", "near": "grape", "left": "blue", "right": "red", "current": 3 }
];

// Timelines
var expTimeline = [];
exploreConditions.forEach(trial => {
  expTimeline.push({
    timeline: [exploreTrial, exploreFeedback, noChoiceWarning, controlRating],
    timeline_variables: [trial]
  });
});

var predictionTimeline = [];
predictionConditions.forEach(trial => {
  predictionTimeline.push({
    timeline: [predictHomeBaseTrial, noChoiceWarning, confidenceRating, predictDestTrial, noChoiceWarning, confidenceRating],
    timeline_variables: [trial]
  });
});

var rewardTimeline = [];
rewardConditions.forEach(trial => {
  rewardTimeline.push({
    timeline: [rewardTrial, rewardFeedback, noChoiceWarning, controlRating],
    timeline_variables: [trial]
  });
});
