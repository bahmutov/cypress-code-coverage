const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    fixturesFolder: false,
    video: false,
    specPattern: 'cypress/integration/spec.js',
    supportFile: '../../support.js',
    setupNodeEvents(on, config) {
      return require('../../plugins')(on, config)
    },
  },
})
