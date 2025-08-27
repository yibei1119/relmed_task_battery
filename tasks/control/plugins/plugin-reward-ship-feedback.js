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