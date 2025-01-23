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

// Define the base structure for the game interface
const exploreTrial = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <main class="main-stage">
      <img class="background" src="imgs/Ocean.png" alt="Background"/>
      <section class="scene">
        <!-- <div class="upper-frame">
          
        </div> -->
        <img class="island-far" src="imgs/Island_Orange.png" alt="Farther island" />
        <div class="overlap-group">
          <img class="ship-left" src="imgs/Ship_Blue.png" alt="Left ship" />
          <img class="island-near" src="imgs/Island_Coconut.png" alt="Nearer island" />
          <img class="ship-right" src="imgs/Ship_Yellow.png" alt="Right ship" />
        </div>
      </section>
    </main>
  `
};

// Add the fuel animation function
const addFuel = () => {
  const fuelIcon = document.querySelector('.fuel-icon');
  fuelIcon.classList.remove('adding');
  void fuelIcon.offsetWidth; // Trigger reflow
  fuelIcon.classList.add('adding');
};

// Create the instruction pages timeline
const expTimeline = {
  timeline: [exploreTrial]
};
