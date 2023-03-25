const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    fixturesFolder: false,
    baseUrl: 'http://localhost:3003',
    env: {
      codeCoverage: {
        url: 'http://localhost:3003/__coverage__',
        expectBackendCoverageOnly: true,
      },
      coverage: {
        exclude: true,
      },
    },
    video: false,
    specPattern: 'cypress/integration/spec.js',
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
  },
})
