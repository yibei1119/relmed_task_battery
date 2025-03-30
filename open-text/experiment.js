// Setup requisite objects
const currentUser = new User()
// const jsPsych = my_jsPsych_init(); // Should be already defined in experiment.html
let openTextTimeline = []

// Welcome and instructions
let openText_welcome_trial = {
    type: jsPsychHtmlKeyboardResponse,
    // trial_duration: debug_mode,
    post_trial_gap: 500,
    choices: ['n'],
    stimulus: welcome_text,
    on_start: function (trial) {
        document.body.className = "open-text";

        updateState("open_text_start_instructions");
    }
}
let openText_instructions = {
    type: jsPsychInstructions,
    pages: instr_pages,
    show_clickable_nav: true,
    button_label_previous: 'Go to the previous page',
    button_label_next: 'Go to the next page',
    allow_keys: false,
    on_page_change: function (current_page) {
        let next_button_element = document.querySelector('button#jspsych-instructions-next')
        if (current_page === instr_pages.length - 1) {
            next_button_element.innerHTML = '<b style="color:red"><u>Start the experiment!</u></b>'
        }
    },
    show_page_number: true,
    on_finish: () => {
        updateState("open_text_start");
}

// RELMED open-ended questions
let q_count = 0
let relmed_open_timeline_array = []
let q_max = relmed_question_array.length
for (let i = 0; i < q_max; i++) {
    q_count += 1
    relmed_open_timeline_array.push(question_trial(relmed_question_array, i, q_count, currentUser, jsPsych))
}
let relmed_open_timeline = {
    timeline: relmed_open_timeline_array,
    on_timeline_finish: () => {
        document.body.className = '';
        saveDataREDCap(3);
    }
}

// Assemble timeline
// Welcome trial
openTextTimeline.push(openText_welcome_trial) // <--------

// Instructions timeline
openTextTimeline.push(openText_instructions) // <--------
openTextTimeline.push(relmed_open_timeline); // <--------