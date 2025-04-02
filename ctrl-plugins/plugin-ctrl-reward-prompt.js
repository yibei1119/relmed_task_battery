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
      prompt_duration: {
        type: jspsych.ParameterType.INT,
        default: 8000,
        description: "Duration to show the prompt (ms)"
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
        default: "control_reward_prompt"
      }
    }
  };

  class RewardPromptPlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }

    trial(display_element, trial) {
      // Generate prompt display
      const html = `
        <main class="main-stage">
          <img class="background" src="imgs/ocean_above.png" alt="Background"/>
          <div class="icon-row" style="position: absolute; display: flex; align-items: center; top: 0%;">
            <img src="imgs/icon-reward.png" alt="Reward Missions" style="width: 40px; height: 40px; margin-right: 15px;"><p style="text-align: left; color: #0F52BA;">Reward Mission</p>
          </div>
          <div class="instruction-dialog" style="bottom:50%; min-width: 600px; width: 60%;">
            <div class="instruction-content" style="font-size: 20px; text-align: center;">
              <h2 style="color: #0F52BA;">First Reward Mission!</h2>
              <p>In this mission, you'll need to:</p>
              <ul style="text-align: left; padding-left: 20px;">
                <li>Focus on the <strong>target island</strong> shown in the quest scroll at the top-right</li>
                <li>Choose the appropriate ship</li>
                <li>Press keys rapidly to fuel the ship</li>
                <li>Reach the target island to win the reward</li>
              </ul>
              <p>Remember, ocean currents affect ship destinations!</p>
            </div>
          </div>
          <div class="quest-scroll" style="position: absolute; top: 10px; right: 10px; width: 120px; height: 120px; z-index: 10;">
            <p style="position: absolute; z-index: 4; top: 9%; font-size: 2vh; color: maroon">Target Island</p>
            <img class="quest-scroll-img" src="imgs/scroll.png" alt="Quest scroll" style="width: 100%; height: 100%;" />
            <img class="island-target" src="imgs/island_icon_${trial.target}.png" alt="Target island" style="position: absolute; width: 50px; height: 50px; top: 30%; left: 50%; transform: translate(-50%, -50%);" />
          </div>
        </main>
      `;

      display_element.innerHTML = html;

      // End trial after duration
      this.jsPsych.pluginAPI.setTimeout(() => {
        display_element.innerHTML = '';
        this.jsPsych.finishTrial();
      }, trial.prompt_duration);
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
        trialphase: "control_reward_prompt"
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
        trial.prompt_duration = trial.prompt_duration / simulation_options.speed_up_factor;
        trial.post_trial_gap = trial.post_trial_gap / simulation_options.speed_up_factor;
      }

      this.trial(display_element, trial);
      load_callback();
    }
  }

  RewardPromptPlugin.info = info;

  return RewardPromptPlugin;
})(jsPsychModule);