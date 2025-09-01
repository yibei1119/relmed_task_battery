
// Data saving function
import { saveDataREDCap } from '/core/utils/index.js'; // or wherever this is defined


// User class for storing booleans etc for a given participant
export class User {
    constructor() {
        this.consent = null
        this.attention_check1 = 0
        this.attention_check2 = 0
        this.attention_check = 0
        this.empty_responses = false
        this.timeout_count = 0
        this.empty_count = 0
        this.warning_count = 0
        this.last_checked = null
    }
}


function separateWords(input, counter, div_counter, submit_bttn, settings) {
    /**
     * Processes the input text, counts words, and controls UI elements based on the word count.
     * Handles attention checks for specific question types.
     *
     * @param {HTMLInputElement} input - The text input field containing user input.
     * @param {HTMLElement} counter - The element displaying the remaining word count.
     * @param {HTMLElement} div_counter - The UI element that shows or hides the word count message.
     * @param {HTMLElement} submit_bttn - The submit button that becomes visible when the minimum word count is met.
     */
    // process text input
    let text = input.value
    text = text.replace(/\s\s+/g, ' ');

    // Replace commas, semi-colons, and periods with spaces
    text = text.replace(/[,;.]/g, ' ');
    
    // Replace multiple spaces with a single space
    text = text.replace(/\s\s+/g, ' ');

    // count words
    let words = text.split(" ");
    if (words.length > 0) {
        if (words[words.length - 1] === " ") {
            words.pop()
        }
        if (words[words.length - 1] === "") {
            words.pop()
        }
    }

    if (words.length >= settings.min_words) {
        submit_bttn.style.visibility = "visible"
        div_counter.style.visibility = "hidden"
        counter.innerHTML = 0
    } else {
        submit_bttn.style.visibility = "hidden"
        div_counter.style.visibility = "visible"
        counter.innerHTML = settings.min_words - words.length
    }
};

function startTimer_sec(duration, display, warning_time, min_instr = null) {
    /**
     * Shows a timeout soon warning.
     *
     * @param {number} duration - The total countdown duration in seconds.
     * @param {HTMLElement} display - The element showing the remaining time.
     * @param {number} warning_time - The time left (in seconds) before which the countdown should become visible.
     * @param {HTMLElement|null} [min_instr=null] - An optional instruction element that gets hidden when the countdown starts.
     */
    var timer = duration, minutes, seconds;
    let timer_interval = setInterval(function () {
        seconds = parseInt(timer, 10);

        if (seconds <= warning_time && seconds > 0) {
            display.style.visibility = 'visible'
            if (min_instr != null) {
                min_instr.style.visibility = "hidden"
            }
        } else if (seconds > warning_time && seconds > 0) {
            display.style.visibility = 'hidden'
        } else {
            display.style.visibility = 'hidden'
        }

        if (--timer < 0) {
            // timer = duration;
            timer = 0;
        }
    }, 1000);
}

function showAlert(settings) {
    /**
     * Displays a custom alert warning the user about timeouts and pauses the experiment.
     * Resumes the experiment after a set duration.
     */

    let alert_text = `
                   <div id="customAlert">
                   ` + settings.warning_text 
    document.getElementById('jspsych-content').innerHTML = alert_text

    let alertBox = document.getElementById("customAlert");
    alertBox.style.display = "block";  // Show the alert box

    jsPsych.pauseExperiment()

    // Hide the alert  and resume Experiment after set time
    setTimeout(function () {
        alertBox.style.display = "none";
        jsPsych.resumeExperiment()
    }, (settings.timeout_alert_duration) * 1000);
}

// ------------> Generic content for questions <---------------

/*
Question preamble with instructions for the specific question
Displays: question counter (q out of Q); time limit and time remaining
*/
const questionPreamble = (settings) => {
    return `<div id="qs_preamble"><p id="qs_preamble_q_p"><u>Question <span id="qs_preamble_q_no"></span> of <span id="qs_preamble_q_max"></span></u></p>
        <h4>` + "Please type your answer in detail in the box below." + `</h4>
        <p id="qs_preamble_disclosure">(You have <b>` + settings.oq_timelimit_text + `</b> to answer)</p>
        <div id="qs_timeleft">
        Your time will soon be over. Don't forget to submit your answer!
        </div>
        </div>`
}

// Word counter information for ppt
export const timeWord = (settings) => {
    return `<div id="qs_words">
    Please write at least <span id="qs_words_left">` + settings.min_words + `</span> more words.
    </div>
    `
}

// Once the minimum number of words is reached, display submit button
let lvl_x_question_button_label = "Submit answer"

// ------------> RELMED open-ended questions <---------------

// If you want to have a catch question
let lvl2_catch_ans = 'catch response'

// ------------> Open question trial function <---------------
/*

*/
export function question_trial(qs_list, q_index = 0, q_count, currentUser_instance, settings) {
    /**
     * Creates a jsPsych survey text trial with various UI enhancements and validation mechanisms.
     *
     * @param {Array} qs_list - List of question objects containing question details.
     * @param {number} [q_index=0] - Index of the current question in the list.
     * @param {number} q_count - The current question number in the experiment sequence.
     * @param {Object} currentUser_instance - Object representing the current user session and progress.
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
    const nQ = qs_list.length

    console.log(1000 * (settings.writing_time + settings.qs_read_time))
    
    return {
        type: jsPsychOpenText,
        preamble: questionPreamble(settings),
        button_label: lvl_x_question_button_label,
        questions: [qs_list[q_index]],
        css_classes: ['lvlx_qs'],
        trial_duration: 1000 * (settings.writing_time + settings.qs_read_time),
        data: {trialphase: 'open-text'},
        on_load: function () {
            // preamble margin-top style if in simulation mod
            if (!window.simulating) {
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
                startTimer_sec(settings.writing_time, time_display, settings.warning_time, minute_instr)

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



                // get the word counter relevant elements
                let my_txt_area = document.getElementsByTagName('textarea')[0]
                let counter = document.getElementById('qs_words_left')
                let div_counter = document.getElementById('qs_words')
                let submit_bttn = document.getElementById('jspsych-survey-text-next')

                // hide submit button at the start
                submit_bttn.style.visibility = "hidden"

                // prevent pasting into textbox
                if (settings.prevent_paste) {
                    my_txt_area.addEventListener('paste', e => e.preventDefault());
                }

                // Checkbox alert object
                let alert_el = document.getElementById('formAlert')

                // Enable word counting by attaching the counter function to the textbox event listener
                my_txt_area.addEventListener('input', function () {
                    separateWords(my_txt_area, counter, div_counter, submit_bttn, settings);
                })
            }


        },
        on_finish: function (data) {
            let q_name = qs_list[q_index]['name']
           
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
            let empty_response = n_words < settings.min_words

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
                
                if (currentUser_instance.warning_count > settings.max_timeout && settings.no_skip) {
                    var extraFields = {
                        completed: "Yes", 
                        returned: "Yes", 
                        code: 'WARNED'
                    }
                    saveDataREDCap(3);
                    jsPsych.abortExperiment(return_timeout_text);
                } else {
                    showAlert(settings);
                }
            }

        }

    }
}

// ----------------------------------------------------------
