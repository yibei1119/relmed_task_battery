// api/task-registry.js
// This module defines a registry for tasks in the API, allowing for easy management and execution of tasks.

import { computeRelativeCardChoosingBonus, createCardChoosingTimeline, createPostLearningTestTimeline } from '/tasks/card-choosing/index.js';
import { createDelayDiscountingTimeline } from '/tasks/delay-discounting/index.js';
import { createMaxPressTimeline } from '/tasks/max-press-test/task.js';
import { createVigourTimeline, computeRelativePiggyTasksBonus, createPITTimeline } from '/tasks/piggy-banks/index.js';
import { createPavlovianLotteryTimeline } from '/tasks/pavlovian-lottery/task.js';
import { createControlTimeline, computeRelativeControlBonus } from '/tasks/control/index.js';
import { loadSequence, loadCSS } from '/core/utils/index.js';
import { createOpenTextTimeline } from '/tasks/open-text/index.js';
import { createReversalTimeline, computeRelativeReversalBonus } from '/tasks/reversal/index.js';

export const TaskRegistry = {
  PILT: {
    name: 'PILT',
    description: 'A task measuring probabilistic instrumental learning in a card choosing scenario',
    createTimeline: createCardChoosingTimeline,
    computeBonus: computeRelativeCardChoosingBonus,
    defaultConfig: {
        task_name: "pilt",
        n_choices: 2,
        valence: "mixed",
        present_pavlovian: true,
        include_instructions: true,
        sequence: 'wk0',
        session: 'wk0'
    },
    sequences: {
        screening: '../assets/sequences/trial1_screening_sequences.js',
        wk0: '../assets/sequences/trial1_wk0_sequences.js',
        wk2: '../assets/sequences/trial1_wk2_sequences.js',
        wk4: '../assets/sequences/trial1_wk4_sequences.js',
        wk24: '../assets/sequences/trial1_wk24_sequences.js',
        wk28: '../assets/sequences/trial1_wk28_sequences.js',
    },
    requirements: {
      css: ['/tasks/card-choosing/styles.css'],
      note: 'Make sure to include card-choosing/styles.css in your HTML file'
    },
    resumptionRules: {
        enabled: true,
        granularity: 'block', // or 'trial' for finer control
        statePattern: (taskName) => `${taskName}_block_(\\d+)_start`,
        extractProgress: (lastState, taskName) => {
            const match = lastState.match(new RegExp(`${taskName}_block_(\\d+)_start`));
            return match ? parseInt(match[1]) : 0;
        }
    },
    configOptions: {
        task_name: "The name of the task being tested. Default is 'pilt'.",
        n_choices: "Number of choice options presented. Default is 2.",
        valence: "Valence of the stimuli - can be 'both' (includes both punishment and reward blocks), 'mixed' (includes mixed valence blocks), 'punishment', or 'reward'. Default is 'mixed'.",
        present_pavlovian: "Whether to present stimuli for pavlovian conditioning along with trial outcomes. Default is true.",
        include_instructions: "Whether to show instructions before the task. Default is true.",
        sequence: "The key for the sequence to use for the learning phase. Default is 'wk0'.",
        session: "Session identifier to govern session-specific behaviour. Default is 'wk0'. Should be deprecated, with settings exposed."
    }
  },
  WM: {
    name: 'WM',
    description: 'Anne Collins\'s RLWM task',
    createTimeline: createCardChoosingTimeline,
    computeBonus: computeRelativeCardChoosingBonus,
    defaultConfig: {
        task_name: "wm",
        n_choices: 3,
        valence: "reward",
        present_pavlovian: false,
        include_instructions: true,
        sequence: 'wk0',
        session: 'wk0'
    },
    sequences: {
        screening: '../assets/sequences/trial1_screening_sequences.js',
        wk0: '../assets/sequences/trial1_wk0_sequences.js',
        wk2: '../assets/sequences/trial1_wk2_sequences.js',
        wk4: '../assets/sequences/trial1_wk4_sequences.js',
        wk24: '../assets/sequences/trial1_wk24_sequences.js',
        wk28: '../assets/sequences/trial1_wk28_sequences.js',
    },
    requirements: {
      css: ['/tasks/card-choosing/styles.css'],
      note: 'Make sure to include card-choosing/styles.css in your HTML file'
    },
    resumptionRules: {
        enabled: true,
        granularity: 'block', // or 'trial' for finer control
        statePattern: (taskName) => `${taskName}_block_(\\d+)_start`,
        extractProgress: (lastState, taskName) => {
            const match = lastState.match(new RegExp(`${taskName}_block_(\\d+)_start`));
            return match ? parseInt(match[1]) : 0;
        }
    },
    configOptions: {
        task_name: "The name of the task being tested. Default is 'pilt'.",
        n_choices: "Number of choice options presented. Default is 2.",
        valence: "Valence of the stimuli - can be 'both' (includes both punishment and reward blocks), 'mixed' (includes mixed valence blocks), 'punishment', or 'reward'. Default is 'mixed'.",
        present_pavlovian: "Whether to present stimuli for pavlovian conditioning along with trial outcomes. Default is true.",
        include_instructions: "Whether to show instructions before the task. Default is true.",
        sequence: "The key for the sequence to use for the learning phase. Default is 'wk0'.",
        session: "Session identifier to govern session-specific behaviour. Default is 'wk0'. Should be deprecated, with settings exposed."
    }
  },
  post_learning_test: {
    name: 'Post Learning Test',
    description: 'A test phase that evaluates learning performance in notional extinction after completing a card-choosing learning phase',
    createTimeline: createPostLearningTestTimeline,
    defaultConfig: {
        task_name: "pilt_test",
        test_confidence_every: 4,
        sequence: 'wk0'
    },
    requirements: {
      css: ['/tasks/card-choosing/styles.css'],
      note: 'Make sure to include card-choosing/styles.css in your HTML file'
    },
    sequences: {
      screening: '../assets/sequences/trial1_screening_sequences.js',
      wk0: '../assets/sequences/trial1_wk0_sequences.js',
      wk2: '../assets/sequences/trial1_wk2_sequences.js',
      wk4: '../assets/sequences/trial1_wk4_sequences.js',
      wk24: '../assets/sequences/trial1_wk24_sequences.js',
      wk28: '../assets/sequences/trial1_wk28_sequences.js',
    },
    resumptionRules: {
      enabled: true
    },
    configOptions: {
        task_name: "The name of the test phase - can be 'pilt_test' or 'wm_test'. Default is 'pilt_test'.",
        test_confidence_every: "How often (in trials) to elicit confidence ratings in the test phase. Default is every 4 trials.",
        sequence: "The key for the sequence to use for the test phase - should match the learning phase. Default is 'wk0'.",
    }
  },
  reversal: {
    name: 'reversal',
    description: 'A task measuring probabilistic instrumental reversal learning, using a two squirrel cover story.',
    createTimeline: createReversalTimeline,
    computeBonus: computeRelativeReversalBonus,
    defaultConfig: {
      task_name: "reversal",
      n_trials: 150,
      sequence: 'wk0',
      session: 'wk0'
    },
    sequences: {
        screening: '/assets/sequences/trial1_screening_sequences.js',
        wk0: '/assets/sequences/trial1_wk0_sequences.js',
        wk2: '/assets/sequences/trial1_wk2_sequences.js',
        wk4: '/assets/sequences/trial1_wk4_sequences.js',
        wk24: '/assets/sequences/trial1_wk24_sequences.js',
        wk28: '/assets/sequences/trial1_wk28_sequences.js',
    },
    requirements: {
      css: ['/tasks/reversal/styles.css'],
      note: 'Make sure to include reversal/styles.css in your HTML file'
    },
    resumptionRules: {
        enabled: true
    },
    configOptions: {
        task_name: "The name of the task as it would appear in the bonus object. Default is 'reversal'.",
        n_trials: "Total number of trials in the reversal task. Default is 150.",
        sequence: "The key for the sequence to use for the reversal task. Default is 'wk0'.",
        session: "Session identifier to govern session-specific behaviour. Default is 'wk0'. Should be deprecated, with settings exposed."
    }
  },
  delay_discounting: {
    name: 'Delay Discounting Task',
    description: 'Measure preferences for smaller-sooner vs larger-later monetary rewards',
    createTimeline: createDelayDiscountingTimeline,
    computeBonus: () => 0, // No bonus computation for this task
    defaultConfig: {
      default_response_deadline: 4000,
      long_response_deadline: 6000,
    },
    requirements: {
      css: ['/tasks/delay-discounting/styles.css'],
      note: 'Make sure to include delay-discounting/styles.css in your HTML file'
    },
    resumptionRules: {
        enabled: true,
    },
    configOptions: {
        default_response_deadline: "Default response deadline in milliseconds. Default is 4000 (4 seconds).",
        long_response_deadline: "Extended response deadline in milliseconds for trials where no deadline warning is displayed. This allows a softer regime for participant populations who need it. Default is 6000 (6 seconds)."
    }
  },
  vigour: {
    name: 'Vigour Task',
    description: 'A task measuring instrumental action vigour as a function of reward rate',
    createTimeline: createVigourTimeline,
    computeBonus: () => computeRelativePiggyTasksBonus('vigour_trial'), 
    defaultConfig: {
      task_name: "vigour",
    },
    configOptions: {
      task_name: "The name of the task as it would appear in the bonus object. Default is 'vigour'."
    },
    requirements: {
      css: ['/tasks/piggy-banks/styles.css'],
      note: 'Make sure to include piggy-banks/styles.css in your HTML file'
    },
    resumptionRules: {
        enabled: true,
    }
  },
  PIT: {
    name: 'Pavlovian-Instrumental Transfer Task',
    description: 'A task measuring instrumental action vigour in notional extinction, as a function of instrumental reward rate and Pavlovian cues',
    createTimeline: createPITTimeline,
    computeBonus: () => computeRelativePiggyTasksBonus('pit_trial'),
    defaultConfig: {
      task_name: "PIT",
    },
    configOptions: {
      task_name: "The name of the task as it would appear in the bonus object. Default is 'PIT'."
    },
    requirements: {
      css: ['/tasks/piggy-banks/styles.css'],
      note: 'Make sure to include piggy-banks/styles.css in your HTML file'
    },
    resumptionRules: {
        enabled: true,
    }
  },
  control: {
    name: 'Control Task',
    description: 'Measure control-seeking, information-seeking, and reward-seeking behaviour',
    createTimeline: createControlTimeline,
    computeBonus: computeRelativeControlBonus,
    defaultConfig: {
      session: "wk0",
      max_instruction_fails: 3,
      default_response_deadline: 4000,
      long_response_deadline: 6000,
      task_name: "control",
      warning_expected_n_back: 2
    },
    requirements: {
      css: ['/tasks/control/styles.css'],
      note: 'Make sure to include control/styles.css in your HTML file'
    },
    resumptionRules: {
        enabled: true,
    },
    configOptions: {
        session: "Session identifier to govern session-specific behaviour and select stimuli. Default is 'wk0'.",
        max_instruction_fails: "Maximum number of instruction quiz failures allowed before continuing to the task. Default is 3.",
        default_response_deadline: "Default response deadline in milliseconds. Default is 4000 (4 seconds).",
        long_response_deadline: "Extended response deadline in milliseconds for trials where no deadline warning is displayed. This allows a softer regime for participant populations who need it. Default is 6000 (6 seconds).",
        task_name: "The name of the task as it would appear in the bonus object, and for monitoring warnings. Default is 'control'.",
        warning_expected_n_back: "How many jsPsych trials back to check for the previous deadline warning. Default is 2."
    }
  },
  max_press_test: {
    name: 'Max Press Test',
    description: 'A test of maximum key press speed',
    createTimeline: createMaxPressTimeline,
    computeBonus: () => 0, // No bonus computation for this task
    defaultConfig: {
      duration: 7000,  
      validKey: 'j',
      minSpeed: 3.0 
    },
    configOptions: {
        duration: "Duration of the max press test in milliseconds. Default is 7000 (7 seconds).",
        validKey: "The key that participants should press during the test. Default is 'j'.",
        minSpeed: "Minimum speed in presses per second required to pass the test. Default is 3.0, which was the 5th percentile in pilots 7 & 8."
    },
    requirements: {
      css: ['/tasks/max-press-test/styles.css'],
      note: 'Make sure to include max-press-test/styles.css in your HTML file'
    },
    resumptionRules: {
        enabled: true,
    }
  },
  pavlovian_lottery: {
    name: 'Pavlovian Conditioning Lottery',
    description: 'A lottery task for conditioning Pavlovian associations between visual cues and monetary rewards',
    createTimeline: createPavlovianLotteryTimeline,
    computeBonus: () => 0, // No bonus computation for this task
    defaultConfig: {
      initial_movement_delay: 50,
      reel_spin_duration: 1500,
      winning_highlight_delay: 450,
      max_result_display_time: 4000,
      continue_message_delay: 1500,
      session: "wk0"
    },
    configOptions: {
        initial_movement_delay: "Initial delay before the slot reel starts moving, in milliseconds. Default is 50.",
        reel_spin_duration: "Duration for which the slot reel spins, in milliseconds. Default is 1500.",
        winning_highlight_delay: "Delay before highlighting the winning outcome, in milliseconds. Default is 450.",
        max_result_display_time: "Maximum time to display the result before automatically continuing, in milliseconds. Default is 4000.",
        continue_message_delay: "Delay before showing the 'Press any key to continue' message, in milliseconds. Default is 1500.",
        session: "Session identifier to select the appropriate stimulus set. Default is 'wk0'.",
    },
    requirements: {
      css: ['/tasks/pavlovian-lottery/styles.css'],
      note: 'Make sure to include pavlovian-lottery/styles.css in your HTML file'
    },
    resumptionRules: {
        enabled: true,
    }
  },
  open_text: {
    name: 'Open Text Questions',
    description: 'A task for answering open text questions',
    createTimeline: createOpenTextTimeline,
    computeBonus: () => 0, // No bonus computation for this task
    defaultConfig: {
      min_words: 30,
      prevent_paste: true,
      writing_time: 120,
      warning_time: 90,
      qs_read_time: 7,
      oq_timelimit_text: 'two minutes',
      no_skip: true,
      timeout_alert_duration: 4,
      max_timeout: 5,
      warning_text: `Didn't catch a response - moving on.`
    },
    configOptions: {
      min_words: "Minimum number of words required for each response. Default is 30.",
      prevent_paste: "Whether to prevent pasting text into the response box. Default is true.",
      writing_time: "Time in seconds allocated for writing each response. Default is 120 seconds.",
      warning_time: "Time in seconds before the end of writing time to display a warning. Default is 90 seconds.",
      qs_read_time: "Extra time in seconds allocated to read  the question before writing time starts. Default is 7 seconds.", 
      oq_timelimit_text: "Text to display indicating the time limit for answering each question. Default is 'two minutes'.",
      no_skip: "Whether to prevent skipping questions if no response is given or time runs out. Default is true.",
      timeout_alert_duration: "Duration in seconds of the timeout/empty response alert. Default is 4 seconds.",
      max_timeout: "Maximum number of timeouts or empty responses allowed before the participant is asked to return their submission. Default is 5.",
      warning_text: "Text to display when a response is not captured before moving on. Default is `Didn't catch a response - moving on.`"
    },
    requirements: {
      css: ['/tasks/open-text/styles.css'],
      note: 'Make sure to include open-text/styles.css in your HTML file'
    },
    resumptionRules: {
        enabled: true,
    }
  },
};

// Global settings that apply to all tasks unless overridden
const globalConfig = {
    max_warnings_per_task: 3, 
    warning_expected_n_back: 1,
    default_response_deadline: 4000,
    long_response_deadline: 6000
}

const globalConfigOptions = {
    max_warnings_per_task: "Maximum number of deadline warnings allowed per task. Default is 3.",
    warning_expected_n_back: "How many jsPsych trials back to check for the previous deadline warning. Default is 1.",
    default_response_deadline: "Default response deadline in milliseconds. Default is 4000.",
    long_response_deadline: "Long response deadline in milliseconds. Default is 6000."
}

// Helper functions
export function getTask(taskName) {
  if (!(taskName in TaskRegistry)) {
    throw new Error(`Task "${taskName}" not found. Available tasks: ${Object.keys(TaskRegistry).join(', ')}`);
  }

  let task = TaskRegistry[taskName];

  // Add global settings to task
  task.defaultConfig = { ...globalConfig, ...task.defaultConfig };
  task.configOptions = { ...globalConfigOptions, ...task.configOptions };

  return task;
}

export async function createTaskTimeline(taskName, config = {}) {
    // Get task
    const task = getTask(taskName);

    // Merge configurations with defaults 
    const mergedConfig = { ...globalConfig, ...task.defaultConfig, ...config };

    // Attach task object for internal use
    mergedConfig.__task = task;

    // Load required CSS assets
    if (task.requirements?.css) {
        console.log(`Loading CSS assets for task ${taskName}:`, task.requirements.css);
        
        try {
            await Promise.all(
                task.requirements.css.map(cssPath => loadCSS(cssPath))
            );
            console.log(`Successfully loaded all CSS assets for task ${taskName}`);
        } catch (error) {
            console.warn(`Some CSS assets failed to load for task ${taskName}:`, error);
        }
    }

    // Load required sequence using robust script loading
    if (task.sequences) {
        const sequenceName = mergedConfig.sequence;
        const sequencePath = task.sequences?.[sequenceName];

        console.log(`Loading sequence for task ${taskName}: ${sequenceName} from ${sequencePath}`);

        if (sequencePath) {
            console.log(`Loading sequence using script loading: ${sequencePath}`);
            
            try {
                await loadSequence(sequencePath);
                console.log(`Successfully loaded sequence: ${sequenceName}`);
            } catch (error) {
                console.warn(`Failed to load sequence ${sequencePath}, continuing without it:`, error);
                // Continue without the sequence - let the task handle missing sequences gracefully
            }
        }
    }
    
    return task.createTimeline(mergedConfig);
}

export function listTasks() {
  return Object.keys(TaskRegistry);
}

export function getTaskInfo(taskName) {
  const task = getTask(taskName);
  
  // Add extra_media_assets as a universal config option for all tasks
  const universalConfigOptions = {
    extra_media_assets: "Additional media assets to preload for the task. Default is an empty array."
  };
  
  return {
    name: task.name,
    description: task.description,
    defaultConfig: task.defaultConfig,
    configOptions: { ...task.configOptions, ...universalConfigOptions },
    resumptionRules: task.resumptionRules
  };
}