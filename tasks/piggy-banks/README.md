# Vigour Task

## Overview
The vigour task is a behavioral paradigm that measures participants' motivation and effort allocation by having them shake a virtual piggy bank to earn coins. Participants press the 'B' key repeatedly to shake the piggy bank, with different trials requiring varying effort levels (ratio of presses per coin) for different reward magnitudes. The task assesses how participants balance effort expenditure with reward value, providing insights into motivational processing.

## File Structure

### Core Files

#### `index.js`
**Purpose**: Main entry point that centralizes all exports from the task module.
- Re-exports all functions from `utils.js`, `instructions.js`, and `timeline.js`
- Provides a single import point for accessing vigour task functionality

#### `timeline.js`
**Purpose**: Contains the main timeline creation functions and task orchestration logic.

**Main Export Functions**:
- **`createVigourTimeline(settings)`**: Creates the complete timeline for the vigour task
  - Handles asset preloading, instructions, and core task trials
  - Returns array of jsPsych trial objects for the full task sequence

#### `utils.js`
**Purpose**: Core utility functions for task construction, trial management, animations, and data tracking.

**Main Export Functions**:
- **`preloadVigour(settings)`**: Preloads all necessary images and assets for the task
  - Loads coin images, piggy bank graphics, and pavlovian stimuli
  - Includes error handling with continue_after_error option
  
- **`createVigourCoreTimeline(settings)`**: Constructs the main task trials from predefined trial structure
  - Creates 36 trials with varying magnitude (1, 2, 5 pence) and ratio (1, 8, 16 presses) combinations
  - Includes kick-out checks and fullscreen prompts for each trial
  - Manages task state initialization and cleanup
  
- **`piggyBankTrial(settings)`**: Creates individual vigour trial objects
  - Handles key press detection and response tracking
  - Manages real-time coin dropping animations and piggy bank shaking
  - Records detailed performance metrics including presses, rewards, and response times

**Animation Functions**:
- **`shakePiggy()`**: Animates piggy bank shaking when participants press keys
- **`dropCoin(magnitude, persist)`**: Animates coin dropping with different values
- **`updatePiggyTails(magnitude, ratio)`**: Updates visual indicators showing trial parameters
- **`animatePiggy(keyframes, options)`**: General animation utility for piggy bank effects

**UI Management Functions**:
- **`createPersistentCoinContainer()`**: Creates overlay for persistent coin animations
- **`updatePersistentCoinContainer()`**: Maintains coin animation positioning across screen changes
- **`observeResizing(elementId, callback)`**: Handles dynamic screen resizing during the task

#### `instructions.js`
**Purpose**: Manages interactive instruction sequence with practice demonstration.

**Main Export Functions**:
- **`vigour_instructions`**: Complete interactive instruction timeline
  - Allows participants to practice pressing 'B' to shake the piggy bank
  - Demonstrates coin earning mechanism with visual feedback
  - Includes restart functionality for repeated practice
  - Provides continue button once minimum practice completed

**Helper Functions**:
- **`generateInstructStimulus()`**: Creates HTML structure for instruction interface
- **`updateInstructionText(shakeCount)`**: Updates instruction text based on practice progress
- **`setupKeyboardListener(callback)`**: Configures key press detection for practice

#### `styles.css`
**Purpose**: CSS styling for the vigour task interface and animations.
- Defines layout for piggy bank, coins, and instruction elements
- Handles responsive design for different screen sizes
- Styles for coin dropping animations and piggy bank effects
- Manages visual feedback for tail indicators and saturation effects
- Ensures consistent presentation across trials and instruction phases

## Task Design

### Trial Structure
The task consists of 36 trials with systematic manipulation of:
- **Magnitude**: Reward value per coin (1, 2, or 5 pence)
- **Ratio**: Number of key presses required per coin (1, 8, or 16 presses)
- **Duration**: Fixed trial duration (~6.5-7.5 seconds per trial)
The trial sequence is defined at the head of `utils.js`.

### Visual Feedback System
- **Piggy Bank**: Central visual element that shakes with each key press
- **Coin Animations**: Different coin values (1p, 2p, 5p) drop when ratio requirements are met
- **Tail Indicators**: Visual cues showing current trial parameters
  - Number of tails indicates reward magnitude
  - Saturation/brightness indicates effort requirement (ratio)

### Data saved
The task records the following data:
- **Trial-level metrics**: Number of presses, earned rewards, response times
- **Global tracking**: Total presses and rewards across all trials
- **Temporal data**: Response time patterns and inter-press intervals
- **Efficiency measures**: Effort-to-reward ratios for motivation analysis

## Usage Example

```javascript
import { createVigourTimeline } from './tasks/vigour/index.js';

// Create vigour task timeline
const settings = {
  session: "wk0",
  participant_id: "sub001"
};

const vigourTimeline = createVigourTimeline(settings);

// Add to jsPsych experiment
jsPsych.run(vigourTimeline);
```

## Dependencies
- Core utilities from `/core/utils/index.js`
- jsPsych framework and plugins (html-keyboard-response, preload)
- Asset images in `/assets/images/vigour/` and `/assets/images/pavlovian-stims/`
- Custom CSS styling for animations and responsive design

## Data Output
The task records detailed trial-by-trial data including:
- **Trial behaviour**: Trial presses, earned rewards, response times
- **Trial parameters**: Magnitude, ratio, and trial duration
- **Behavioral patterns**: Inter-press intervals and effort allocation strategies
- **Overall behaviour**: Total presses and rewards for bonus calculations
- **Task progression**: Trial numbers and completion timestamps
