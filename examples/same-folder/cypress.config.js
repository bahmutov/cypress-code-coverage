const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    fixturesFolder: false,
    video: false,
    specPattern: '**/spec.js',
    supportFile: 'support/support.js',
    env: {
      coverage: {
        exclude: true,
      },
    },
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./plugins.js')(on, config)
    },
  },
})
