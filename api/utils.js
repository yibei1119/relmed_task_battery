import { loadSequence, loadCSS } from '/core/utils/index.js';
import { TaskRegistry, globalConfig, globalConfigOptions } from './task-registry.js';

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