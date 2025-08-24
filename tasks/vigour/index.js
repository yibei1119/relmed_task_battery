/**
 * Core max-press-test task index - centralizes all function exports
 * Provides a single entry point for importing max-press-test task functions across the experiment.
 * Even though this is a very simple task, this index file maintains consistency with other tasks that do have multiple modules.
 */

// Import and re-export all utility modules
export * from './instructions.js';
export * from './utils.js';
export * from './timeline.js';