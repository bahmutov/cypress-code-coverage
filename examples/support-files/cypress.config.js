const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    fixturesFolder: false,
    baseUrl: 'http://localhost:1234',
    video: false,
    specPattern: 'cypress/integration/spec.js',
    env: {
      coverage: {
        exclude: true,
      },
    },
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
  },
})
