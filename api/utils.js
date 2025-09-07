import { loadSequence, loadCSS } from '/core/utils/index.js';
import { TaskRegistry, globalConfig, globalConfigOptions } from './task-registry.js';
import { getMessage } from './messages.js';
import { ModuleRegistry } from './module-registry.js';

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

export async function createModuleTimeline(moduleName, config) {
    // Get module
    const module = getModule(moduleName);

    // Create timeline for each task in the module
    const timelines = module.elements.map(element => {
        if (element.type === "task") {
            return createTaskTimeline(element.name, { ...module.moduleConfig, ...element.config, ...config });
        }
        if (element.type === "instructions") {
            return getMessage(moduleName, element.config.text, { ...module.moduleConfig, ...element.config, ...config });
        }
        return null;
    });

    const result = await Promise.all(timelines);
    return result.flat();
}

export function getModule(moduleName) {
  if (!(moduleName in ModuleRegistry)) {
    throw new Error(`Module "${moduleName}" not found. Available modules: ${Object.keys(ModuleRegistry).join(', ')}`);
  }

  let module = ModuleRegistry[moduleName];

  return module;
}

export function listModules() {
  return Object.keys(ModuleRegistry);
}
