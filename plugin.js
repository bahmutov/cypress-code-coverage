const { getNycReportFilename } = require('./task-utils')
const { existsSync } = require('fs')
const NYC = require('nyc')

const nyc = new NYC({
  cwd: process.cwd(),
  reporter: 'text',
})

const nycFilename = getNycReportFilename(process.cwd())

function registerCodeCoveragePlugin(on, config) {
  require('./task')(on, config)

  let reportAfterEachSpec = true
  if (
    config.env &&
    typeof config.env.coverage === 'object' &&
    'reportAfterEachSpec' in config.env.coverage
  ) {
    reportAfterEachSpec = Boolean(config.env.coverage.reportAfterEachSpec)
  }

  if (reportAfterEachSpec) {
    on('after:spec', (t) => {
      console.log('code coverage after spec %s', t.relative)
      if (existsSync(nycFilename)) {
        return nyc.report()
      } else {
        console.warn('Could not find coverage file %s', nycFilename)
      }
    })
  }

  // IMPORTANT to return the config object
  // with the any changed environment variables
  return config
}

module.exports = registerCodeCoveragePlugin
