// @ts-check
const { getNycReportFilename } = require('./task-utils')
const { existsSync } = require('fs')
const NYC = require('nyc')
const debug = require('debug')('code-coverage')

const nycFilename = getNycReportFilename(process.cwd())

function registerCodeCoveragePlugin(on, config) {
  require('./task')(on, config)

  // the user can report the code coverage after each spec
  // reportAfterEachSpec: false = disabled reporting
  // reportAfterEachSpec: true = enabled reporting, default reporter
  // reportAfterEachSpec: 'text' = enabled "text" code coverage reporter
  // typical values: 'text-summary', 'text'
  let reportAfterEachSpec = 'text-summary'
  let shouldReport = true
  if (
    config.env &&
    typeof config.env.coverage === 'object' &&
    'reportAfterEachSpec' in config.env.coverage
  ) {
    if (config.env.coverage.reportAfterEachSpec === false) {
      shouldReport = false
    } else if (config.env.coverage.reportAfterEachSpec === true) {
      // use the default code coverage reporter
    } else {
      reportAfterEachSpec = config.env.coverage.reportAfterEachSpec
      debug('')
    }
  }

  if (shouldReport) {
    const nyc = new NYC({
      cwd: process.cwd(),
      reporter: reportAfterEachSpec,
    })
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
