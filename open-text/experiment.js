// Setup requisite objects
const currentUser = new User()
// const jsPsych = my_jsPsych_init(); // Should be already defined in experiment.html
let openTextTimeline = []

let openText_instructions = {
    type: jsPsychInstructions,
    pages: instr_pages,
    css_classes: ['instructions'],
    show_clickable_nav: true,
    button_label_previous: 'Back',
    button_label_next: 'Next',
    allow_keys: false,
    on_page_change: function (current_page) {
        let next_button_element = document.querySelector('button#jspsych-instructions-next')
        if (current_page === instr_pages.length - 1) {
            next_button_element.innerHTML = '<b><u>Start answering questions</u></b>'
        }
    },
    show_page_number: true,
    on_finish: () => {
        if (["wk24", "wk28"].includes(window.session)){
            updateState("no_resume");
        }
        updateState("open_text_task_start");
    }
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
// Instructions timeline
openTextTimeline.push(openText_instructions) // <--------
openTextTimeline.push(relmed_open_timeline); // <--------