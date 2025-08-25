// Utility functions common to vigour and PIT tasks

// Shake piggy bank animation
function shakePiggy() {
  animatePiggy([
    'translateX(-1%)',
    'translateX(1%)',
    'translateX(0)'
  ], { duration: 80, easing: 'linear' });
}

function updatePiggyTails(magnitude, ratio, settings) {
  const piggyContainer = document.getElementById('piggy-container');
  const piggyBank = document.getElementById('piggy-bank');

  const magnitude_index = settings.magnitudes.indexOf(magnitude);
  const ratio_index = settings.ratios.indexOf(ratio);
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
      tail.src = '/assets/images/vigour/piggy-tail2.png';
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
