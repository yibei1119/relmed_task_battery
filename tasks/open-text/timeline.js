// Setup requisite objects
const currentUser = new User()
// const jsPsych = my_jsPsych_init(); // Should be already defined in experiment.html
let openTextTimeline = []


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