/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  testRunner: 'vitest',
  plugins: ['@stryker-mutator/vitest-runner'],
  mutate: ['grupo-kr-motion/js/lib.js', 'grupo-kr-motion/js/consent.js', 'grupo-kr-motion/js/observability.js'],
  coverageAnalysis: 'perTest',
  reporters: ['clear-text', 'html', 'json'],
  htmlReporter: { fileName: 'reports/mutation/index.html' },
  jsonReporter: { fileName: 'reports/mutation/mutation.json' },
  thresholds: { high: 85, low: 70, break: 70 }
};
