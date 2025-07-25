var jsPsychExploreShip = (function (jspsych) {
  "use strict";

  const info = {
    name: "explore-ship",
    version: "1.0.0",
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
    }

    createOceanCurrents(level) {
      // Helper function to create current lines based on level and direction
      const createCurrentLines = (isTrace = false, isLeft = true) => {
        let lines = '';
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
    }

    trial(display_element, trial) {

      // Define base rule mapping
      this.baseRule = CONTROL_CONFIG.baseRule;

      // Initialize trial variables
      let selectedKey = null;
      let lastPressTime = 0;
      let trial_presses = 0;
      let responseTime = [];
      let choice = null;
      let choice_rt = 0;
      let repeated_listener = null;

      // Generate HTML for the trial
      const generateHTML = () => {
        const far = this.baseRule[trial.near];
        const other_islands = Object.values(this.baseRule).filter(x => ![trial.near, far].includes(x));
        const left_island = other_islands[0];
        const right_island = other_islands[1];
        return `
          <main class="main-stage">
            <img class="background" src="imgs/ocean.png" alt="Background"/>
            <section class="scene">
              <img class="island-far" src="imgs/Control_stims/${window.session}/simple_island_${far}.png" alt="Farther island" />
              <!--Middle group for other islands, if needed-->
              <!--
              <div class="middle-group">
                <img class="island-middle" src="imgs/Control_stims/${window.session}/simple_island_${left_island}.png" alt="Left island" />
                <img class="island-middle" src="imgs/Control_stims/${window.session}/simple_island_${right_island}.png" alt="Right island" />
              </div>
              -->
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
                <img class="island-near" src="imgs/Control_stims/${window.session}/simple_island_${trial.near}.png" alt="Nearer island" />
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
              ${this.createOceanCurrents(trial.current)}
            </section>
          </main>
        `;
      };

      // Display the trial
      display_element.innerHTML = generateHTML();

      // Function to create and animate fuel icons
      const createFuelIcon = (container) => {
        const fuelIcon = document.createElement('img');
        fuelIcon.src = 'imgs/fuel.png';
        fuelIcon.className = 'fuel-icon fuel-animation';
        container.appendChild(fuelIcon);

        fuelIcon.addEventListener('animationend', () => {
          container.removeChild(fuelIcon);
        });
      };

      // Handle initial ship selection
      const handleKeypress = (info) => {
        if (!selectedKey) {
          if (info.key === 'ArrowLeft') {
            selectedKey = 'left';
            document.querySelector('.arrow-left').classList.add('highlight');
            document.querySelector('.choice-right').style.visibility = 'hidden';
            document.querySelector('.fuel-container-left .fuel-indicator-container').style.opacity = '1';
            setupRepeatedKeypress('ArrowLeft');
          } else if (info.key === 'ArrowRight') {
            selectedKey = 'right';
            document.querySelector('.arrow-right').classList.add('highlight');
            document.querySelector('.choice-left').style.visibility = 'hidden';
            document.querySelector('.fuel-container-right .fuel-indicator-container').style.opacity = '1';
            setupRepeatedKeypress('ArrowRight');
          }
          choice = selectedKey;
          choice_rt = info.rt;
          this.jsPsych.pluginAPI.cancelKeyboardResponse(firstKey_listener);

          // Start effort phase timer
          this.jsPsych.pluginAPI.setTimeout(() => {
            // Apply fade-out animation to the selected ship
            this.jsPsych.pluginAPI.cancelAllKeyboardResponses();
            if (selectedKey === 'left') {
              const leftShip = document.querySelector('.ship-left');
              leftShip.classList.add('fade-out-left');
            } else if (selectedKey === 'right') {
              const rightShip = document.querySelector('.ship-right');
              rightShip.classList.add('fade-out-right');
            }

            // End trial after short animation delay (300ms)
            this.jsPsych.pluginAPI.setTimeout(() => {
              endTrial();
            }, 350);
          }, trial.explore_effort);
        }
      };

      // Handle repeated keypresses for effort
      const handleRepeatedKeypress = (info) => {
        trial_presses++;
        responseTime.push(info.rt - lastPressTime);
        lastPressTime = info.rt;

        const container = selectedKey === 'left' ?
          document.querySelector('.fuel-container-left') :
          document.querySelector('.fuel-container-right');

        createFuelIcon(container);

        const fuelBar = container.querySelector('.fuel-indicator-bar');
        const progress = Math.min((trial_presses / 30) * 100, 100);
        fuelBar.style.width = `${progress}%`;

        if (progress === 100) {
          fuelBar.style.backgroundColor = '#00ff00';
        }
      };

      // Setup repeated keypress listener
      const setupRepeatedKeypress = (key) => {
        repeated_listener = this.jsPsych.pluginAPI.getKeyboardResponse({
          callback_function: handleRepeatedKeypress,
          valid_responses: [key],
          rt_method: 'performance',
          persist: true,
          allow_held_key: false,
          minimum_valid_rt: 0
        });
      };

      // Initial keyboard listener
      const firstKey_listener = this.jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: handleKeypress,
        valid_responses: trial.choices,
        rt_method: 'performance',
        persist: false,
        allow_held_key: false,
        minimum_valid_rt: 100
      });

      // Start decision phase timer
      this.jsPsych.pluginAPI.setTimeout(() => {
        if (!selectedKey) {
          endTrial();
        }
      }, trial.explore_decision);

      // Function to end trial
      const endTrial = () => {
        this.jsPsych.pluginAPI.cancelAllKeyboardResponses();
        display_element.innerHTML = '';

        // Save data
        const trial_data = {
          trialphase: "control_explore",
          response: choice,
          rt: choice_rt,
          responseTime: responseTime,
          trial_presses: trial_presses
        };

        this.jsPsych.finishTrial(trial_data);
      };
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
      this.baseRule = CONTROL_CONFIG.baseRule;

      this.controlRule = CONTROL_CONFIG.controlRule;

      this.effort_threshold = CONTROL_CONFIG.effort_threshold;
      this.scale = CONTROL_CONFIG.scale;
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
      let choice = lastTrial.response; // 'left' or 'right'
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

      // Generate feedback display
      const html = `
        <main class="main-stage">
          <img class="background" src="imgs/ocean.png" alt="Background"/>
          <section class="scene">
            <div class="overlap-group" style="justify-content: space-between;">
              <div class="choice-left">
              </div>
              <img class="island-near" style="visibility: hidden;" src="imgs/Control_stims/${window.session}/simple_island_i4.png" alt="Nearer island" />
              <div class="choice-right">
              </div>
            </div>
          </section>
        </main>
      `;

      display_element.innerHTML = html;

      // Clean up any leftover style elements
      const oldStyles = document.querySelectorAll('style[data-feedback-animation]');
      oldStyles.forEach(style => style.remove());

      // Get the choice container
      // Invert the choice to determine the opposite side for feedback display
      choice = choice === 'left' ? 'right' : 'left';
      const choiceContainer = display_element.querySelector(`.choice-${choice}`);
      // Clear any existing content
      choiceContainer.innerHTML = '';
      // Create the ship image element
      const shipImg = document.createElement('img');
      shipImg.className = `ship-${choice}`;
      shipImg.style.opacity = '0';
      shipImg.src = `imgs/simple_ship_${chosenColor}.png`;
      // Add the image to the container
      choiceContainer.appendChild(shipImg);

      // Handle the island side
      const islandSide = choice === 'left' ? 'right' : 'left';
      const islandContainer = display_element.querySelector(`.choice-${islandSide}`);
      // Clear any existing content
      islandContainer.innerHTML = '';
      // Create the island image element
      const islandImg = document.createElement('img');
      // islandImg.className = `ship-${islandSide}`;  
      islandImg.className = `island-near`;
      islandImg.style.top = '-10%';
      islandImg.src = `imgs/Control_stims/${window.session}/simple_island_${destinationIsland}.png`;
      // Add the image to the container
      islandContainer.appendChild(islandImg);

      // Add animation styles
      const animationStyle = document.createElement('style');
      animationStyle.setAttribute('data-feedback-animation', 'true');

      // Determine if ship should be flipped based on which side it starts from
      // Ships on the left are already flipped with scaleX(-1) in the CSS
      // As long as it's flipped here, it will move in the correct direction
      const shouldFlip = choice === 'left';
      const scaleX = shouldFlip ? '-1' : '1';

      // Calculate the distance to move the ship
      const distance = display_element.querySelector('.island-near').offsetWidth + shipImg.offsetWidth / 4;

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

      // Add ocean currents based on current strength and movement direction
      const createHorizontalCurrents = (level, choice) => {
        // Helper function to create current lines based on level and direction
        const createCurrentLines = (isTrace = false, isLeft = true) => {
          let lines = '';
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
          return lines;
        };

        const currentsHTML = `
          <div class="ocean-current">
            <div class="current-group ${choice}-horizon-currents">
            ${createCurrentLines(true, choice === 'left')}
            ${createCurrentLines(false, choice === 'left')}
          </div>
        `
        return currentsHTML;
      };

      // Add horizontal currents to the scene if the ship goes to the next island
      if (destinationIsland === this.baseRule[nearIsland]) {
        display_element.querySelector('.scene').insertAdjacentHTML('beforeend', createHorizontalCurrents(currentStrength, choice));
      }

      // Apply the animation class after a small delay to ensure DOM is ready
      setTimeout(() => {
        shipImg.classList.add('ship-animate');
      }, 100);

      // Save data and end trial after duration
      const trial_data = {
        trialphase: "control_explore_feedback",
        destination_island: destinationIsland,
        control_rule_used: currentRule,
        effort_level: effortLevel,
        current_strength: currentStrength,
        ship_color: chosenColor,
        near_island: nearIsland,
        probability_control: this.sigmoid((effortLevel - this.effort_threshold[currentStrength - 1]) * this.scale)
      };

      this.jsPsych.pluginAPI.setTimeout(() => {
        display_element.innerHTML = '';
        this.jsPsych.finishTrial(trial_data);
      }, trial.feedback_duration);
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