// Get the proportion of coins in safe, reweighted by a generous prior
const getCoinProportions = () => {

    // Get the updates safe
    const updated_safe = updateSafeFrequencies();

    // Compute the coin proportions
    let raw_props = calculateProportions(updated_safe);

    raw_props = [raw_props[0.01], raw_props[0.5], raw_props[1], raw_props["-0.01"], raw_props["-0.5"], raw_props["-1"]]

    const prior = [0.1, 0.3, 0.5, 0.1 / 3, 0.1 / 3, 0.1 / 3];

    // Take weighted average
    const weight_data = 0.6;

    let weightedSum = raw_props.map((value, index) => {
        return (value * weight_data) + (prior[index] * (1 - weight_data));
    });

    // Normalize and return
    let sum = weightedSum.reduce((acc, value) => acc + value, 0);
    return weightedSum.map(value => value / sum);
}

// Get the list of coins in the safe
const getCoins = () => {

    // Get the updates safe
    const updated_safe = updateSafeFrequencies();

    // Compute the coin proportions
    const coin_proportions = calculateProportions(updated_safe);

    return createProportionalArray(coin_proportions, 35).sort()
};


// Coin lottery trial
let coin_lottery;

if (window.context === "relmed") {
    coin_lottery = {
        type: jsPsychCoinLottery,
        coins: getCoins,
        bonus_coins: relmedSafeBonus,
        on_finish: (data) => {
            const bonus = data.outcomes.reduce((acc, num) => acc + num, 0);
        
            postToParent({bonus: bonus});
        
            updateState("coin_lottery_end");
        }
    };
} else {
    coin_lottery = {
        type: jsPsychCoinLottery,
        coins: getCoins,
        props: getCoinProportions
    }
}

/**
 * Finds all combinations of n coins that yield a sum within the specified range.
 * @param {number[]} coinValues - Array of coin values.
 * @param {number} numCoins - Number of coins to select.
 * @param {number[]} range - Array with two elements [min, max] specifying the range.
 * @returns {number[][]} - Array of combinations where each combination is an array of coin values.
 */
function findCoinCombinations(coinValues, numCoins, range) {
    const [min, max] = range;
    const results = [];

    function backtrack(combination, sum) {
        if (combination.length === numCoins) {
            if (sum >= min && sum <= max) {
                results.push([...combination]);
            }
            return;
        }

        for (let coin of coinValues) {
            combination.push(coin);
            backtrack(combination, sum + (coin < 0 ? 0 : coin));
            combination.pop();
        }
    }

    backtrack([], 0);
    return results;
}

/**
 * Computes the probability of drawing a given combination of coins, working in log space.
 * @param {number[]} combination - Array representing the combination of coins.
 * @param {Object} coinProbabilities - Dictionary where keys are coin values and values are their probabilities in log space.
 * @returns {number} - The log probability of the given combination.
 */
function computeCombinationProbability(combination, coinProbabilities) {
    return combination.reduce((logProb, coin) => {
        const coinLogProb = coinProbabilities[coin] ?? -Infinity; // Handle missing coins
        return logProb + coinLogProb;
    }, 0);
}

/**
 * Converts a dictionary with probability values to a dictionary of log probabilities.
 * @param {Object} probabilities - Dictionary where keys are coin values and values are their probabilities.
 * @returns {Object} - Dictionary where keys are coin values and values are their log probabilities.
 */
function convertToLogProbabilities(probabilities) {
    const logProbabilities = {};
    for (const [coin, prob] of Object.entries(probabilities)) {
        logProbabilities[coin] = Math.log(prob);
    }
    return logProbabilities;
}

/**
 * Draws a combination from a collection of coin combinations based on their log probabilities.
 * @param {number[][]} combinations - Array of coin combinations.
 * @param {Object} coinProbabilities - Dictionary where keys are coin values and values are their probabilities in log space.
 * @returns {number[]} - A randomly drawn combination.
 */
function drawCombinationFromDistribution(combinations, coinProbabilities) {
    // Compute log probabilities for each combination
    const logProbs = combinations.map(combination => computeCombinationProbability(combination, coinProbabilities));

    // Convert log probabilities to probabilities
    const maxLogProb = Math.max(...logProbs); // For numerical stability
    const probs = logProbs.map(logProb => Math.exp(logProb - maxLogProb));

    // Normalize probabilities
    const totalProb = probs.reduce((sum, prob) => sum + prob, 0);
    const normalizedProbs = probs.map(prob => prob / totalProb);

    // Draw a combination based on the normalized probabilities
    const randomValue = Math.random();
    let cumulativeProb = 0;

    for (let i = 0; i < combinations.length; i++) {
        cumulativeProb += normalizedProbs[i];
        if (randomValue <= cumulativeProb) {
            return combinations[i];
        }
    }

    // Fallback (should not happen if probabilities are normalized correctly)
    return combinations[combinations.length - 1];
}

// Draw RELMED safe bonus
/**
 * Draws a combination of coins for a bonus from the safe.
 * 
 * @param {number} [numCoins=4] - The number of coins to draw.
 * @param {number[]} [range=[2, 3]] - The range [min, max] of bonus values. Borken coins count as zero.
 * @returns {number[]} - A shuffled array representing the drawn combination of coins.
 */
function relmedSafeBonus(numCoins = 4, range = [2, 3]) {
    // Get the proportions of each type of coin in the safe
    const proportionsArray = getCoinProportions();
    const coinValues = [0.01, 0.5, 1, -0.01, -0.5, -1]; // Based on the order in getCoinProportions
    const coinProportions = {};
    
    // Map each proportion to its corresponding coin value as key
    coinValues.forEach((value, index) => {
        coinProportions[value] = proportionsArray[index];
    });

    // Convert the probability values to log probabilities for numerical stability
    const logProbabilities = convertToLogProbabilities(coinProportions);

    // Find all possible combinations of coins that sum within the range and shuffle them
    const all_cobms = jsPsych.shuffle(findCoinCombinations(Object.keys(coinProportions).map(Number), numCoins, range));

    // Draw a combination from the distribution based on the log probabilities
    const drawnCombination = drawCombinationFromDistribution(all_cobms, logProbabilities);

    // Shuffle the drawn combination and return it
    return jsPsych.shuffle(drawnCombination);
}
