const confidenceRating = {
  timeline: [{
    type: jsPsychHtmlButtonResponse,
    stimulus: '<p>How confident are you that your last choice was correct?</p>',
    choices: ["1<br>Not at all", "2", "3", "4", "5<br>Very confident"],
    data: {
        trialphase: "ctrl_confidence"
    }
  }],
  conditional_function: function () {
    const last_trial_choice = jsPsych.data.get().last(1).select('response').values[0];
    return last_trial_choice !== null;
  },
  post_trial_gap: 800
};

const controlRating = {
  timeline: [{
    type: jsPsychHtmlButtonResponse,
    stimulus: "<p>How in control do you feel at this moment?</p>",
    choices: ["1<br>Not at all", "2", "3<br>I don't know", "4", "5<br>Completely in control"],
    data: {
      trialphase: "ctrl_controllability"
    }
  }],
  post_trial_gap: 800
};

// Acceptability questions
const acceptability_intro =
{
    type: jsPsychInstructions,
    css_classes: ['instructions'],
    pages: [
        `<p>Please answer the following short questions.</p>`
    ],
    show_clickable_nav: true,
    data: { trialphase: "pre_debrief_instructions" },
    simulation_options: {
        simulate: false
    }
};

const acceptability_control = {
  type: jsPsychSurveyLikert,
  preamble: `<p>Please answer these questions regarding the fruit shipping game:<p>`,
  questions: [
      {
          prompt: "How difficult was the fruit shipping game?",
          labels: ["1<br>Not at all", "2", "3", "4", "5<br>Very difficult"],
          required: true,
          name: "ctrl_difficulty"
      },
      {
          prompt: "How enjoyable was the fruit shipping game?",
          labels: ["1<br>Not at all", "2", "3", "4", "5<br>Very enjoyable"],
          required: true,
          name: "ctrl_enjoy"
      },
      {
          prompt: "Was it clear to you what you needed to do in the fruit shipping game?",
          labels: ["1<br>Not clear at all", "2", "3", "4", "5<br>Extremely clear"],
          required: true,
          name: "ctrl_clear"
      }
  ],
  data: {
      trialphase: "acceptability_ctrl"
  },
  simulation_options: {
      simulate: false
  }
};

const debrief = {
  type: jsPsychSurveyText,
  questions: [
      {
          prompt: "Thinking back on the whole study, was there anything unclear in any of the instructions?",
          columns: 35,
          rows: 3,
          value: '',
          name: "instructions",
          required: true
      },
      {
        prompt: "Thinking back on the whole study, how did you approach the game when asked to explore the shipping network? What was your strategy to choose the ship and the fuel level?",
        columns: 35,
        rows: 3,
        value: '',
        name: "strategies",
        required: true
      }
  ],
  data: {
      trialphase: 'debrief_instructions'
  },
  simulation_options: {
      simulate: false
  }
};