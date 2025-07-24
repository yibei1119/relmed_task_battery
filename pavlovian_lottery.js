/**
 * Pavlovian Lottery Task
 * 
 * A simple lottery game where participants view Pavlovian stimuli (as conditioned stimuli)
 * paired with coins (as unconditioned stimuli/rewards).
 * 
 * Participants press a key to run the lottery, which displays a Pavlovian stimulus
 * followed by its associated coin reward with animation effects.
 */

// Function to initialize the Pavlovian Lottery experiment
function initPavlovianLottery() {
  // Define the Pavlovian stimuli and their associated rewards
  const getSpeedUpFactor = () => window.simulating ? 10 : 1;

  var PREPILT_CONFIG = {
    sequence: [{ "pav_value": -1.0 }, { "pav_value": 0.5 }, { "pav_value": -1.0 }, { "pav_value": -1.0 }, { "pav_value": 0.01 }, { "pav_value": 1.0 }, { "pav_value": 0.01 }, { "pav_value": -0.01 }, { "pav_value": 0.5 }, { "pav_value": -0.01 }, { "pav_value": 0.01 }, { "pav_value": -0.01 }, { "pav_value": 1.0 }, { "pav_value": 1.0 }, { "pav_value": -0.5 }, { "pav_value": 0.01 }, { "pav_value": -0.5 }, { "pav_value": 0.5 }, { "pav_value": -1.0 }, { "pav_value": -0.5 }, { "pav_value": 1.0 }, { "pav_value": 0.5 }, { "pav_value": -1.0 }, { "pav_value": -0.5 }, { "pav_value": -0.01 }, { "pav_value": 0.5 }, { "pav_value": 1.0 }, { "pav_value": 0.01 }, { "pav_value": -0.01 }, { "pav_value": -0.5 }],

    stimulus: {
      0.01: "PIT3.png",
      1.0: "PIT1.png",
      0.5: "PIT2.png",
      "-0.01": "PIT4.png",
      "-1": "PIT6.png",
      "-0.5": "PIT5.png"
    },

    reward: {
      0.01: "1penny.png",
      1.0: "1pound.png",
      0.5: "50pence.png",
      "-0.01": "1pennybroken.png",
      "-1": "1poundbroken.png",
      "-0.5": "50pencebroken.png"
    },

    value: {
      0.01: "+ 1p",
      1.0: "+ £1",
      0.5: "+ 50p",
      "-0.01": "- 1p",
      "-1": "- £1",
      "-0.5": "- 50p"
    },

    CONSTANTS: {
      SMALL_COIN_SIZE: 100,
      get INITIAL_MOVEMENT_DELAY() { return 50 / getSpeedUpFactor(); },
      get REEL_SPIN_DURATION() { return 1500 / getSpeedUpFactor(); },
      get WINNING_HIGHLIGHT_DELAY() { return 450 / getSpeedUpFactor(); },
      get MAX_RESULT_DISPLAY_TIME() { return 4000 / getSpeedUpFactor(); },
      get CONTINUE_MESSAGE_DELAY() { return 1500 / getSpeedUpFactor(); }
    }
  };

  // Add index to PREPILT_CONFIG.sequence for resumption
  PREPILT_CONFIG.sequence = PREPILT_CONFIG.sequence.map((item, index) => ({
    prepilt_trial: index + 1,
    ...item
  }));

  // Create preload trial
  const prepilt_preload = {
    type: jsPsychPreload,
    auto_preload: true,
    images: [
      [1, 2, 3, 4, 5, 6].map(i => `imgs/Pav_stims/${window.session}/PIT${i}.png`),
      [
        "50pence.png",
        "1pound.png",
        "1penny.png",
        "1pennybroken.png",
        "50pencebroken.png",
        "1poundbroken.png",
      ].map(i => `imgs/${i}`)
    ].flat(),
    message: 'Loading the game... Please wait.',
    on_start: function () {
      // Report to tests
      console.log("load_successful")

      // Report to relmed.ac.uk
      postToParent({message: "load_successful"})
    },
    continue_after_error: true
  };

  // Create instructions screen
  const instructions = [{
    type: jsPsychInstructions,
    css_classes: ['instructions'],
    pages: [
      `
        <h2>Welcome to the Lucky Lottery Game!</h2>
        <p>Spin the lottery wheel to discover which patterns earn or lose coins.</p>
      `,
      `
        <p>Each spin reveals a pattern that will either reward you with a £1, 50p, or 1p coin, or break a coin.</p>
        <div style='display: grid;'>
            <table style='width: 200px; grid-column: 2;'>
                <tr>
                    <td><img src='imgs/1pound.png' style='width:${PREPILT_CONFIG.CONSTANTS.SMALL_COIN_SIZE}px; height:${PREPILT_CONFIG.CONSTANTS.SMALL_COIN_SIZE}px;'></td>
                    <td><img src='imgs/50pence.png' style='width:${PREPILT_CONFIG.CONSTANTS.SMALL_COIN_SIZE}px; height:${PREPILT_CONFIG.CONSTANTS.SMALL_COIN_SIZE}px;'></td>
                    <td><img src='imgs/1penny.png' style='width:${PREPILT_CONFIG.CONSTANTS.SMALL_COIN_SIZE}px; height:${PREPILT_CONFIG.CONSTANTS.SMALL_COIN_SIZE}px;'></td>
                </tr>
                <tr>
                    <td><img src='imgs/1poundbroken.png' style='width:${PREPILT_CONFIG.CONSTANTS.SMALL_COIN_SIZE}px; height:${PREPILT_CONFIG.CONSTANTS.SMALL_COIN_SIZE}px;'></td>
                    <td><img src='imgs/50pencebroken.png' style='width:${PREPILT_CONFIG.CONSTANTS.SMALL_COIN_SIZE}px; height:${PREPILT_CONFIG.CONSTANTS.SMALL_COIN_SIZE}px;'></td>
                    <td><img src='imgs/1pennybroken.png' style='width:${PREPILT_CONFIG.CONSTANTS.SMALL_COIN_SIZE}px; height:${PREPILT_CONFIG.CONSTANTS.SMALL_COIN_SIZE}px;'></td>
                </tr>
            </table>
        </div>
        <p>Your bonus payment will depend on the coins you find in this task and the next ones. Each coin adds to your bonus, but broken coins reduce it.</p>
      `
    ],
    show_clickable_nav: true,
    data: { trialphase: 'prepilt_instruction' }
  },
  {
    type: jsPsychHtmlKeyboardResponse,
    css_classes: ['instructions'],
    stimulus: `
    <p>The game consists of ${parseInt(PREPILT_CONFIG.sequence.length)} spins in total.</p>
    <p>When you're ready, place your fingers comfortably on the <span class="spacebar-icon">Spacebar</span>.</p>
    <p class="highlight-txt">Press down the <span class="spacebar-icon">Spacebar</span> to begin your first spin!</p>
    `,
    choices: [' '],
    data: { trialphase: 'prepilt_instruction' },
    on_start: () => {updateState("prepilt_conditioning_start")}
  }
  ];

  // Create a one-armed bandit style animation with center focus
  const lotteryAnimation = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: function () {
      // Create a carousel/slot machine style display
      return `
        <div class="trial-content-wrapper">
          <h3>Spinning the Lucky Lottery!</h3>
          <div class="slot-machine-container">
            <div class="selection-frame"></div>
            <div id="slot-reel" class="slot-reel">
              <!-- Slot images will be added via JavaScript -->
            </div>
          </div>
          <div class="lower-message-area">
            <p style="font-size: 28px; font-weight: bold; margin: 10px 0; visibility: hidden;"></p>
            <p id="continue-msg" style="visibility: hidden;">Press <span class="spacebar-icon">Spacebar</span> to continue</p>
          </div>
        </div>
      `;
    },
    record_data: false,
    choices: "NO_KEYS",
    trial_duration: function() {
      return PREPILT_CONFIG.CONSTANTS.REEL_SPIN_DURATION;
    },
    on_load: function () {
      const currentStimulus = "imgs/Pav_stims/" + window.session + "/" + PREPILT_CONFIG.stimulus[jsPsych.evaluateTimelineVariable('pav_value')];
      const slotReel = document.getElementById('slot-reel');
      const slotContainer = document.querySelector('.slot-machine-container');
      const selectionFrame = document.querySelector('.selection-frame');

      // Create pavlovianStimuli array from PREPILT_CONFIG
      const pavlovianStimuli = Object.values(PREPILT_CONFIG.stimulus).map((filename) => {
        return {
          stimulus: "imgs/Pav_stims/" + window.session + "/" + filename
        };
      });

      if (slotReel && slotContainer) {
        // Create a long sequence of images that repeats all stimuli several times
        let reelContent = '';

        // Function to shuffle an array (Fisher-Yates algorithm)
        function shuffleArray(array) {
          const newArray = [...array];
          for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
          }
          return newArray;
        }

        // Create a sequence with no consecutive duplicates
        let lastImageSrc = null;
        const allItems = [];

        // Create 5 sets of shuffled stimuli (enough for the full reel)
        for (let i = 0; i < 5; i++) {
          // Get shuffled stimuli
          let shuffledStimuli = shuffleArray([...pavlovianStimuli]);

          // Check if first item matches last item from previous set
          if (lastImageSrc !== null && shuffledStimuli[0].stimulus === lastImageSrc) {
            // Swap with another position to avoid duplicates
            for (let j = 1; j < shuffledStimuli.length; j++) {
              if (shuffledStimuli[j].stimulus !== lastImageSrc) {
                // Swap positions to avoid duplicate
                [shuffledStimuli[0], shuffledStimuli[j]] = [shuffledStimuli[j], shuffledStimuli[0]];
                break;
              }
            }
          }

          // Add all stimuli from this set
          shuffledStimuli.forEach(stim => {
            allItems.push(stim.stimulus);
            lastImageSrc = stim.stimulus;
          });
        }

        // Check for any remaining duplicates (in case there are any)
        for (let i = 0; i < allItems.length - 1; i++) {
          if (allItems[i] === allItems[i + 1]) {
            // Find a different stimulus to replace the duplicate
            const options = pavlovianStimuli
              .map(stim => stim.stimulus)
              .filter(src => src !== allItems[i] && (i + 2 >= allItems.length || src !== allItems[i + 2]));

            if (options.length > 0) {
              // Replace with a non-duplicate option
              allItems[i + 1] = options[Math.floor(Math.random() * options.length)];
            }
          }
        }

        // Generate HTML for all items
        allItems.forEach(stimSrc => {
          reelContent += `
            <div class="slot-item">
              <img src="${stimSrc}" class="slot-image">
            </div>
          `;
        });

        // Ensure penultimate item is different from both target and the last item in allItems
        const lastItemInSequence = allItems[allItems.length - 1];
        const filteredStimuli = pavlovianStimuli.filter(stim =>
          stim.stimulus !== currentStimulus &&
          stim.stimulus !== lastItemInSequence
        );
        const penultimateStimulus = filteredStimuli[Math.floor(Math.random() * filteredStimuli.length)].stimulus;

        // Add a penultimate item that is guaranteed to be different from the target
        reelContent += `
          <div class="slot-item">
            <img src="${penultimateStimulus}" class="slot-image">
          </div>
        `;

        // Add our target item as the final item that will stop in the center
        reelContent += `
          <div class="slot-item target-item" id="winning-item">
            <img src="${currentStimulus}" class="slot-image">
          </div>
        `;

        // Fill the reel with content
        slotReel.innerHTML = reelContent;

        // Calculate the width of the reel for proper positioning
        const itemWidth = Math.ceil((window.innerWidth * (30 + 1 * 2) / 100)); // 240px width + 20px margin
        const totalItems = slotReel.children.length;
        slotReel.style.width = (itemWidth * totalItems) + 'px';

        // Initial position: far to the right so items appear to enter from the right
        slotReel.style.transform = `translateX(${slotContainer.offsetWidth}px)`;

        // Find the target item position (it's the last item in our reel)
        const winningItem = document.getElementById('winning-item');

        // Calculate the exact position needed to center the target in the frame
        const containerCenter = slotContainer.offsetWidth / 2;
        const targetPosition = containerCenter - (winningItem.offsetLeft + (winningItem.offsetWidth / 2));

        // Animation sequence
        setTimeout(() => {
          // First movement: slide from right to left through container
          slotReel.style.transition = 'transform 0.5s cubic-bezier(0, 0.4, 0.6, 1)';
          slotReel.style.transform = `translateX(${targetPosition}px)`;

          // Phase 2: Highlight the winning item and the frame
          setTimeout(() => {
            if (winningItem) {
              winningItem.classList.add('winning-item');
            }
            if (selectionFrame) {
              selectionFrame.classList.add('frame-highlight');
            }
          }, PREPILT_CONFIG.CONSTANTS.WINNING_HIGHLIGHT_DELAY);
        }, PREPILT_CONFIG.CONSTANTS.INITIAL_MOVEMENT_DELAY);
      }
    }
  };

  // Create a combined result display that shows the stimulus with its coin
  const showResult = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: function () {
      const stimulusImg = "imgs/Pav_stims/" + window.session + "/" + PREPILT_CONFIG.stimulus[jsPsych.evaluateTimelineVariable('pav_value')];
      const rewardImg = "imgs/" + PREPILT_CONFIG.reward[jsPsych.evaluateTimelineVariable('pav_value')];
      const value = PREPILT_CONFIG.value[jsPsych.evaluateTimelineVariable('pav_value')];

      return `
        <div class="trial-content-wrapper">
          <h3>You got:</h3>
          <div class="result-stimulus">
            <div class="result-frame"></div>
            <img src="${stimulusImg}" class="result-image">
            <img src="${rewardImg}" class="coin-image">
          </div>
          <div class="lower-message-area">
            <p class="${value.includes('-') ? 'negative' : 'positive'}">${value}</p>
            <p id="continue-msg" style="visibility: hidden;">Press <span class="spacebar-icon">Spacebar</span> to continue</p>
          </div>
        </div>
      `;
    },
    choices: "NO_KEYS",
    trial_duration: function() {
      return PREPILT_CONFIG.CONSTANTS.MAX_RESULT_DISPLAY_TIME;
    },
    save_timeline_variables: true,
    data: { trialphase: 'prepilt_conditioning'},
    on_start: function (trial) {
      jsPsych.pluginAPI.setTimeout(() => {
        const continueMsg = document.querySelector('#continue-msg');
        continueMsg.style.visibility = 'visible';
      }, PREPILT_CONFIG.CONSTANTS.CONTINUE_MESSAGE_DELAY); // Delay before showing the prompt
      jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: (info) => {
          jsPsych.finishTrial({
            response: info.key,
            rt: info.rt
          });
        },
        valid_responses: [' '],
        rt_method: 'performance',
        persist: false,
        allow_held_key: false,
        minimum_valid_rt: PREPILT_CONFIG.CONSTANTS.CONTINUE_MESSAGE_DELAY,
      });
      if (jsPsych.evaluateTimelineVariable('prepilt_trial') < PREPILT_CONFIG.sequence.length) {
        updateState(`pavlovian_lottery_${jsPsych.evaluateTimelineVariable('prepilt_trial')}`, false);
      } else {
        updateState("pavlovian_lottery_last", false);
      }
    }
  };

  // Build the main task trial sequence
  let last_lottery = 0; // Default value
  if (typeof window.last_state === 'string' && (window.last_state.match(/_/g) || []).length >= 2) {
    const parts = window.last_state.split("_");
    last_lottery = parseInt(parts[2]) || 0; // Fallback to 0 if parsing fails
  } else {
    console.warn("Invalid format for window.last_state. Falling back to default value.");
  }
  const trialSequence = {
    timeline: [
      lotteryAnimation,
      showResult,
    ],
    timeline_variables: PREPILT_CONFIG.sequence.slice(last_lottery)
  };

  // Create an ending message
  const endMessage = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
      <h2>Great job!</h2>
      <p>You've completed all the lottery spins.</p>
      <p>Press any key to continue to the next part of the experiment.</p>
    `,
    post_trial_gap: 800
  };

  // Build the full experiment timeline
  const timeline = [
    // prepilt_preload, // Disabled because preloading is currently handled elsewhere. Re-enable this line if additional preloading is required for new stimuli or assets.
    instructions,
    trialSequence,
    endMessage
  ];

  // Return the timeline
  return timeline;
}