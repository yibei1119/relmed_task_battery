// Import functions 
import { postToParent, saveDataREDCap, updateBonusState, updateState, showTemporaryWarning, kick_out, fullscreen_prompt } from '/core/utils/index.js';

// Trial plan for Vigour task
const VIGOUR_TRIALS = [{ "magnitude": 1, "ratio": 1, "trialDuration": 6825 }, { "magnitude": 2, "ratio": 8, "trialDuration": 6956 }, { "magnitude": 1, "ratio": 16, "trialDuration": 7228 }, { "magnitude": 5, "ratio": 1, "trialDuration": 7221 }, { "magnitude": 5, "ratio": 16, "trialDuration": 7261 }, { "magnitude": 2, "ratio": 1, "trialDuration": 7386 }, { "magnitude": 1, "ratio": 8, "trialDuration": 7009 }, { "magnitude": 5, "ratio": 8, "trialDuration": 7376 }, { "magnitude": 2, "ratio": 16, "trialDuration": 6666 }, { "magnitude": 1, "ratio": 1, "trialDuration": 6962 }, { "magnitude": 2, "ratio": 8, "trialDuration": 6501 }, { "magnitude": 2, "ratio": 1, "trialDuration": 7236 }, { "magnitude": 5, "ratio": 1, "trialDuration": 7490 }, { "magnitude": 1, "ratio": 16, "trialDuration": 6902 }, { "magnitude": 1, "ratio": 8, "trialDuration": 6888 }, { "magnitude": 2, "ratio": 16, "trialDuration": 6891 }, { "magnitude": 5, "ratio": 8, "trialDuration": 6535 }, { "magnitude": 5, "ratio": 16, "trialDuration": 6652 }, { "magnitude": 1, "ratio": 8, "trialDuration": 6890 }, { "magnitude": 5, "ratio": 8, "trialDuration": 7452 }, { "magnitude": 5, "ratio": 16, "trialDuration": 6954 }, { "magnitude": 2, "ratio": 1, "trialDuration": 6827 }, { "magnitude": 5, "ratio": 1, "trialDuration": 6679 }, { "magnitude": 1, "ratio": 16, "trialDuration": 7199 }, { "magnitude": 2, "ratio": 16, "trialDuration": 7207 }, { "magnitude": 1, "ratio": 1, "trialDuration": 7145 }, { "magnitude": 2, "ratio": 8, "trialDuration": 7465 }, { "magnitude": 1, "ratio": 8, "trialDuration": 6870 }, { "magnitude": 5, "ratio": 8, "trialDuration": 6726 }, { "magnitude": 2, "ratio": 16, "trialDuration": 6688 }, { "magnitude": 2, "ratio": 8, "trialDuration": 6506 }, { "magnitude": 5, "ratio": 1, "trialDuration": 7044 }, { "magnitude": 2, "ratio": 1, "trialDuration": 7293 }, { "magnitude": 1, "ratio": 1, "trialDuration": 7182 }, { "magnitude": 1, "ratio": 16, "trialDuration": 6862 }, { "magnitude": 5, "ratio": 16, "trialDuration": 6985 }];

// Find unique magnitudes and ratios for piggy tails
const magnitudes = [...new Set(VIGOUR_TRIALS.map(trial => trial.magnitude))].sort((a, b) => a - b);
const ratios = [...new Set(VIGOUR_TRIALS.map(trial => trial.ratio))].sort((a, b) => b - a);


// Task state tracking
let taskTotalReward = 0;
let taskTotalPresses = 0;

// First preload for task
function preloadVigour(settings) {
  return {
    type: jsPsychPreload,
    images: [
      [
        "1p-num.png", "2p-num.png", "5p-num.png", "10p-num.png", "piggy-bank.png", 
        "ooc_2p.png", "piggy-tail2.png", "saturate-icon.png", "tail-icon.png",
        "occluding_clouds.png"
      ].map(s => "imgs/" + s),
      [
        "PIT1.png", "PIT2.png", "PIT3.png", "PIT4.png", "PIT5.png", "PIT6.png"
      ].map(s => "/assets/images/pavlovian-stims/" + settings.session + "/" + s)
    ].flat(),
    post_trial_gap: 800,
    data: {
        trialphase: "preload_PILT"
    },
    on_start: () => {

        // Report to tests
        console.log("load_successful")

        // Report to relmed.ac.uk
        postToParent({message: "load_successful"})
    },
    continue_after_error: true
  };
}


// Functions for animation
function animatePiggy(keyframes, options) {
  const piggyBank = document.getElementById('piggy-container');
  if (piggyBank) {
    let currentTransform = getComputedStyle(piggyBank).transform;
    currentTransform = currentTransform === 'none' ? '' : currentTransform;
    const animationKeyframes = keyframes.map(frame => ({
      transform: `${currentTransform} ${frame}`
    }));
    piggyBank.animate(animationKeyframes, options);
  }
}

// Shake piggy bank animation
function shakePiggy() {
  animatePiggy([
    'translateX(-1%)',
    'translateX(1%)',
    'translateX(0)'
  ], { duration: 80, easing: 'linear' });
}

// Drop coin animation
function dropCoin(magnitude, persist = false) {
  const containerType = persist ? 'persist-coin-container' : 'coin-container';
  const coinContainer = document.getElementById(containerType);
  const coin = createCoin(magnitude);
  coinContainer.appendChild(coin);

  const animationOptions = getCoinAnimationOptions(magnitude);
  coin.animate(animationOptions.keyframes, animationOptions.config)
    .onfinish = () => coin.remove();
}

function createCoin(magnitude) {
  const coin = document.createElement('img');
  coin.className = 'vigour_coin';
  coin.src = magnitude === 0 ? 'imgs/ooc_2p.png' : `imgs/${magnitude}p-num.png`;
  coin.alt = `Coin of value ${magnitude}`;
  return coin;
}

function getCoinAnimationOptions(magnitude) {
  const duration = magnitude === 0 ? 2500 : 1000;
  const topStart = '-15%';
  const opacityStart = 0.8;

  return {
    keyframes: [
      { top: topStart, opacity: opacityStart, offset: 0 },
      { top: '70%', opacity: 1, offset: 0.1 },
      { top: '70%', opacity: 1, offset: 0.9 },
      { top: '70%', opacity: 0, offset: 1 }
    ],
    config: {
      duration: duration,
      easing: 'ease-in-out'
    }
  };
}

// Set up an observer to handle dynamic resizing
function observeResizing(elementId, callback) {
  const resizeObserver = new ResizeObserver(callback);
  const element = document.getElementById(elementId);
  if (element) {
    resizeObserver.observe(element);
  }
}

// Function to create persistent coin container
function createPersistentCoinContainer() {
  // Check if it already exists
  if (document.getElementById('persist-coin-container')) {
    return;
  }
  
  // Create the container
  const persistContainer = document.createElement('div');
  persistContainer.id = 'persist-coin-container';
  document.body.appendChild(persistContainer);
  
  // Initialize position
  updatePersistentCoinContainer();
}

function removePersistentCoinContainer() {
  const persistContainer = document.getElementById('persist-coin-container');
  if (persistContainer) {
    persistContainer.remove();
  }
}

// Update persistent coin container position based on coin container
function updatePersistentCoinContainer() {
  const coinContainer = document.getElementById('coin-container');
  const persistCoinContainer = document.getElementById('persist-coin-container');

  if (coinContainer && persistCoinContainer) {
    const rect = coinContainer.getBoundingClientRect();
    persistCoinContainer.style.top = `${rect.top}px`;
    persistCoinContainer.style.left = `${rect.left}px`;
    persistCoinContainer.style.width = `${rect.width}px`;
    persistCoinContainer.style.height = `${rect.height}px`;
  }
}

function updatePiggyTails(magnitude, ratio) {
  const piggyContainer = document.getElementById('piggy-container');
  const piggyBank = document.getElementById('piggy-bank');

  const magnitude_index = magnitudes.indexOf(magnitude);
  const ratio_index = ratios.indexOf(ratio);
  // Calculate saturation based on ratio
  const ratio_factor = ratio_index / (ratios.length - 1);

  // Remove existing tails
  document.querySelectorAll('.piggy-tail').forEach(tail => tail.remove());

  // Wait for the piggy bank image to load
  piggyBank.onload = () => {
    const piggyBankWidth = piggyBank.offsetWidth;
    const tailWidth = piggyBankWidth * 0.1; // Adjust this factor as needed
    const spacing = tailWidth * 0; // Adjust spacing between tails
    for (let i = 0; i < magnitude_index + 1; i++) {
      const tail = document.createElement('img');
      tail.src = 'imgs/piggy-tail2.png';
      tail.alt = 'Piggy Tail';
      tail.className = 'piggy-tail';

      // Position each tail
      tail.style.left = `calc(50% + ${piggyBankWidth / 2 + (tailWidth + spacing) * i}px - ${tailWidth / 20}px)`;
      tail.style.width = `${tailWidth}px`;
      tail.style.filter = `saturate(${50 * (400 / 50) ** ratio_factor}%) brightness(${115 * (90 / 115) ** ratio_factor}%)`;

      piggyContainer.appendChild(tail);
    }
  };

  // Trigger onload if the image is already cached
  if (piggyBank.complete) {
    piggyBank.onload();
  }
}

// Trial stimulus function
function generateTrialStimulus(magnitude, ratio) {
  const ratio_index = ratios.indexOf(ratio);
  // Calculate saturation based on ratio
  const ratio_factor = ratio_index / (ratios.length - 1);
  const piggy_style = `filter: saturate(${50 * (400 / 50) ** ratio_factor}%) brightness(${115 * (90 / 115) ** ratio_factor}%);`;
  return `
    <div class="experiment-wrapper">
      <!-- Middle Row (Piggy Bank & Coins) -->
      <div id="experiment-container">
        <div id="coin-container"></div>
        <div id="piggy-container">
          <!-- Piggy Bank Image -->
          <img id="piggy-bank" src="imgs/piggy-bank.png" alt="Piggy Bank" style="${piggy_style}">
        </div>
      </div>
    </div>
  `;
}

// Box shaking trial
let vigourTrialCounter = 0;
let fsChangeHandler = null;

function piggyBankTrial() {
  return {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: function () {
      return generateTrialStimulus(jsPsych.evaluateTimelineVariable('magnitude'), jsPsych.evaluateTimelineVariable('ratio'));
    },
    choices: 'NO_KEYS',
    // response_ends_trial: false,
    trial_duration: jsPsych.timelineVariable('trialDuration'),
    save_timeline_variables: ["magnitude", "ratio"],
    data: {
      trialphase: 'vigour_trial',
      trial_duration: jsPsych.timelineVariable('trialDuration'),
      response_time: function() { return this.trialState?.responseTime || [] },
      trial_presses: function() { return this.trialState?.trialPresses || 0 },
      trial_reward: function() { return this.trialState?.trialReward || 0 },
      // Record global data
      total_presses: function() { return taskTotalPresses },
      total_reward: function() { return taskTotalReward }
    },
    on_start: function (trial) {
      if (window.simulating) {
        trial.trial_duration = 500;
      }
      // Create trial state
      const trialState = {
        trialPresses: 0,
        trialReward: 0,
        responseTime: []
      };
      
      // Store trial state in trial data for access by data functions
      trial.data.trialState = trialState;

      let lastPressTime = 0;
      let pressCount = 0;

      const ratio = jsPsych.evaluateTimelineVariable('ratio');
      const magnitude = jsPsych.evaluateTimelineVariable('magnitude');

      const keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: function (info) {
          trialState.responseTime.push(info.rt - lastPressTime);
          lastPressTime = info.rt;
          // wigglePiggy();
          shakePiggy();
          pressCount++;
          trialState.trialPresses++;
          taskTotalPresses++;

          if (pressCount === ratio) {
            trialState.trialReward += magnitude;
            taskTotalReward += magnitude;
            pressCount = 0;
            dropCoin(magnitude, true);
          }
        },
        valid_responses: ['b'],
        rt_method: 'performance',
        persist: true,
        allow_held_key: false,
        minimum_valid_rt: 0
      });
    },
    on_load: function () {
      const currentMag = jsPsych.evaluateTimelineVariable('magnitude');
      const currentRatio = jsPsych.evaluateTimelineVariable('ratio');
      updatePiggyTails(currentMag, currentRatio);
      updatePersistentCoinContainer(); // Update the persistent coin container
      observeResizing('coin-container', updatePersistentCoinContainer);

      // Add fullscreen change listener to re-update piggy tails
      fsChangeHandler = () => {
        if (document.fullscreenElement || document.webkitFullscreenElement) {
          updatePiggyTails(currentMag, currentRatio);
        }
      };
      document.addEventListener('fullscreenchange', fsChangeHandler);
      document.addEventListener('webkitfullscreenchange', fsChangeHandler);

      // Simulating keypresses
      if (window.simulating) {
        trial_presses = jsPsych.randomization.randomInt(1, 8);
        avg_rt = 500/trial_presses;
        for (let i = 0; i < trial_presses; i++) {
          jsPsych.pluginAPI.pressKey('b', avg_rt * i + 1);
        }
      }
    },
    on_finish: function (data) {
      // Clean up listener
      jsPsych.pluginAPI.cancelAllKeyboardResponses();
      vigourTrialCounter += 1;
      data.trial_number = vigourTrialCounter;
      if (vigourTrialCounter % (VIGOUR_TRIALS.length / 3) == 0 || vigourTrialCounter == VIGOUR_TRIALS.length) {
        saveDataREDCap(retry = 3);
        
        updateBonusState();
      }
      if (fsChangeHandler) {
        document.removeEventListener('fullscreenchange', fsChangeHandler);
        document.removeEventListener('webkitfullscreenchange', fsChangeHandler);
        fsChangeHandler = null;
      }

      // No response
      if (data.trial_presses === 0 && data.timeline_variables.ratio === 1) {
        var up_to_now = parseInt(jsPsych.data.get().last(1).select('n_warnings').values);
        jsPsych.data.addProperties({
          n_warnings: up_to_now + 1
        });
        // console.log(jsPsych.data.get().last(1).select('n_warnings').values[0]);
        showTemporaryWarning("Didn't catch a response - moving on", 800); // Enable this line for non-stopping warning
      }
      
      // Clean up trial state reference
      delete data.trialState;
    }
  }
};


// Log-normal probability density function
function logNormalPDF(x, mu, sigma) {
  return Math.exp(-0.5 * Math.pow((Math.log(x) - mu) / sigma, 2)) / (x * sigma * Math.sqrt(2 * Math.PI));
}

function createVigourCoreTimeline() {
    let experimentTimeline = [];
    VIGOUR_TRIALS.forEach(trial => {
        experimentTimeline.push({
            timeline: [kick_out, fullscreen_prompt, piggyBankTrial], 
            timeline_variables: [trial]
        });
    });

    experimentTimeline[0]["on_timeline_start"] = () => {
        updateState("no_resume_10_minutes");
        updateState(`vigour_task_start`);
        createPersistentCoinContainer();
        // Reset task counters
        taskTotalReward = 0;
        taskTotalPresses = 0;
    };

    experimentTimeline.at(-1)["on_timeline_finish"] = () => {
        removePersistentCoinContainer();
    };
    
    return experimentTimeline;
}


export {
  createVigourCoreTimeline,
  preloadVigour,
  updatePersistentCoinContainer, 
  observeResizing, 
  shakePiggy, 
  dropCoin
}