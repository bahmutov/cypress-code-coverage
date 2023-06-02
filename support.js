/// <reference types="cypress" />
// @ts-check

const dayjs = require('dayjs')
var duration = require('dayjs/plugin/duration')
const {
  excludeByUser,
  filterSupportFilesFromCoverage,
} = require('./support-utils')
const { isPluginDisabled } = require('./common-utils')

dayjs.extend(duration)

function getCoverageConfig() {
  const env = Cypress.env()
  return env.coverage || {}
}

/**
 * Sends collected code coverage object to the backend code
 * via "cy.task".
 */
const sendCoverage = (coverage, pathname = '/') => {
  const config = getCoverageConfig()

  if (!config.quiet) {
    logMessage(`Saving code coverage for **${pathname}**`)
  }

  let filteredCoverage = coverage

  // console.log({ config })

  // by default we do not filter anything from the code coverage object
  // if the user gives a list of patters to filter, we filter the coverage object
  if (config.exclude) {
    filteredCoverage = excludeByUser(config.exclude, coverage)
  } else if (Cypress.spec.specType === 'component') {
    filteredCoverage = filterSupportFilesFromCoverage(coverage)
  }

  // stringify coverage object for speed
  cy.task('combineCoverage', JSON.stringify(filteredCoverage), {
    log: false,
  })
}

/**
 * Consistently logs the given string to the Command Log
 * so the user knows the log message is coming from this plugin.
 * @param {string} message String message to log.
 */
const logMessage = (message) => {
  const logInstance = Cypress.log({
    name: 'Coverage',
    message,
  })
}

const registerHooks = () => {
  let windowCoverageObjects

  const hasE2ECoverage = () => Boolean(windowCoverageObjects.length)

  // @ts-ignore
  const hasUnitTestCoverage = () => Boolean(window.__coverage__)

  before(() => {
    const config = getCoverageConfig()
    let logInstance

    if (!config.quiet) {
      // we need to reset the coverage when running
      // in the interactive mode, otherwise the counters will
      // keep increasing every time we rerun the tests
      logInstance = Cypress.log({
        name: 'Coverage',
        message: ['Reset [@bahmutov/cypress-code-coverage]'],
      })
    }

    cy.task(
      'resetCoverage',
      {
        // @ts-ignore
        isInteractive: Cypress.config('isInteractive'),
        specCovers: Cypress.env('specCovers'),
      },
      { log: false },
    ).then(() => {
      if (logInstance) {
        logInstance.end()
      }
    })
  })

  beforeEach(() => {
    // each object will have the coverage and url pathname
    // to let the user know the coverage has been collected
    windowCoverageObjects = []

    const saveCoverageObject = (win) => {
      // if application code has been instrumented, the app iframe "window" has an object
      try {
        const applicationSourceCoverage = win.__coverage__
        if (!applicationSourceCoverage) {
          return
        }

        if (
          Cypress._.find(windowCoverageObjects, {
            coverage: applicationSourceCoverage,
          })
        ) {
          // this application code coverage object is already known
          // which can happen when combining `window:load` and `before` callbacks
          return
        }

        if (Cypress.spec.specType === 'component') {
          windowCoverageObjects.push({
            coverage: applicationSourceCoverage,
            pathname: Cypress.spec.relative,
          })
        } else {
          windowCoverageObjects.push({
            coverage: applicationSourceCoverage,
            pathname: win.location.pathname,
          })
        }
      } catch {
        // do nothing, probably cross-origin access
      }
    }

    // save reference to coverage for each app window loaded in the test
    cy.on('window:load', saveCoverageObject)

    // save reference if visiting a page inside a before() hook
    cy.window({ log: false }).then(saveCoverageObject)
  })

  afterEach(() => {
    // save coverage after the test
    // because now the window coverage objects have been updated
    windowCoverageObjects.forEach((cover) => {
      sendCoverage(cover.coverage, cover.pathname)
    })

    const taskOptions = { spec: Cypress.spec }
    if (Cypress.env('specCovers')) {
      taskOptions.specCovers = Cypress.env('specCovers')
    }

    const config = getCoverageConfig()
    const taskLogOptions = {
      log: !config.quiet,
    }
    cy.task('reportSpecCovers', taskOptions, taskLogOptions)

    if (!hasE2ECoverage()) {
      if (hasUnitTestCoverage()) {
        if (!config.quiet) {
          logMessage(`👉 Only found unit test code coverage.`)
        }
      } else {
        const expectBackendCoverageOnly = Cypress._.get(
          Cypress.env('codeCoverage'),
          'expectBackendCoverageOnly',
          false,
        )
        if (!expectBackendCoverageOnly) {
          logMessage(`
            ⚠️ Could not find any coverage information in your application
            by looking at the window coverage object.
            Did you forget to instrument your application?
            See [code-coverage#instrument-your-application](https://github.com/cypress-io/code-coverage#instrument-your-application)
          `)
        }
      }
    }
  })

  after(function collectBackendCoverage() {
    let runningEndToEndTests, isIntegrationSpec

    try {
      // I wish I could fail the tests if there is no code coverage information
      // but throwing an error here does not fail the test run due to
      // https://github.com/cypress-io/cypress/issues/2296

      // there might be server-side code coverage information
      // we should grab it once after all tests finish
      // @ts-ignore
      const baseUrl = Cypress.config('baseUrl') || cy.state('window').origin
      // @ts-ignore
      runningEndToEndTests = baseUrl !== Cypress.config('proxyUrl')
      const specType = Cypress._.get(Cypress.spec, 'specType', 'integration')
      isIntegrationSpec = specType === 'integration'
    } catch {
      // probably cross-origin request
      // cannot access the window
    }

    if (runningEndToEndTests && isIntegrationSpec) {
      // we can only request server-side code coverage
      // if we are running end-to-end tests,
      // otherwise where do we send the request?
      const url = Cypress._.get(
        Cypress.env('codeCoverage'),
        'url',
        '/__coverage__',
      )
      cy.request({
        url,
        log: false,
        failOnStatusCode: false,
      })
        .then((r) => {
          return Cypress._.get(r, 'body.coverage', null)
        })
        .then((coverage) => {
          if (!coverage) {
            // we did not get code coverage - this is the
            // original failed request
            const expectBackendCoverageOnly = Cypress._.get(
              Cypress.env('codeCoverage'),
              'expectBackendCoverageOnly',
              false,
            )
            if (expectBackendCoverageOnly) {
              throw new Error(
                `Expected to collect backend code coverage from ${url}`,
              )
            } else {
              // we did not really expect to collect the backend code coverage
              return
            }
          }
          sendCoverage(coverage, 'backend')
        })
    }
  })

  after(function mergeUnitTestCoverage() {
    // collect and merge frontend coverage

    // if spec bundle has been instrumented (using Cypress preprocessor)
    // then we will have unit test coverage
    // NOTE: spec iframe is NOT reset between the tests, so we can grab
    // the coverage information only once after all tests have finished
    // @ts-ignore
    if (window.__coverage__) {
      const unitTestCoverage = filterSupportFilesFromCoverage(
        // @ts-ignore
        window.__coverage__,
      )
      sendCoverage(unitTestCoverage, 'component tests')
    }
  })

  after(function generateReport() {
    const config = getCoverageConfig()
    let logInstance

    if (!config.quiet) {
      // when all tests finish, lets generate the coverage report
      logInstance = Cypress.log({
        name: 'Coverage',
        message: ['Generating report [@bahmutov/cypress-code-coverage]'],
      })
    }

    const options = {
      specCovers: Cypress.env('specCovers'),
    }
    cy.task('coverageReport', options, {
      timeout: dayjs.duration(3, 'minutes').asMilliseconds(),
      log: false,
    }).then((coverageReportFolder) => {
      if (logInstance) {
        logInstance.set('consoleProps', () => ({
          'coverage report folder': coverageReportFolder,
        }))
        logInstance.end()
      }
      return coverageReportFolder
    })
  })
}

// to disable code coverage commands and save time
// pass environment variable coverage=false
//  cypress run --env coverage=false
// or
//  CYPRESS_coverage=false cypress run
// see https://on.cypress.io/environment-variables

// to avoid "coverage" env variable being case-sensitive, convert to lowercase
const cyEnvs = Cypress._.mapKeys(Cypress.env(), (value, key) =>
  key.toLowerCase(),
)

const pluginDisabled = isPluginDisabled(cyEnvs)

if (pluginDisabled) {
  console.log('Skipping code coverage hooks')
} else if (Cypress.env('codeCoverageTasksRegistered') !== true) {
  // register a hook just to log a message
  before(() => {
    logMessage(`
      ⚠️ Code coverage tasks were not registered by the plugins file.
      See [support issue](https://github.com/cypress-io/code-coverage/issues/179)
      for possible workarounds.
    `)
  })
} else {
  registerHooks()
}
