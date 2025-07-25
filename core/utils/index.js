/**
 * Core utilities index - centralizes all utility function exports
 * Provides a single entry point for importing utility functions across the experiment
 */

// Re-export all functions from bonus.js
if (typeof window !== 'undefined') {
    // Browser environment - functions are loaded via script tags
    window.utils = window.utils || {};
    
    // Export bonus functions
    if (typeof getTaskBonusData !== 'undefined') {
        window.utils.getTaskBonusData = getTaskBonusData;
        window.utils.roundDigits = roundDigits;
        window.utils.deepCopySessionState = deepCopySessionState;
        window.utils.computeTotalBonus = computeTotalBonus;
        window.utils.updateBonusState = updateBonusState;
        window.utils.bonus_trial = bonus_trial;
    }
    
    // Export calculation functions
    if (typeof formatDateString !== 'undefined') {
        window.utils.formatDateString = formatDateString;
        window.utils.computeBestRest = computeBestRest;
        window.utils.countOccurrences = countOccurrences;
        window.utils.isValidNumber = isValidNumber;
        window.utils.stringToSeed = stringToSeed;
        window.utils.seededRandom = seededRandom;
        window.utils.shuffleArray = shuffleArray;
    }
    
    // Export data handling functions
    if (typeof postToParent !== 'undefined') {
        window.utils.postToParent = postToParent;
        window.utils.updateState = updateState;
        window.utils.saveDataREDCap = saveDataREDCap;
        window.utils.endExperiment = endExperiment;
    }
    
    // Export participation validation functions
    if (typeof preventRefresh !== 'undefined') {
        window.utils.preventRefresh = preventRefresh;
        window.utils.fullscreen_prompt = fullscreen_prompt;
        window.utils.pre_kick_out_warning = pre_kick_out_warning;
        window.utils.kick_out_warning = kick_out_warning;
        window.utils.kick_out = kick_out;
        window.utils.createInstructionsKickOut = createInstructionsKickOut;
        window.utils.checkFullscreen = checkFullscreen;
        window.utils.canBeWarned = canBeWarned;
        window.utils.showTemporaryWarning = showTemporaryWarning;
        window.utils.noChoiceWarning = noChoiceWarning;
        window.utils.setupMultiKeysListener = setupMultiKeysListener;
        window.utils.createPressBothTrial = createPressBothTrial;
    }
    
    // Export setup functions
    if (typeof loadSequence !== 'undefined') {
        window.utils.loadSequence = loadSequence;
    }
    
} else {
    // Node.js environment - use module exports
    try {
        const bonus = require('./bonus');
        const calculations = require('./calculations');
        const dataHandling = require('./data_handling');
        const participationValidation = require('./participation_validation');
        const setup = require('./setup');
        
        module.exports = {
            // Bonus utilities
            ...bonus,
            
            // Calculation utilities
            ...calculations,
            
            // Data handling utilities
            ...dataHandling,
            
            // Participation validation utilities
            ...participationValidation,
            
            // Setup utilities
            ...setup
        };
    } catch (error) {
        // Fallback for environments where require() is not available
        console.warn('Module system not available, functions should be loaded via script tags');
        module.exports = {};
    }
}
