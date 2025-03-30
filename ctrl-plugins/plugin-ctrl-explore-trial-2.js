var jsPsychExploreShip = (function (jspsych) {
  "use strict";

  const info = {
    name: "explore-ship",
    version: "1.1.0",
    parameters: {
      left: {
        type: jspsych.ParameterType.STRING,
        default: undefined,
        description: "Color/type of the left ship"
      },
      right: {
        type: jspsych.ParameterType.STRING,
        default: undefined,
        description: "Color/type of the right ship"
      },
      near: {
        type: jspsych.ParameterType.STRING,
        default: undefined,
        description: "Type of the near island"
      },
      current: {
        type: jspsych.ParameterType.INT,
        default: 1,
        description: "Strength of ocean current (1-3)"
      },
      explore_decision: {
        type: jspsych.ParameterType.INT,
        default: 4000,
        description: "Time allowed for initial ship selection (ms)"
      },
      explore_effort: {
        type: jspsych.ParameterType.INT,
        default: 3000,
        description: "Time allowed for effort input after selection (ms)"
      },
      choices: {
        type: jspsych.ParameterType.KEYS,
        default: ["ArrowLeft", "ArrowRight"]
      },
      post_trial_gap: {
        type: jspsych.ParameterType.INT,
        default: 300,
        description: "Gap between trials (ms)"
      }
    },
    data: {
      trialphase: {
        type: jspsych.ParameterType.STRING,
        default: "control_explore"
      },
      response: {
        type: jspsych.ParameterType.STRING
      },
      rt: {
        type: jspsych.ParameterType.INT
      },
      responseTime: {
        type: jspsych.ParameterType.INT,
        array: true
      },
      trial_presses: {
        type: jspsych.ParameterType.INT
      }
    }
  };

  class ExploreShipPlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;

      // Define base rule mapping
      this.baseRule = {
        banana: "coconut",
        coconut: "grape",
        grape: "orange",
        orange: "banana"
      };
    }

    trial(display_element, trial) {
      // Initialize trial variables
      let selectedKey = null;
      let lastPressTime = 0;
      let trial_presses = 0;
      let responseTime = [];
      let choice = null;
      let choice_rt = 0;
      let repeated_listener = null;

      // Generate full HTML upfront
      display_element.innerHTML = this.generateTrialHTML(trial);

      // Setup initial keyboard listener
      const firstKey_listener = this.jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: (info) => this.handleInitialKeypress(info, trial),
        valid_responses: trial.choices,
        rt_method: 'performance',
        persist: false,
        allow_held_key: false,
        minimum_valid_rt: 100
      });

      // Start decision phase timer
      this.jsPsych.pluginAPI.setTimeout(() => {
        if (!selectedKey) {
          this.endTrial();
        }
      }, trial.explore_decision);

      // Store important elements and variables in instance for access across methods
      this.display_element = display_element;
      this.selectedKey = selectedKey;
      this.lastPressTime = lastPressTime;
      this.trial_presses = trial_presses;
      this.responseTime = responseTime;
      this.choice = choice;
      this.choice_rt = choice_rt;
      this.repeated_listener = repeated_listener;
      this.firstKey_listener = firstKey_listener;
      this.trial = trial;
    }

    generateTrialHTML(trial) {
      const far = this.baseRule[trial.near];
      const other_islands = Object.values(this.baseRule).filter(x => ![trial.near, far].includes(x));
      const left_island = other_islands[0];
      const right_island = other_islands[1];

      return `
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
                <img class="ship-left" src="imgs/simple_ship_${trial.left}.png" alt="Left ship" />
                <img class="arrow-left" src="imgs/left.png" alt="Left arrow" />
              </div>
              <img class="island-near" src="imgs/simple_island_${trial.near}.png" alt="Nearer island" />
              <div class="choice-right">
                <div class="fuel-container-right">
                  <div class="fuel-indicator-container">
                    <div class="fuel-indicator-bar"></div>
                  </div>
                </div>
                <img class="ship-right" src="imgs/simple_ship_${trial.right}.png" alt="Right ship" />
                <img class="arrow-right" src="imgs/left.png" alt="Right arrow" />
              </div>
            </div>
            ${this.generateOceanCurrentsHTML(trial.current)}
          </section>
        </main>
      `;
    }

    generateOceanCurrentsHTML(level) {
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

      // Generate the HTML for currents
      let leftTraces = '', leftLines = '', rightTraces = '', rightLines = '';

      currentPositions.forEach(({ top, offset }) => {
        leftTraces += `<div class="current-trace" style="top: ${top}%; right: calc(5% + ${offset}px);"></div>`;
        leftLines += `<div class="current-line" style="top: ${top}%; right: calc(5% + ${offset}px);"></div>`;

        rightTraces += `<div class="current-trace" style="top: ${top}%; left: calc(5% + ${offset}px);"></div>`;
        rightLines += `<div class="current-line" style="top: ${top}%; left: calc(5% + ${offset}px);"></div>`;
      });

      return `
        <div class="ocean-current">
          <div class="current-group left-currents">
            ${leftTraces}
            ${leftLines}
          </div>
          <div class="current-group right-currents">
            ${rightTraces}
            ${rightLines}
          </div>
        </div>
      `;
    }

    handleInitialKeypress(info, trial) {
      if (!this.selectedKey) {
        if (info.key === 'ArrowLeft') {
          this.selectedKey = 'left';
          this.display_element.querySelector('.arrow-left').classList.add('highlight');
          this.display_element.querySelector('.choice-right').classList.add('hidden');
          this.display_element.querySelector('.fuel-container-left .fuel-indicator-container').classList.add('visible');
          this.setupRepeatedKeypress('ArrowLeft');
        } else if (info.key === 'ArrowRight') {
          this.selectedKey = 'right';
          this.display_element.querySelector('.arrow-right').classList.add('highlight');
          this.display_element.querySelector('.choice-left').classList.add('hidden');
          this.display_element.querySelector('.fuel-container-right .fuel-indicator-container').classList.add('visible');
          this.setupRepeatedKeypress('ArrowRight');
        }

        this.choice = this.selectedKey;
        this.choice_rt = info.rt;
        this.jsPsych.pluginAPI.cancelKeyboardResponse(this.firstKey_listener);

        // Start effort phase timer
        this.jsPsych.pluginAPI.setTimeout(() => {
          // Cancel all keyboard responses
          this.jsPsych.pluginAPI.cancelAllKeyboardResponses();

          // Apply fade-out animation to the selected ship
          if (this.selectedKey === 'left') {
            this.display_element.querySelector('.ship-left').classList.add('fade-out-left');
          } else if (this.selectedKey === 'right') {
            this.display_element.querySelector('.ship-right').classList.add('fade-out-right');
          }

          // End trial after animation completes
          this.jsPsych.pluginAPI.setTimeout(() => {
            this.endTrial();
          }, 350);
        }, trial.explore_effort);
      }
    }

    handleRepeatedKeypress(info) {
      this.trial_presses++;
      this.responseTime.push(info.rt - this.lastPressTime);
      this.lastPressTime = info.rt;

      // Create fuel animation element
      const container = this.selectedKey === 'left'
        ? this.display_element.querySelector('.fuel-container-left')
        : this.display_element.querySelector('.fuel-container-right');

      this.createFuelAnimation(container);

      // Update fuel indicator bar
      const fuelBar = container.querySelector('.fuel-indicator-bar');
      const progress = Math.min((this.trial_presses / 30) * 100, 100);
      fuelBar.style.width = `${progress}%`;

      if (progress === 100) {
        fuelBar.classList.add('full');
      }
    }

    createFuelAnimation(container) {
      const fuelIcon = document.createElement('img');
      fuelIcon.src = 'imgs/fuel.png';
      fuelIcon.className = 'fuel-icon fuel-animation';
      container.appendChild(fuelIcon);

      fuelIcon.addEventListener('animationend', () => {
        container.removeChild(fuelIcon);
      });
    }

    setupRepeatedKeypress(key) {
      this.repeated_listener = this.jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: (info) => this.handleRepeatedKeypress(info),
        valid_responses: [key],
        rt_method: 'performance',
        persist: true,
        allow_held_key: false,
        minimum_valid_rt: 0
      });
    }

    endTrial() {
      this.jsPsych.pluginAPI.cancelAllKeyboardResponses();
      this.display_element.innerHTML = '';

      // Save data
      const trial_data = {
        trialphase: "control_explore",
        response: this.choice,
        rt: this.choice_rt,
        responseTime: this.responseTime,
        trial_presses: this.trial_presses
      };

      this.jsPsych.finishTrial(trial_data);
    }

    // Simulation function
    simulate(trial, simulation_mode, simulation_options, load_callback) {
      if (simulation_mode == "data-only") {
        load_callback();
        this.simulate_data_only(trial, simulation_options);
      }
      if (simulation_mode == "visual") {
        this.simulate_visual(trial, simulation_options, load_callback);
      }
    }

    create_simulation_data(trial, simulation_options) {
      const keyToChoice = { "ArrowLeft": "left", "ArrowRight": "right" };
      const trial_presses = this.jsPsych.randomization.randomInt(2, 20);
      const default_data = {
        trialphase: "control_explore",
        response: keyToChoice[this.jsPsych.pluginAPI.getValidKey(trial.choices)],
        rt: Math.floor(this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true)),
        responseTime: Array.from({ length: trial_presses }, () => Math.floor(this.jsPsych.randomization.sampleExGaussian(100, 10, 0.5, true))),
        trial_presses: trial_presses
      };

      const data = this.jsPsych.pluginAPI.mergeSimulationData(default_data, simulation_options);
      this.jsPsych.pluginAPI.ensureSimulationDataConsistency(trial, data);
      return data;
    }

    simulate_data_only(trial, simulation_options) {
      const data = this.create_simulation_data(trial, simulation_options);
      this.jsPsych.finishTrial(data);
    }

    simulate_visual(trial, simulation_options, load_callback) {
      const choiceToKey = { "left": "ArrowLeft", "right": "ArrowRight" };
      const data = this.create_simulation_data(trial, simulation_options);
      const display_element = this.jsPsych.getDisplayElement();

      // Faster visual simulation
      if (simulation_options.speed_up) {
        trial.explore_decision = trial.explore_decision / simulation_options.speed_up_factor;
        trial.explore_effort = trial.explore_effort / simulation_options.speed_up_factor;
        trial.post_trial_gap = trial.post_trial_gap / simulation_options.speed_up_factor;
      }

      this.trial(display_element, trial);
      load_callback();

      if (data.rt !== null) {
        let t = data.rt;
        this.jsPsych.pluginAPI.pressKey(choiceToKey[data.response], t);
        data.responseTime.forEach((rt, i) => {
          t += rt;
          this.jsPsych.pluginAPI.pressKey(choiceToKey[data.response], t);
        });
      }
    }
  }

  ExploreShipPlugin.info = info;
  return ExploreShipPlugin;
})(jsPsychModule);

var jsPsychExploreShipFeedback = (function (jspsych) {
  "use strict";

  const info = {
    name: "explore-ship-feedback",
    version: "1.0.0",
    parameters: {
      feedback_duration: {
        type: jspsych.ParameterType.INT,
        default: 3000,
        description: "Duration to show feedback (ms)"
      },
      post_trial_gap: {
        type: jspsych.ParameterType.INT,
        default: 800,
        description: "Gap between trials (ms)"
      }
    },
    data: {
      trialphase: {
        type: jspsych.ParameterType.STRING,
        default: "control_explore_feedback"
      },
      destination_island: {
        type: jspsych.ParameterType.STRING
      },
      control_rule_used: {
        type: jspsych.ParameterType.STRING
      },
      effort_level: {
        type: jspsych.ParameterType.INT
      },
      current_strength: {
        type: jspsych.ParameterType.INT
      },
      ship_color: {
        type: jspsych.ParameterType.STRING
      },
      near_island: {
        type: jspsych.ParameterType.STRING
      },
      probability_control: {
        type: jspsych.ParameterType.FLOAT
      }
    }
  };

  class ExploreShipFeedbackPlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;

      // Define rule mappings
      this.baseRule = {
        banana: "coconut",
        coconut: "grape",
        grape: "orange",
        orange: "banana"
      };

      this.controlRule = {
        green: "coconut",
        blue: "grape",
        red: "orange",
        yellow: "banana"
      };

      this.effort_threshold = [6, 12, 18];
      this.scale = 2;
    }

    sigmoid(x) {
      return 1 / (1 + Math.exp(-x));
    }

    chooseControlRule(effort, current) {
      const extra_effort = (effort - this.effort_threshold[current - 1]) * this.scale;
      const prob = this.sigmoid(extra_effort);
      return Math.random() < prob ? 'control' : 'base';
    }

    trial(display_element, trial) {
      // Get data from previous trial
      const lastTrial = this.jsPsych.data.getLastTrialData().values()[0];
      const choice = lastTrial.response; // 'left' or 'right'
      const chosenColor = this.jsPsych.evaluateTimelineVariable(choice);
      const nearIsland = this.jsPsych.evaluateTimelineVariable('near');
      const currentStrength = this.jsPsych.evaluateTimelineVariable('current');
      const effortLevel = lastTrial.trial_presses;

      // Determine destination island based on control rule
      const currentRule = this.chooseControlRule(
        effortLevel,
        currentStrength
      );

      const destinationIsland = currentRule === 'base'
        ? this.baseRule[nearIsland]
        : this.controlRule[chosenColor];

      // Clear any existing animation styles
      const oldStyles = document.querySelectorAll('style[data-feedback-animation]');
      oldStyles.forEach(style => style.remove());

      // Generate feedback display HTML
      display_element.innerHTML = this.generateFeedbackHTML(choice, chosenColor, destinationIsland);

      // Create dynamic animation for the ship
      setTimeout(() => {
        this.createShipAnimation(display_element, choice);
      }, 50);


      // Store trial data for end of trial
      this.trial_data = {
        trialphase: "control_explore_feedback",
        destination_island: destinationIsland,
        control_rule_used: currentRule,
        effort_level: effortLevel,
        current_strength: currentStrength,
        ship_color: chosenColor,
        near_island: nearIsland,
        probability_control: this.sigmoid((effortLevel - this.effort_threshold[currentStrength - 1]) * this.scale)
      };

      // Apply animation classes after a small delay
      setTimeout(() => {
        // Find the ship element
        const feedbackChoice = choice === 'left' ? 'right' : 'left';
        const shipElement = display_element.querySelector(`.ship-${feedbackChoice}`);

        // Add animation class
        shipElement.classList.add('ship-animate');
      }, 100);

      // End trial after duration
      this.jsPsych.pluginAPI.setTimeout(() => {
        display_element.innerHTML = '';
        this.jsPsych.finishTrial(this.trial_data);
      }, trial.feedback_duration);
    }

    generateFeedbackHTML(choice, chosenColor, destinationIsland, currentStrength, useBaseRule) {
      // Invert the choice for correct feedback display
      const feedbackChoice = choice === 'left' ? 'right' : 'left';
      const islandSide = feedbackChoice === 'left' ? 'right' : 'left';

      // Determine CSS classes for ship orientation
      const shipClass = `ship-${feedbackChoice} feedback-ship-${feedbackChoice}`;

      // Generate ocean currents HTML if using base rule
      const currentsHTML = useBaseRule
        ? this.generateOceanCurrentsHTML(currentStrength, feedbackChoice)
        : '';

      return `
        <main class="main-stage">
          <img class="background" src="imgs/ocean.png" alt="Background"/>
          <section class="scene">
            <div class="overlap-group" style="justify-content: space-between;">
              <div class="choice-left">
                ${feedbackChoice === 'left' ? `<img class="${shipClass}" src="imgs/simple_ship_${chosenColor}.png" alt="Ship" />` : ''}
                ${islandSide === 'left' ? `<img class="island-near feedback-island" src="imgs/simple_island_${destinationIsland}.png" alt="Destination island" />` : ''}
              </div>
              <img class="island-near" style="visibility: hidden;" src="imgs/simple_island_grape.png" alt="Hidden island" />
              <div class="choice-right">
                ${feedbackChoice === 'right' ? `<img class="${shipClass}" src="imgs/simple_ship_${chosenColor}.png" alt="Ship" />` : ''}
                ${islandSide === 'right' ? `<img class="island-near feedback-island" src="imgs/simple_island_${destinationIsland}.png" alt="Destination island" />` : ''}
              </div>
            </div>
            ${currentsHTML}
          </section>
        </main>
      `;
    }

    createShipAnimation(display_element, choice) {
      // Invert the choice for feedback display
      const feedbackChoice = choice === 'left' ? 'right' : 'left';
      
      // Get ship and island elements
      const shipImg = display_element.querySelector(`.ship-${feedbackChoice}`);
      const islandImg = display_element.querySelector(`.island-near`);
      
      if (!shipImg || !islandImg) return;
      
      // Calculate the distance to move the ship
      const distance = islandImg.offsetWidth + shipImg.offsetWidth / 4;
      
      // Determine if ship should be flipped based on which side it starts from
      const shouldFlip = feedbackChoice === 'left';
      const scaleX = shouldFlip ? '-1' : '1';
      
      // Create the animation style
      const animationStyle = document.createElement('style');
      animationStyle.setAttribute('data-feedback-animation', 'true');
      
      // Define the animation with the calculated distance
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
      
      // Apply the animation class
      shipImg.classList.add('ship-animate');
    }

    generateOceanCurrentsHTML(level, shipSide) {
      // Create positions based on current strength
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

      // Generate currents HTML based on ship position
      let tracesHTML = '';
      let linesHTML = '';

      currentPositions.forEach(({ top, offset }) => {
        const position = shipSide === 'left' ? 'right' : 'left';
        tracesHTML += `<div class="current-trace feedback-current-trace" style="top: ${top}%; ${position}: calc(15% + ${offset}px);"></div>`;
        linesHTML += `<div class="current-line feedback-current-line" style="top: ${top}%; ${position}: calc(15% + ${offset}px);"></div>`;
      });

      return `
        <div class="ocean-current feedback-ocean-current">
          <div class="current-group ${shipSide}-horizon-currents">
            ${tracesHTML}
            ${linesHTML}
          </div>
        </div>
      `;
    }

    // Simulation methods remain the same
    simulate(trial, simulation_mode, simulation_options, load_callback) {
      if (simulation_mode == "data-only") {
        load_callback();
        this.simulate_data_only(trial, simulation_options);
      }
      if (simulation_mode == "visual") {
        this.simulate_visual(trial, simulation_options, load_callback);
      }
    }

    create_simulation_data(trial, simulation_options) {
      // Get data from previous trial
      const lastTrial = this.jsPsych.data.getLastTrialData().values()[0];
      const choice = lastTrial.response; // 'left' or 'right'
      const chosenColor = this.jsPsych.evaluateTimelineVariable(choice);
      const nearIsland = this.jsPsych.evaluateTimelineVariable('near');
      const currentStrength = this.jsPsych.evaluateTimelineVariable('current');
      const effortLevel = lastTrial.trial_presses;

      // Determine destination island based on control rule
      const currentRule = this.chooseControlRule(
        effortLevel,
        currentStrength
      );

      const destinationIsland = currentRule === 'base'
        ? this.baseRule[nearIsland]
        : this.controlRule[chosenColor];

      const default_data = {
        trialphase: "control_explore_feedback",
        destination_island: destinationIsland,
        control_rule_used: currentRule,
        effort_level: effortLevel,
        current_strength: currentStrength,
        ship_color: chosenColor,
        near_island: nearIsland,
        probability_control: this.sigmoid((effortLevel - this.effort_threshold[currentStrength - 1]) * this.scale)
      };

      const data = this.jsPsych.pluginAPI.mergeSimulationData(default_data, simulation_options);
      this.jsPsych.pluginAPI.ensureSimulationDataConsistency(trial, data);
      return data;
    }

    simulate_data_only(trial, simulation_options) {
      const data = this.create_simulation_data(trial, simulation_options);
      this.jsPsych.finishTrial(data);
    }

    simulate_visual(trial, simulation_options, load_callback) {
      const data = this.create_simulation_data(trial, simulation_options);
      const display_element = this.jsPsych.getDisplayElement();

      // Faster visual simulation
      if (simulation_options.speed_up) {
        trial.feedback_duration = trial.feedback_duration / simulation_options.speed_up_factor;
        trial.post_trial_gap = trial.post_trial_gap / simulation_options.speed_up_factor;
      }

      this.trial(display_element, trial);
      load_callback();
    }
  }

  ExploreShipFeedbackPlugin.info = info;

  return ExploreShipFeedbackPlugin;
})(jsPsychModule);