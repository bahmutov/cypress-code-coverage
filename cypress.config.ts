import { defineConfig } from 'cypress'

export default defineConfig({
  viewportHeight: 200,
  viewportWidth: 200,
  e2e: {
    env: {
      coverage: {
        // set to true to hide the messages in the Command Log
        quiet: false,
      },
    },
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
    baseUrl: 'http://localhost:1234',
  },
})
