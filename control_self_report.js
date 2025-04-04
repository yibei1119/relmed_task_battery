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
    return last_trial_choice !== null;
  }
};

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
      if (data.response === null) {
        var up_to_now = parseInt(jsPsych.data.get().last(1).select('n_warnings').values);
        console.log("n_warnings: " + up_to_now);
        jsPsych.data.addProperties({
            n_warnings: up_to_now + 1
        });
      }
    }
  },
  noChoiceWarning("response")
]
};

// Acceptability questions
const control_acceptability_intro =
{
    type: jsPsychInstructions,
    css_classes: ['instructions'],
    pages: [
        `
          <p>Please answer the following short questions.</p>
          <p>Your feedback would be very helpful for us to improve the game.</p>
        `
    ],
    show_clickable_nav: true,
    data: { trialphase: "control_pre_debrief_instructions" },
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
          name: "control_difficulty"
      },
      {
          prompt: "How enjoyable was the fruit shipping game?",
          labels: ["1<br>Not at all", "2", "3", "4", "5<br>Very enjoyable"],
          required: true,
          name: "control_enjoy"
      },
      {
          prompt: "Was it clear to you what you needed to do in the fruit shipping game?",
          labels: ["1<br>Not clear at all", "2", "3", "4", "5<br>Extremely clear"],
          required: true,
          name: "control_clear"
      }
  ],
  data: {
      trialphase: "acceptability_ctrl"
  },
  simulation_options: {
      simulate: false
  }
};

const control_debrief = {
  type: jsPsychSurveyText,
  questions: [
      {
          prompt: "Thinking back on the whole study, was there anything unclear in any of the instructions?",
          columns: 50,
          rows: 5,
          value: '',
          name: "instructions",
          required: true
      },
      {
        prompt: "Were any parts of the game difficult? If so, which ones and why?",
        columns: 50,
        rows: 5,
        value: '',
        name: "hardship",
        required: true
      },
      {
        prompt: "How did you approach the game when exploring the shipping network? What strategy did you use to choose the ship and fuel level?",
        columns: 50,
        rows: 5,
        value: '',
        name: "strategies",
        required: true
      },
      {
        prompt: "How much effort (e.g., number of presses or percentage of fuel used) did you expend<br>to overcome the low, medium, and strong currents and guide the ships back to their home bases?",
        columns: 50,
        rows: 5,
        value: '',
        name: "efforts",
        required: true
      }
  ],
  data: {
      trialphase: 'control_debrief_text'
  },
  simulation_options: {
      simulate: false
  }
};