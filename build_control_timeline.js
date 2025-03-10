const controlExploreTimeline = [];
explore_sequence.forEach(trial => {
  controlExploreTimeline.push({
    timeline: [
      {
        type: jsPsychExploreShip,
        left: jsPsych.timelineVariable('left'),
        right: jsPsych.timelineVariable('right'),
        near: jsPsych.timelineVariable('near'),
        current: jsPsych.timelineVariable('current'),
        save_timeline_variables: true
      },
      {
        timeline: [{
          type: jsPsychExploreShipFeedback,
          on_finish: function (data) {
            // console.log(data);
          }
        }],
        conditional_function: function () {
          const lastTrialChoice = jsPsych.data.getLastTrialData().values()[0].response;
          return lastTrialChoice !== null;
        }
      },
      noChoiceWarning("response")
    ],
    timeline_variables: [trial]
  });
});

const controlPredTimeline = [];
predict_sequence.forEach(trial => {
  controlPredTimeline.push({
    timeline: [
      {
        type: jsPsychPredictHomeBase,
        ship: jsPsych.timelineVariable('ship'),
        save_timeline_variables: true
      },
      confidenceRating,
      noChoiceWarning("response")
    ],
    timeline_variables: [trial]
  });
});

const controlRewardTimeline = [];
reward_sequence.forEach(trial => {
  controlRewardTimeline.push({
    timeline: [
      {
        type: jsPsychRewardShip,
        target: jsPsych.timelineVariable('target'),
        near: jsPsych.timelineVariable('near'),
        left: jsPsych.timelineVariable('left'),
        right: jsPsych.timelineVariable('right'),
        current: jsPsych.timelineVariable('current'),
        reward_amount: "5p",
        save_timeline_variables: true
      },
      {
        timeline: [{
          type: jsPsychRewardShipFeedback,
          target_island: jsPsych.timelineVariable('target')
        }],
        conditional_function: function () {
          const lastTrialChoice = jsPsych.data.getLastTrialData().values()[0].response;
          return lastTrialChoice !== null;
        }
      },
      noChoiceWarning("response")
    ],
    timeline_variables: [trial]
  });
});

// Add feedback on the final rewards in total
let controlTotalReward = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: function () {
    let total_bonus = jsPsych.data.get().filter({ trialphase: 'control_reward_feedback' }).select('correct').sum() * 5 / 100;
    return `<main class="main-stage">
          <img class="background" src="imgs/ocean_above.png" alt="Background"/>
          <div class="instruction-dialog" style="bottom:50%; min-width: 600px; width: 50%;">
            <div class="instruction-content" style="font-size: 32px; text-align: center;">
              <p>You total earnings from the shipping quests are ${total_bonus.toLocaleString('en-GB', { style: 'currency', currency: 'GBP' })}.!</p>
              <p>Thank you for playing the game!</p>
              <p>Now press any key to continue.</p>
            </div>
          </div>
        </main>`;
  },
  choices: ['ALL_KEYS'],
  response_ends_trial: true,
  post_trial_gap: 800,
  data: { 
    trialphase: 'control_bonus',
    control_bonus: jsPsych.data.get().filter({ trialphase: 'control_reward_feedback' }).select('correct').sum() * 5 / 100
  }
};
let controlTimeline = [];
for (let i = 0; i < explore_sequence.length; i++) {
  controlTimeline.push(controlExploreTimeline[i]);
  if ((i + 1) % 6 === 0) {
    num_miniblock = Math.floor(i / 6)
    if (num_miniblock % 2 === 0) {
      indx = [0, 2].map(num => num + num_miniblock);
      controlTimeline.push(...controlPredTimeline.slice(indx[0], indx[1]));
    } else {
      controlTimeline.push(controlRating);
      indx = [0, 2].map(num => num + num_miniblock - 1);
      controlTimeline.push(...controlRewardTimeline.slice(indx[0], indx[1]));
    }
  }
}

// Add debriefing to the end of the experiment
let controlDebriefing = [];
controlDebriefing.push(control_acceptability_intro);
controlDebriefing.push(acceptability_control);
controlDebriefing.push(control_debrief);

// Add the debriefing to the end of the experiment
controlTimeline.push(controlDebriefing);