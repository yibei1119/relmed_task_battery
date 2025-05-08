const controlPreload = {
  type: jsPsychPreload,
  images: [
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
    ].map(s => "imgs/" + s)),
    ...([
      "simple_island_i1.png", //wk0: banana
      "simple_island_i2.png", //wk0: coconut
      "simple_island_i3.png", //wk0: grape
      "simple_island_i4.png", //wk0: orange
      "island_icon_i1.png",
      "island_icon_i2.png",
      "island_icon_i3.png",
      "island_icon_i4.png"
    ].map(s => "imgs/Control_stims/" + window.session + "/" + s)),
  ],
  post_trial_gap: 800,
  continue_after_error: true,
  data: {
    trialphase: "control_preload"
  },
  on_start: () => {
    // Report to tests
    console.log("load_successful")

    // Report to relmed.ac.uk
    postToParent({message: "load_successful"})
  }
};

const controlExploreTimeline = [];
explore_sequence.forEach(trial => {
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
          if (can_be_warned("control_explore")) {
              return window.default_response_deadline
          } else {
              return window.default_long_response_deadline
          }
        },
        explore_effort: 3000,
        post_trial_gap: 0,
        save_timeline_variables: true,
        on_start: function (trial) {
          const last_trialphase = jsPsych.data.getLastTrialData().values()[0].trialphase;
          if (last_trialphase === "control_confidence") {
            trial.explore_decision += 0;
          }
        },
        on_finish: function (data) {
          const n_trials = jsPsych.data.get().filter([{trialphase: "control_explore"}, {trialphase: "control_predict_homebase"}, {trialphase: "control_reward"}]).count();
          data.n_control_trials = n_trials;
          console.log("Trial number: " + n_trials + " (explore)");
          
          if (n_trials % 24 === 0) {
            console.log("n_trials: " + n_trials);
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
          post_trial_gap: 0
        }],
        conditional_function: function () {
          const lastTrialChoice = jsPsych.data.getLastTrialData().values()[0].response;
          return lastTrialChoice !== null;
        }
      },
      noChoiceWarning("response", 
        `<main class="main-stage">
          <img class="background" src="imgs/ocean.png" alt="Background"/>
        </main>`,
        "control_explore"
      )
    ],
    timeline_variables: [trial]
  });
});

controlExploreTimeline[0]["on_timeline_start"] = () => {
  updateState(`no_resume`);
  updateState(`control_task_start`);
  jsPsych.data.addProperties({
      control_explore_n_warnings: 0
  });
}

const controlPredTimeline = [];
predict_sequence.forEach(trial => {
  controlPredTimeline.push({
    timeline: [
      kick_out,
      fullscreen_prompt,
      {
        type: jsPsychPredictHomeBase,
        ship: jsPsych.timelineVariable('ship'),
        predict_decision: () => {
          if (can_be_warned("control_predict_homebase")) {
              return window.default_response_deadline
          } else {
              return window.default_long_response_deadline
          }
        },
        post_trial_gap: 0,
        save_timeline_variables: true,
        on_finish: function (data) {
          const n_trials = jsPsych.data.get().filter([{trialphase: "control_explore"}, {trialphase: "control_predict_homebase"}, {trialphase: "control_reward"}]).count();
          data.n_control_trials = n_trials;
          console.log("Trial number: " + n_trials + " (predict)");

          if (n_trials % 24 === 0) {
            console.log("n_trials: " + n_trials);
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
    timeline_variables: [trial]
  });
});

controlPredTimeline[0]["on_timeline_start"] = () => {
  jsPsych.data.addProperties({
      control_predict_homebase_n_warnings: 0
  });
}

const controlRewardTimeline = [];
reward_sequence.forEach((trial, index) => {
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
      simulation_options: {
        simulate: false
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
    reward_decision: () => {
      return 10000000000;
      if (can_be_warned("control_reward")) {
          return window.default_response_deadline
      } else {
          return window.default_long_response_deadline
      }
    },
    post_trial_gap: 0,
    save_timeline_variables: true,
    on_start: function (trial) {
      const last_trialphase = jsPsych.data.getLastTrialData().values()[0].trialphase;
      if (last_trialphase === "control_controllability" || last_trialphase === "control_reward_prompt") {
        trial.reward_decision += 0;
      }
    },
    on_finish: function (data) {
      const n_trials = jsPsych.data.get().filter([{trialphase: "control_explore"}, {trialphase: "control_predict_homebase"}, {trialphase: "control_reward"}]).count();
      data.n_control_trials = n_trials;
      console.log("Trial number: " + n_trials + " (reward)");

      if (n_trials % 24 === 0) {
        console.log("n_trials: " + n_trials);
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
  
  // timelineItems.push({
  //   timeline: [{
  //     type: jsPsychRewardShipFeedback,
  //     target_island: jsPsych.timelineVariable('target'),
  //     feedback_duration: 2000,
  //     post_trial_gap: 0
  //   }],
  //   conditional_function: function () {
  //     const lastTrialChoice = jsPsych.data.getLastTrialData().values()[0].response;
  //     return lastTrialChoice !== null;
  //   }
  // });

  timelineItems.push(
    noChoiceWarning("response",
      `<main class="main-stage">
        <img class="background" src="imgs/ocean.png" alt="Background"/>
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
            <img class="background" src="imgs/ocean.png" alt="Background"/>
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
    timeline_variables: [trial]
  });
});

controlRewardTimeline[0]["on_timeline_start"] = () => {
  updateState(`no_resume`);
  updateState(`control_reward_start`);
  jsPsych.data.addProperties({
      control_reward_n_warnings: 0
  });
}

// Add feedback on the final rewards in total
let controlTotalReward = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: function () {
    let total_bonus = (jsPsych.data.get().filter({ trialphase: 'control_reward' }).select('reward').sum() + 45) / 125 * 3;
    if (window.context === "relmed" || window.task === "control") {
      stimulus = `<main class="main-stage">
          <img class="background" src="imgs/ocean_above.png" alt="Background"/>
          <div class="instruction-dialog" style="bottom:50%; min-width: 600px; width: 50%;">
            <div class="instruction-content" style="font-size: 32px; text-align: center;">
              <p>Thank you for playing the game!</p>
              <p>Your final bonus from all the successful quests is ${total_bonus.toLocaleString('en-GB', { style: 'currency', currency: 'GBP' })}!</p>
              <p>You may now press any key to continue.</p>
            </div>
          </div>
        </main>`;
    } else {
      stimulus = `<main class="main-stage">
          <img class="background" src="imgs/ocean_above.png" alt="Background"/>
          <div class="instruction-dialog" style="bottom:50%; min-width: 600px; width: 50%;">
            <div class="instruction-content" style="font-size: 32px; text-align: center;">
              <p>Thank you for playing the game!</p>
              <p>You may now press any key to continue.</p>
            </div>
          </div>
        </main>`;
    }
    return stimulus;
  },
  choices: "ALL_KEYS",
  response_ends_trial: true,
  post_trial_gap: 400,
  simulation_options: {
    simulate: false
  },
  data: { 
    trialphase: 'control_bonus'
  },
  on_finish: function (data) {
    const control_bonus = jsPsych.data.get().filter({ trialphase: 'control_reward' }).select('reward').sum();
    data.control_bonus = control_bonus;
    data.control_bonus_adjusted = (control_bonus + 45) / 125 * 3;
    console.log("Control bonus (adjusted): " + data.control_bonus_adjusted);
    postToParent({bonus: data.control_bonus_adjusted});
    saveDataREDCap(retry = 3);
  }
};

// Add debriefing questions
let controlDebriefing = [];
controlDebriefing.push(control_acceptability_intro);
controlDebriefing.push(acceptability_control);
controlDebriefing.push(control_debrief);

// Assembling the control timeline
let controlTimeline = [];
// Add the preload
controlTimeline.push(controlPreload);
// Add the instructions
controlTimeline.push(controlInstructionsTimeline);

// Add the explore, predict, reward trials
for (let i = 0; i < explore_sequence.length; i++) {
  // Add the explore trials
  controlTimeline.push(controlExploreTimeline[i]);
  if ((i + 1) % 6 === 0) {
    num_miniblock = Math.floor(i / 6)
    if (num_miniblock % 2 === 0) {
      // Add the prediction trials after trial 6, 18, 30...
      indx = [0, 4].map(num => num + num_miniblock / 2 * 4);
      controlTimeline.push(...controlPredTimeline.slice(indx[0], indx[1]));
    } else {
      // Add the reward trials after trial 12, 24, 36...
      controlTimeline.push(controlRating);
      // indx = [0, 8].map(num => num + (num_miniblock - 1) / 2 * 8);
      // controlTimeline.push(...controlRewardTimeline.slice(indx[0], indx[1]));
    }
  }
}

// Add the reward trials as a separate block
controlTimeline.push(controlRewardTimeline);

// Add the final reward feedback
controlTimeline.push(controlTotalReward);

// Add the debriefing to the end of the experiment
controlTimeline.push(controlDebriefing);