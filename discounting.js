// Monetary Choice Questionnaire

const dd_sum_delays = [
    { today: 54, later: 55, delay: 117 },
    { today: 55, later: 75, delay: 61 },
    { today: 19, later: 25, delay: 53 },
    { today: 31, later: 85, delay: 7 },
    { today: 14, later: 25, delay: 19 },
    { today: 47, later: 50, delay: 160 },
    { today: 15, later: 35, delay: 13 },
    { today: 25, later: 60, delay: 14 },
    { today: 78, later: 80, delay: 162 },
    { today: 40, later: 55, delay: 62 },
    { today: 11, later: 30, delay: 7 },
    { today: 67, later: 75, delay: 119 },
    { today: 34, later: 35, delay: 186 },
    { today: 27, later: 50, delay: 21 },
    { today: 69, later: 85, delay: 91 },
    { today: 49, later: 60,  delay: 89 },
    { today: 80, later: 85, delay: 157 },
    { today: 24, later: 35, delay: 29 },
    { today: 33, later: 80, delay: 14 },
    { today: 28, later: 30, delay: 179 },
    { today: 34, later: 50, delay: 30 },
    { today: 25, later: 30, delay: 80 },
    { today: 41, later: 75, delay: 20 },
    { today: 54, later: 60, delay: 111 },
    { today: 54, later: 80, delay: 30 },
    { today: 22, later: 25, delay: 136 },
    { today: 20, later: 55, delay: 7 },
]

const dd_choices = dd_sum_delays.map((d) => {return {choices: [`£${d.today}\ntoday`, `£${d.later}\nin ${d.delay} days`]}})

const dd_trial = {
    type: jsPsychHtmlButtonResponse,
    stimulus: "<p>Would you prefer:</p>",
    choices: jsPsych.timelineVariable("choices"),
    enable_button_after: 500,
    trial_duration: window.default_response_deadline,
    post_trial_gap: 200
}

const dd_timeline = {
    timeline: [dd_trial],
    timeline_variables: dd_choices,
    on_finish: (data) => {
        data.chosen_later = data.response === null ? null : data.response == 1
    }
}

