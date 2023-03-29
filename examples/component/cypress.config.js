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
      mode: 'development',
      devtool: false,
      module: {
        rules: [
          // application and Cypress files are bundled like React components
          // and instrumented using the babel-plugin-istanbul
          {
            test: /\.jsx?$/,
            // do not instrument node_modules
            // or Cypress component specs
            exclude: /node_modules|\.cy\.jsx/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env', '@babel/preset-react'],
                plugins: ['istanbul'],
              },
            },
          },
        ],
      },
    },
  },
})
