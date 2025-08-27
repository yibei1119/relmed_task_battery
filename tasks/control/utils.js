import { 
  controlConfig, 
  EXPLORE_SEQUENCE, 
  PREDICT_SEQUENCE, 
  REWARD_SEQUENCE, 
  EXPLORE_SEQUENCE_SCREENING, 
  PREDICT_SEQUENCE_SCREENING 
} from "./configuration.js"

import { createPreloadTrial, kick_out, fullscreen_prompt, noChoiceWarning, updateState, saveDataREDCap, canBeWarned, updateBonusState } from "/core/utils/index.js"

export const controlPreload = (settings) => {
  const image_assets = [
    ...([
      "200p.png",
      "ocean.png",
      "ocean_above.png",
      "simple_island.png",
      "simple_ship_blue.png",
      "simple_ship_green.png",
      "simple_ship_red.png",
      "simple_ship_yellow.png",
      "left.png",
      "fuel.png",
      "scroll.png",
      "icon-reward.png",
      "icon-predict.png",
      "icon-explore.png"
    ].map(s => "/assets/images/control/" + s)),
    ...([
      "simple_island_i1.png", //wk0: banana
      "simple_island_i2.png", //wk0: coconut
      "simple_island_i3.png", //wk0: grape
      "simple_island_i4.png", //wk0: orange
      "island_icon_i1.png",
      "island_icon_i2.png",
      "island_icon_i3.png",
      "island_icon_i4.png"
    ].map(s => "/assets/images/control/session-specific/" + settings.session + "/" + s)),
  ];

  return createPreloadTrial(
    image_assets,
    "control"
  );
} 

const controlRating = {
  timeline: [{
    type: jsPsychHtmlButtonResponse,
    stimulus: `<p><span class="highlight-txt">How <strong>in control</strong> do you feel at this moment?</span></p>`,
    choices: ["1<br>Not at all", "2", "3<br>I don't know", "4", "5<br>Completely in control"],
    trial_duration: 10000,
    post_trial_gap: 400,
    data: {
      trialphase: "control_controllability"
    },
    on_finish: function (data) {
      updateState(`control_trial_${jsPsych.evaluateTimelineVariable('trial')}`, false);

      if (data.response === null) {
        var up_to_now = parseInt(jsPsych.data.get().last(1).select('n_warnings').values);
        console.log("n_warnings: " + up_to_now);
        jsPsych.data.addProperties({
            n_warnings: up_to_now + 1
        });
      }
    }
  },
  noChoiceWarning("response", "", "control_explore")
]
};


export function createCoreControlTimeline(settings) {

  const confidenceRating = {
    timeline: [{
      type: jsPsychHtmlButtonResponse,
      stimulus: `<p><span class="highlight-txt">How <strong>confident</strong> are you that your last choice was correct?</span></p>`,
      choices: ["1<br>Not at all", "2", "3", "4", "5<br>Very confident"],
      trial_duration: 10000,
      post_trial_gap: 400,
      data: {
          trialphase: "control_confidence"
      },
      on_finish: function (data) {
        if (data.response === null) {
          var up_to_now = parseInt(jsPsych.data.get().last(1).select('n_warnings').values);
          console.log("n_warnings: " + up_to_now);
          jsPsych.data.addProperties({
              n_warnings: up_to_now + 1
          });
        }
      }
    }],
    conditional_function: function () {
      const last_trial_choice = jsPsych.data.get().last(1).select('response').values[0];
      return last_trial_choice !== null && settings.session !== "screening";
    }
  };

  const controlExploreTimeline = [];
  (settings.session === "screening" 
    ? EXPLORE_SEQUENCE_SCREENING 
    : EXPLORE_SEQUENCE).forEach(t => {
    controlExploreTimeline.push({
      timeline: [
        kick_out,
        fullscreen_prompt,
        {
          type: jsPsychExploreShip,
          left: jsPsych.timelineVariable('left'),
          right: jsPsych.timelineVariable('right'),
          near: jsPsych.timelineVariable('near'),
          current: jsPsych.timelineVariable('current'),
          explore_decision: () => {
            if (canBeWarned("control_explore")) {
                return settings.default_response_deadline
            } else {
                return settings.long_response_deadline
            }
          },
          explore_effort: 3000,
          island_path: `/assets/images/control/session-specific/${settings.session}`,
          base_rule: controlConfig(settings).baseRule,
          post_trial_gap: 0,
          save_timeline_variables: true,
          on_start: function (trial) {
            const last_trialphase = jsPsych.data.getLastTrialData().values()[0].trialphase;
            if (last_trialphase === "control_confidence" || last_trialphase === "control_controllability") {
              trial.explore_decision += 2000;
            }
          },
          on_finish: function (data) {
            const n_trials = jsPsych.data.get().filter([{trialphase: "control_explore"}, {trialphase: "control_predict_homebase"}, {trialphase: "control_reward"}]).count();
            data.n_control_trials = n_trials;
            console.log("Trial number: " + n_trials + " (explore)");

            updateState(`control_trial_${jsPsych.evaluateTimelineVariable('trial')}`, false);

            if (n_trials % 24 === 0) {
              saveDataREDCap(retry = 3);
            }

            if (data.response === null) {
              var up_to_now = parseInt(jsPsych.data.get().last(1).select('n_warnings').values);
              console.log("n_warnings: " + up_to_now);
              jsPsych.data.addProperties({
                  n_warnings: up_to_now + 1
              });
            }
          }
        },
        {
          timeline: [{
            type: jsPsychExploreShipFeedback,
            feedback_duration: 3000,
            base_rule: controlConfig(settings).baseRule,
            control_rule: controlConfig(settings).controlRule,
            effort_threshold: controlConfig(settings).effort_threshold,
            island_path: `/assets/images/control/session-specific/${settings.session}`,
            scale: controlConfig(settings).scale,
            post_trial_gap: 0
          }],
          conditional_function: function () {
            const lastTrialChoice = jsPsych.data.getLastTrialData().values()[0].response;
            return lastTrialChoice !== null;
          }
        },
        noChoiceWarning("response", 
          `<main class="main-stage">
            <img class="background" src="/assets/images/control/ocean.png" alt="Background"/>
          </main>`,
          "control_explore"
        )
      ],
      timeline_variables: [t]
    });
  });

  controlExploreTimeline[0]["on_timeline_start"] = () => {
    updateState(`control_task_start`);
    jsPsych.data.addProperties({
        control_explore_n_warnings: 0
    });
  }

  const controlPredTimeline = [];
  (settings.session === "screening" 
    ? PREDICT_SEQUENCE_SCREENING 
    : PREDICT_SEQUENCE).forEach(t => {
    controlPredTimeline.push({
      timeline: [
        kick_out,
        fullscreen_prompt,
        {
          type: jsPsychPredictHomeBase,
          ship: jsPsych.timelineVariable('ship'),
          predict_decision: () => {
            if (canBeWarned("control_predict_homebase")) {
                return settings.default_response_deadline
            } else {
                return settings.long_response_deadline
            }
          },
          choices: settings.session === "screening" ? ["i1", "i2", "i3"] : ["i2", "i3", "i4", "i1"],
          post_trial_gap: 0,
          save_timeline_variables: true,
          control_rule: controlConfig(settings).controlRule,
          island_path: `/assets/images/control/session-specific/${settings.session}`,
          on_start: function (trial) {
            const last_trialphase = jsPsych.data.getLastTrialData().values()[0].trialphase;
            if (last_trialphase === "control_explore_feedback") {
              trial.predict_decision += 2000;
            }
          },
          on_finish: function (data) {
            const n_trials = jsPsych.data.get().filter([{trialphase: "control_explore"}, {trialphase: "control_predict_homebase"}, {trialphase: "control_reward"}]).count();
            data.n_control_trials = n_trials;
            console.log("Trial number: " + n_trials + " (predict)");

            updateState(`control_trial_${jsPsych.evaluateTimelineVariable('trial')}`, false);

            if (n_trials % 24 === 0) {
              saveDataREDCap(retry = 3);
            }

            if (data.response === null) {
              var up_to_now = parseInt(jsPsych.data.get().last(1).select('n_warnings').values);
              console.log("n_warnings: " + up_to_now);
              jsPsych.data.addProperties({
                  n_warnings: up_to_now + 1
              });
            }
          }
        },
        confidenceRating,
        noChoiceWarning("response", '', "control_predict_homebase")
      ],
      timeline_variables: [t]
    });
  });

  controlPredTimeline[0]["on_timeline_start"] = () => {
    jsPsych.data.addProperties({
        control_predict_homebase_n_warnings: 0
    });
  }

  const controlRewardTimeline = [];
  REWARD_SEQUENCE.forEach((t, index) => {
    const timelineItems = [
      kick_out,
      fullscreen_prompt
    ];
    
    // Add prompt before the first reward trial
    if (index === 0) {
      timelineItems.push({
        type: jsPsychRewardPrompt,
        target: jsPsych.timelineVariable('target'),
        near: jsPsych.timelineVariable('near'),
        left: jsPsych.timelineVariable('left'),
        right: jsPsych.timelineVariable('right'),
        current: jsPsych.timelineVariable('current'),
        reward_amount: jsPsych.timelineVariable('reward_amount'),
        base_rule: controlConfig(settings).baseRule,
        island_path: `/assets/images/control/session-specific/${settings.session}`,
        simulation_options: {
          data: {rt: 1100}
        }
      });
    }
    
    timelineItems.push({
      type: jsPsychRewardShip,
      target: jsPsych.timelineVariable('target'),
      near: jsPsych.timelineVariable('near'),
      left: jsPsych.timelineVariable('left'),
      right: jsPsych.timelineVariable('right'),
      current: jsPsych.timelineVariable('current'),
      reward_amount: jsPsych.timelineVariable('reward_amount'),
      reward_number: jsPsych.timelineVariable('reward_number'),
      base_rule: controlConfig(settings).baseRule,
      control_rule: controlConfig(settings).controlRule,
      effort_threshold: controlConfig(settings).effort_threshold,
      scale: controlConfig(settings).scale,
      island_path: `/assets/images/control/session-specific/${settings.session}`,
      reward_decision: () => {
        if (canBeWarned("control_reward")) {
            return settings.default_response_deadline
        } else {
            return settings.long_response_deadline
        }
      },
      post_trial_gap: 0,
      save_timeline_variables: true,
      on_finish: function (data) {
        const n_trials = jsPsych.data.get().filter([{trialphase: "control_explore"}, {trialphase: "control_predict_homebase"}, {trialphase: "control_reward"}]).count();
        data.n_control_trials = n_trials;
        console.log("Trial number: " + n_trials + " (reward)");

        updateState(`control_trial_${jsPsych.evaluateTimelineVariable('trial')}`, false);

        updateBonusState();

        if (n_trials % 24 === 0) {
          saveDataREDCap(retry = 3);
        }

        if (data.response === null) {
          var up_to_now = parseInt(jsPsych.data.get().last(1).select('n_warnings').values);
          console.log("n_warnings: " + up_to_now);
          jsPsych.data.addProperties({
              n_warnings: up_to_now + 1
          });
        }
      }
    });
    
    timelineItems.push(
      noChoiceWarning("response",
        `<main class="main-stage">
          <img class="background" src="/assets/images/control/ocean.png" alt="Background"/>
        </main>`,
        "control_reward"
      )
    );
    
    // Add reward post trial gap but with ocean background
    timelineItems.push({
      timeline: [{
      type: jsPsychHtmlKeyboardResponse,
      stimulus: `
        <main class="main-stage">
              <img class="background" src="/assets/images/control/ocean.png" alt="Background"/>
        </main>
      `,
      trial_duration: 400,
      choices: ["NO_KEYS"]
      }],
      conditional_function: function () {
        const lastTrialChoice = jsPsych.data.getLastTrialData().values()[0].response;
        return lastTrialChoice !== null;
      }
    });
    
    controlRewardTimeline.push({
      timeline: timelineItems,
      timeline_variables: [t]
    });
  });

  controlRewardTimeline[0]["on_timeline_start"] = () => {
    updateState(`control_reward_start`);
    jsPsych.data.addProperties({
        control_reward_n_warnings: 0
    });
  }

  // Reveal homebases in the experiment
  const controlHomebaseReveal = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: () => {
      // Create the HTML stimulus with a table showing ships and their homebases
      let html = `
        <main class="main-stage">
          <img class="background" src="/assets/images/control/ocean_above.png" alt="Background"/>
          <div class="instruction-dialog" style="bottom:unset;">
            <div class="instruction-content" style="font-size: 24px; text-align: center;">
              <h3>Well done!</h3>
              <p>In case you’re curious, this is the home base for each ship in today's session:</p>
              <table style="margin: auto; border-collapse: separate; border-spacing: 20px 0px;">
                <tbody>`;
      
      // Add a row for each ship that has a defined homebase
      const shipColors = ["blue", "green", "red", "yellow"];
      shipColors.forEach(color => {
        const homebase = controlConfig(settings).controlRule[color];
        if (homebase) { // Only show ships with defined homebases
          html += `
            <tr>
              <td style="text-align: right; vertical-align: middle;">
                <img src="/assets/images/control/simple_ship_${color}.png" alt="${color} ship" style="height: 80px;">
              </td>
              <td style="text-align: center; vertical-align: middle; padding: 0 15px;">
                <div style="font-size: 32px;">→</div>
              </td>
              <td style="text-align: left; vertical-align: middle;">
                <img src="/assets/images/control/Control_stims/${settings.session}/island_icon_${homebase}.png" alt="Island ${homebase}" style="height: 100px;">
              </td>
            </tr>`;
        }
      });
      
      html += `
                </tbody>
              </table>
              <p>Thank you for playing the game!</p>
              <p>You may now press any key to continue.</p>
            </div>
          </div>
        </main>`;
      
      return html;
    },
    choices: "ALL_KEYS",
    response_ends_trial: true,
    post_trial_gap: 400,
    data: { 
      trialphase: 'control_reveal'}
  };

  // Assembling the control task timeline
  let controlTimeline = [];

  // Add the control trials depending on the session
  if (settings.session === "screening") {
    let trial = 1;
    for (let i = 0; i < EXPLORE_SEQUENCE_SCREENING.length; i++) {
      controlExploreTimeline[i].timeline_variables[0].trial = trial++;
      controlTimeline.push(controlExploreTimeline[i]);
      if ((i + 1) % 6 === 0) {
        const num_miniblock = Math.floor(i / 6);
        controlPredTimeline[num_miniblock].timeline_variables[0].trial = trial++;
        controlTimeline.push(controlPredTimeline[num_miniblock]);
      }
    }
  } else {
    let trial = 1;
    let pred_trials = [];
    // Add the explore, predict, report trials
    for (let i = 0; i < EXPLORE_SEQUENCE.length; i++) {
      controlExploreTimeline[i].timeline_variables[0].trial = trial++;
      controlTimeline.push(controlExploreTimeline[i]);
      if ((i + 1) % 6 === 0) {
        const num_miniblock = Math.floor(i / 6);
        if (num_miniblock % 2 === 0) {
          const indx = [0, 4].map(num => num + num_miniblock / 2 * 4);
          pred_trials = controlPredTimeline.slice(indx[0], indx[1]);
          pred_trials.forEach(t => {
            t.timeline_variables[0].trial = trial++;
          });
          controlTimeline.push(...pred_trials);
        } else {
          controlTimeline.push({
            ...controlRating,
            timeline_variables: [{trial: trial++}]
          });
        }
      }
    }
    // Add the reward trials as a separate block
    controlRewardTimeline.forEach((t, index) => {
      t.timeline_variables[0].trial = trial++;
    });
    controlTimeline.push(...controlRewardTimeline);
  }

  // If resuming, remove all the trials they have finished
  if (typeof window.last_state !== "undefined" && window.last_state.includes("control_trial_")) {
    const last_trial = parseInt(window.last_state.split("_")[2]);
    controlTimeline = controlTimeline.slice(last_trial);
  }

  return controlTimeline;
}

  // Add feedback on the final rewards in total
  export const computeRelativeControlBonus = () => {

      // Compute lowest and highest sum of coins possible to earn
      
      const earned_sum = jsPsych.data.get().filter({ trialphase: 'control_reward' }).select('reward').sum();
      const min_sum = 0;
      const max_sum = jsPsych.data.get().filter({trialphase: 'control_reward'}).select('timeline_variables').values.reduce((sum, value) => sum + value.reward_number, 0);
      
      return {
          earned: earned_sum,
          min: min_sum,
          max: max_sum
      }
  }
