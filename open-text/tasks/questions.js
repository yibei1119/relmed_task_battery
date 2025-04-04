// ------------> Generic content for questions <---------------

/*
Question preamble with instructions for the specific question
Displays: question counter (q out of Q); time limit and time remaining
*/
let question_preamble = `<div id="qs_preamble"><p id="qs_preamble_q_p"><u>Question <span id="qs_preamble_q_no"></span> of <span id="qs_preamble_q_max"></span></u></p>
    <h4>` + "Please type your answer in detail in the box below." + `</h4>
    <p id="qs_preamble_disclosure">(You have <b>` + oq_timelimit_text + `</b> to answer)</p>
    <div id="qs_timeleft">
    Your time will soon be over. Don't forget to submit your answer!
    </div>
    </div>`

// Checkbox to skip a question -> would result in returned submission
let avoid_label = window.context === "prolific" ? "If you'd rather not say, check this box and return your submission." : ""
let avoid_answer = `<div id="qs_avoid">
        <label>
            <input type="checkbox" id="qs_preamble_na_check" ${window.context === "relmed" ? "disabled style='visibility: hidden'" : ""}>
                <span>` + avoid_label + `</span> 
        </label>
    </div>
    `

// Word counter information for ppt
let time_word = `<div id="qs_words">
    Please write at least <span id="qs_words_left">` + min_words + `</span> more words.
    </div>
    `
// Once the minimum number of words is reached, display submit button
let lvl_x_question_button_label = "Submit answer"

// ------------> RELMED open-ended questions <---------------
let relmed_q1 = "<p>Please describe any <b>rewarding experiences</b> you've had during the past week.</p><p>How have these experiences affected you personally?</p>"
let relmed_q2 = "<p>Describe specific instances when things turned out <b>better than you expected</b> during the past week.</p>"
let relmed_q3 = "<p>How did this experience affect your energy and motivation levels?</p>"
let relmed_q4 = "<p>Describe specific instances when things turned out <b>worse than you expected</b> during the past week.</p>"
let relmed_q5 = "<p>How did this experience affect your energy and motivation levels?</p>"
let relmed_q6 = "<p>What <b>meaningful goals</b> have you been motivated to pursue in the past week?</p>"
let relmed_q7 = "<p>How did you find answering these questions?</p>"

let relmed_qs = [relmed_q1, relmed_q2, relmed_q3, relmed_q4, relmed_q5, relmed_q6, relmed_q7]
let nQ = relmed_qs.length
let relmed_question_array = []
let q = 0
for (let relmed_q of relmed_qs) {
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

// If you want to have a catch question
let lvl2_catch_ans = 'catch response'

// ------------> Open question trial function <---------------
/*

*/
function question_trial(qs_list, q_index = 0, q_count, currentUser_instance, jsPsych_instance) {
    /**
     * Creates a jsPsych survey text trial with various UI enhancements and validation mechanisms.
     *
     * @param {Array} qs_list - List of question objects containing question details.
     * @param {number} [q_index=0] - Index of the current question in the list.
     * @param {number} q_count - The current question number in the experiment sequence.
     * @param {Object} currentUser_instance - Object representing the current user session and progress.
     * @param {Object} jsPsych_instance - Instance of jsPsyc
     *
     * @returns {Object} - A jsPsych trial object with the configured survey text question.
     *
     * The function dynamically adjusts UI elements, handles input restrictions, validates responses,
     * manages timers, and saves trial data. It also includes:
     * - Background styling adjustments based on the question index. (odd vs even to help distinguish that question has changed)
     * - Countdown timer display and warning handling.
     * - Checkbox handling for "Rather not say" responses.
     * - Word count enforcement for open-ended questions.
     * - Attention check question processing.
     * - Data saving and warning system for empty responses or timeouts.
     */
    return {
        type: jsPsychSurveyText,
        preamble: question_preamble,
        button_label: lvl_x_question_button_label,
        questions: [qs_list[q_index]],
        css_classes: ['lvlx_qs'],
        trial_duration: 1000 * (writing_time + qs_read_time),
        data: {trialphase: 'open-text'},
        on_load: function () {
            // preamble margin-top style if in simulation mod
            if (!run_sim) {
                let q_name = qs_list[q_index]['name']

                // initialise checked property
                currentUser_instance.last_checked = false

                // style instruction preamble depending on question number being odd/even
                let instr_el = document.getElementById('qs_instr');
                let q_no_el = document.getElementById('qs_preamble_q_p');
                if (q_index % 2 === 0) {
                    instr_el.style.background = `rgb(211, 211, 211, 0.5)`
                    q_no_el.style.color = `rgb(65, 105, 225)`
                } else {
                    instr_el.style.background = `rgb(85, 85, 85, 0.4)`
                    q_no_el.style.color = `blue`
                }

                // Question progress
                let q_max_el = document.getElementById('qs_preamble_q_max');
                q_max_el.innerHTML = nQ.toString()
                let q_no_item = document.getElementById("qs_preamble_q_no")
                q_no_item.textContent = (q_count).toString()

                // start timer count down
                let time_display = document.querySelector('#qs_timeleft')
                time_display.style.visibility = 'hidden'
                let minute_instr = document.getElementById('qs_preamble_disclosure')
                startTimer_sec(writing_time, time_display, warning_time, minute_instr)

                // get elements to adjust
                let preamble = document.getElementById("qs_preamble").clientHeight
                let lvlx_el = document.getElementsByClassName("lvlx_qs")[0]

                lvlx_el.style.marginTop = (preamble * 1.025).toString() + 'px'
                try {
                    // adapt preamble when resizing window
                    window.addEventListener('resize', function () {
                        let preamble = document.getElementById("qs_preamble").clientHeight
                        let lvlx_el = document.getElementsByClassName("lvlx_qs")[0]
                        lvlx_el.style.marginTop = (preamble * 1.025).toString() + 'px'
                    })
                } catch (error) {
                    console.error('resize issues')
                }


                // checkbox objects
                let na_check = document.getElementById("qs_preamble_na_check")

                // Prevent checking the checkbox with a key
                na_check.addEventListener('keydown', function (event) {
                    event.preventDefault();
                });

                // get the word counter relevant elements
                let my_txt_area = document.getElementsByTagName('textarea')[0]
                let counter = document.getElementById('qs_words_left')
                let div_counter = document.getElementById('qs_words')
                let submit_bttn = document.getElementById('jspsych-survey-text-next')

                // hide submit button at the start
                submit_bttn.style.visibility = "hidden"

                // prevent pasting into textbox
                if (prevent_paste) {
                    my_txt_area.addEventListener('paste', e => e.preventDefault());
                }

                if (q_name === 'lvl2_q_catch') {
                    // if a catch question
                    let catch_resp = my_txt_area.value.replace(/\s+/g, ' ').trim() === lvl2_catch_ans
                    jsPsych_instance.data.addProperties({'lvl2_attention': catch_resp})
                }

                // Checkbox alert object
                let alert_el = document.getElementById('formAlert')

                // 'Rather not say' checkbox handling - hide/show the submit button and textarea text - including catch question handling
                na_check.addEventListener('change', function () {
                    currentUser_instance.last_checked = na_check.checked
                    let words_left = Number(document.getElementById("qs_words_left").innerText) // words left to write
                    if (na_check.checked) { // handle when someones checked they dont want to answer
                        na_check.disabled = true; // disable checkbox
                        submit_bttn.style.visibility = 'hidden'
                        alert_el.style.visibility = 'visible'
                        div_counter.style.visibility = "hidden"
                        my_txt_area.style["content-visibility"] = "hidden"
                        my_txt_area.style.background = `rgb(211, 211, 211, 0.5)`;
                        my_txt_area.readOnly = true
                        if (q_name === 'lvl2_q_catch') {
                            // if a catch question
                            let catch_resp = my_txt_area.value.replace(/\s+/g, ' ').trim() === lvl2_catch_ans
                            jsPsych_instance.data.addProperties({'lvl2_attention': catch_resp})
                        }

                        document.getElementById('close_alert').addEventListener('click', function (event) {
                            // when they close down the alert to continue
                            event.preventDefault()
                            na_check.checked = false;
                            na_check.disabled = false;
                            currentUser_instance.last_checked = na_check.checked

                            alert_el.style.visibility = 'hidden'
                            submit_bttn.style.visibility = 'visible'

                            my_txt_area.readOnly = false
                            my_txt_area.style["content-visibility"] = "visible"
                            my_txt_area.style.background = `rgb(255, 255, 255, 1)`;
                            div_counter.style.visibility = "hidden"
                            if (words_left > 0) { // if there are more words to write
                                submit_bttn.style.visibility = "hidden"
                                div_counter.style.visibility = "visible"
                                if (q_name === 'lvl2_q_catch') {
                                    let catch_resp = my_txt_area.value.replace(/\s+/g, ' ').trim() === lvl2_catch_ans
                                    jsPsych_instance.data.addProperties({'lvl2_attention': catch_resp})
                                    if (catch_resp) {
                                        submit_bttn.style.visibility = "visible"
                                        div_counter.style.visibility = "hidden"
                                    } else {
                                        submit_bttn.style.visibility = "hidden"
                                        div_counter.style.visibility = "visible"
                                    }
                                }
                            } else { // if words written
                                if (q_name === 'lvl2_q_catch') {
                                    let catch_resp = my_txt_area.value.replace(/\s+/g, ' ').trim() === lvl2_catch_ans
                                    jsPsych_instance.data.addProperties({'lvl2_attention': catch_resp})
                                }
                            }
                        });
                        // when they want to return the submission and skip
                        document.getElementById('return_alert').addEventListener('click', (event) => {
                            event.preventDefault()
                            // na_check.disabled = false; // disable checkbox
                            alert_el.style.visibility = 'hidden'
                            submit_bttn.style.visibility = 'hidden'
                            // document.getElementById('display_element').innerHTML = ''
                            jsPsych_instance.finishTrial()
                        });
                    } else {
                        // normal case
                        my_txt_area.readOnly = false
                        my_txt_area.style["content-visibility"] = "visible"
                        my_txt_area.style.background = `rgb(255, 255, 255, 1)`;
                        if (words_left > 0) {// if more words to write
                            submit_bttn.style.visibility = "hidden"
                            div_counter.style.visibility = "visible"
                            if (q_name === 'lvl2_q_catch') {
                                let catch_resp = my_txt_area.value.replace(/\s+/g, ' ').trim() === lvl2_catch_ans
                                jsPsych_instance.data.addProperties({'lvl2_attention': catch_resp})
                                if (catch_resp) {
                                    submit_bttn.style.visibility = "visible"
                                    div_counter.style.visibility = "hidden"
                                } else {
                                    submit_bttn.style.visibility = "hidden"
                                    div_counter.style.visibility = "visible"
                                }
                            }
                        } else { // if minimum met
                            submit_bttn.style.visibility = "visible"
                            div_counter.style.visibility = "hidden"
                            if (q_name === 'lvl2_q_catch') {
                                let catch_resp = my_txt_area.value.replace(/\s+/g, ' ').trim() === lvl2_catch_ans
                                jsPsych_instance.data.addProperties({'lvl2_attention': catch_resp})
                            }
                        }
                    }
                })


                // Enable word counting by attaching the counter function to the textbox event listener
                my_txt_area.addEventListener('input', function () {
                    separateWords(my_txt_area, counter, div_counter, submit_bttn, q_name, jsPsych_instance);
                })
            }


        },
        on_finish: function (data) {
            let q_name = qs_list[q_index]['name']
            let na_check = currentUser_instance.last_checked
            // return submission checkbox
            if (na_check) {
                // if rather not say, then ask to return submission
                if (no_skip) {
                    // Use saveDataREDCap to save the return status
                    var extraFields = {
                        completed: "Yes",
                        returned: "Yes",
                        code: 'RETURNED'
                    }
                    saveDataREDCap(3);
                    jsPsych_instance.abortExperiment(return_text)
                }
            } else {
                // check for timeout
                currentUser_instance.timeout_count += data['timeout'] * 1
                // console.log('timeout count: ', currentUser_instance.timeout_count)

                // check if empty response - count words
                let words = data['response'][q_name].replace(/\s\s+/g, ' ').split(" ")
                if (words.length > 0) {
                    if (words[words.length - 1] === " ") {
                        words.pop()
                    }
                    if (words[words.length - 1] === "") {
                        words.pop()
                    }
                }
                let n_words = words.length
                let empty_response = n_words < min_words

                currentUser_instance.empty_count += empty_response * 1
                // console.log('empty count: ', currentUser_instance.empty_count)

                // Process and prepare data for REDCap as extra fields
                var extraFields = {
                    // Response data
                    [`responses_${q_name}`]: data['response'],
                    [`is_empty_${q_name}`]: empty_response,
                    
                    // Response time and timeout data
                    [`rts_${q_name}`]: data['rt'],
                    [`timeout_${q_name}`]: data['timeout'],
                    
                    // User metrics
                    empty_count: currentUser_instance.empty_count,
                    timeout_count: currentUser_instance.timeout_count
                };

                // saveDataREDCap(3);

                // count warn about timeouts or empty responses
                if (data['timeout'] || empty_response) {
                    currentUser_instance.warning_count += 1
                    
                    if (currentUser_instance.warning_count > max_timeout && no_skip) {
                        var extraFields = {
                            completed: "Yes", 
                            returned: "Yes", 
                            code: 'WARNED'
                        }
                        saveDataREDCap(3);
                        jsPsych_instance.abortExperiment(return_timeout_text);
                    } else {
                        showAlert(jsPsych_instance, currentUser_instance);
                    }
                }
            }

        }

    }
}

// ----------------------------------------------------------
