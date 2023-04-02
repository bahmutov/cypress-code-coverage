const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    env: {
      coverage: {
        exclude: '**/cypress/**',
      },
    },
    fixturesFolder: false,
    video: false,
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
  },
})
