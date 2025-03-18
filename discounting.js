// Monetary Choice Questionnaire

const discounting_trial = {
    type: jsPsychHtmlButtonResponse,
    stimulus: "<p>Would you prefer:</p>",
    choices: jsPsych.timeline_variable("choices"),
    enable_button_after: 500,
    trial_duration: window.default_response_deadline
}