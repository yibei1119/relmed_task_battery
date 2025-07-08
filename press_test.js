// Configuration object
const maxPressConfig = {
    duration: 7000,  // 7 seconds in milliseconds
    validKey: 'j',
    minSpeed: 3.0 // 5% in pilots 7 & 8 max press rates
};

// Function to get each key press RT
function getDifferences(array) {
    return array.map((currentValue, index, arr) => {
        if (index === 0) return 0; // or null, or any default for last element
        return currentValue - arr[index - 1];
    }).slice(1); // remove first element if you don't want the 0/null
}

// Trial to measure maximum press rate
const maxPressRateTrial = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: function() {
        return `
        <div id="instruction-container">
            <div id="instruction-text" style="text-align: center;">
                <h3><div id="countdown" style="margin: 20px;">Place your finger on the <span class="spacebar-icon">J</span> key.<br>When you are ready, start pressing it repeatedly as fast as you can!</div></h3>
                <div id="press-counter">Presses: 0</div>
                <div id="speed-display" style="color: #0066cc;">Speed: 0.00 presses/sec</div>
                <div style="width: 300px; margin: 20px auto; border: 1px solid black;">
                    <div id="speed-bar" style="height: 20px; width: 0%; background-color: #0066cc; transition: width 0.1s ease;"></div>
                </div>
            </div>
        </div>
        `;
    },
    choices: 'NO_KEYS',
    data: {trialphase: 'max_press_rate'},
    on_start: function (trial) {
        if (window.simulating) {
            trial.trial_duration = 1000;
        }
        // Create a shared state object
        let pressCount = 0;
        let isStarted = false;
        let startTime;
        let timeLeft;
        let countdownInterval;
        let RTs = [];
    
        const keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: function (info) {
            const updateSpeed = () => {
                if (!isStarted) return;
                const currentTime = performance.now();
                const elapsedSeconds = (currentTime - startTime) / 1000;
                const speed = (pressCount - 1) / Math.min(elapsedSeconds, maxPressConfig.duration/1000); // Subtract initial press
                const speedDisplay = document.getElementById('speed-display');
                const speedBar = document.getElementById('speed-bar');
                if (speedDisplay) {
                    speedDisplay.textContent = `Speed: ${speed.toFixed(2)} presses/sec`;
                    // Assume max speed is 10 presses/sec for 100% bar width
                    const barWidth = Math.min(speed * 10, 110);
                    speedBar.style.width = `${barWidth}%`;
                }
            };

            if (!isStarted) {
                // First press - start the countdown
                isStarted = true;
                startTime = performance.now();
                lastPressTime = startTime;
                timeLeft = maxPressConfig.duration/1000;
                updateState('max_press_rate_start');
                
                // Start animation loop
                animationFrameId = requestAnimationFrame(updateSpeed);

                // Set trial duration from first press
                jsPsych.pluginAPI.setTimeout(function() {
                    // const totalTime = getDifferences(RTs).reduce((a, b) => a + b, 0);
                    // console.log(totalTime);
                    jsPsych.finishTrial({responseTime: getDifferences(RTs), trialPresses: pressCount - 1, avgSpeed: (pressCount - 1) / (maxPressConfig.duration / 1000)});
                }, maxPressConfig.duration + 1000);
                
                // Start countdown
                countdownInterval = setInterval(() => {
                    timeLeft = timeLeft - 0.1;
                    const countdownElement = document.getElementById('countdown');
                    if (countdownElement) {
                        if (timeLeft >= 0) {
                            countdownElement.textContent = `${timeLeft.toFixed(1)} s left`;
                            updateSpeed();
                        } else {
                            clearInterval(countdownInterval);
                            cancelAnimationFrame(animationFrameId);
                            updateSpeed();
                            countdownElement.textContent = 'Time\'s up!';
                            jsPsych.pluginAPI.cancelAllKeyboardResponses();
                        }
                    }
                }, 100);
            }
            
            pressCount++;
            RTs.push(info.rt);
            const pressCounter = document.getElementById('press-counter');
            if (pressCounter) {
                pressCounter.textContent = `Presses: ${pressCount-1}`;
            }
        },
        valid_responses: [maxPressConfig.validKey],
        rt_method: 'performance',
        persist: true,
        allow_held_key: false,
        minimum_valid_rt: 10
        });
    },
    on_finish: function (data) {
        if (window.simulating) {
            data.avgSpeed = 5.0;
        }
    }
};

// Instructions trial
const maxPressInstructions = {
    type: jsPsychHtmlButtonResponse,
    css_classes: ["instructions"],
    stimulus: `
    <div id="instruction-container">
        <div id="instruction-text" style="text-align: center;">
            <p>Before we start the first game, we need to complete a short test of your keyboard.</p>
            <p>On the next screen, you will need to <span class="highlight-txt">press the <span class="spacebar-icon">J</span> key repeatedly as fast as you can</span>, as shown below.</p>
            <img src="imgs/max_press_key.gif" alt="Max Press Key Example" style="width:250px;">
        </div>
    </div>
    `,
    choices: ['Start']
};

const maxPressFeedback = {
    type: jsPsychHtmlButtonResponse,
    stimulus: function() {
        const avgSpeed = jsPsych.data.get().select("avgSpeed").values.reverse()[0];
        return `
        <div id="instruction-container">
            <div id="instruction-text" style="text-align: center;">
                <h2><span class="highlight-txt">Well done!</span></h2>
                <p>On average, you pressed <strong>${avgSpeed.toFixed(2)} times per second</strong> during the keyboard test.</p>
                <p>Press <strong>Continue</strong> to proceed to the first game.</p>
            </div>
        </div>
        `;
    },
    post_trial_gap: 800,
    choices: ['Continue']
};

const maxPressRetakeMessage = {
    timeline: [{
        type: jsPsychHtmlButtonResponse,
        stimulus: function () {
            const avgSpeed = jsPsych.data.get().select("avgSpeed").values.reverse()[0];
            return `
        <div id="instruction-container">
            <div id="instruction-text" style="text-align: center;">
                <p>On average, you pressed <strong>${avgSpeed.toFixed(2)} times per second</strong> during the keyboard test.</p>
                <p>To ensure the accuracy of the test,</br>we kindly ask you to retake it <span class="highlight-txt">with your best effort as much as possible</span>.</p>
                <p>Press <strong>Continue</strong> to retake the test.</p>
            </div>
        </div>
        `;
        },
        post_trial_gap: 800,
        choices: ['Continue']
    }],
    conditional_function: () => {
        const avgSpeed = jsPsych.data.get().select("avgSpeed").values.reverse()[0];
        if (avgSpeed < maxPressConfig.minSpeed && maxPressTakes < 1) {
            return true;
        } else {
            return false;
        }
    }
};

const maxPressRetakeLoop = {
    timeline: [maxPressRateTrial, maxPressRetakeMessage],
    loop_function: (data) => {
        if (data.select('avgSpeed').values.reverse()[0] < maxPressConfig.minSpeed && maxPressTakes < 1) {
            maxPressTakes++;
            return true;
        } else {
            updateState('max_press_rate_end');

            return false;
        }
    }
};

// Define the timeline
var maxPressTakes = 0;
const maxPressTimeline = [
    maxPressInstructions,
    maxPressRetakeLoop,
    maxPressFeedback
];

// Example usage:
// jsPsych.run(maxPressTimeline);