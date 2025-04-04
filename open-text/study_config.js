// Script that specifies useful variables and defines jsPsych and user classes

// Open-ended questions config
let min_words = 30 // Minimum number of words required to write <=================== CHANGE FOR LIVE (def: 30)
let qs_ans_required = false // obsolete boolean for requiring response
let prevent_paste = true // prevent pasting text into box <=================== CHANGE FOR LIVE to TRUE (def: true)
let writing_time = 120 // time in seconds to write a response (def: 90)
let warning_time = 90 // warning X seconds before the time runs out (def: 30)
let qs_read_time = 7 // extra time to read the question on top of the writing time (def: 7)
let oq_timelimit_text = 'two minutes' // display the initial time to answer a question

// Boolean values
let console_debug = true // whether to print to console
let do_online = true // whether to run online or offline
// let do_online = false // whether to run online or offline
let no_skip = true // prevent skipping question if no response or timeout

let run_sim = false || window.participantID.includes('simulate') // whether to run in simulation mode

// Error codes
let no_consent_error = 'E_NC1' // return when no consent is given
let prolific_ids_error = 'E_PID1' // Prolific IDS don't match
let study_completed_error = 'E_SC1' // Study already completed before

// Usefuf duration and warning variables
let timeout_alert_duration = 4 // duration of the timeout/empty alert
let max_timeout = 4 // max number of timeouts or empty responses allowed (next one kicks ppt out)
let warning_text = `You've timed out or haven't provided a full response!`
let warning_last_chance = `<br><br>This is your <b>last warning</b>, next time you <u>will be asked to return your submission.</u>`

// User class for storing booleans etc for a given participant
class User {
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


function separateWords(input, counter, div_counter, submit_bttn, q_name, jsPsych_instance) {
    /**
     * Processes the input text, counts words, and controls UI elements based on the word count.
     * Handles attention checks for specific question types.
     *
     * @param {HTMLInputElement} input - The text input field containing user input.
     * @param {HTMLElement} counter - The element displaying the remaining word count.
     * @param {HTMLElement} div_counter - The UI element that shows or hides the word count message.
     * @param {HTMLElement} submit_bttn - The submit button that becomes visible when the minimum word count is met.
     * @param {string} q_name - The identifier of the current question, used to check for special cases.
     * @param {Object} jsPsych_instance - The jsPsych instance used for adding experimental data.
     */
    // process text input
    let text = input.value
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

    if (words.length >= min_words) {
        submit_bttn.style.visibility = "visible"
        div_counter.style.visibility = "hidden"
        counter.innerHTML = 0
    } else {
        if (q_name === 'lvl2_q_catch') {
            submit_bttn.style.visibility = "hidden"
            div_counter.style.visibility = "visible"
            counter.innerHTML = min_words - words.length

            // attention check case
            let catch_resp = input.value.replace(/\s+/g, ' ').trim() === lvl2_catch_ans
            jsPsych_instance.data.addProperties({ 'lvl2_attention': catch_resp })
            if (catch_resp) {
                submit_bttn.style.visibility = "visible"
                div_counter.style.visibility = "hidden"
            } else {
                submit_bttn.style.visibility = "hidden"
                div_counter.style.visibility = "visible"
            }
        } else {
            submit_bttn.style.visibility = "hidden"
            div_counter.style.visibility = "visible"
            counter.innerHTML = min_words - words.length
        }
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

function showAlert(jsPsych_instance, currentUser_instance) {
    /**
     * Displays a custom alert warning the user about timeouts and pauses the experiment.
     * Resumes the experiment after a set duration.
     *
     * @param {Object} jsPsych_instance - The jsPsych instance managing the experiment.
     * @param {Object} currentUser_instance - The current user object, which contains the warning count.
     */

    let alert_text = `
                   <div id="customAlert">
                   ` + warning_text + `<br> You have used <b>` + currentUser_instance.warning_count + ` out of ` + (max_timeout) + ` chances</b>.
                   `
    let extra_time = 0
    if (currentUser_instance.warning_count === max_timeout) {
        alert_text += warning_last_chance + '<br><br>The experiment will resume shortly.</div>'
        extra_time = 2
    } else {
        alert_text += '<br><br>The experiment will resume shortly.</div>'
    }
    document.getElementById('jspsych-content').innerHTML = alert_text

    let alertBox = document.getElementById("customAlert");
    alertBox.style.display = "block";  // Show the alert box

    jsPsych_instance.pauseExperiment()

    // Hide the alert  and resume Experiment after set time
    setTimeout(function () {
        alertBox.style.display = "none";
        jsPsych_instance.resumeExperiment()
    }, (timeout_alert_duration + extra_time) * 1000);
}