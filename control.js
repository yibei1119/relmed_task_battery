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
  stimulus = `
    <main class="main-stage">
      <img class="background" src="imgs/ocean.png" alt="Background"/>
      <section class="scene">
        <img class="island-far" src="imgs/island_${far}.png" alt="Farther island" />
        <div class="overlap-group">
          <div class="choice-left">
            <div class="fuel-container-left"></div>
            <img class="ship-left" src="imgs/ship_${left}.png" alt="Left ship" />
            <img class="arrow-left" src="imgs/left.png" alt="Left arrow" />
          </div>
          <img class="island-near" src="imgs/island_${near}.png" alt="Nearer island" />
          <div class="choice-right">
            <div class="fuel-container-right"></div>
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
          // Hide the entire right choice (ship, arrow, and container)
          document.querySelector('.choice-right').style.visibility = 'hidden';
          
          // Set up listener for subsequent left key presses
          setupRepeatedKeypress('ArrowLeft');
        } else if (info.key === 'ArrowRight') {
          selectedKey = 'right';
          rightArrow.classList.add('highlight');
          // Hide the entire left choice (ship, arrow, and container)
          document.querySelector('.choice-left').style.visibility = 'hidden';
          
          // Set up listener for subsequent right key presses
          setupRepeatedKeypress('ArrowRight');
        }
      }
      window.choice = selectedKey;
      window.choice_rt = info.rt;
      jsPsych.pluginAPI.cancelKeyboardResponse(firstKey_listener);
    }

    // Function to handle repeated keypresses
    function handleRepeatedKeypress(info) {
      window.responseTime.push(info.rt - lastPressTime);
      lastPressTime = info.rt;
      createFuelIcon(selectedKey === 'left' ? leftContainer : rightContainer);
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
  type: jsPsychHtmlKeyboardResponse,
  stimulus: () => {
    return generateCtrlFeedback()
  },
  choices: "NO_KEYS",
  trial_duration: 100000000,
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
};

// Create the timeline
var expTimeline = [];
ctrlTrials.forEach(trial => {
  expTimeline.push({
    timeline: [exploreTrial, exploreFeedback],
    timeline_variables: [trial]
  });
});