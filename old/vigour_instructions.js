// vigour_instructions.js

// Instruction page configuration
const instructionPage = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: generateInstructStimulus,
  choices: ["NO_KEYS"],
  trial_duration: null,
  data: {trialphase: 'vigour_instructions'},
  on_load: function () {
    updatePersistentCoinContainer();
    observeResizing('coin-container', updatePersistentCoinContainer);

    let shakeCount = 0;
    let FR = 5;
    let timerStarted = false;
    let timer;
    updateInstructionText(shakeCount);
    const bottomContainer = document.getElementById('bottom-container');
    const experimentContainer = document.getElementById('experiment-container');
    const buttonInstruction = document.getElementById('button-instruction');
    let keyboardListener = setupKeyboardListener(handleSpacebar);

    function handleSpacebar() {
      shakeCount++;
      shakePiggy();
      updateInstructionText(shakeCount);

      if (shakeCount % FR === 0) {
        dropCoin(0);
      }

      if (shakeCount === FR + 1) {
        bottomContainer.style.visibility = 'visible';

        if (!timerStarted) {
          timerStarted = true;
          startTimer();
        }
      }
    }

    function startTimer() {
      timer = setTimeout(() => {
        experimentContainer.style.visibility = 'hidden';
        // buttonInstruction.style.fontSize = '1.5em';
        buttonInstruction.style.color = '#0066cc';
      }, 10000); // 10 seconds
    }

    function restart() {
      shakeCount = 0;
      timerStarted = false;
      clearTimeout(timer);
      updateInstructionText(shakeCount);
      experimentContainer.style.visibility = 'visible';
      bottomContainer.style.visibility = 'hidden';
      buttonInstruction.style.fontSize = '';
      buttonInstruction.style.color = '';
      jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      keyboardListener = setupKeyboardListener(handleSpacebar);
      const coinContainer = document.getElementById('coin-container');
      coinContainer.innerHTML = '';
    }

    document.getElementById('restart-button').addEventListener('click', restart);
    document.getElementById('continue-button').addEventListener('click', jsPsych.finishTrial);

    // Add simulation for the instruction page
    if (window.simulating) {
      async function simulateKeyPressesAndClick() {
        const pressKeyPromises = [];
        // FR is defined in the outer scope (e.g., let FR = 5;)
        // Loop to schedule FR + 1 key presses
        for (let i = 0; i < FR + 1; i++) {
          const scheduledTime = 100 * i + 1; // Delay for this specific key press

          pressKeyPromises.push(
        new Promise(resolve => {
          // Schedule the key press simulation
          jsPsych.pluginAPI.pressKey('b', scheduledTime);
          
          // This promise resolves when the time for this key press simulation has passed
          setTimeout(resolve, scheduledTime);
        })
          );
        }

        // Wait for all promises in the array to resolve.
        // This means waiting until the maximum scheduledTime (i.e., 100 * FR) has passed.
        // At this point, all key presses should have been simulated.
        await Promise.all(pressKeyPromises);

        // Now that all key presses are simulated, call clickTarget.
        // The click will be simulated 100ms after this function call.
        jsPsych.pluginAPI.clickTarget(document.getElementById('continue-button'), 100);
      }

      // Call the async function to start the simulation
      simulateKeyPressesAndClick();
    }
  },
  on_finish: function () {
    jsPsych.pluginAPI.cancelAllKeyboardResponses();
  }
};

// Before starting the first trial
// If one wants to specify the simulation options, then it should provide view_history (array: {page_index: (starting from 0), viewing_time}) and rt (the time spent on the whole instruction).
// But setting global simulation options will cause the view_history array in the local simulation options to be an object rather than an array. So the simulation mode would not work.
const ruleInstruction = {
  type: jsPsychInstructions,
  data: {trialphase: 'vigour_instructions'},
  show_clickable_nav: true,
  pages: [`
  <div id="instruction-text" style="text-align: left">
    <p><strong>You will now play a few minutes of this game, collecting coins!</strong></p>
    
    <p>Throughout the game, you will see different piggy banks with unique appearances:</p>
    <ul>
        <li><img src="imgs/saturate-icon.png" style="height:1.3em; transform: translateY(0.2em)"> <span class="highlight-txt">Vividness</span> of piggy colors: Indicates how fast you need to shake it.</li>
        <li><img src="imgs/tail-icon.png" style="height:1.3em; transform: translateY(0.2em)"> <span class="highlight-txt">Tail length</span>: Longer piggy tails = more valuable coins.</li>
    </ul>
    </div>
    `,
    `<div id="instruction-text" style="text-align: left">
    <p>Types of coins you can win:</p>
    <div class="instruct-coin-container">
        <div class="instruct-coin">
            <img src="imgs/1p-num.png" alt="1 Penny">
            <p>1 Penny</p>
        </div>
        <div class="instruct-coin">
            <img src="imgs/2p-num.png" alt="2 Pence">
            <p>2 Pence</p>
        </div>
        <div class="instruct-coin">
            <img src="imgs/5p-num.png" alt="5 Pence">
            <p>5 Pence</p>
        </div>
    </div>
    
    <p><span class="highlight-txt">Your bonus</span>: At the end of the game, we will pay you a proportion of the total amount of coins collected across all the piggy banks.</p>
    </div>
      `]
};

const startConfirmation = {
  type: jsPsychHtmlKeyboardResponse,
  choices: ['b', 'r'],
  stimulus: `
  <div id="instruction-text">
      <p>You will now play the piggy-bank game without a break for about <strong>four minutes</strong>.</p>
      <p>When you're ready, place the <strong>index finger of the hand you write with</strong> comfortably on the <span class="spacebar-icon">B</span> key, as shown below.</p>
      <p>Use only this finger to press during the game.</p>
      <p>Press it once to begin.</p>
      <img src="imgs/Vigour_key.png" style="width:250px;" alt="Key press illustration">
      <p>If you want to start over from the beginning, press <span class="spacebar-icon">R</span>.</p>
  </div>
    `,
  post_trial_gap: 300,
  data: {trialphase: 'vigour_instructions'},
  simulation_options: {
    data: {
      response: 'b'
    }
  },
  on_finish: function (data) {
    const seed = jsPsych.randomization.setSeed();
    data.rng_seed = seed;
  },
}

const vigourInstructions = {
  timeline: [instructionPage, ruleInstruction, startConfirmation],
  loop_function: function (data) {
    const last_iter = data.last(1).values()[0];
    if (jsPsych.pluginAPI.compareKeys(last_iter.response, 'r')) {
      return true;
    } else {
      return false;
    }
  },
  on_timeline_start: () => {updateState(`vigour_instructions_start`)}
}

// Function to generate stimulus HTML
function generateInstructStimulus() {
  return `
    <div class="experiment-wrapper">
      <!-- Upper Information (Instructions) -->
      <div id="instruction-container">
        <div id="instruction-text"></div>
      </div>

      <!-- Middle Row (Piggy Bank & Coins) -->
      <div id="experiment-container">
        <div id="coin-container"></div>
        <div id="piggy-container">
          <!-- Piggy Bank Image -->
          <img id="piggy-bank" src="imgs/piggy-bank.png" alt="Piggy Bank">
        </div>
      </div>

      <!-- Lower Information (Buttons) -->
      <div id="bottom-container" style="visibility: hidden">
        <p id="button-instruction" style="margin: 24px">Press <span style="font-weight: bold;">Restart</span> to try again, or <span style="font-weight: bold;">Continue</span> to proceed.</p>
        <div id="button-container">
          <button id="restart-button" class="jspsych-btn">Restart</button>
          <button id="continue-button" class="jspsych-btn">Continue</button>
        </div>
      </div>
    </div>
  `;
}

// Function to update instruction text based on shake count
function updateInstructionText(shakeCount) {
  const messages = [
    '<p>Welcome to the piggy bank game!</p><p>Press <span class="spacebar-icon">B</span> on the keyboard to shake this piggy bank!</p>',
    '<p>Press <span class="spacebar-icon">B</span> on the keyboard to shake this piggy bank!</p><p>You can press <span class="spacebar-icon">B</span> again to keep on shaking...</p>',
    '<p>Well done, You just got a coin out of the piggy bank!</p><p><span class="highlight-txt">You can always press again for more coins.</span> Try getting some more!</p>'
  ];
  let messageIndex = 0;
  if (shakeCount < 1) {
    messageIndex = 0;
  } else if (shakeCount >= 1 && shakeCount < 5) {
    messageIndex = 1;
  } else {
    messageIndex = 2;
  }
  document.getElementById('instruction-text').innerHTML = messages[messageIndex];
}

// Function to set up keyboard listener
function setupKeyboardListener(callback) {
  return jsPsych.pluginAPI.getKeyboardResponse({
    callback_function: callback,
    valid_responses: ['b'],
    rt_method: 'performance',
    persist: true,
    allow_held_key: false
  });
}
