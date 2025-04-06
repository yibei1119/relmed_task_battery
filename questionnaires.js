// Label for questionnaires
var likert_phq = [
    "Not at all",
    "Several days",
    "More than half the days",
    "Nearly every day"
];
var likert_gad = [
    "Not at all",
    "Several days",
    "More than half the days",
    "Nearly every day"
];
var likert_WSAS = [
    "Not at all",
    "",
    "Slightly",
    "",
    "Definitely",
    "",
    "Markedly",
    "",
    "Very severely"
];
var multichoice_ICECAP = [
    [
        "I am able to feel settled and secure in <b>all</b> areas of my life",
        "I am able to feel settled and secure in <b>many</b> areas of my life",
        "I am able to feel settled and secure in <b>a few</b> areas of my life",
        "I am <b>unable</b> to feel settled and secure in <b>any</b> areas of my life"
    ],
    [
        "I can have <b>a lot</b> of love, friendship and support",
        "I can have <b>quite a lot</b> of love, friendship and support",
        "I can have <b>a little</b> love, friendship and support",
        "I <b>cannot</b> have <b>any</b> love, friendship and support"
    ],
    [
        "I am able to be <b>completely</b> independent",
        "I am able to be independent in <b>many</b> things",
        "I am able to be independent in <b>a few</b> things",
        "I am <b>unable</b> to be at all independent"
    ],
    [
        "I can achieve and progress in <b>all</b> aspects of my life",
        "I can achieve and progress in <b>many</b> aspects of my life",
        "I can achieve and progress in <b>a few</b> aspects of my life",
        "I <b>cannot</b> achieve and progress in <b>any</b> aspects of my life"
    ],
    [
        "I can have <b>a lot</b> of enjoyment and pleasure",
        "I can have <b>quite a lot</b> of enjoyment and pleasure",
        "I can have a <b>little</b> enjoyment and pleasure",
        "I <b>cannot</b> have <b>any</b> enjoyment and pleasure"
    ]
];
var likert_BFI = [
    "Disagree strongly",
    "Disagree a little",
    "Neither agree nor disagree",
    "Agree a little",
    "Agree strongly"
];
var likert_pvss = [
    "Extremely untrue of me",
    "Very untrue of me",
    "Moderately untrue of me",
    "Slightly untrue of me",
    "Neutral",
    "Slightly true of me",
    "Moderately true of me",
    "Very true of me",
    "Extremely true of me"
];
var likert_BADS = [
    "Not at all",
    "",
    "A little",
    "",
    "A lot",
    "",
    "Completely"
];
var likert_hopelessness = [
    "Absolutely agree",
    "Somewhat agree",
    "Cannot say",
    "Somewhat disagree",
    "Absolutely disagree"
];
var likert_RRS_brooding = [
    "Almost never",
    "Sometimes",
    "Often",
    "Almost always"
];
var likert_PERS_negAct = [
    "Very unlike me",
    "Somewhat unlike me",
    "Neither like nor unlike me",
    "Somewhat like me",
    "Very like me"
];

// Prompts for questionnaires

var prompt_gad = [
    "Feeling nervous, anxious or on edge",
    "Not being able to stop or control worrying",
    "Worrying too much about different things",
    "Trouble relaxing",
    "Being so restless that it is hard to sit still",
    "Becoming easily annoyed or irritable",
    "Worrying about the 1974 Eurovision Song Contest", // Catch-
    "Feeling afraid as if something awful might happen"
];

var prompt_WSAS = [
    "Because of my depression my <b>ability to work</b> is impaired. '0' means 'not at all impaired' and '8' means very severely impaired to the point I can't work.",
    "Because of my depression my <b>home management</b> (cleaning, tidying, shopping, cooking, looking after home or children, paying bills) is impaired.",
    "Because of my depression my <b>social leisure activities</b> (with other people e.g. parties, bars, clubs, outings, visits, dating, home entertaining) are impaired.",
    "Because of my depression, my <b>private leisure activities</b> (done alone, such as reading, gardening, collecting, sewing, walking alone) are impaired.",
    "Because of my depression, my ability to form and maintain <b>close relationships</b> with others, including those I live with, is impaired."
];

var prompt_ICECAP = [
    "Feeling settled and secure",
    "Love, friendship and support",
    "Being independent",
    "Achievement and progress",
    "Enjoyment and pleasure"
];

var prompt_BFI = [ 
    "I see myself as someone who is reserved",
    "I see myself as someone who is generally trusting",
    "I see myself as someone who tends to be lazy",
    "I see myself as someone who is relaxed, handles stress well",
    "I see myself as someone who has few artistic interests",
    "I see myself as someone who is outgoing, sociable",
    "I see myself as someone who tends to find fault with others",
    "I see myself as someone who does a thorough job",
    "I see myself as someone who gets nervous easily",
    "I see myself as someone who has an active imagination"
];

var prompt_BADS = [
    "There were certain things I needed to do that I didn't do",
    "I am content with the amount and types of things I did.",
    "I engaged in many different activities.",
    "I made good decisions about what type of activities and/or situations I put myself in.",
    "I was an active person and accomplished the goals I set out to do.",
    "Most of what I did was to escape from or avoid something unpleasant.",
    "I was able to lift my coffee cup or water glass when drinking.", // Catch+
    "I spent a long time thinking over and over about my problems.",
    "I engaged in activities that would distract me from feeling bad.",
    "I did things that were enjoyable."
];

var prompt_hopelessness = [
    "The future seems to me to be hopeless and I can't believe that things are changing for the better.",
    "I feel that it is impossible to reach the goals I would like to strive for."
];

var prompt_RRS_brooding = [
    'think "What am I doing to deserve this?"',
    'think "Why do I always react this way?"',
    'think about a recent situation, wishing it had gone better',
    'think "Why do I have problems other people don\'t have?"',
    'think "Why can\'t I handle things better?"'
];

var prompt_PERS_negAct = [
    "I tend to get upset very easily",
    "I tend to get disappointed very easily",
    "I tend to get frustrated very easily",
    "My emotions go from neutral to negative very quickly",
    "I tend to get pessimistic about negative things very quickly"
];

// Questionnaires

var questionnaire_phq = (i,total) => {
    return {
        type: jsPsychSurveyTemplate,
        instructions: [`<h2>Questionnaire ${i} out of ${total}</h2>` +
            "<p>Over the <u>last 2 weeks</u>, how often have you been bothered by any of the following problems?</p>" +
            "<p>Please respond to all items.</p>"
        ],
        items: [
            "Little interest or pleasure in doing things",
            "Feeling down, depressed, or hopeless", // Catch-origin
            "Trouble falling or staying asleep, or sleeping too much",
            "Feeling tired or having little energy",
            "Poor appetite or overeating",
            "Feeling bad about yourself - or that you are a failure or have let yourself or your family down",
            "Trouble concentrating on things, such as reading the newspaper of watching television",
            "Moving or speaking so slowly that other people have noticed, or the opposite - being so fidgety or restless that you have been moving around a lot more than usual",
            "Experiencing sadness or a sense of despair", // Catch
            "Thoughts that you would be better off dead, or of hurting yourself in some way",
        ],
        scale: likert_phq,
        survey_width: 700,
        data: {
            trialphase: "PHQ"
        },
        on_start: () => {
            updateState("PHQ_start");
        }
    };
};

var questionnaire_gad = (i,total) => {
    return {
        type: jsPsychSurveyTemplate,
        instructions: [`<h2>Questionnaire ${i} out of ${total}</h2>` +
            "<p>Over the <u>last 2 weeks</u>, how often have you been bothered by following problems?</p>"
        ],
        items: prompt_gad,
        scale: likert_gad,
        survey_width: 700,
        data: {
            trialphase: "GAD"
        },
        on_start: () => {
            updateState("GAD_start");
        }
    };
};

// questions_WSAS.unshift({prompt: "If you're retired or choose not to have a job for reasons unrelated to your problem, tick here", labels: [""], required: false});
var questionnaire_WSAS = (i,total) => {
    return {
        type: jsPsychSurveyTemplate,
        instructions: [`<h2>Questionnaire ${i} out of ${total}</h2>` +
            "<p>People's problems sometimes affect their ability to do certain day-to-day tasks in their lives. To rate your problems look at each section and determine on the scale provided how much your problem impairs your ability to carry out the activity. This assessment is not intended to be a diagnosis. If you are concerned about your results in any way, please speak with a qualified health professional.</p>" +
            '<div style="border: 2px solid #000; padding: 10px; display: inline-block; background-color: #f9f9f9; border-radius: 5px;"><label style="display: inline-flex; align-items: center;">If you\'re retired or choose not to have a job for reasons unrelated to your problem, tick here&nbsp<input type="checkbox" id="retiredCheck" style="margin-left: 5px;"></label></div>'
        ],
        items: prompt_WSAS,
        scale: likert_WSAS,
        survey_width: 800,
        item_width: 37,
        data: {
            trialphase: "WSAS"
        },
        before_finish: (data) => {
            let checkbox = document.getElementById("retiredCheck");

            // When running in node.js, checkbox == null
            if (checkbox != null){
                data['responses']['retired_check'] = checkbox.checked;
            }
            
            // Return details for questionnaire requirement document
            return {
                variable_name: "retired_check",
                type: "Checkbox",
                text: 'If you\'re retired or choose not to have a job for reasons unrelated to your problem, tick here',
                possible_values: "true<br>false"
            }
        },
        on_start: () => {
            updateState("WSAS_start");
        }
    };
};

var questionnaire_ICECAP = (i,total) => {
    return {
        type: jsPsychSurveyMultiChoice,
        preamble: [`<h2>Questionnaire ${i} out of ${total}</h2>` +
            "<p>Please indicate which statements best describe your overall quality of life at the moment by choosing ONE option for each of the five groups below.</p>"
        ],
        css_classes: ['instructions'],
        questions: prompt_ICECAP.map((prompt, index) => ({
            prompt: prompt,
            options: multichoice_ICECAP[index],
            required: true
        })),
        scale_width: 700,
        data: {
            trialphase: "ICECAP"
        },
        on_start: () => {
            updateState("ICECAP_start");
        }
    };    
};

var questionnaire_BFI = (i,total) => {
    return {
        type: jsPsychSurveyTemplate,
        instructions: [`<h2>Questionnaire ${i} out of ${total}</h2>` +
            "<p>How well do the following statements describe your personality?</p>"
        ],
        items: prompt_BFI,
        scale: likert_BFI,
        survey_width: 700,
        data: {
            trialphase: "BFI"
        },
        on_start: () => {
            updateState("BFI_start");
        }
    };
};

var questionnaire_pvss = (i,total) => {
    return {
        type: jsPsychSurveyTemplate,
        instructions: [`<h2>Questionnaire ${i} out of ${total}</h2>` +
            '<p class="instructions">Please indicate to what extent these statements describe your <b><u>responses over the last two weeks, including today.</u></br>' +
            'Did you NOT have this experience? No problem. Please indicate how you <u>would have responded</u> if you had experienced the situation over the last two weeks.</b></br>' +
            'Please consider only the aspect of the situation that is described, paying particular attention to the <u>underlined text</u>. For example, if the statement says, "<u>I wanted</u> to meet new people," rate how much you wanted or would have wanted to meet new people over the last two weeks, assuming that the opportunity presented itself. Do not consider what the situation would have required of you or whether it would have been possible for you to meet people.</p>'
        ],
        items: [
            'I <u>savoured</u> my first bite of food after feeling hungry',
            'I <u>put energy</u> into activities I enjoy',
            'I <u>was delighted</u> to catch a breath of fresh air outdoors',
            'I <u>wanted</u> to spend time with people I know',
            'A fun activity during the weekend sustained my good mood <u>throughout the new week</u>',
            'It <u>felt good</u> to have physical contact with someone I felt close to',
            'I <u>expected</u> to enjoy a brief moment outdoors',
            'I <u>looked forward</u> to hearing feedback on my work',
            'I <u>expected</u> to enjoy my meals',
            'Receiving praise about my work made me feel pleased <u>for the rest of the day</u>',
            'I <u>looked forward</u> to spending time with others',
            'I <u>wanted</u> to accomplish goals I set for myself',
            'I <u>expected</u> to enjoy being hugged by someone I love',
            'I <u>wanted</u> to participate in a fun activity with friends', // Catch-origin
            'I <u>worked hard</u> to earn positive feedback on my projects',
            'I <u>looked forward</u> to an upcoming meal',
            'I <u>felt pleased</u> when I reached a goal I set for myself',
            'Getting a hug from someone close to me made me happy <u>even after</u> we parted',
            'I <u>expected</u> to master the tasks I undertook',
            "I felt like engaging in enjoyable activities with people I'm close to", // Catch
            'I <u>actively pursued</u> activities I thought would be fun',
            'I <u>went out of my way</u> to admire the beauty around me',
        ],
        scale: likert_pvss,
        survey_width: 900,
        item_width: 25,
        scale_repeat: 5,
        data: {
            trialphase: "PVSS"
        },
        on_start: () => {
            updateState("pvss_start");
        }
    };
};

var questionnaire_BADS = (i,total) => {
    return {
        type: jsPsychSurveyTemplate,
        instructions: [`<h2>Questionnaire ${i} out of ${total}</h2>` +
            "<p>Please read each statement carefully and then circle the number which best describes how much the statement was true for you DURING THE PAST WEEK, INCLUDING TODAY.</p>"
        ],
        items: prompt_BADS,
        scale: likert_BADS,
        survey_width: 800,
        item_width: 33,
        data: {
            trialphase: "BADS"
        },
        on_start: () => {
            updateState("BADS_start");
        }
    };
};


var questionnaire_hopelessness = (i,total) => {
    return {
        type: jsPsychSurveyTemplate,
        instructions: [`<h2>Questionnaire ${i} out of ${total}</h2>` +
            "<p>For each of the statements below, please choose the option that best applies to you.</p>"
        ],
        items: prompt_hopelessness,
        scale: likert_hopelessness,
        survey_width: 800,
        item_width: 40,
        data: {
            trialphase: "Hopelessness"
        },
        on_start: () => {
            updateState("hopelessness_start");
        }
    };
};

var questionnaire_RRS_brooding = (i,total) => {
    return {
        type: jsPsychSurveyTemplate,
        instructions: [`<h2>Questionnaire ${i} out of ${total}</h2>` +
            "<p>People think and do many different things when they feel depressed. Please read each of the items below and indicate whether you almost never, sometimes, often, or almost always think or do each one when you feel down, sad, or depressed. Please indicate what you generally do, not what you think you should do.</p>"
        ],
        items: prompt_RRS_brooding,
        scale: likert_RRS_brooding,
        survey_width: 700,
        data: {
            trialphase: "RRS_brooding"
        },
        on_start: () => {
            updateState("RRS_brooding_start");
        }
    };
}; 

const questionnaire_PERS_negAct = (i, total) => {
    return {
        type: jsPsychSurveyTemplate,
        instructions: [`<h2>Questionnaire ${i} out of ${total}</h2>` +
            "<p>This questionnaire is designed to measure different aspects of how you typically react to experiencing emotional events. Please score the following statements according to how much they apply or do not apply to you on a typical day.</p>"
        ],
        items: prompt_PERS_negAct,
        scale: likert_PERS_negAct,
        survey_width: 700,
        item_width: 40,
        data: {
            trialphase: "PERS_negAct"
        },
        on_start: () => {
            updateState("PERS_negAct_start");
        }
    };
}; 

let questionnaires_instructions = (total) => {
    return [
        {
            type: jsPsychInstructions,
            css_classes: ['instructions'],
            pages: [
                `<p>Please answer the following ${total} questionnaires.</p>` +
                `<p>Each questionnaire will be presented on a separate page.</p>` +
                `<p>Your responses are important, and we ask that you carefully read each question and answer as accurately and thoughtfully as possible.</p>` +
                `<p>Please take your time with each item, and remember that there are no “right” or “wrong” answers. Your honest and thorough responses will help us gather meaningful data.</p>` +
                `<p>Click 'Next' to begin.</p>`
            ],
            on_start: () => {
                updateState("quests_instructions_start");
            },
            on_finish: () => {
                updateState("quests_start");
            },
            show_clickable_nav: true,
            data: {trialphase: "pre_questionnaire_instructions"},
            simulation_options:{
                simulate: false
            }
        }
    ];
} 

/**
 * Creates a timeline of questionnaires and configures the last questionnaire to update the state to "no_resume".
 * 
 * @param {Array<Function>} questionnaires - An array of questionnaire functions, each of which when called with 
 * a number and total, returns a jsPsych trial object.
 * @returns {Array<Object>} questionnaire_timeline - An array of jsPsych trial objects representing the questionnaires.
 * 
 * @description
 * Each questionnaire function is called with two parameters:
 * 1. Its position in the sequence (1-indexed)
 * 2. The total number of questionnaires
 * 
 * The last questionnaire in the timeline is modified to call `updateState("no_resume")` when it starts,
 * which prevents the experiment from being resumed after the questionnaires are completed.
 */
const instantiate_questionnaires = (questionnaires) => {
    let questionnaire_timeline = [];
    questionnaires.forEach((questionnaire, i) => {
        questionnaire_timeline.push(questionnaire(i+1, questionnaires.length));
    });

    // Add updateState("no_resume") to the on_start function of the last questionnaire
    if (questionnaire_timeline.length > 0) {
        const lastQuestionnaireIndex = questionnaire_timeline.length - 1;
        const originalOnStart = questionnaire_timeline[lastQuestionnaireIndex].on_start;
        
        questionnaire_timeline[lastQuestionnaireIndex].on_start = () => {
            updateState("no_resume");
            if (originalOnStart) {
                originalOnStart();
            }
        };
    }
    

    return questionnaire_timeline;
}


// Export if run by node.js, for generating requirement document
if (typeof module !== 'undefined' && module.exports) {
    // Export for Node.js validation
    module.exports = {
        PHQ9: questionnaire_phq,
        GAD7: questionnaire_gad,
        WSAS: questionnaire_WSAS,
        ICECAP: questionnaire_ICECAP,
        PVSS: questionnaire_pvss,
        BADS: questionnaire_BADS,
        hopelessness: questionnaire_hopelessness,
        RRS_brooding: questionnaire_RRS_brooding,
        PERS_negAct: questionnaire_PERS_negAct,
        BFI: questionnaire_BFI
    };
} else {
    // Build questionnaires timeline
    let questionnaires_timeline = [];

    if (window.session === "screening"){
        // Self-report battery A
        let included_questionnaires = [];

        if (resumptionRule(screening_order, window.last_state, "PHQ9_start")){
            included_questionnaires.push(questionnaire_phq);
        }

        if (resumptionRule(screening_order, window.last_state, "WSAS_start")){
            included_questionnaires.push(questionnaire_WSAS);
        }

        if (resumptionRule(screening_order, window.last_state, "ICECAP_start")){
            included_questionnaires.push(questionnaire_ICECAP);
        }

        if (resumptionRule(screening_order, window.last_state, "BFI_start")){
            included_questionnaires.push(questionnaire_BFI);
        }

        // Instantiate timeline
        questionnaires_timeline = questionnaires_instructions(included_questionnaires.length).concat(
            instantiate_questionnaires(included_questionnaires)
        );

    } else if (window.task === "quests" && ["wk0", "wk2", "wk4", "wk28"].includes(window.session)) {
        // Self-report battery B

        let included_questionnaires = [];

        if (resumptionRule(quests_order, window.last_state, "PHQ9_start")){
            included_questionnaires.push(questionnaire_phq);
        }

        if (resumptionRule(quests_order, window.last_state, "GAD7_start")){
            included_questionnaires.push(questionnaire_gad);
        }

        if (resumptionRule(quests_order, window.last_state, "PVSS_start")){
            included_questionnaires.push(questionnaire_pvss);
        }

        if (resumptionRule(quests_order, window.last_state, "BADS_start")){
            included_questionnaires.push(questionnaire_BADS);
        }

        if (resumptionRule(quests_order, window.last_state, "hopelessness_start")){
            included_questionnaires.push(questionnaire_hopelessness);
        }

        if (resumptionRule(quests_order, window.last_state, "RRS_brooding_start")){
            included_questionnaires.push(questionnaire_RRS_brooding);
        }

        if (resumptionRule(quests_order, window.last_state, "PERS_negAct_start")){
            included_questionnaires.push(questionnaire_PERS_negAct);
        }

        // Instantiate timeline
        questionnaires_timeline = questionnaires_instructions(included_questionnaires.length).concat(
            instantiate_questionnaires(included_questionnaires)
        );

    } else if (window.task === "quests"){

        let included_questionnaires = [];

        // Self-report battery C
        if (resumptionRule(quests_order, window.last_state, "PHQ9_start")){
            included_questionnaires.push(questionnaire_phq);
        }

        if (resumptionRule(quests_order, window.last_state, "GAD7_start")){
            included_questionnaires.push(questionnaire_gad);
        }

        if (resumptionRule(quests_order, window.last_state, "WSAS_start")){
            included_questionnaires.push(questionnaire_WSAS);
        }

        if (resumptionRule(quests_order, window.last_state, "ICECAP_start")){
            included_questionnaires.push(questionnaire_ICECAP);
        }

        if (resumptionRule(quests_order, window.last_state, "PVSS_start")){
            included_questionnaires.push(questionnaire_pvss);
        }

        if (resumptionRule(quests_order, window.last_state, "BADS_start")){
            included_questionnaires.push(questionnaire_BADS);
        }

        if (resumptionRule(quests_order, window.last_state, "hopelessness_start")){
            included_questionnaires.push(questionnaire_hopelessness);
        }

        if (resumptionRule(quests_order, window.last_state, "RRS_brooding_start")){
            included_questionnaires.push(questionnaire_RRS_brooding);
        }

        if (resumptionRule(quests_order, window.last_state, "PERS_negAct_start")){
            included_questionnaires.push(questionnaire_PERS_negAct);
        }

        // Instantiate timeline
        questionnaires_timeline = questionnaires_instructions(included_questionnaires.length).concat(
            instantiate_questionnaires(included_questionnaires)
        );

    }
}
