/**
 * API Module - Entry point for task registry and management
 * Provides a centralized interface for creating and managing experimental tasks
 */

// Import and re-export all task registry functions
export {
    TaskRegistry,
    getTask,
    createTaskTimeline,
    listTasks,
    getTaskInfo
} from './task-registry.js';
