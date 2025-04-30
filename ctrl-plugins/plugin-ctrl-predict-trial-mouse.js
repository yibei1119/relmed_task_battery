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
        default: 6000,
        description: "Time allowed for prediction (ms)"
      },
      predict_choice: {
        type: jspsych.ParameterType.INT,
        default: 300,
        description: "Delay after choice before ending trial (ms)"
      },
      choices : {
        type: jspsych.ParameterType.STRING,
        default: ["coconut", "grape", "orange", "banana"],
        array: true,
        description: "Island choices",
      },
      button_html: {
        type: jspsych.ParameterType.FUNCTION,
        default: function(choice, choice_index) {
          return `<button class="destination-button"><img src="imgs/island_icon_${choice}.png" style="width:100px;"></button>`;
        }
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
      correct: {
        type: jspsych.ParameterType.BOOL
      }
    }
  };

  class PredictHomeBasePlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;

      // Home base answers
      this.controlRule = CONTROL_CONFIG.controlRule;
    }

    trial(display_element, trial) {
      // Initialize response tracking
      var response = {
        rt: null,
        button: null
      };

      // Generate trial HTML
      const html = `
        <div class="instruction-stage" style="transform: unset;">
          <img class="background" style="top: -5vh;" src="imgs/ocean.png" alt="Background"/>
          <section class="scene">
            <div class="overlap-group">
              <div class="choice-left">
                <img class="island-near" src="imgs/simple_island_banana.png" style="visibility:hidden;" alt="Nearer island" />
                <img class="ship-left" src="imgs/simple_ship_${trial.ship}.png" style="top:-10%" alt="Prediction ship" />
              </div>
            </div>
          </section>
        </div>
        <p style="position: relative; top: -5vh;"><strong><span class="highlight-txt">Please use the mouse and click on the home fruit island for the ship above.</span></strong></p>
        <div class="island-choices">
        </div>
        <div class="icon-row" style="position: absolute; display: flex; align-items: center; top: 0%; transform: translateX(-50%); left: 50%;">
            <img src="imgs/icon-predict.png" alt="Knowledge Assessments" style="width: 40px; height: 40px; margin-right: 15px;"><p style="text-align: left; color: #0F52BA;">Knowledge Assessment</p>
        </div>
      `;

      display_element.innerHTML = html;

      const buttonGroupElement = document.querySelector(".island-choices");
      for (const [choiceIndex, choice] of trial.choices.entries()) {
        buttonGroupElement.insertAdjacentHTML("beforeend", trial.button_html(choice, choiceIndex));
        const buttonElement = buttonGroupElement.lastChild;
        buttonElement.dataset.choice = choiceIndex.toString();
        buttonElement.addEventListener("click", () => {
          after_response(choiceIndex);
          // End trial after delay
          this.jsPsych.pluginAPI.setTimeout(end_trial, trial.predict_choice);
        });
      }

      var start_time = performance.now();

      function after_response(choice) {
        var end_time = performance.now();
        var rt = Math.round(end_time - start_time);
        response.button = parseInt(choice);
        response.rt = rt;
        const stimulusElement = display_element.querySelector(".instruction-stage");
        stimulusElement.classList.add("responded");
        for (const button of buttonGroupElement.children) {
          button.setAttribute("disabled", "disabled");
        }
        const button = display_element.querySelector(`.destination-button[data-choice="${choice}"]`);
        if (button) {
          button.style.borderColor = "#f4ce5c";
        }
      }

      // End trial if no response after timeout
      if (trial.predict_decision !== null) {
        this.jsPsych.pluginAPI.setTimeout(() => {
          if (!response.choice) end_trial();
        }, trial.predict_decision);
      }

      const end_trial = () => {
        // Save data
        const trial_data = {
          trialphase: "control_predict_homebase",
          rt: response.rt,
          response: response.button,
          button: trial.choices[response.button],
          correct: this.controlRule[trial.ship] === trial.choices[response.button]
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
      let button = this.jsPsych.randomization.randomInt(0, trial.choices.length - 1);
      const default_data = {
        trialphase: "control_predict_homebase",
        response: button,
        rt: Math.floor(this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true)),
        correct: this.controlRule[trial.ship] === trial.choices[button]
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

      if (data.rt !== null) {
        this.jsPsych.pluginAPI.clickTarget(
          display_element.querySelector(
            `.island-choices [data-choice="${data.response}"]`
          ),
          data.rt
        );
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
        'coconut': "d",
        'orange': "f",
        'grape': "j",
        'banana': "k"
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
                <img class="island-near" src="imgs/simple_island_${trial.near}.png" alt="Nearer island" />
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
              <img src="imgs/island_icon_${island}.png" style="width:100px;">
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
