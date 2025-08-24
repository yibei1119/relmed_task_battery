# Delay Discounting Task

## Overview
The delay discounting task is a behavioral economics paradigm that measures participants' preferences for immediate versus delayed monetary rewards. Participants make a series of choices between smaller amounts of money available immediately and larger amounts available after specified delays. This task provides insights into intertemporal choice behavior, impulsivity, and self-control by quantifying how much participants discount the value of future rewards.

## File Structure

### Core Files

#### `index.js`
**Purpose**: Main entry point that centralizes all exports from the task module.
- Re-exports all functions from `task.js`
- Provides a single import point for accessing delay discounting task functionality
- Maintains consistency with other task modules despite being a single-file implementation

#### `task.js`
**Purpose**: Contains all task logic, trial construction, and timeline management functions.

**Main Export Functions**:
- **`createDelayDiscountingTimeline(settings)`**: Creates the complete timeline for the delay discounting task
  - Handles instructions and all 27 choice trials
  - Integrates warning system for missed responses
  - Returns array of jsPsych trial objects for the full assessment

**Core Components**:
- **`DD_SUM_DELAYS`**: Array of 27 predefined choice scenarios
  - Each scenario contains immediate amount, delayed amount, and delay period
  - Covers range of reward ratios and delay periods for comprehensive assessment
  - Based on established monetary choice questionnaire methodology

- **`ddTrial(settings)`**: Creates individual choice trial objects
  - Presents two-alternative forced choice between immediate and delayed rewards
  - Implements response time limits with warning system integration
  - Records choice data along with trial parameters
  - Includes 300ms button enable delay to prevent accidental responses

**Instruction Components**:
- **`dd_instructions`**: Multi-page instruction sequence explaining the task
  - Describes hypothetical nature of monetary choices
  - Explains choice format and response requirements
  - Initializes warning counter for response monitoring

**Data Processing**:
- **Choice Mapping**: Automatically converts button responses to meaningful choice indicators
- **Warning Integration**: Tracks missed responses and integrates with experiment-wide warning system
- **Trial Parameters**: Records immediate amount, delayed amount, and delay period for each choice

#### `styles.css`
**Purpose**: CSS styling for the delay discounting task interface.
- Defines button styling for choice options (`.dd-btn`)
- Handles disabled button states while maintaining visual consistency
- Ensures clear presentation of monetary choices
- Maintains accessibility standards for button interactions

## Task Design

### Choice Structure
The task presents 27 binary choices derived from established delay discounting research:
- **Immediate Options**: Range from £11 to £80 available today
- **Delayed Options**: Range from £25 to £85 available after delays
- **Delay Periods**: Range from 7 to 186 days
- **Choice Format**: Side-by-side presentation with clear monetary amounts and timing

### Behavioral Measurement
- **Discount Rate**: Calculated from pattern of immediate vs. delayed choices
- **Impulsivity Index**: Preference for immediate rewards across different scenarios
- **Consistency Patterns**: Response patterns across similar choice scenarios
- **Individual Differences**: Variation in temporal preference functions

### Response Collection
- **Interface**: Two-button choice presentation with clear option labeling
- **Timing**: 300ms delay before buttons become active to prevent premature responses
- **Deadlines**: Configurable response time limits with warning system integration
- **Data Recording**: Choice selection, response time, and trial parameters

### Quality Control
- **Response Monitoring**: Integration with experiment-wide warning system
- **Time Limits**: Adjustable deadlines based on participant response history
- **Missing Response Handling**: Graceful management of timeouts with appropriate warnings
- **Data Validation**: Automatic conversion of responses to interpretable choice indicators

## Usage Example

```javascript
import { createDelayDiscountingTimeline } from './tasks/delay-discounting/index.js';

// Create delay discounting timeline
const settings = {
  default_response_deadline: 10000,    // 10 seconds for most participants
  long_response_deadline: 15000        // 15 seconds for participants with warnings
};

const delayDiscountingTimeline = createDelayDiscountingTimeline(settings);

// Add to jsPsych experiment
jsPsych.run(delayDiscountingTimeline);
```

## Settings Configuration

### Required Parameters
- **`default_response_deadline`**: Standard response time limit in milliseconds (number)
- **`long_response_deadline`**: Extended time limit for participants with previous warnings (number)

### Example Settings
```javascript
const typicalSettings = {
  default_response_deadline: 10000,   // 10 seconds
  long_response_deadline: 15000       // 15 seconds
};
```

## Dependencies
- Core utilities from `/core/utils/index.js` (updateState, noChoiceWarning, canBeWarned)
- jsPsych framework and plugins (html-button-response, instructions)
- Custom CSS styling for button presentation and accessibility
- Integration with experiment-wide warning and state management systems

## Data Output
The task records comprehensive choice data including:
- **Choice Parameters**: Immediate amount, delayed amount, delay period for each trial
- **Response Data**: Button selection, response time, choice direction (immediate/delayed)
- **Behavioral Indicators**: Derived measures like `chosen_later` for analysis
- **Quality Metrics**: Warning counts and response compliance indicators
- **Trial Information**: Phase markers and completion timestamps
