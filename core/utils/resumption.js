/**
 * Determines which blocks to skip based on last state
 * @param {Array} structure - Task structure with blocks
 * @param {string} lastState - Last recorded state
 * @param {string} taskName - Name of the task
 * @param {Object} resumptionRules - Resumption configuration from task registry
 * @returns {Array} Filtered structure with completed blocks removed
 */
export function applyWithinTaskResumptionRules(structure, lastState, taskName, resumptionRules) {
    if (!resumptionRules?.enabled || !lastState || lastState === "none") {
        return structure;
    }

    if (resumptionRules.granularity === 'block') {
        const lastBlock = resumptionRules.extractProgress(lastState, taskName);
        
        return structure.filter((block, index) => {
            const blockNumber = block[0]?.block;
            
            // Skip blocks that are already completed
            if (typeof blockNumber === "number" && blockNumber <= lastBlock) {
                console.log(`Skipping completed block ${blockNumber} for ${taskName}`);
                return false;
            }
            return true;
        });
    }

    return structure;
}

/**
 * Get resumption state from URL or other source
 * @returns {string} Current resumption state
 */
export function getResumptionState() {
    // For direct URL parameter access
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('state') || "none";
}