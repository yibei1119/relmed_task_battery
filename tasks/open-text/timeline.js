import { User, question_trial } from "./utils.js"
import { openTextInstructions } from "./instructions.js"
import { RELMED_QS } from "./configuration.js"
import { saveDataREDCap } from "/core/utils/index.js"

function createOpenTextTimeline(settings) {
    // Setup requisite objects
    const currentUser = new User()
    
    let openTextTimeline = []

    // RELMED open-ended questions
    let relmed_question_array = []
    let q = 0
    for (let relmed_q of RELMED_QS) {
        q += 1
        let tmp_json = {
            prompt: `<div id="qs_instr">` + relmed_q + `</div>` + avoid_answer + time_word,
            rows: 8,
            required: qs_ans_required,
            columns: 100,
            name: 'relmed_q' + q.toString(),
        }
        relmed_question_array.push(tmp_json)
    }

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
    openTextTimeline.push(openTextInstructions(settings))
    openTextTimeline.push(relmed_open_timeline)
    
    return openTextTimeline
}

export { createOpenTextTimeline }