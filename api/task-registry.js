// api/task-registry.js
// This module defines a registry for tasks in the API, allowing for easy management and execution of tasks.

import { createCardChoosingTimeline, createPostLearningTestTimeline } from '../tasks/card_choosing/task.js';

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
        include_instructions: true
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
        test_confidence_every: 4
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

export function createTaskTimeline(taskName, config = {}) {
  const task = getTask(taskName);
  
  // Add universal defaults for all tasks
  const universalDefaults = {
    extra_media_assets: []
  };
  
  // Merge with defaults: universal defaults, then task defaults, then user config
  const mergedConfig = { ...universalDefaults, ...task.defaultConfig, ...config };
  
  // Run the task with merged config
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