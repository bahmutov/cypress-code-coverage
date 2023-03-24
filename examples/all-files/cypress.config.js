const { defineConfig } = require('cypress')

module.exports = defineConfig({
  viewportHeight: 200,
  viewportWidth: 200,
  e2e: {
    fixturesFolder: false,
    baseUrl: 'http://localhost:1234',
    specPattern: 'cypress/integration/*.js',
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
  },
})
