// Script that specifies useful variables and defines jsPsych and user classes

// Open-ended questions config
let min_words = 30 // Minimum number of words required to write <=================== CHANGE FOR LIVE (def: 30)
let qs_ans_required = false // obsolete boolean for requiring response
let prevent_paste = false // prevent pasting text into box <=================== CHANGE FOR LIVE to TRUE (def: true)
let writing_time = 90 // time in seconds to write a response (def: 90)
let warning_time = 30 // warning X seconds before the time runs out (def: 30)
let qs_read_time = 7 // extra time to read the question on top of the writing time (def: 7)
let oq_timelimit_text = '1.5 minutes' // display the initial time to answer a question

// Useful variables for firebase and js psych
let subversion = ''
let firestore_task = 'relmed-toy' + subversion // firestore db task name
let base_url = "https://app.prolific.com/submissions/complete?cc=" // for prolific redirects
var dur_experiment = `19`; // duration of experiment in minutes for consent/PIS
var study_subname = 'Understanding introspection and self-report' // subtitle of the study for consent
let uid; // variable storing firebase uid

// Boolean values
let console_debug = true // whether to print to console
let do_online = true // whether to run online or offline
// let do_online = false // whether to run online or offline
let no_skip = true // prevent skipping question if no response or timeout

// let quick_consent = true // whether to do quick consent (1st option only required)
let quick_consent = false // whether to run online or offline
let run_sim = false // whether to run in simulation mode

// Error codes
let no_consent_error = 'E_NC1' // return when no consent is given
let prolific_ids_error = 'E_PID1' // Prolific IDS don't match
let study_completed_error = 'E_SC1' // Study already completed before

// Usefuf duration and warning variables
let timeout_alert_duration = 4 // duration of the timeout/empty alert
let max_timeout = 4 // max number of timeouts or empty responses allowed (next one kicks ppt out)
let warning_text = `You've timed out or haven't provided a full response!`
let warning_last_chance = `<br><br>This is your <b>last warning</b>, next time you <u>will be asked to return your submission.</u>`

// Initialise jsPsych
let my_jsPsych_init = function () {
    return initJsPsych({
        override_safe_mode: true,
    });
}

// User class for storing booleans etc for a given participant
class User {
    constructor(uid) {
        this.uid = uid;
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

    // Sets requisite IDs in class based on URL or random if not specified - adds to jsPsych data property
    get_ids(jsPsych_instance) {
        let prolificID = jsPsych_instance.data.getURLVariable('PROLIFIC_PID');
        let studyID = jsPsych_instance.data.getURLVariable('STUDY_ID')
        let sessionID = jsPsych_instance.data.getURLVariable('SESSION_ID')

        // handle empty URL variables
        if (prolificID == null || prolificID.toString().length === 0) {
            prolificID = Array.from(Array(20), () => Math.floor(Math.random() * 36).toString(36)).join('');
        }
        if (studyID == null || studyID.toString().length === 0) {
            studyID = Array.from(Array(20), () => Math.floor(Math.random() * 36).toString(36)).join('');
        }
        if (sessionID == null || sessionID.toString().length === 0) {
            sessionID = Array.from(Array(20), () => Math.floor(Math.random() * 36).toString(36)).join('');
        }
        this.PID = prolificID;
        this.ST_ID = studyID;
        this.SE_ID = sessionID;

        jsPsych_instance.data.addProperties({
            uid: this.uid,
            PID: prolificID,
            ST_ID: studyID,
            SE_ID: sessionID,
        })

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
            jsPsych_instance.data.addProperties({'lvl2_attention': catch_resp})
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

function startTimer_sec(duration, display, time_left, warning_time, min_instr = null) {
    /**
     * Starts a countdown timer that updates the display and manages visibility of UI elements.
     *
     * @param {number} duration - The total countdown duration in seconds.
     * @param {HTMLElement} display - The element showing the remaining time.
     * @param {HTMLElement} time_left - The element where the countdown time left is displayed.
     * @param {number} warning_time - The time left (in seconds) before which the countdown should become visible.
     * @param {HTMLElement|null} [min_instr=null] - An optional instruction element that gets hidden when the countdown starts.
     */
    var timer = duration, minutes, seconds;
    let timer_interval = setInterval(function () {
        seconds = parseInt(timer, 10);

        if (seconds <= warning_time && seconds > 0) {
            time_left.innerHTML = seconds
            display.style.visibility = 'visible'
            if (min_instr != null) {
                min_instr.style.visibility = "hidden"
            }
        } else if (seconds > warning_time && seconds > 0) {
            time_left.innerHTML = ''
            display.style.visibility = 'hidden'
        } else {
            time_left.innerHTML = ''
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
    document.getElementById('jspsych-experiment').innerHTML = alert_text

    let alertBox = document.getElementById("customAlert");
    alertBox.style.display = "block";  // Show the alert box

    jsPsych_instance.pauseExperiment()

    // Hide the alert  and resume Experiment after set time
    setTimeout(function () {
        alertBox.style.display = "none";
        jsPsych_instance.resumeExperiment()
    }, (timeout_alert_duration + extra_time) * 1000);
}