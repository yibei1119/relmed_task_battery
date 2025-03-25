# RELMED probabilistic learning task pilot #8
This reposistory hosts the experiment website for the eighth pilot for RELMED (Internal name Pilot 8?), which includes PILT, Vigour, PIT, reversal, WM, control, and questionnaires. The task is coded with jsPsych.

However, only WM and Control will be tested for Pilot 8.

Data is written to REDCap via a call to an AWS lamda function.

## Files in this repository
```
.
├── consent.html - landing page, consent form.
├── experiment.html - main experiment script, participants are redirected here from conset.html
├── PILT.js - main script for PILT
├── PILT_instructions.js - instructions for PILT
├── plugin-PLT.js - plugin for PILT trial
├── pilot6_pilt.json - trial sequence for PILT
├── pilot6_pilt_test.json - trial sequence for PILT test phase
├── vigour.js - main vigour task script
├── vigour_instructions.js - vigour task 
├── visgour_styles.css - stylesheet for vigour task
├── post-vigour-test.js - script for post vigour task test
├── vigour.json - trial sequence for vigour task
├── reversal.js - main script for reversal task
├── PIT.js - main script for PIT transfer phase
├── questionnaires.js - main script for all the questionnaires
├── plugin-reversal.js - plugin for reversal trial
├── pilot4_reversal_sequence.js - trial sequence for reversal task
├── utils.js - functions and trial objects shared across tasks
├── jspsych - jsPsych library/
│   └── .
└── lambda - AWS lambda function scripts/
    └── .
```


<!-- LOADING-TEST-RESULTS -->

### 🧪 Can all tasks load?

| Session | Task | Status |
|---------|------|--------|
| screening | screening | ✅ Success |
| wk0 | pilt-to-test | ✅ Success |
| wk0 | reversal | ✅ Success |
| wk0 | control | ✅ Success |
| wk0 | wm | ✅ Success |
| wk2 | pilt-to-test | ✅ Success |
| wk2 | reversal | ✅ Success |
| wk2 | control | ✅ Success |
| wk2 | wm | ✅ Success |
| wk4 | pilt-to-test | ✅ Success |
| wk4 | reversal | ✅ Success |
| wk4 | control | ✅ Success |
| wk4 | wm | ✅ Success |
| wk24 | pilt-to-test | ✅ Success |
| wk24 | reversal | ✅ Success |
| wk24 | control | ✅ Success |
| wk24 | wm | ✅ Success |
| wk28 | pilt-to-test | ✅ Success |
| wk28 | reversal | ✅ Success |
| wk28 | control | ✅ Success |
| wk28 | wm | ✅ Success |
| wk0 | quests | ✅ Success |
| wk2 | quests | ✅ Success |
| wk4 | quests | ✅ Success |
| wk24 | quests | ✅ Success |
| wk28 | quests | ✅ Success |
| wk6 | quests | ✅ Success |
| wk8 | quests | ✅ Success |
| wk52 | quests | ✅ Success |

<!-- LOADING-TEST-RESULTS -->