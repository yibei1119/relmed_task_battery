var jsPsychExploreShip = (function (jspsych) {
  "use strict";

  const info = {
    name: "explore-ship",
    version: "1.1.1",
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
        default: 0,
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
      
      // Define base rule mapping - persistent across trials
      this.baseRule = CONTROL_CONFIG.baseRule;
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
            <div class="icon-row" style="position: absolute; display: flex; align-items: center; top: 0%;">
                <img src="imgs/icon-explore.png" alt="Learning" style="width: 40px; height: 40px; margin-right: 15px;"><p style="text-align: left; color: #0F52BA;">Learning</p>
            </div>
            <img class="island-far" src="imgs/Control_stims/${window.session}/simple_island_${far}.png" alt="Farther island" />
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
              <img class="island-near" src="imgs/simple_island.png" alt="Nearer island" />
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

    createFuelAnimation(container) {
      const fuelIcon = document.createElement('img');
      fuelIcon.src = 'imgs/fuel.png';
      fuelIcon.className = 'fuel-icon fuel-animation';
      container.appendChild(fuelIcon);

      fuelIcon.addEventListener('animationend', () => {
        container.removeChild(fuelIcon);
      });
    }

    trial(display_element, trial) {
      // Initialize trial variables (locally scoped to this trial)
      let selectedKey = null;
      let lastPressTime = 0;
      let trial_presses = 0;
      let responseTime = [];
      let choice = null;
      let choice_rt = 0;
      let repeated_listener = null;

      // Generate full HTML upfront
      display_element.innerHTML = this.generateTrialHTML(trial);

      // Handle initial ship selection
      const handleInitialKeypress = (info) => {
        if (!selectedKey) {
          if (info.key === 'ArrowLeft') {
            selectedKey = 'left';
            display_element.querySelector('.arrow-left').classList.add('highlight');
            display_element.querySelector('.choice-right').style.visibility = 'hidden';
            display_element.querySelector('.fuel-container-left .fuel-indicator-container').style.opacity = '1';
            setupRepeatedKeypress('ArrowLeft');
          } else if (info.key === 'ArrowRight') {
            selectedKey = 'right';
            display_element.querySelector('.arrow-right').classList.add('highlight');
            display_element.querySelector('.choice-left').style.visibility = 'hidden';
            display_element.querySelector('.fuel-container-right .fuel-indicator-container').style.opacity = '1';
            setupRepeatedKeypress('ArrowRight');
          }
          
          choice = selectedKey;
          choice_rt = info.rt;
          this.jsPsych.pluginAPI.cancelKeyboardResponse(firstKey_listener);

          // Start effort phase timer
          this.jsPsych.pluginAPI.setTimeout(() => {
            // Cancel all keyboard responses
            this.jsPsych.pluginAPI.cancelAllKeyboardResponses();
            
            // Apply fade-out animation to the selected ship
            if (selectedKey === 'left') {
              display_element.querySelector('.ship-left').classList.add('fade-out-left');
            } else if (selectedKey === 'right') {
              display_element.querySelector('.ship-right').classList.add('fade-out-right');
            }

            // End trial after animation completes
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

        // Create fuel animation element
        const container = selectedKey === 'left' 
          ? display_element.querySelector('.fuel-container-left')
          : display_element.querySelector('.fuel-container-right');
        
        this.createFuelAnimation(container);

        // Update fuel indicator bar
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

      // Initial keyboard listener
      const firstKey_listener = this.jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: handleInitialKeypress,
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
    version: "1.2.0",
    parameters: {
      feedback_duration: {
        type: jspsych.ParameterType.INT,
        default: 3000,
        description: "Duration to show feedback (ms)"
      },
      post_trial_gap: {
        type: jspsych.ParameterType.INT,
        default: 0,
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
      ship_color: {
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

      // Define rule mappings - persistent across trials
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

    generateFeedbackHTML(choice, chosenColor, destinationIsland, matchBaseRule) {
      // Invert the choice for feedback display
      const feedbackChoice = choice === 'left' ? 'right' : 'left';
      const islandSide = feedbackChoice === 'left' ? 'right' : 'left';
      
      if (matchBaseRule) {
        return `
          <main class="main-stage">
            <img class="background" src="imgs/ocean.png" alt="Background"/>
            <section class="scene">
              <div class="icon-row" style="position: absolute; display: flex; align-items: center; top: 0%;">
                  <img src="imgs/icon-explore.png" alt="Learning" style="width: 40px; height: 40px; margin-right: 15px;"><p style="text-align: left; color: #0F52BA;">Learning</p>
              </div>
              <img class="island-far" src="imgs/Control_stims/${window.session}/simple_island_${destinationIsland}.png" alt="Farther island" />
              <img class="feedback-ship" src="imgs/simple_ship_${chosenColor}.png" alt="Ship" style="opacity: 0;" />
            </section>
          </main>
        `;
      } else {
        return `
          <main class="main-stage">
            <img class="background" src="imgs/ocean.png" alt="Background"/>
            <section class="scene">
              <div class="overlap-group" style="justify-content: space-between;">
                <div class="choice-left">
                  ${feedbackChoice === 'left' ? 
                    `<img class="ship-${feedbackChoice}" src="imgs/simple_ship_${chosenColor}.png" alt="Ship" style="opacity: 0;" />` : ''}
                  ${islandSide === 'left' ? `<img class="island-near" src="imgs/Control_stims/${window.session}/simple_island_${destinationIsland}.png" alt="Destination island" style="top: -10%;" />` : ''}
                </div>
                <img class="island-near" style="visibility: hidden;" src="imgs/simple_island.png" alt="Hidden island" />
                <div class="choice-right">
                  ${feedbackChoice === 'right' ? 
                    `<img class="ship-${feedbackChoice}" src="imgs/simple_ship_${chosenColor}.png" alt="Ship" style="opacity: 0;" />` : ''}
                  ${islandSide === 'right' ? `<img class="island-near" src="imgs/Control_stims/${window.session}/simple_island_${destinationIsland}.png" alt="Destination island" style="top: -10%;" />` : ''}
                </div>
              </div>
            </section>
          </main>
        `;
      }
    }

    generateOceanCurrentsHTML(level, choice, matchBaseRule) {
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
    }

    createShipAnimation(display_element, choice, matchBaseRule) {
      // Invert the choice for feedback display
      const feedbackChoice = choice === 'left' ? 'right' : 'left';
      const islandSide = feedbackChoice === 'left' ? 'right' : 'left';

      // Get ship and island elements
      const shipImg = matchBaseRule ? display_element.querySelector(`.feedback-ship`) : display_element.querySelector(`.ship-${feedbackChoice}`);
      const islandImg = matchBaseRule ? display_element.querySelector(`.island-far`) : display_element.querySelector(`.choice-${islandSide} .island-near`);
      
      if (!shipImg || !islandImg) return;
      
      // Calculate the distance to move the ship
      const distance = matchBaseRule ? islandImg.offsetWidth/2 + shipImg.offsetWidth : islandImg.offsetWidth + shipImg.offsetWidth / 4;
      
      // Determine if ship should be flipped based on which side it starts from
      const shouldFlip = (feedbackChoice === 'left' && !matchBaseRule) || (feedbackChoice === 'right' && matchBaseRule);
      const scaleX = shouldFlip ? '-1' : '1';
      
      // Create the animation style
      const animationStyle = document.createElement('style');
      animationStyle.setAttribute('data-feedback-animation', 'true');
      
      // Define the animation with the calculated distance
      animationStyle.textContent = matchBaseRule ?`
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
      ` : `
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

      // Clean up any existing animation styles
      const oldStyles = document.querySelectorAll('style[data-feedback-animation]');
      oldStyles.forEach(style => style.remove());

      // Match base rule island
      const matchBaseRule = currentRule === 'base' || destinationIsland === this.baseRule[nearIsland];
      
      // Generate feedback display
      display_element.innerHTML = this.generateFeedbackHTML(choice, chosenColor, destinationIsland, matchBaseRule);

      // Add ocean currents only if using base rule
      // But this way also allows flexibility for future changes
      display_element.querySelector('.scene').insertAdjacentHTML(
        'beforeend', 
        this.generateOceanCurrentsHTML(currentStrength, choice, matchBaseRule)
      );
      if (!matchBaseRule) {
        display_element.querySelector(".ocean-current").style.visibility = "hidden";
      }

      // Create dynamic ship animation after DOM is ready
      setTimeout(() => {
        this.createShipAnimation(display_element, choice, matchBaseRule);
      }, 100);

      // Save data and end trial after duration
      const trial_data = {
        trialphase: "control_explore_feedback",
        destination_island: destinationIsland,
        control_rule_used: currentRule,
        ship_color: chosenColor,
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
        ship_color: chosenColor,
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