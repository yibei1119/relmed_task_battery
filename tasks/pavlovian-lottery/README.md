# Pavlovian Lottery Task

## Overview
The Pavlovian lottery task is a conditioning paradigm that establishes associations between visual stimuli and monetary outcomes. Participants observe slot machine-style animations that reveal Pavlovian stimuli (conditioned stimuli) paired with specific coin rewards or losses (unconditioned stimuli). The task serves to create learned associations between abstract visual patterns and their corresponding monetary values, which can be utilized in subsequent experimental tasks that require established stimulus-reward pairings.

## File Structure

### Core Files

#### `index.js`
**Purpose**: Main entry point that centralizes all exports from the task module.
- Re-exports all functions from `task.js`
- Provides a single import point for accessing Pavlovian lottery functionality
- Maintains consistency with other task modules despite being a single-file task

#### `task.js`
**Purpose**: Contains all task logic, stimulus-reward mappings, timeline construction, and animation management functions.

**Main Export Functions**:
- **`createPavlovianLotteryTimeline(settings)`**: Creates the complete timeline for the Pavlovian lottery task
  - Handles asset preloading, instructions, lottery trials, and completion sequence
  - Returns array of jsPsych trial objects for the full conditioning procedure

**Core Configuration**:
- **`PREPILT_CONFIG`**: Central configuration object containing stimulus-reward mappings
  - Maps numerical values (-1.0 to 1.0) to specific Pavlovian stimulus images
  - Associates each stimulus with corresponding reward/punishment coin images
  - Defines trial sequence with predefined stimulus-reward pairings
  - Contains timing constants for animations and displays

**Trial Functions**:
- **`lotteryAnimation`**: Creates slot machine-style spinning animation trial
  - Implements horizontal carousel with multiple stimuli scrolling across screen
  - Uses Fisher-Yates shuffle to randomize stimulus order in carousel
  - Prevents consecutive duplicate stimuli for smoother visual effect
  - Precisely positions target stimulus in center frame after animation

- **`showResult`**: Displays final stimulus-reward pairing after lottery spin
  - Shows both the Pavlovian stimulus and its associated coin outcome
  - Applies appropriate styling for positive/negative monetary values
  - Records trial data including stimulus type, reward value, and response timing

**Instruction Functions**:
- **`instructions`**: Multi-page instruction sequence with visual examples
  - Welcome screen explaining the lottery concept
  - Visual guide displaying all possible coin outcomes (intact and broken)
  - Starting instructions with spacebar prompt

**Utility Functions**:
- **`getSpeedUpFactor()`**: Returns timing multiplier for simulation mode
  - Speeds up all animations by factor of 10 when `window.simulating` is true
  - Allows rapid testing while preserving normal timing for participants

- **`shuffleArray(array)`**: Implements Fisher-Yates algorithm for randomization
  - Ensures random ordering of stimuli in slot machine carousel
  - Creates unpredictable animation sequences while maintaining target outcome

#### `styles.css`
**Purpose**: CSS styling for the Pavlovian lottery interface and animations.
- Defines slot machine container and carousel positioning (`.slot-machine-container`, `.slot-reel`)
- Styles for selection frame highlighting and winning item emphasis (`.selection-frame`, `.winning-item`)
- Animation transitions for smooth slot machine movement
- Responsive sizing for different screen dimensions
- Color schemes for positive/negative monetary value display

## Task Design

### Conditioning Protocol
- **Trial Count**: 30 predetermined stimulus-reward pairings
- **Stimulus Set**: 6 distinct Pavlovian stimuli with varying reward associations
- **Outcome Range**: Monetary values from -£1 (loss) to +£1 (gain)
- **Animation Style**: Slot machine carousel with horizontal scrolling motion

### Stimulus-Reward Mappings
- **High Positive (1.0)**: PIT1.png → intact £1 coin
- **Medium Positive (0.5)**: PIT2.png → intact 50p coin  
- **Low Positive (0.01)**: PIT3.png → intact 1p coin
- **Low Negative (-0.01)**: PIT4.png → broken 1p coin
- **Medium Negative (-0.5)**: PIT5.png → broken 50p coin
- **High Negative (-1.0)**: PIT6.png → broken £1 coin

### Animation Sequence
- **Initial Delay**: Configurable pause before carousel movement begins
- **Reel Spin Duration**: Horizontal scrolling animation timing
- **Landing Effect**: Target stimulus centers in selection frame
- **Highlight Delay**: Pause before emphasizing winning item and frame
- **Result Display**: Combined presentation of stimulus and reward outcome

### Timing Controls
- **Adaptive Speed**: All timing parameters adjust automatically for simulation mode
- **Continue Prompt**: Minimum display time before spacebar prompt appears
- **Response Validation**: Prevents accidental fast responses during result display
- **Animation Synchronization**: Coordinated timing across multiple visual elements

### Resumption Capability
- **State Tracking**: Records progress through trial sequence for interruption recovery
- **Trial Indexing**: Each trial numbered for precise resumption point identification
- **Session Continuity**: Maintains stimulus set consistency across session interruptions

## Usage Example

```javascript
import { createPavlovianLotteryTimeline } from './tasks/pavlovian-lottery/index.js';

// Create Pavlovian lottery timeline
const settings = {
  session: 'pilot',                    // Session identifier for stimulus selection
  task_name: 'pavlovian_lottery',      // Task name for preloading
  initial_movement_delay: 500,         // Delay before animation starts (ms)
  reel_spin_duration: 2000,           // Duration of slot spinning (ms)
  winning_highlight_delay: 200,       // Delay before highlighting winner (ms)
  max_result_display_time: 5000,      // Maximum result display duration (ms)
  continue_message_delay: 1500        // Delay before continue prompt (ms)
};

const pavlovianLotteryTimeline = createPavlovianLotteryTimeline(settings);

// Add to jsPsych experiment
jsPsych.run(pavlovianLotteryTimeline);
```

## Settings Configuration

### Required Parameters
- **`session`**: Session identifier determining which stimulus set to load (string)
- **`task_name`**: Task identifier for asset preloading management (string)
- **`initial_movement_delay`**: Milliseconds before carousel animation begins (number)
- **`reel_spin_duration`**: Total duration of slot machine spinning animation (number)
- **`winning_highlight_delay`**: Delay before highlighting the selected stimulus (number)
- **`max_result_display_time`**: Maximum time for result display before automatic advance (number)
- **`continue_message_delay`**: Minimum time before spacebar prompt appears (number)

### Example Settings
```javascript
const defaultSettings = {
  session: 'pilot',
  task_name: 'pavlovian_lottery',
  initial_movement_delay: 500,      // 0.5 seconds
  reel_spin_duration: 2000,        // 2 seconds
  winning_highlight_delay: 200,    // 0.2 seconds
  max_result_display_time: 5000,   // 5 seconds
  continue_message_delay: 1500     // 1.5 seconds
};
```

## Dependencies
- Core utilities from `/core/utils/index.js`
- jsPsych framework and plugins (html-keyboard-response, instructions)
- Pavlovian stimulus images: `/assets/images/pavlovian-stims/{session}/PIT{1-6}.png`
- Coin outcome images: `/assets/images/card-choosing/outcomes/{coin}.png`
- Custom CSS styling for slot machine animations and visual feedback

## Data Output
The task records conditioning trial data including:
- **Stimulus Information**: Pavlovian stimulus filename and associated reward value
- **Timing Data**: Response times for spacebar presses and trial durations
- **Trial Metadata**: Trial numbers, phase markers, and stimulus-reward pairings
- **State Information**: Resumption markers and completion status for session continuity