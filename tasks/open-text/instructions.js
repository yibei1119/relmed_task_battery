import { 
    oq_timelimit_text, 
    min_words
} from "./configuration.js"

import { updateState } from "/core/utils/index.js"

// ------------> Instruction texts <---------------


// Page 2
const instr_page2 = `
    <p><b>Next, you'll be answering questions by typing text responses.</b></p>
    <p>These questions will ask about yourself, your feelings, background, attitudes, and everyday behaviors.</p>
    <p>For each question, you'll have <b>`+oq_timelimit_text+`</b> to write a response containing <b>at least `+min_words.toString()+` words</b>.</p>
`


// Page 5
const instr_page5 = `
    <p>You may notice that some questions appear to be similar or repetitive. This is intentional - <b>please answer each question carefully and thoroughly.</b></p>
    `


// All pages
let instr_pages = [instr_page2, instr_page5]

export function openTextInstructions(settings) {
    return {
        type: jsPsychInstructions,
        pages: instr_pages,
        css_classes: ['instructions'],
        show_clickable_nav: true,
        button_label_previous: 'Back',
        button_label_next: 'Next',
        allow_keys: false,
        simulation_options: {
            data: {
                rt: 1000
            }
        },
        on_start: function(trial) {
            if (window.simulating) {
                trial.allow_keys = true;
                trial.key_forward = ' ';
            }
        },
        on_page_change: function (current_page) {
            let next_button_element = document.querySelector('button#jspsych-instructions-next')
            if (current_page === instr_pages.length - 1) {
                next_button_element.innerHTML = '<b><u>Start answering questions</u></b>'
            }
        },
        show_page_number: true,
        on_finish: () => {
            if (["wk24", "wk28"].includes(settings.session)){
                updateState("no_resume");
            }
            updateState("open_text_task_start");
        }
    }
} 
