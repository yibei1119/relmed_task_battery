const {
    getCoinProportions,
    findCoinCombinations,
    computeCombinationProbability,
    convertToLogProbabilities,
    drawCombinationFromDistribution,
    relmedSafeBonus
} = require('./bonus_safe');

describe('bonus_safe.js Tests', () => {
    test('getCoinProportions should return normalized proportions', () => {
        // Mock dependencies
        global.updateSafeFrequencies = jest.fn(() => ({ /* mock safe data */ }));
        global.calculateProportions = jest.fn(() => ({ 0.01: 0.2, 0.5: 0.3, 1: 0.4, "-0.01": 0.05, "-0.5": 0.03, "-1": 0.02 }));

        const result = getCoinProportions();
        expect(result).toHaveLength(6);
        expect(result.reduce((sum, val) => sum + val, 0)).toBeCloseTo(1);
    });

    test('findCoinCombinations should return valid combinations within range', () => {
        const coinValues = [0.01, 0.5, 1];
        const numCoins = 2;
        const range = [0.5, 1.5];
        const combinations = findCoinCombinations(coinValues, numCoins, range);

        combinations.forEach(combination => {
            const sum = combination.reduce((acc, val) => acc + val, 0);
            expect(sum).toBeGreaterThanOrEqual(range[0]);
            expect(sum).toBeLessThanOrEqual(range[1]);
        });
    });

    test('computeCombinationProbability should calculate correct log probability', () => {
        const combination = [0.01, 0.5];
        const coinProbabilities = { 0.01: Math.log(0.2), 0.5: Math.log(0.3) };
        const logProb = computeCombinationProbability(combination, coinProbabilities);

        const expectedLogProb = Math.log(0.2) + Math.log(0.3);
        expect(logProb).toBeCloseTo(expectedLogProb);
    });

    test('convertToLogProbabilities should convert probabilities to log space', () => {
        const probabilities = { 0.01: 0.2, 0.5: 0.3, 1: 0.5 };
        const logProbabilities = convertToLogProbabilities(probabilities);

        Object.entries(probabilities).forEach(([coin, prob]) => {
            expect(logProbabilities[coin]).toBeCloseTo(Math.log(prob));
        });
    });

    test('drawCombinationFromDistribution should return a valid combination', () => {
        const combinations = [[0.01, 0.5], [0.5, 1], [1, 0.01]];
        const coinProbabilities = { 0.01: Math.log(0.2), 0.5: Math.log(0.3), 1: Math.log(0.5) };

        const drawnCombination = drawCombinationFromDistribution(combinations, coinProbabilities);
        expect(combinations).toContainEqual(drawnCombination);
    });

    test('relmedSafeBonus should return a shuffled combination within range', () => {
        // Mock dependencies
        global.getCoinProportions = jest.fn(() => [0.2, 0.3, 0.4, 0.05, 0.03, 0.02]);
        global.jsPsych = {
            shuffle: jest.fn(arr => arr.reverse()), // Mock shuffle to reverse array
        };

        const numCoins = 4;
        const range = [2, 3];
        const result = relmedSafeBonus(numCoins, range);

        expect(result).toHaveLength(numCoins);
        const sum = result.reduce((acc, val) => acc + (val < 0 ? 0 : val), 0);
        expect(sum).toBeGreaterThanOrEqual(range[0]);
        expect(sum).toBeLessThanOrEqual(range[1]);
    });
});
