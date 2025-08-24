import { fullscreen_prompt, kick_out, updateState } from '/core/utils/index.js';
import { createPersistentCoinContainer, removePersistentCoinContainer, piggyBankTrial } from './utils.js';

// Create vigour timeline
// Generate trials for Vigour task
const VIGOUR_TRIALS = [{ "magnitude": 1, "ratio": 1, "trialDuration": 6825 }, { "magnitude": 2, "ratio": 8, "trialDuration": 6956 }, { "magnitude": 1, "ratio": 16, "trialDuration": 7228 }, { "magnitude": 5, "ratio": 1, "trialDuration": 7221 }, { "magnitude": 5, "ratio": 16, "trialDuration": 7261 }, { "magnitude": 2, "ratio": 1, "trialDuration": 7386 }, { "magnitude": 1, "ratio": 8, "trialDuration": 7009 }, { "magnitude": 5, "ratio": 8, "trialDuration": 7376 }, { "magnitude": 2, "ratio": 16, "trialDuration": 6666 }, { "magnitude": 1, "ratio": 1, "trialDuration": 6962 }, { "magnitude": 2, "ratio": 8, "trialDuration": 6501 }, { "magnitude": 2, "ratio": 1, "trialDuration": 7236 }, { "magnitude": 5, "ratio": 1, "trialDuration": 7490 }, { "magnitude": 1, "ratio": 16, "trialDuration": 6902 }, { "magnitude": 1, "ratio": 8, "trialDuration": 6888 }, { "magnitude": 2, "ratio": 16, "trialDuration": 6891 }, { "magnitude": 5, "ratio": 8, "trialDuration": 6535 }, { "magnitude": 5, "ratio": 16, "trialDuration": 6652 }, { "magnitude": 1, "ratio": 8, "trialDuration": 6890 }, { "magnitude": 5, "ratio": 8, "trialDuration": 7452 }, { "magnitude": 5, "ratio": 16, "trialDuration": 6954 }, { "magnitude": 2, "ratio": 1, "trialDuration": 6827 }, { "magnitude": 5, "ratio": 1, "trialDuration": 6679 }, { "magnitude": 1, "ratio": 16, "trialDuration": 7199 }, { "magnitude": 2, "ratio": 16, "trialDuration": 7207 }, { "magnitude": 1, "ratio": 1, "trialDuration": 7145 }, { "magnitude": 2, "ratio": 8, "trialDuration": 7465 }, { "magnitude": 1, "ratio": 8, "trialDuration": 6870 }, { "magnitude": 5, "ratio": 8, "trialDuration": 6726 }, { "magnitude": 2, "ratio": 16, "trialDuration": 6688 }, { "magnitude": 2, "ratio": 8, "trialDuration": 6506 }, { "magnitude": 5, "ratio": 1, "trialDuration": 7044 }, { "magnitude": 2, "ratio": 1, "trialDuration": 7293 }, { "magnitude": 1, "ratio": 1, "trialDuration": 7182 }, { "magnitude": 1, "ratio": 16, "trialDuration": 6862 }, { "magnitude": 5, "ratio": 16, "trialDuration": 6985 }];


export function createVigourTimeline(settings) {
    const experimentTimeline = [];
    VIGOUR_TRIALS.forEach(trial => {
        experimentTimeline.push({
            timeline: [kick_out, fullscreen_prompt, piggyBankTrial], 
            timeline_variables: [trial]
        });
    });

    experimentTimeline[0]["on_timeline_start"] = () => {
        updateState("no_resume_10_minutes");
        updateState(`vigour_task_start`);
        createPersistentCoinContainer();
    };

    experimentTimeline.at(-1)["on_timeline_finish"] = () => {
        removePersistentCoinContainer();
    };
    
    return experimentTimeline;
}

