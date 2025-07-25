// api/task-registry.js
// This module defines a registry for tasks in the API, allowing for easy management and execution of tasks.

import { runPILT } from '../tasks/pilt/pilt.js';

export const TaskRegistry = {
  pilt: {
    name: 'PILT (Probabilistic Instrumental Learning Task)',
    description: 'A task measuring learning from probabilistic rewards and punishments',
    run: runPILT,
    defaultConfig: {
        include_instructions: true,
        test_confidence_every: 4
    },
    requirements: {
      css: ['tasks/pilt/pilt.css'],
      note: 'Make sure to include pilt.css in your HTML file'
    },
    resumptionRules: {
      enabled: true,
      granularity: 'block'
    },
    configOptions: {
        include_instructions: "Whether to show instructions before the task. Default is true.",
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

export function runTask(taskName, config = {}) {
  const task = getTask(taskName);
  
  // Merge with defaults
  const mergedConfig = { ...task.defaultConfig, ...config };
  
  // Run the task with merged config
  return task.run(mergedConfig);
}

export function listTasks() {
  return Object.keys(TaskRegistry);
}

export function getTaskInfo(taskName) {
  const task = getTask(taskName);
  return {
    name: task.name,
    description: task.description,
    defaultConfig: task.defaultConfig,
    configOptions: task.configOptions,
    resumptionRules: task.resumptionRules
  };
}