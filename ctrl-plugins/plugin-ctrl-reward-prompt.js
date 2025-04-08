var jsPsychRewardPrompt = (function (jspsych) {
  "use strict";

  const info = {
    name: "reward-prompt",
    version: "1.0.0",
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
      reward_amount: {
        type: jspsych.ParameterType.STRING,
        default: "",
        description: "Amount of reward shown in the quest scroll"
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
      response: {
        type: jspsych.ParameterType.STRING
      },
      rt: {
        type: jspsych.ParameterType.INT
      },
      trialphase: {
        type: jspsych.ParameterType.STRING,
        default: "control_reward_prompt"
      }
    }
  };

  class RewardPromptShipPlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;

      // Define base rule mapping
      this.baseRule = CONTROL_CONFIG.baseRule;
    }

    trial(display_element, trial) {
      // Initialize trial variables
      var response = {
        rt: null,
        key: null
      };

      // Generate trial HTML
      const generateHTML = () => {
        const far = this.baseRule[trial.near];
        return `
          <main class="main-stage">
            <img class="background" src="imgs/ocean.png" alt="Background"/>
            <section class="scene">
              <img class="island-far" src="imgs/simple_island_${far}.png" alt="Farther island" />
              <div class="icon-row" style="position: absolute; display: flex; align-items: center; top: 0%;">
                  <img src="imgs/icon-reward.png" alt="Reward Missions" style="width: 40px; height: 40px; margin-right: 15px;"><p style="text-align: left; color: #0F52BA;">Reward Mission</p>
              </div>
              <div class="quest-scroll">
                <p style="position: absolute;z-index: 4;top: 1%;font-size: 2.5vh;color: maroon;margin-top: 0px;margin-bottom: 0px;font-weight: 600;">Target Island</p>
                <img class="quest-scroll-img" src="imgs/scroll.png" alt="Quest scroll">
                <img class="island-target glowing-border" src="imgs/simple_island_${trial.target}.png" alt="Target island">
                <p style="position: absolute;z-index: 4;top: 73%;font-size: 2.5vh;color: maroon;margin-top: 0px;margin-bottom: 0px;font-weight: 500;">Quest reward: <strong>${trial.reward_amount}</strong></p>
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
            <div class="instruction-dialog" style="bottom:20%; min-width: 600px;">
                <div class="instruction-content" style="font-size: 1.25em; text-align: center;">
                    <h3>You're about to take your first <strong>Reward Mission</strong></h3>
                    <p>Focus on the target island on the quest scroll in these missions</p>
                    <p>Choose the right ship and add the appropriate amount of fuel</br> to deliver cargo to the target island and win the reward!</p>
                    <p>At the end of the game, we will pay you the rewards you have earned from all the Reward Missions</p>
                    <p>Press <span class="spacebar-icon">&nbsp;←&nbsp;</span> or <span class="spacebar-icon">&nbsp;→&nbsp;</span> to continue</p>
                </div>
            </div>
          </main>
        `;
      };

      
      display_element.innerHTML = generateHTML();

      const end_trial = () => {
        if (typeof keyboardListener !== "undefined") {
          this.jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
        }
        var trial_data = {
          rt: response.rt,
          response: response.key,
          trialphase: "control_reward_prompt"
        };
        this.jsPsych.finishTrial(trial_data);
      };

      var after_response = (info2) => {
        if (response.key == null) {
          response = info2;
        }
        end_trial();
      };

      // Initial keyboard listener
      if (trial.choices != "NO_KEYS") {
        var keyboardListener = this.jsPsych.pluginAPI.getKeyboardResponse({
          callback_function: after_response,
          valid_responses: trial.choices,
          rt_method: "performance",
          persist: false,
          allow_held_key: false
        });
      }
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
      const default_data = {
        trialphase: "control_reward_prompt",
        response: this.jsPsych.pluginAPI.getValidKey(trial.choices),
        rt: Math.floor(this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true))
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
        trial.reward_decision = trial.reward_decision / simulation_options.speed_up_factor;
        trial.reward_effort = trial.reward_effort / simulation_options.speed_up_factor; 
        trial.post_trial_gap = trial.post_trial_gap / simulation_options.speed_up_factor;
      }
      
      this.trial(display_element, trial);
      load_callback();

      if (data.rt !== null) {
        this.jsPsych.pluginAPI.pressKey(data.response, data.rt);
      }
    }
  }

  RewardPromptShipPlugin.info = info;

  return RewardPromptShipPlugin;
})(jsPsychModule);
