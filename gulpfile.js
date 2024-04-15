import { config, defaultTask, TestRunner } from '@ewn/gulp-recipe';

config.sources[0] = 'index.js';
config.testRunner = TestRunner.vitest;

export * from '@ewn/gulp-recipe/tasks.js';
export { defaultTask as default };
