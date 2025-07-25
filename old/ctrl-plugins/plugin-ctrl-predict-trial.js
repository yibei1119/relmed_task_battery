var jsPsychPredictHomeBase = (function (jspsych) {
  "use strict";

  const info = {
    name: "predict-home-base",
    version: "1.0.0",
    parameters: {
      ship: {
        type: jspsych.ParameterType.STRING,
        default: undefined,
        description: "Color/type of the ship to predict"
      },
      predict_decision: {
        type: jspsych.ParameterType.INT,
        default: 4000,
        description: "Time allowed for prediction (ms)"
      },
      predict_choice: {
        type: jspsych.ParameterType.INT,
        default: 500,
        description: "Delay after choice before ending trial (ms)"
      },
      choices : {
        type: jspsych.ParameterType.KEYS,
        default: ["d", "f", "j", "k"],
        description: "Keys for island selection"
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
        default: "control_predict_homebase"
      },
      response: {
        type: jspsych.ParameterType.STRING
      },
      rt: {
        type: jspsych.ParameterType.INT
      },
      ship: {
        type: jspsych.ParameterType.STRING
      }
    }
  };

  class PredictHomeBasePlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;

      // Key mappings for island selection
      this.islandKeyList = {
        'i2': "d",
        'i3': "f",
        'i4': "j",
        'i1': "k"
      };

      // Map keys to numeric indices
      this.keyList = {
        'd': 0,
        'f': 1,
        'j': 2,
        'k': 3
      };

      // Home base answers
      this.controlRule = CONTROL_CONFIG.controlRule;
    }

    trial(display_element, trial) {
      // Initialize response tracking
      let choice = null;
      let choice_rt = null;

      // Generate trial HTML
      const html = `
        <div class="instruction-stage" style="transform: unset;">
          <img class="background" src="imgs/ocean.png" alt="Background"/>
          <section class="scene">
            <div class="overlap-group">
              <div class="choice-left">
                <img class="island-near" src="imgs/Control_stims/${window.session}/simple_island_i1.png" style="visibility:hidden;" alt="Nearer island" />
                <img class="ship-left" src="imgs/simple_ship_${trial.ship}.png" style="top:-10%" alt="Prediction ship" />
              </div>
            </div>
          </section>
        </div>
        <p style="position: relative; top: -5vh;">Which island is the home base of this ship?<br>Press the key to choose.</p>
        <div class="island-choices">
          ${Object.entries(this.islandKeyList).map(([island, key]) => `
            <div class="destination-button" data-choice="${this.keyList[key]}">
              <img src="imgs/Control_stims/${window.session}/island_icon_${island}.png" style="width:100px;">
              <img src="imgs/Control_stims/${window.session}/letter-${key}.png" style="width:50px;">
            </div>
          `).join('')}
        </div>
      `;

      display_element.innerHTML = html;

      // Handle keyboard responses
      const handleKeypress = (info) => {
        const pressedKey = info.key.toLowerCase();
        if (this.keyList.hasOwnProperty(pressedKey)) {
          choice = this.keyList[pressedKey];
          choice_rt = info.rt;

          // Highlight selected button
          const button = display_element.querySelector(`.destination-button[data-choice="${choice}"]`);
          if (button) {
            button.style.borderColor = "#f4ce5c";
            
            // End trial after delay
            this.jsPsych.pluginAPI.setTimeout(() => {
              endTrial();
            }, trial.predict_choice);
          }
        }
      };

      // Set up keyboard listener
      const keyboardListener = this.jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: handleKeypress,
        valid_responses: trial.choices,
        rt_method: 'performance',
        persist: false,
        allow_held_key: false
      });

      // End trial if no response after timeout
      if (trial.predict_decision !== null) {
        this.jsPsych.pluginAPI.setTimeout(() => {
          if (!choice) endTrial();
        }, trial.predict_decision);
      }

      const endTrial = () => {
        // Kill keyboard listeners
        this.jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);

        // Save data
        const trial_data = {
          trialphase: "control_predict_homebase",
          response: choice,
          rt: choice_rt,
          correct: this.controlRule[trial.ship] === Object.keys(this.islandKeyList)[choice],
          ship: trial.ship
        };

        // Clear display
        display_element.innerHTML = '';

        // End trial
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
      let choice = this.keyList[this.jsPsych.pluginAPI.getValidKey(trial.choices)];
      const default_data = {
        trialphase: "control_predict_homebase",
        response: choice,
        rt: Math.floor(this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true)),
        correct: this.controlRule[trial.ship] === Object.keys(this.islandKeyList)[choice],
        ship: trial.ship
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
        trial.predict_decision = trial.predict_decision / simulation_options.speed_up_factor;
        trial.predict_choice = trial.predict_choice / simulation_options.speed_up_factor;
        trial.post_trial_gap = trial.post_trial_gap / simulation_options.speed_up_factor;
      }

      this.trial(display_element, trial);
      load_callback();

      if (data.rt!== null) {
        this.jsPsych.pluginAPI.pressKey(Object.keys(this.keyList)[data.response], data.rt);
      }
    }
  }

  PredictHomeBasePlugin.info = info;

  return PredictHomeBasePlugin;
})(jsPsychModule);

var jsPsychPredictDest = (function (jspsych) {
  "use strict";

  const info = {
    name: "predict-dest",
    version: "1.0.0",
    parameters: {
      ship: {
        type: jspsych.ParameterType.STRING,
        default: undefined,
        description: "Color/type of the ship"
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
      fuel_lvl: {
        type: jspsych.ParameterType.INT,
        default: 0,
        description: "Fuel level percentage (0-100)"
      },
      predict_decision: {
        type: jspsych.ParameterType.INT,
        default: 4000,
        description: "Time allowed for prediction (ms)"
      },
      predict_choice: {
        type: jspsych.ParameterType.INT,
        default: 500,
        description: "Delay after choice before ending trial (ms)"
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
        default: "control_predict_dest"
      },
      response: {
        type: jspsych.ParameterType.INT
      },
      rt: {
        type: jspsych.ParameterType.INT
      }
    }
  };

  class PredictDestPlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;

      this.islandKeyList = {
        'i2': "d",
        'i3': "f",
        'i4': "j",
        'i1': "k"
      };

      this.keyList = {
        'd': 0,
        'f': 1,
        'j': 2,
        'k': 3
      };

      this.level_text = { 
        "1": "Low", 
        "2": "Mid", 
        "3": "High" 
      };
    }

    trial(display_element, trial) {
      let choice = null;
      let choice_rt = null;

      // Generate trial HTML
      const html = `
        <div class="instruction-stage" style="transform: unset;">
          <img class="background" src="imgs/ocean.png" alt="Background"/>
          <section class="scene">
            <div class="overlap-group">
              <div class="choice-left">
                <img class="island-near" src="imgs/Control_stims/${window.session}/simple_island_${trial.near}.png" alt="Nearer island" />
                <img class="ship-left" src="imgs/simple_ship_${trial.ship}.png" style="top:-10%" alt="Prediction ship" />
              </div>
              <!-- Fuel Level Indicator -->
              <div style="position:absolute; top:70px; right:60px; width: 150px; height: 60px; background:white; padding:10px; border-radius:5px; z-index: 3">
                <div>Fuel Level</div>
                <div style="width:150px; height:20px; background: #ddd; border: 2px solid rgba(255, 255, 255, 0.8); border-radius:10px;">
                  <div style="width:${trial.fuel_lvl}%; height:100%; background:#ffd700; border-radius:10px;"></div>
                </div>
              </div>
              <!-- Current Strength Indicator -->
              <div style="position:absolute; top:170px; right:60px; width: 150px; height: 60px; background:white; padding:10px; border-radius:5px; z-index: 3;">
                <div>Current Strength</div>
                <div style="color:#1976D2; font-weight:bold;">${this.level_text[trial.current]}</div>
              </div>
            </div>
            ${this.createOceanCurrents(trial.current)}
          </section>
        </div>
        <p style="position: relative; top: -5vh;">Based on the current strength and fuel level, where will this ship most likely dock?<br>Press the key to choose.</p>
        <div class="island-choices">
          ${Object.entries(this.islandKeyList).map(([island, key]) => `
            <div class="destination-button" data-choice="${this.keyList[key]}">
              <img src="imgs/Control_stims/${window.session}/island_icon_${island}.png" style="width:100px;">
              <img src="imgs/letter-${key}.png" style="width:50px;">
            </div>
          `).join('')}
        </div>
      `;

      display_element.innerHTML = html;

      // Handle keyboard responses
      const handleKeypress = (info) => {
        const pressedKey = info.key.toLowerCase();
        if (this.keyList.hasOwnProperty(pressedKey)) {
          choice = this.keyList[pressedKey];
          choice_rt = info.rt;

          // Highlight selected button
          const button = display_element.querySelector(`.destination-button[data-choice="${choice}"]`);
          if (button) {
            button.style.borderColor = "#f4ce5c";
            
            // End trial after delay
            this.jsPsych.pluginAPI.setTimeout(() => {
              endTrial();
            }, trial.predict_choice);
          }
        }
      };

      // Set up keyboard listener
      const keyboardListener = this.jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: handleKeypress,
        valid_responses: Object.keys(this.keyList),
        rt_method: 'performance',
        persist: false,
        allow_held_key: false
      });

      // End trial if no response after timeout
      if (trial.predict_decision !== null) {
        this.jsPsych.pluginAPI.setTimeout(() => {
          if (!choice) endTrial();
        }, trial.predict_decision);
      }

      const endTrial = () => {
        // Kill keyboard listeners
        this.jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);

        // Save data
        const trial_data = {
          trialphase: "control_predict_dest",
          response: choice,
          rt: choice_rt
        };

        // Clear display
        display_element.innerHTML = '';

        // End trial
        this.jsPsych.finishTrial(trial_data);
      };
    }

    createOceanCurrents(level) {
      // Same createOceanCurrents function as in explore plugin
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
            ${createCurrentLines(true, true)}
            ${createCurrentLines(false, true)}
          </div>
          <div class="current-group right-currents">
            ${createCurrentLines(true, false)}
            ${createCurrentLines(false, false)}
          </div>
        </div>
      `;
    }
  }

  PredictDestPlugin.info = info;

  return PredictDestPlugin;
})(jsPsychModule);
