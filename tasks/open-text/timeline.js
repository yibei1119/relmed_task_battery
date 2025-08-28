import { User, question_trial } from "./utils.js"
import { openTextInstructions } from "./instructions.js"

// Setup requisite objects
const currentUser = new User()

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
openTextTimeline.push(openTextInstructions(settings)) // <--------
openTextTimeline.push(relmed_open_timeline); // <--------