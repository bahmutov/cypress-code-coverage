const { defineConfig } = require('cypress')

module.exports = defineConfig({
  component: {
    framework: 'react-scripts',
    bundler: 'webpack',
    fixturesFolder: false,
    video: false,
  },

  component: {
    viewportHeight: 100,
    viewportWidth: 100,
    fixturesFolder: false,
    video: false,
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('../../plugins')(on, config)
    },
    devServer: {
      framework: 'create-react-app',
      bundler: 'webpack',
    },
  },
})
