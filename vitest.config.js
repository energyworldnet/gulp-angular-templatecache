import { coverageConfigDefaults, defaultInclude, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      exclude: ['gulpfile.js', ...coverageConfigDefaults.exclude]
    },
    include: ['test/**', ...defaultInclude]
  }
});
