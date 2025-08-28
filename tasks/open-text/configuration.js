// Configurations for open-text task

// Open-ended questions config
export const min_words = 30 // Minimum number of words required to write <=================== CHANGE FOR LIVE (def: 30)
export const qs_ans_required = false // obsolete boolean for requiring response
export const prevent_paste = true // prevent pasting text into box <=================== CHANGE FOR LIVE to TRUE (def: true)
export const writing_time = 120 // time in seconds to write a response (def: 90)
export const warning_time = 90 // warning X seconds before the time runs out (def: 30)
export const qs_read_time = 7 // extra time to read the question on top of the writing time (def: 7)
export const oq_timelimit_text = 'two minutes' // display the initial time to answer a question

// Boolean values
export const console_debug = true // whether to print to console
export const do_online = true // whether to run online or offline
export const no_skip = true // prevent skipping question if no response or timeout

// Error codes
export const no_consent_error = 'E_NC1' // return when no consent is given
export const prolific_ids_error = 'E_PID1' // Prolific IDS don't match
export const study_completed_error = 'E_SC1' // Study already completed before

// Usefuf duration and warning variables
export const timeout_alert_duration = 4 // duration of the timeout/empty alert
export const max_timeout = 5 // max number of timeouts or empty responses allowed (next one kicks ppt out). Effectively set to never kick out.
export const warning_text = `Didn't catch a response - moving on.`
export const warning_last_chance = `<br><br>This is your <b>last warning</b>, next time you <u>will be asked to return your submission.</u>`
