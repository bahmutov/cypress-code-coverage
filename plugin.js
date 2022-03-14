const NYC = require('nyc')
const nyc = new NYC({
  cwd: process.cwd(),
  reporter: 'text',
})

function registerCodeCoveragePlugin(on, config) {
  require('./task')(on, config)

  let reportAfterEachSpec = true
  if (
    config.env &&
    config.env.coverage &&
    'reportAfterEachSpec' in config.env.coverage
  ) {
    reportAfterEachSpec = Boolean(config.env.coverage.reportAfterEachSpec)
  }

  if (reportAfterEachSpec) {
    on('after:spec', (t) => {
      console.log('after spec %s', t.relative)
      return nyc.report()
    })
  }

  // IMPORTANT to return the config object
  // with the any changed environment variables
  return config
}

module.exports = registerCodeCoveragePlugin
