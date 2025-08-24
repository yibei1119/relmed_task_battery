/**
 * Core max-press-test (vigour) task index - centralizes all function exports.
 * Provides a single entry point for importing vigour task functions across the experiment.
 * This index file centralizes exports from multiple modules (instructions.js, utils.js, timeline.js) for consistency and ease of import. */

// Import and re-export all utility modules
export * from './instructions.js';
export * from './utils.js';
export * from './timeline.js';