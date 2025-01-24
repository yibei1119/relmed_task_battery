// Configuration object for the control condition
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

const ctrlTrials = [
  {"left": "green", "right": "blue", "near": "coconut"}, 
  {"left": "red", "right": "yellow", "near": "orange"}
];

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

// Define the base structure for the game interface with enhanced interaction
const exploreTrial = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: () => {
    return generateCtrlTrial(
      jsPsych.evaluateTimelineVariable('left'), 
      jsPsych.evaluateTimelineVariable('right'), 
      jsPsych.evaluateTimelineVariable('near')
    );
  },
  choices: ['ArrowLeft', 'ArrowRight'],
  response_ends_trial: false,
  // trial_duration: 3000,  // 3 second time limit
  on_load: () => {
    let selectedKey = null;
    const leftArrow = document.querySelector('.arrow-left');
    const rightArrow = document.querySelector('.arrow-right');
    const leftContainer = document.querySelector('.fuel-container-left');
    const rightContainer = document.querySelector('.fuel-container-right');

    // Function to create and animate a fuel icon
    function createFuelIcon(container) {
      const fuelIcon = document.createElement('img');
      fuelIcon.src = 'imgs/fuel.png';  // Make sure you have this image
      fuelIcon.className = 'fuel-icon fuel-animation';
      container.appendChild(fuelIcon);

      // Remove the fuel icon after animation completes
      fuelIcon.addEventListener('animationend', () => {
        container.removeChild(fuelIcon);
      });
    }

    // Event listener for keydown events
    document.addEventListener('keydown', (e) => {
      if (!selectedKey) {  // First key press
        if (e.key === 'ArrowLeft') {
          selectedKey = 'left';
          leftArrow.classList.add('highlight');
          rightArrow.style.visibility = 'hidden';
          createFuelIcon(leftContainer);
        } else if (e.key === 'ArrowRight') {
          selectedKey = 'right';
          rightArrow.classList.add('highlight');
          leftArrow.style.visibility = 'hidden';
          createFuelIcon(rightContainer);
        }
      } else {  // Subsequent key presses
        if ((selectedKey === 'left' && e.key === 'ArrowLeft') ||
            (selectedKey === 'right' && e.key === 'ArrowRight')) {
          createFuelIcon(selectedKey === 'left' ? leftContainer : rightContainer);
        }
      }
    });
  }
};

// Create the timeline
var expTimeline = [];
ctrlTrials.forEach(trial => {
  expTimeline.push({
    timeline: [exploreTrial],
    timeline_variables: [trial]
  });
});