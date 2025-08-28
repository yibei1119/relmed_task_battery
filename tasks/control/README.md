# Control Task Module

## Overview
This module contains the control task behavioral paradigm that mesures the value of control, information seeking, and reward-guided behaviour through a maritime navigation game. Participants control ships navigating between islands in an ocean environment with varying current strengths, learning to predict ship home bases and later make decisions to collect rewards.

## Task Description
The control task uses a ship navigation paradigm where participants:
- Choose between different colored ships (red, blue, green, yellow) to travel between islands
- Learn that ships have "home base" islands where they can travel with less effort
- Navigate ocean currents of varying strengths that affect effort requirements
- Make predictions about ship home bases after exploration
- In a separate phase, collect reward for successfully completing navigation quests.

## Task Phases

### 1. Exploration Phase: Exploration trials
Participants learn the ship-island mappings by making repeated choices between ship pairs. Ships either reach their home base island (with sufficient fuel) or drift to adjacent islands following ocean currents when fuel is insufficient.

### 2. Exploration Phase: Prediction trials
Participants predict which island each ship considers its "home base" based on their exploration experience.

### 3. Reward Phase
Participants navigate to target islands to collect monetary rewards, requiring strategic decisions about which ships to use and how much effort to expend based on current strength.

## File Structure

### Core Files

#### `index.js`
**Purpose**: Main entry point that centralizes all exports from the control task module.
- Re-exports all functions from utils, instructions, and timeline components
- Provides a single import point for accessing all control task functionality

#### `configuration.js`
**Purpose**: Contains all task configurations, rules, and trial sequences.

**Main Export Functions**:
- **`controlConfig(settings)`**: Creates configuration object based on session settings
  - **Base Rule**: Defines island-to-island drift patterns when ships lack fuel
  - **Control Rule**: Maps each ship color to its home base island
  - **Effort Thresholds**: Key press requirements for different current strengths [6, 12, 18]
  - **Island Names**: Session-specific naming conventions (e.g., fruits for different weeks)

**Trial Sequences**:
- **`EXPLORE_SEQUENCE`**: 72 trials for main session exploration phase
- **`PREDICT_SEQUENCE`**: 24 trials for prediction phase
- **`REWARD_SEQUENCE`**: 24 trials for reward collection phase
- **`EXPLORE_SEQUENCE_SCREENING`**: 24 trials for screening session (3 ships, 3 islands)
- **`PREDICT_SEQUENCE_SCREENING`**: 4 trials for screening predictions

#### `timeline.js`
**Purpose**: Creates the complete task timeline sequence.

**Main Export Functions**:
- **`createControlTimeline(settings)`**: Constructs full task sequence including preload, instructions, and core trials

#### `utils.js`
**Purpose**: Core utility functions for task construction, trial management, and data handling.

**Main Export Functions**:
- **`controlPreload(settings)`**: Preloads all necessary images and assets
- **`createCoreControlTimeline(settings)`**: Constructs main task trials from configuration sequences
- **`exploreShipTrial(settings)`**: Creates individual exploration trials
- **`predictHomeBaseTrial(settings)`**: Creates prediction phase trials
- **`rewardShipTrial(settings)`**: Creates reward collection trials

#### `instructions.js`
**Purpose**: Manages interactive instruction sequences for the control task.

**Main Export Functions**:
- **`createControlInstructionsTimeline(settings)`**: Complete interactive instruction sequence
- **`createOceanCurrents(level, choice, matchBaseRule)`**: Helper function for visualizing ocean currents in instructions

### Custom jsPsych Plugins

#### `plugins/plugin-explore-ship.js`
**Purpose**: Handles ship selection during exploration phase.
- Presents two ship options and records choice
- Manages visual presentation of ships and islands
- Records reaction times and choice data

#### `plugins/plugin-explore-ship-feedback.js`
**Purpose**: Provides feedback after ship selection in exploration.
- Shows ship navigation animation and outcome
- Displays whether ship reached home base or drifted
- Handles fuel/effort mechanics visualization

#### `plugins/plugin-predict-home-base.js`
**Purpose**: Manages prediction phase trials.
- Presents ship color and island options for home base prediction
- Records confidence ratings and prediction choices
- Handles visual presentation of prediction interface

#### `plugins/plugin-reward-prompt.js`
**Purpose**: Displays reward collection opportunities.
- Shows target island and available reward amount
- Presents current ocean strength and ship options
- Records decision to attempt reward collection

#### `plugins/plugin-reward-ship.js`
**Purpose**: Handles reward collection navigation.
- Manages ship selection for reward trials
- Calculates fuel costs and success/failure outcomes
- Records earnings and effort expenditure

### Styling

#### `styles.css`
**Purpose**: CSS styling for control task interface elements.
- Ocean and island visual layouts
- Ship animation and selection interfaces
- Current strength visualizations and fuel indicators
- Responsive design for different screen sizes
- Instruction phase interactive elements

## Task Mechanics

### Ship-Island Mapping
- **Screening Session**: 3 ships (red, blue, green) → 3 islands
- **Main Sessions**: 4 ships (red, blue, green, yellow) → 4 islands
- Ships have designated "home base" islands for efficient travel
- Ocean currents create circular drift pattern between islands

### Effort Requirements
- **Current Strength 1 (Weak)**: 6 key presses minimum
- **Current Strength 2 (Medium)**: 12 key presses minimum  
- **Current Strength 3 (Strong)**: 18 key presses minimum
- Insufficient effort leads to drift following ocean currents

## Usage Examples

### Basic Control Task
```javascript
import { createControlTimeline } from './tasks/control/index.js';

const settings = {
  session: "wk0"
};

const controlTimeline = createControlTimeline(settings);
```

### Custom Configuration
```javascript
import { controlConfig } from './tasks/control/configuration.js';

const settings = { session: "screening" };
const config = controlConfig(settings);
// Access base rules, control rules, effort thresholds
```

## Dependencies
- Core utilities from `/core/utils/index.js`
- jsPsych framework and plugins
- Asset images in `/assets/images/control/` and session-specific subdirectories
- Custom CSS styling for maritime theme and animations

## Data Output
The task records comprehensive trial-by-trial data including:

### Exploration Phase
- **Ship choices**: Left vs right ship selections and reaction times
- **Navigation outcomes**: Whether ships reached home base or drifted
- **Effort data**: Key press counts and patterns during fuel provision
- **Learning progression**: Trial-by-trial choice patterns indicating rule acquisition

### Prediction Phase  
- **Home base predictions**: Participant predictions for each ship's home island
- **Confidence ratings**: Subjective confidence in each prediction
- **Accuracy measures**: Correctness of predictions vs actual ship-island mappings

### Reward Phase
- **Strategic decisions**: Ship selections for reward collection attempts
- **Economic outcomes**: Rewards earned vs effort costs
- **Efficiency measures**: Success rates and optimal decision-making patterns
- **Bonus calculations**: Total earnings for participant compensation
