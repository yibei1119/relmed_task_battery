# RELMED Task Battery

## Overview
This repository aims to provide easy to customize code for the RELMED task battery. This system provides a standardized interface for creating and combining experimental timelines, making it easy to build complete experiments from individual task components. The framework is built on top of jsPsych and follows a modular architecture that promotes code reusability and consistency across different experimental paradigms.

## Available Tasks

The battery currently includes the following experimental tasks:

### Learning & Decision Making Tasks Based on Card Choosing
- **PILT** - Probabilistic Instrumental Learning Task: A card-choosing task measuring probabilistic learning with 2-choice decisions
- **WM** - Working Memory Task: Anne Collins's RLWM task with 3-choice decisions and reward-only feedback
- **Post Learning Test** - Extinction test phase for evaluating learning performance after card-choosing tasks
- **Pavlovian Lottery** - Conditioning task creating associations between visual cues and monetary rewards

### Reward & Motivation Tasks Based on Repeated Key Pressing
- **Max Press Test** - Tests maximum key press speed for calibrating effort-based tasks
- **Vigour Task** - Measures instrumental action vigour as a function of reward rate
- **PIT** - Pavlovian-Instrumental Transfer Task: Measures action vigour in extinction with Pavlovian cues

### Control & Exploration Tasks
- **Control Task** - Measures control-seeking, information-seeking, and reward-seeking behavior

### Miscellaneous Tasks
- **Delay Discounting** - Measures preferences for smaller-sooner vs larger-later monetary rewards
- **Open Text** - Collects open-ended text responses with customizable time limits and validation

## Repository Structure

```
relmed_task_battery/
├── README
├── api/                          # Task registry and unified interface
│   ├── index.js                 # Main API entry point
│   └── task-registry.js         # Task definitions and configuration
├── tasks/                       # Individual task implementations
│   ├── card-choosing/           # PILT and WM tasks
│   ├── control/                 # Control task
│   ├── delay-discounting/       # Delay discounting task
│   ├── max-press-test/          # Max press speed test
│   ├── open-text/               # Open text questions
│   ├── pavlovian-lottery/       # Pavlovian conditioning
│   └── piggy-banks/             # Vigour and PIT tasks
├── core/                        # Shared utilities and jsPsych
│   ├── utils/                   # Common utility functions
│   └── jspsych/                 # jsPsych library and plugins
├── assets/                      # Static resources
│   ├── images/                  # Task images and stimuli
│   └── sequences/               # Experimental sequences/parameters
└── examples/                    # Working example HTML files
```

## How to Build an Experiment

### Creating Experiments is Simple

**If you don't need to modify task behavior**, creating an experiment is straightforward - you just need to write an HTML file that loads the required dependencies and calls the API functions. The framework handles all the task logic, timing, and data collection automatically.

### Steps to Create an HTML Experiment File

1. **Set up HTML structure**: Create a basic HTML page with a display element for jsPsych

2. **Load dependencies in the `<head>`**:
   - jsPsych core library (`jspsych.js`)
   - Required jsPsych plugins (varies by task)
   - Task-specific plugin files (check task requirements)
   - Core utilities as ES6 modules
   - CSS files (jsPsych core + task-specific styles)

3. **Initialize jsPsych** with display settings and completion handlers

4. **Create experiment logic**:
   - Import API functions (`createTaskTimeline`, `getTaskInfo`, etc.)
   - Use `createTaskTimeline()` to generate task timelines with optional configuration
   - Combine multiple tasks by concatenating their timelines
   - Add experiment entry/exit (fullscreen, etc.)

5. **Run the experiment** using `jsPsych.run()`

### Single vs Multiple Tasks

- **Single Task**: Call `createTaskTimeline()` once with your desired configuration
- **Multiple Tasks**: Call `createTaskTimeline()` for each task and combine the resulting arrays into one timeline
- **Task Order**: Simply arrange the timeline arrays in the order you want tasks to appear

### Required Files and Dependencies

**For every experiment, you must include:**

1. **jsPsych core files**: Always load `jspsych.js` and required plugins
2. **Core utilities**: Load `/core/utils/index.js` as a module
3. **Task-specific files**: Check each task's requirements in the task registry
4. **CSS files**: Include `jspsych.css` and task-specific stylesheets

**Task-specific requirements** (check `api/task-registry.js` for complete details):
- **PILT/WM**: Requires `plugin-card-choosing.js` and `styles.css`
- **Control**: Requires multiple control plugins and `styles.css`
- **Vigour/PIT**: Requires piggy-banks plugins and `styles.css`
- **Delay Discounting**: Requires only core plugins and `styles.css`

### Task Configuration

Each task accepts a configuration object to customize behavior. If you don't need to change anything, you can use the default settings by passing an empty object `{}` or omitting the configuration entirely.

**Example configurations for different tasks:**

```javascript
// PILT with custom settings
const piltConfig = {
    task_name: "pilt",
    n_choices: 2,
    valence: "mixed",           // "mixed", "reward", "punishment", "both"
    present_pavlovian: true,
    sequence: 'wk0',
    include_instructions: true
};

// Control task with custom timing
const controlConfig = {
    session: "wk0",
    max_instruction_fails: 3,
    default_response_deadline: 4000,
    long_response_deadline: 6000
};

// Delay discounting with default settings (just pass empty object)
const ddConfig = {};
```

### Getting Task Information

Use `getTaskInfo()` to explore available configuration options:

```javascript
const taskInfo = getTaskInfo('PILT');
console.log(taskInfo.configOptions);  // Shows all available config options
console.log(taskInfo.defaultConfig);  // Shows default values
```

## API Reference

### Core Functions

- `createTaskTimeline(taskName, config)` - Creates a timeline for the specified task
- `getTaskInfo(taskName)` - Returns task information including configuration options
- `listTasks()` - Returns array of all available task names
- `getTask(taskName)` - Returns the complete task object from registry

### Utility Functions

- `enterExperiment` - Standard fullscreen entry point for experiments
- Various bonus calculation, data handling, and resumption utilities in `/core/utils/`

### Task Names

Use these exact strings when calling `createTaskTimeline()`:
- `'PILT'`, `'WM'`, `'post_learning_test'`
- `'delay_discounting'`, `'vigour'`, `'PIT'` 
- `'control'`, `'max_press_test'`, `'pavlovian_lottery'`, `'open_text'`

## Examples

Complete working examples are available in the `examples/` folder:
- `PILT.html` - Card choosing learning task
- `control.html` - Control-seeking task  
- `delay-discounting.html` - Intertemporal choice task
- `vigour.html` - Action vigour task
- And more...

Each example demonstrates proper file loading, API usage, and task configuration for that specific task type.