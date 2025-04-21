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
      const startTime = performance.now();

      // Generate trial HTML
      const generateHTML = () => {
        const far = this.baseRule[trial.near];
        return `
          <main class="main-stage">
            <img class="background" src="imgs/ocean.png" alt="Background"/>
            <section class="scene">
              <img class="island-far" style="visibility: hidden;" src="imgs/simple_island_${far}.png" alt="Farther island" />
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
                <img class="island-near" style="visibility: visible;" src="imgs/simple_island_${trial.near}.png" alt="Nearer island" />
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
                    <p>In this mission, select the correct ship and fuel it appropriately to deliver cargo to the target island for your reward!</p>
                    <p>We will now give you a short guide on reward missions.</p>
                    <p>Press <span class="spacebar-icon">&nbsp;←&nbsp;</span> or <span class="spacebar-icon">&nbsp;→&nbsp;</span> to continue</p>
                </div>
            </div>
          </main>
        `;
      };

      
      display_element.innerHTML = generateHTML();

      const end_trial = () => {
        if (typeof lastKeyListener !== "undefined") {
          this.jsPsych.pluginAPI.cancelKeyboardResponse(lastKeyListener);
        }
        var trial_data = {
          rt: performance.now() - startTime,
          trialphase: "control_reward_prompt"
        };
        this.jsPsych.finishTrial(trial_data);
      };

      // var lastKeyListener = this.jsPsych.pluginAPI.getKeyboardResponse({
      //   callback_function: end_trial,
      //   valid_responses: trial.choices,
      //   rt_method: "performance",
      //   persist: false,
      //   allow_held_key: false
      // });

      // Change the instruction dialog text
      const instructionContent = display_element.querySelector('.instruction-content');

      if (trial.choices !== "NO_KEYS") {
        const pages = [
          {
            html: `
              <p><span class="highlight-txt">Notice the quest scroll on the top right!</span> It shows the target and reward for this round.</p>
              <p>Think about what you have seen and learned about the homebase of the ships.</p>
              <p>Then, choose the ship that can reach the <strong>target island</strong> shown in the scroll.</p>
              <p>Press <span class="spacebar-icon">&nbsp;←&nbsp;</span> or <span class="spacebar-icon">&nbsp;→&nbsp;</span> to continue</p>
            `,
            showExtra: false
          },
          {
            html: `
              <p><span class="highlight-txt">After choosing the ship, now you see the current strength and the drift island.</span></p>
              <p>Think about the fuel level required for each current strength and plan your effort accordingly.</p>
              <p>Then, press the same arrow key repeatedly to provide appropriate amount of fuel in <strong>3 seconds</strong>.</p>
              <p>Press <span class="spacebar-icon">&nbsp;←&nbsp;</span> or <span class="spacebar-icon">&nbsp;→&nbsp;</span> to continue</p>
            `,
            showExtra: true
          },
          {
            html: `
              <p>To recap, during <strong>Reward Missions</strong>, you will:</p>
              <ol style="list-style-position: inside; padding-left:0; margin-left: 0;">
                  <li>Select ships based on the target island</li>
                  <li>Add fuel wisely and properly based on the current strength and the drift island</li>
                  <li><strong>Successfully transport the cargo to the target and win the quest reward!</strong></li>
              </ol>
              <p>Now, press <span class="spacebar-icon">&nbsp;←&nbsp;</span> or <span class="spacebar-icon">&nbsp;→&nbsp;</span> to <span class="highlight-txt">end this instruction and officially enter your first Reward Mission.</span></p>
            `,
            showExtra: true
          }
        ];
      
        const showElements = (yes) => {
          ['island-near','island-far','ocean-current']
            .forEach(sel => document.querySelector(`.${sel}`).style.visibility = yes ? 'visible' : 'hidden');
        };
      
        let idx = 0;
        const nextPage = () => {
          if (idx === pages.length) {
            end_trial();
            return;
          }
          // render this page
          instructionContent.innerHTML = pages[idx].html;
          showElements(pages[idx].showExtra);
          idx++;
      
          // wait for a key to show the next page
          this.jsPsych.pluginAPI.getKeyboardResponse({
            callback_function: nextPage,
            valid_responses: trial.choices,
            rt_method: "performance",
            persist: false,
            allow_held_key: false
          });
        };
      
        // kick off the sequence
        nextPage();
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
