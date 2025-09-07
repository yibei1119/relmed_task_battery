// A module is a collection of tasks to be completed in a single sitting.
// Each module can contain one or more tasks, and each task can have its own configuration settings.

import { TaskRegistry } from './task-registry.js';
import { getMessage } from './messages.js';

export const ModuleRegistry = {
    full_battery: {
        name: "Full RELEMD Task Battery",
        moduleConfig: { // Settings that apply to all tasks in the module unless overridden
            session: "wk0",
            sequence: "wk0"
        }, 
        elements: [
            { type: "instructions", config: { text: "start_message" } },
            { type: "task", name: "reversal"},
            { type: "task", name: "max_press_test" },
            { type: "task", name: "pavlovian_lottery" },§
            { type: "task", name: "PILT" },
            { type: "task", name: "acceptability_judgment", config: { game_description: "card choosing game" } },
            { type: "task", name: "vigour" },
            { type: "task", name: "acceptability_judgment", config: { game_description: "piggy-bank game" } },
            { type: "task", name: "PIT"},
            { type: "task", name: "acceptability_judgment", config: { game_description: "piggy-bank game in cloudy space" } },
            { type: "task", name: "vigour_test"},
            { type: "task", name: "post_learning_test"},
            { type: "task", name: "control"},
            { type: "task", name: "acceptability_judgment", config: { game_description: "shipping game" } },
            { type: "task", name: "wm" },
            { type: "task", name: "open_text" },
            { type: "instructions", config: { text: "end_message" } }
        ]
    }
};

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

