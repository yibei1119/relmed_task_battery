// Configuration PIT object
const PITconfig = {
  magnitudes: [1, 2, 5],
  ratios: [16, 8, 1],
  RPPs: [0.0625, 0.25, 5.0],
  coins: [1, 0.01, -1, -0.01],
  trialDuration: 7000 // in milliseconds on average, U[9500, 10500]
};

var PITtrialList = [{ "magnitude": 5, "ratio": 8, "coin": 0, "trialDuration": 4110 }, { "magnitude": 5, "ratio": 8, "coin": -0.01, "trialDuration": 6666 }, { "magnitude": 5, "ratio": 8, "coin": 0.01, "trialDuration": 7261 }, { "magnitude": 2, "ratio": 8, "coin": 0, "trialDuration": 4188 }, { "magnitude": 2, "ratio": 8, "coin": -1, "trialDuration": 7490 }, { "magnitude": 2, "ratio": 8, "coin": 1, "trialDuration": 6825 }, { "magnitude": 1, "ratio": 1, "coin": 0, "trialDuration": 4130 }, { "magnitude": 1, "ratio": 1, "coin": 0.01, "trialDuration": 6891 }, { "magnitude": 1, "ratio": 1, "coin": -0.01, "trialDuration": 6902 }, { "magnitude": 2, "ratio": 8, "coin": 0, "trialDuration": 4193 }, { "magnitude": 2, "ratio": 8, "coin": -0.5, "trialDuration": 6535 }, { "magnitude": 2, "ratio": 8, "coin": -0.01, "trialDuration": 6652 }, { "magnitude": 1, "ratio": 1, "coin": 0, "trialDuration": 3978 }, { "magnitude": 1, "ratio": 1, "coin": -0.5, "trialDuration": 6888 }, { "magnitude": 1, "ratio": 1, "coin": -1, "trialDuration": 6962 }, { "magnitude": 2, "ratio": 16, "coin": 0, "trialDuration": 3833 }, { "magnitude": 2, "ratio": 16, "coin": 0.5, "trialDuration": 7452 }, { "magnitude": 2, "ratio": 16, "coin": 0.01, "trialDuration": 6954 }, { "magnitude": 5, "ratio": 8, "coin": 0, "trialDuration": 3913 }, { "magnitude": 5, "ratio": 8, "coin": -0.5, "trialDuration": 6956 }, { "magnitude": 5, "ratio": 8, "coin": 0.5, "trialDuration": 7376 }, { "magnitude": 2, "ratio": 8, "coin": 0, "trialDuration": 4005 }, { "magnitude": 2, "ratio": 8, "coin": 0.5, "trialDuration": 7009 }, { "magnitude": 2, "ratio": 8, "coin": 0.01, "trialDuration": 7228 }, { "magnitude": 5, "ratio": 8, "coin": 0, "trialDuration": 4114 }, { "magnitude": 5, "ratio": 8, "coin": -1, "trialDuration": 7386 }, { "magnitude": 5, "ratio": 8, "coin": 1, "trialDuration": 7221 }, { "magnitude": 2, "ratio": 16, "coin": 0, "trialDuration": 4245 }, { "magnitude": 2, "ratio": 16, "coin": 1, "trialDuration": 6679 }, { "magnitude": 2, "ratio": 16, "coin": -0.01, "trialDuration": 7207 }, { "magnitude": 1, "ratio": 1, "coin": 0, "trialDuration": 3767 }, { "magnitude": 1, "ratio": 1, "coin": 1, "trialDuration": 7236 }, { "magnitude": 1, "ratio": 1, "coin": 0.5, "trialDuration": 6501 }, { "magnitude": 2, "ratio": 16, "coin": 0, "trialDuration": 3826 }, { "magnitude": 2, "ratio": 16, "coin": -0.5, "trialDuration": 7465 }, { "magnitude": 2, "ratio": 16, "coin": -1, "trialDuration": 6827 }, { "magnitude": 2, "ratio": 8, "coin": 0, "trialDuration": 4118 }, { "magnitude": 2, "ratio": 8, "coin": -0.5, "trialDuration": 6535 }, { "magnitude": 2, "ratio": 8, "coin": 1, "trialDuration": 6825 }, { "magnitude": 1, "ratio": 1, "coin": 0, "trialDuration": 3751 }, { "magnitude": 1, "ratio": 1, "coin": 0.01, "trialDuration": 6891 }, { "magnitude": 1, "ratio": 1, "coin": -1, "trialDuration": 6962 }, { "magnitude": 2, "ratio": 16, "coin": 0, "trialDuration": 3946 }, { "magnitude": 2, "ratio": 16, "coin": -0.01, "trialDuration": 7207 }, { "magnitude": 2, "ratio": 16, "coin": -1, "trialDuration": 6827 }, { "magnitude": 1, "ratio": 1, "coin": 0, "trialDuration": 3981 }, { "magnitude": 1, "ratio": 1, "coin": 0.5, "trialDuration": 6501 }, { "magnitude": 1, "ratio": 1, "coin": 1, "trialDuration": 7236 }, { "magnitude": 2, "ratio": 16, "coin": 0, "trialDuration": 3944 }, { "magnitude": 2, "ratio": 16, "coin": 0.5, "trialDuration": 7452 }, { "magnitude": 2, "ratio": 16, "coin": 1, "trialDuration": 6679 }, { "magnitude": 5, "ratio": 8, "coin": 0, "trialDuration": 3951 }, { "magnitude": 5, "ratio": 8, "coin": -1, "trialDuration": 7386 }, { "magnitude": 5, "ratio": 8, "coin": -0.5, "trialDuration": 6956 }, { "magnitude": 5, "ratio": 8, "coin": 0, "trialDuration": 3839 }, { "magnitude": 5, "ratio": 8, "coin": -0.01, "trialDuration": 6666 }, { "magnitude": 5, "ratio": 8, "coin": 0.01, "trialDuration": 7261 }, { "magnitude": 2, "ratio": 8, "coin": 0, "trialDuration": 4226 }, { "magnitude": 2, "ratio": 8, "coin": 0.01, "trialDuration": 7228 }, { "magnitude": 2, "ratio": 8, "coin": -1, "trialDuration": 7490 }, { "magnitude": 1, "ratio": 1, "coin": 0, "trialDuration": 3977 }, { "magnitude": 1, "ratio": 1, "coin": -0.01, "trialDuration": 6902 }, { "magnitude": 1, "ratio": 1, "coin": -0.5, "trialDuration": 6888 }, { "magnitude": 2, "ratio": 16, "coin": 0, "trialDuration": 3913 }, { "magnitude": 2, "ratio": 16, "coin": 0.01, "trialDuration": 6954 }, { "magnitude": 2, "ratio": 16, "coin": -0.5, "trialDuration": 7465 }, { "magnitude": 5, "ratio": 8, "coin": 0, "trialDuration": 4233 }, { "magnitude": 5, "ratio": 8, "coin": 1, "trialDuration": 7221 }, { "magnitude": 5, "ratio": 8, "coin": 0.5, "trialDuration": 7376 }, { "magnitude": 2, "ratio": 8, "coin": 0, "trialDuration": 4104 }, { "magnitude": 2, "ratio": 8, "coin": -0.01, "trialDuration": 6652 }, { "magnitude": 2, "ratio": 8, "coin": 0.5, "trialDuration": 7009 }];

if (window.demo){
  PITtrialList = PITtrialList.slice(0,10);
}
// var PITtrialList = jsPsych.randomization.shuffleNoRepeats(PITtrialList, function(trial1, trial2) {trial1.coin == trial2.coin && trial1.ratio == trial2.ratio && trial1.magnitude == trial2.magnitude});

// Trial stimulus function
function generatePITstimulus(coin, ratio) {
  const ratio_index = experimentConfig.ratios.indexOf(ratio);
  // Calculate saturation based on ratio
  const ratio_factor = ratio_index / (experimentConfig.ratios.length - 1);
  const piggy_style = `filter: saturate(${50 * (400 / 50) ** ratio_factor}%) brightness(${115 * (90/115) ** ratio_factor}%);`;
  const cloud_style = `filter: brightness(0.8) contrast(1.2);`;
  let PIT_imgs = {
    0.01: "PIT3.png",
    1.0: "PIT1.png",
    0.5: "PIT2.png",
    "-0.01": "PIT4.png",
    "-1": "PIT6.png",
    "-0.5": "PIT5.png"
  };
  PIT_imgs = Object.fromEntries(Object.entries(PIT_imgs).map(([k, v]) => [k, "imgs/Pav_stims/" + session + "/" + v]));
  PIT_imgs["0"] = "";
  const piggyBgImg = PIT_imgs[coin];
  return `
    <div class="experiment-wrapper" style="background-image: url(${piggyBgImg});background-repeat: repeat; background-size: 30vw;">
      <!-- Middle Row (Piggy Bank & Coins) -->
      <div id="experiment-container">
        <div id="bg-container">
          <img id="piggy-bg-1" src="imgs/piggy-cloud.png" alt="Piggy background" style="transform: translate(0vw, -4vh); position: absolute; height: 120%; width: auto; ${cloud_style}">
          <img id="piggy-bg-2" src="imgs/piggy-cloud.png" alt="Piggy background" style="transform: translate(0vw, -4vh); position: absolute; height: 120%; width: auto;">
        </div>
        <div id="piggy-container">
          <!-- Piggy Bank Image -->
          <img id="piggy-bank" src="imgs/piggy-bank.png" alt="Piggy Bank" style="${piggy_style}">
        </div>
        <div id="obstructor-container">
          <img id="obstructor" src="imgs/occluding_clouds.png" alt="Obstructor">
        </div>
      </div>
    </div>
  `;
}

// PIT trial
let PITtrialCounter = 0;

const PITtrial = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: function () {
    return generatePITstimulus(jsPsych.evaluateTimelineVariable('coin'), jsPsych.evaluateTimelineVariable('ratio'));
  },
  choices: 'NO_KEYS',
  // response_ends_trial: false,
  trial_duration: jsPsych.timelineVariable('trialDuration'),
  save_timeline_variables: ["magnitude", "ratio"],
  data: {
    trialphase: 'pit_trial',
    pit_coin: jsPsych.timelineVariable('coin'),
    trial_duration: jsPsych.timelineVariable('trialDuration'),
    response_time: () => { return window.responseTime },
    trial_presses: () => { return window.trialPresses },
    trial_reward: () => { return window.trialReward },
    // Record global data
    total_presses: () => { return window.totalPresses },
    total_reward: () => { return window.totalReward }
  },
  on_start: function (trial) {
    if (window.simulating) {
      trial.trial_duration = 500;
    }
    // Create a shared state object
    window.trialPresses = 0;
    window.trialReward = 0;
    window.responseTime = [];

    let lastPressTime = 0;
    let pressCount = 0;

    const ratio = jsPsych.evaluateTimelineVariable('ratio');
    const magnitude = jsPsych.evaluateTimelineVariable('magnitude');

    const keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
      callback_function: function (info) {
        window.responseTime.push(info.rt - lastPressTime);
        lastPressTime = info.rt;
        // wigglePiggy();
        shakePiggy();
        pressCount++;
        window.trialPresses++;
        window.totalPresses++;

        if (pressCount === ratio) {
          window.trialReward += magnitude;
          window.totalReward += magnitude;
          pressCount = 0;
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
    PITtrialCounter += 1;
    data.pit_trial_number = PITtrialCounter;
    if (PITtrialCounter % (PITtrials.length / 3) == 0 || PITtrialCounter == PITtrials.length) {
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
      showTemporaryWarning("Don't forget to participate!", 800); // Enable this line for non-stopping warning
    }
  }
};

// Create timeline for PIT task
const PITtrials = [];
PITtrialList.forEach(trial => {
  PITtrials.push({
    timeline: [kick_out, fullscreen_prompt, PITtrial],
    timeline_variables: [trial]
  });
});

PITtrials[0]["on_timeline_start"] = () => {
  updateState(`no_resume_10_minutes`);
  updateState(`pit_task_start`);
};

function getSelectedPITtrial() {
  const raw_data = jsPsych.data.get().filterCustom((trial) => trial.trialphase == "pit_trial");
  const trial_rewards = raw_data.select('trial_reward').values;
  // Select a random trial to be the bonus round with weights based on the rewards
  const selected_trial = jsPsych.randomization.sampleWithReplacement(raw_data.values(), 1, trial_rewards.map(reward => logNormalPDF(reward+1, Math.log(40), 0.3)));
  // Side effect: Save the reward for the bonus round
  window.sampledPITreward = selected_trial[0].trial_reward;
  // Return the trial index for referencing and the trial number for display
  return { trial_index: selected_trial[0].trial_index, pit_trial_number: selected_trial[0].pit_trial_number };
}

// Get fractional rewards of Vigour
function getFracPITReward(prop = 0.0213) {
  const raw_data = jsPsych.data.get().filterCustom((trial) => trial.trialphase == "pit_trial");
  const total_reward = raw_data.select('total_reward').values.slice(-1)[0];
  try {
    total_reward === window.trialReward;
  } catch (error) {
    console.error("Total reward for PIT mismatch!");
  }
  return total_reward / 100 * prop;
}

const PIT_bonus = {
  type: jsPsychHtmlButtonResponse,
  stimulus: "Congratulations! You've finished this game!",
  choices: ['Finish'],
  data: { trialphase: 'pit_bonus' },
  on_start: function (trial) {
    const selected_trial = getSelectedPITtrial();
    trial.stimulus = `
            <p>It is time to reveal your bonus payment for this round of cloudy piggy-bank game.</p>
            <p>The computer selected piggy bank number ${selected_trial.pit_trial_number}, which means you will earn ${(window.sampledPITreward / 100).toLocaleString('en-GB', { style: 'currency', currency: 'GBP' })} for the game.</p>
        `;
  },
  on_finish: (data) => {
    data.PIT_bonus = window.sampledPITreward / 100
  }
};

// Debriefing
const vigour_PIT_bonus = {
  type: jsPsychHtmlButtonResponse,
  css_classes: ['instructions'],
  stimulus: "Congratulations! You've finished the Piggy-Bank Game!",
  choices: ['Finish'],
  data: { trialphase: 'vigour_bonus' },
  on_start: function (trial) {
    const selected_trial = getSelectedTrial();
    const selected_PIT_trial = getSelectedPITtrial();
    trial.stimulus = `
            <p>It is time to reveal your total bonus payment for the Piggy-Bank Game.</p>
            <p>The computer selected piggy bank number ${selected_trial.trial_number} of the no-cloud version and number ${selected_PIT_trial.pit_trial_number} of the cloudy version, which means you will earn ${((window.sampledVigourReward + window.sampledPITreward)/ 100).toLocaleString('en-GB', { style: 'currency', currency: 'GBP' })} in total for the game.</p>
        `;
  },
  on_start: () => {
    updateState(`vigour_pit_bonus_start`);
  },
  on_finish: (data) => {

    const bonus = (window.sampledVigourReward + window.sampledPITreward)/ 100;
    
    data.vigour_bonus = bonus;

    postToParent({bonus: bonus});
  }
};

const vigour_PIT_bonus2 = {
  type: jsPsychHtmlButtonResponse,
  css_classes: ['instructions'],
  stimulus: "Congratulations! You've finished the Piggy-Bank Game!",
  choices: ['Finish'],
  data: { trialphase: 'vigour_bonus' },
  on_start: function (trial) {
    updateState(`vigour_pit_bonus_start`);

    const raw_bonus = computeRelativeVigourPITBonus();
    const total_bonus = (raw_bonus.earned - raw_bonus.min)/(raw_bonus.max - raw_bonus.min) * (1 - 0.6) + 0.6;
    trial.stimulus = `
            <p>It is time to reveal your total bonus payment for the Piggy-Bank Game.</p>
            <p>With the cloudy version and the no-cloud version combined, you will earn ${total_bonus.toLocaleString('en-GB', { style: 'currency', currency: 'GBP' })} in total for the game.</p>
        `;
  },
  on_finish: (data) => {
    const raw_bonus = computeRelativeVigourPITBonus();
    data.vigour_bonus = (raw_bonus.earned - raw_bonus.min)/(raw_bonus.max - raw_bonus.min) * (1 - 0.6) + 0.6;
  },
  simulation_options: {
    simulate: true
  }
};

const computeRelativeVigourPITBonus = () => {
  const computePiggyMetrics = (trialphase) => {
    const trials = jsPsych.data.get().filter({trialphase});
    
    if (trials.count() === 0) {
      // console.log(`No trials found for ${trialphase}. Returning default values.`);
      return { earned: 0, min: 0, max: 0 };
    }
    
    const earned = trials.select('total_reward').values.slice(-1)[0] * 0.01;
    const values = trials.values();
    
    const min = values.reduce((sum, trial) => 
      sum + (1 * trial.timeline_variables.magnitude * 0.01 / trial.timeline_variables.ratio), 0);
    
    const max = values.reduce((sum, trial) => 
      sum + (10 * trial.trial_duration / 1000 * 
           (trial.timeline_variables.magnitude * 0.01 / trial.timeline_variables.ratio)), 0);
    
    return { 
      earned: isNaN(earned) ? 0 : earned, 
      min: isNaN(min) ? 0 : min, 
      max: isNaN(max) ? 0 : max
    }
  };

  const vigour = computePiggyMetrics("vigour_trial");
  const pit = computePiggyMetrics("pit_trial");
  
  return {
    earned: vigour.earned + pit.earned,
    min: vigour.min + pit.min,
    max: vigour.max + pit.max
  };
};

