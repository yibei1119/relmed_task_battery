const ctrlConfig = {
  baseRule: {
    banana: "coconut",
    coconut: "grape",
    grape: "orange",
    orange: "banana"
  },
  controlRule: {
    green: "coconut",
    blue: "grape",
    red: "orange",
    yellow: "banana",
  }
};

const ctrlTrials = [{"left": "green", "right": "blue", "near": "coconut"}, {"left": "red", "right": "yellow", "near": "orange"}];

function generateCtrlTrial(left, right, near) {
  const far = ctrlConfig.baseRule[near];
  stimulus = `
    <main class="main-stage">
      <img class="background" src="imgs/ocean.png" alt="Background"/>
      <section class="scene">
        <img class="island-far" src="imgs/island_${far}.png" alt="Farther island" />
        <div class="overlap-group">
          <div class="choice-left">
            <div class="fuel-container-left"></div>
            <img class="ship-left" src="imgs/ship_${left}.png" alt="Left ship" />
            <img class="arrow-left" src="imgs/left.png" alt="Left arrow" />
          </div>
          <img class="island-near" src="imgs/island_${near}.png" alt="Nearer island" />
          <div class="choice-right">
            <div class="fuel-container-right"></div>
            <img class="ship-right" src="imgs/ship_${right}.png" alt="Right ship" />
            <img class="arrow-right" src="imgs/left.png" alt="Right arrow" />
          </div>
        </div>
      </section>
    </main>
  `;
  return stimulus;
}

// Define the base structure for the game interface
const exploreTrial = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: () => {
    return generateCtrlTrial(jsPsych.evaluateTimelineVariable('left'), jsPsych.evaluateTimelineVariable('right'), jsPsych.evaluateTimelineVariable('near'));
  }
};

// Add the fuel animation function
const addFuel = () => {
  const fuelIcon = document.querySelector('.fuel-icon');
  fuelIcon.classList.remove('adding');
  void fuelIcon.offsetWidth; // Trigger reflow
  fuelIcon.classList.add('adding');
};

// Create the instruction pages timeline
var expTimeline = [];
ctrlTrials.forEach(trial => {
  expTimeline.push({
    timeline: [exploreTrial],
    timeline_variables: [trial]
  });
});
