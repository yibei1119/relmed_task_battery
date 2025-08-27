var jsPsychRewardShip = (function (jspsych) {
  "use strict";

  const info = {
    name: "reward-ship",
    version: "1.1.0",
    parameters: {
      target: {
        type: jspsych.ParameterType.STRING,
        default: undefined,
        description: "Target island for delivery"
      },
      near: {
        type: jspsych.ParameterType.STRING,
        default: undefined,
        description: "Type of the near island"
      },
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
      current: {
        type: jspsych.ParameterType.INT,
        default: 1,
        description: "Strength of ocean current (1-3)"
      },
      reward_decision: {
        type: jspsych.ParameterType.INT,
        default: 4000,
        description: "Time allowed for initial ship selection (ms)"
      },
      reward_effort: {
        type: jspsych.ParameterType.INT,
        default: 3000,
        description: "Time allowed for effort input after selection (ms)"
      },
      reward_amount: {
        type: jspsych.ParameterType.STRING,
        default: "",
        description: "Amount of reward in currency shown in the quest scroll"
      },
      reward_number: {
        type: jspsych.ParameterType.FLOAT,
        default: 0,
        description: "Amount of reward in number shown in the quest scroll"
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
        default: "control_reward"
      },
      response: {
        type: jspsych.ParameterType.STRING
      },
      rt: {
        type: jspsych.ParameterType.INT
      },
      correct: {
        type: jspsych.ParameterType.BOOL
      },
      reward: {
        type: jspsych.ParameterType.FLOAT
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

  class RewardShipPlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;

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
      // Initialize trial variables
      let selectedKey = null;
      let lastPressTime = 0;
      let trial_presses = 0;
      let responseTime = [];
      let choice = null;
      let choice_rt = 0;

      // Generate trial HTML
      const generateHTML = () => {
        const far = this.baseRule[trial.near];
        return `
          <main class="main-stage">
            <img class="background" src="imgs/ocean.png" alt="Background"/>
            <section class="scene">
              <img class="island-far" style="visibility: hidden;" src="imgs/Control_stims/${window.session}/simple_island_${far}.png" alt="Farther island" />
              <div class="quest-scroll">
                <p style="position: absolute;z-index: 4;top: 1%;font-size: 2.5vh;color: maroon;margin-top: 0px;margin-bottom: 0px;font-weight: 600;">Target Island</p>
                <img class="quest-scroll-img" src="imgs/scroll.png" alt="Quest scroll">
                <img class="island-target glowing-border" src="imgs/Control_stims/${window.session}/simple_island_${trial.target}.png" alt="Target island">
                <div class="quest-reward" style="position: absolute;display: inline-flex;z-index: 4;top: 72%;flex-direction: row;align-items: center;background-color: #eedfbc;border-radius: 10px;">
                  <p style="font-size: 2.5vh;color: maroon;margin-top: 0px;margin-bottom: 0px;margin-left: 10px;font-weight: 500;"><strong>${trial.reward_amount}</strong></p>
                  <img src="imgs/${trial.reward_amount === "£2" ? `200p.png`: `50pence.png`}" style="height:5em;margin: 10px;">
                </div>
              </div>
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
                <img class="island-near" style="visibility: visible;" src="imgs/simple_island.png" alt="Nearer island" />
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
      };

      
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

          this.jsPsych.pluginAPI.cancelKeyboardResponse(firstKey_listener);
          if (info.key === 'ArrowLeft') {
            selectedKey = 'left';
            document.querySelector('.arrow-left').classList.add('highlight');
            document.querySelector('.choice-right').style.visibility = 'hidden';
          } else if (info.key === 'ArrowRight') {
            selectedKey = 'right';
            document.querySelector('.arrow-right').classList.add('highlight');
            document.querySelector('.choice-left').style.visibility = 'hidden';
          }
          this.jsPsych.pluginAPI.setTimeout(() => {
            if (selectedKey === 'left') {
              document.querySelector('.fuel-container-left .fuel-indicator-container').style.opacity = '1';
              setupRepeatedKeypress('ArrowLeft');
            } else if (selectedKey === 'right') {
              document.querySelector('.fuel-container-right .fuel-indicator-container').style.opacity = '1';
              setupRepeatedKeypress('ArrowRight');
            }
            document.querySelector('.island-near').style.visibility = 'visible';
            document.querySelector('.island-far').style.visibility = 'visible';
            document.querySelector('.ocean-current').style.visibility = 'visible';
          }, 100);

          choice = selectedKey;
          choice_rt = info.rt;

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
          }, trial.reward_effort + 100); // Adding 100ms to ensure smooth transition and animation completion
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
        this.jsPsych.pluginAPI.getKeyboardResponse({
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
        valid_responses: ['ArrowLeft', 'ArrowRight'],
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
      }, trial.reward_decision);

      const endTrial = () => {
        // Kill keyboard listeners
        this.jsPsych.pluginAPI.cancelAllKeyboardResponses();

        // Determine destination island based on control rule
        const currentRule = this.chooseControlRule(
          trial_presses, 
          trial.current
        );

        const destinationIsland = currentRule === 'base' 
          ? this.baseRule[trial.near]
          : this.controlRule[choice === "left" ? trial.left : trial.right];

        const correct = trial.target === destinationIsland;
        const reward = correct ? trial.reward_number : 0;

        // Save data
        const trial_data = {
          trialphase: "control_reward",
          response: choice,
          rt: choice_rt,
          correct: correct,
          reward: reward,
          responseTime: responseTime,
          trial_presses: trial_presses,
        };

        // Clear display
        display_element.innerHTML = '';

        // End trial
        this.jsPsych.finishTrial(trial_data);
      };
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
        <div class="ocean-current" style="visibility: hidden;">
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
      const keyToChoice = {"ArrowLeft": "left", "ArrowRight": "right"};
      const trial_presses = this.jsPsych.randomization.randomInt(2, 20);

      // Simulate choice data and outcomes
      const choice = keyToChoice[this.jsPsych.pluginAPI.getValidKey(trial.choices)];

      // Determine destination island based on control rule
      const currentRule = this.chooseControlRule(
        trial_presses, 
        trial.current
      );

      const destinationIsland = currentRule === 'base' 
        ? this.baseRule[trial.near]
        : this.controlRule[choice === "left" ? trial.left : trial.right];

      const correct = trial.target === destinationIsland;
      const reward = correct ? trial.reward_number : 0;


      const default_data = {
        trialphase: "control_reward",
        response: choice,
        rt: Math.floor(this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true)),
        correct: correct,
        reward: reward,
        responseTime: Array.from({ length: trial_presses }, () => Math.floor(this.jsPsych.randomization.sampleExGaussian(100, 10, 0.5, true))),
        trial_presses: trial_presses,
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
      const choiceToKey = {"left": "ArrowLeft", "right": "ArrowRight"};
      const data = this.create_simulation_data(trial, simulation_options);
      const display_element = this.jsPsych.getDisplayElement();
      
      // Faster visual simulation
      if (simulation_options.speed_up) {
        trial.reward_decision = trial.reward_decision / simulation_options.speed_up_factor;
        trial.reward_effort = trial.reward_effort / simulation_options.speed_up_factor; 
        trial.post_trial_gap = trial.post_trial_gap / simulation_options.speed_up_factor;
      }
      
      this.trial(display_element, trial);
      load_callback();

      if (data.rt!== null) {
        let t = data.rt;
        this.jsPsych.pluginAPI.pressKey(choiceToKey[data.response], t);
        data.responseTime.forEach((rt, i) => {
          t += rt;
          this.jsPsych.pluginAPI.pressKey(choiceToKey[data.response], t);
        });
      }
    }
  }

  RewardShipPlugin.info = info;

  return RewardShipPlugin;
})(jsPsychModule);

var jsPsychRewardShipFeedback = (function (jspsych) {
  "use strict";

  const info = {
    name: "reward-ship-feedback",
    version: "1.0.0",
    parameters: {
      target_island: {
        type: jspsych.ParameterType.STRING,
        default: undefined,
        description: "Target island for delivery"
      },
      reward_amount: {
        type: jspsych.ParameterType.STRING,
        description: "Amount of reward in currency shown in the quest scroll"
      },
      reward_number: {
        type: jspsych.ParameterType.FLOAT,
        description: "Amount of reward in number shown in the quest scroll"
      },
      feedback_duration: {
        type: jspsych.ParameterType.INT,
        default: 2000,
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
        default: "control_reward_feedback"
      },
      destination_island: {
        type: jspsych.ParameterType.STRING
      },
      control_rule_used: {
        type: jspsych.ParameterType.STRING
      },
      correct: {
        type: jspsych.ParameterType.BOOL
      },
      reward: {
        type: jspsych.ParameterType.FLOAT
      }
    }
  };

  class RewardShipFeedbackPlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;

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

      const correct = trial.target_island === destinationIsland;
      const reward = correct ? trial.reward_number : 0;
      
      const msg = correct 
        ? `<p>🎉Congratulations!</p><p>You have won <strong>${trial.reward_amount}</strong>!</p>`
        : `<p>❌Sorry!</p><p>The ship didn't reach the target island.<br>Maybe next time.</p>`;

      // Generate feedback display
      const html = `
        <main class="main-stage">
          <img class="background" src="imgs/ocean_above.png" alt="Background"/>
          <div class="instruction-dialog" style="top:20%; height: auto; max-height:50%; min-width: 400px; width: 50%;">
            <div class="instruction-content" style="font-size: 42px; text-align: center;">
              ${msg}
            </div>
            ${
              correct
              ? `<img style="width: 150px" src="imgs/${trial.reward_amount === "£2" ? `200p.png`: `50pence.png`}">`
              : ''
            }
          </div>
        </main>
      `;

      display_element.innerHTML = html;

      // Save data and end trial after duration
      const trial_data = {
        trialphase: "control_reward_feedback",
        destination_island: destinationIsland,
        control_rule_used: currentRule,
        correct: correct,
        reward: reward
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

      const correct = trial.target_island === destinationIsland;
      const reward = correct ? this.jsPsych.evaluateTimelineVariable('reward_number') : 0;

      const default_data = {
        trialphase: "control_reward_feedback",
        destination_island: destinationIsland,
        control_rule_used: currentRule,
        correct: correct,
        reward: reward
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

      const msg = data.correct 
        ? "<p>🎉Congratulations!</p><p>You've successfully transported the cargo to the target island.</p>"
        : "<p>Sorry!</p><p>The cargo has been transported to the wrong island.<br>But don't worry, maybe next time.</p>";

      // Generate feedback display
      const html = `
        <main class="main-stage">
          <img class="background" src="imgs/ocean_above.png" alt="Background"/>
          <div class="instruction-dialog" style="bottom:50%; min-width: 600px; width: 50%;">
            <div class="instruction-content" style="font-size: 32px; text-align: center;">
              ${msg}
            </div>
          </div>
        </main>
      `;

      display_element.innerHTML = html;

      // Faster visual simulation
      if (simulation_options.speed_up) {
        trial.feedback_duration = trial.feedback_duration / simulation_options.speed_up_factor;
        trial.post_trial_gap = trial.post_trial_gap / simulation_options.speed_up_factor;
      }

      this.trial(display_element, trial);
      load_callback();
    }
  }

  RewardShipFeedbackPlugin.info = info;

  return RewardShipFeedbackPlugin;
})(jsPsychModule);