// api/task-registry.js
// This module defines a registry for tasks in the API, allowing for easy management and execution of tasks.

import { createCardChoosingTimeline, createPostLearningTestTimeline } from '../tasks/card-choosing/task.js';
import { loadSequence } from '../core/utils/setup.js';

export const TaskRegistry = {
  card_choosing: {
    name: 'Card Choosing Task',
    description: 'A task measuring learning and decision making in a card choosing scenario',
    createTimeline: createCardChoosingTimeline,
    defaultConfig: {
        task_name: "pilt",
        n_choices: 2,
        valence: "mixed",
        present_pavlovian: true,
        include_instructions: true,
        sequence: 'wk0'
    },
    sequences: {
        screening: 'sequences/trial1_screening_sequences.js',
        wk0: 'sequences/trial1_wk0_sequences.js',
        wk2: 'sequences/trial1_wk2_sequences.js',
        wk4: 'sequences/trial1_wk4_sequences.js',
        wk24: 'sequences/trial1_wk24_sequences.js',
        wk28: 'sequences/trial1_wk28_sequences.js',
    },
    requirements: {
      css: ['tasks/card-choosing/styles.css'],
      note: 'Make sure to include card-choosing/styles.css in your HTML file'
    },
    resumptionRules: {
      enabled: true,
      granularity: 'block'
    },
    configOptions: {
        task_name: "The name of the task being tested. Default is 'pilt'.",
        n_choices: "Number of choice options presented. Default is 2.",
        valence: "Valence of the stimuli - can be 'both' (includes both punishment and reward blocks), 'mixed' (includes mixed valence blocks), 'punishment', or 'reward'. Default is 'mixed'.",
        present_pavlovian: "Whether to present stimuli for pavlovian conditioning along with trial outcomes. Default is true.",
        test_confidence_every: "How often (in trials) to elicit confidence ratings in the test phase. Default is every 4 trials.",
        include_instructions: "Whether to show instructions before the task. Default is true."
    }
  },
  post_learning_test: {
    name: 'Post Learning Test',
    description: 'A test phase that evaluates learning performance in notional extinction after completing a card-choosing learning phase',
    createTimeline: createPostLearningTestTimeline,
    defaultConfig: {
        task_name: "pilt",
        test_confidence_every: 4,
        sequence: 'wk0'
    },
    requirements: {
      css: ['tasks/card-choosing/styles.css'],
      note: 'Make sure to include card-choosing/styles.css in your HTML file'
    },
    resumptionRules: {
      enabled: true
    },
    configOptions: {
        task_name: "The name of the task being tested - can be 'pilt' or 'wm'. Default is 'pilt'.",
        test_confidence_every: "How often (in trials) to elicit confidence ratings in the test phase. Default is every 4 trials."
    }
  }
};

// Helper functions
export function getTask(taskName) {
  if (!(taskName in TaskRegistry)) {
    throw new Error(`Task "${taskName}" not found. Available tasks: ${Object.keys(TaskRegistry).join(', ')}`);
  }
  return TaskRegistry[taskName];
}

export async function createTaskTimeline(taskName, config = {}) {
    // Get task
    const task = getTask(taskName);

    // Merge configurations with defaults 
    const mergedConfig = { ...task.defaultConfig, ...config };

    // Load required sequence using robust script loading
    if (task.sequences && mergedConfig.task_name) {
        const sequenceName = mergedConfig.sequence;
        const sequencePath = task.sequences[mergedConfig.task_name]?.[sequenceName];

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