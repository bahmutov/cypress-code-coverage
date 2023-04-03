// @ts-check
require('console.table')
const { getNycReportFilename } = require('./task-utils')
const { existsSync, readFileSync } = require('fs')
const NYC = require('nyc')
const debug = require('debug')('code-coverage')
const ghCore = require('@actions/core')
const path = require('path')

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

  debug('should report? %s', shouldReport)
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

    if (process.env.GITHUB_ACTIONS) {
      debug('will report code coverage on GitHub Actions')
      on('after:run', () => {
        const summaryFilename = path.join('coverage', 'coverage-summary.json')
        if (!existsSync(summaryFilename)) {
          debug('cannot find summary file %s', summaryFilename)
        } else {
          const summary = JSON.parse(readFileSync(summaryFilename, 'utf8'))
          if (summary.total) {
            debug('code coverage summary totals %o', summary.total)
            const s = summary.total.statements
            const b = summary.total.branches
            const f = summary.total.functions
            const l = summary.total.lines
            const row = [
              s.pct,
              `${s.covered}/${s.total}`,
              b.pct,
              `${b.covered}/${b.total}`,
              f.pct,
              `${f.covered}/${f.total}`,
              l.pct,
              `${l.covered}/${l.total}`,
            ]
            debug(row)

            // only output the GitHub summary table AFTER the run
            // because GH does not show the summary before the job finishes
            // so we might as well wait for all spec results to come in
            on('after:run', () => {
              // https://github.blog/2022-05-09-supercharging-github-actions-with-job-summaries/
              ghCore.summary
                .addHeading('Code coverage')
                .addTable([
                  [
                    { data: 'Statements %', header: true },
                    { data: '', header: true },
                    { data: 'Branches %', header: true },
                    { data: '', header: true },
                    { data: 'Functions %', header: true },
                    { data: '', header: true },
                    { data: 'Lines %', header: true },
                    { data: '', header: true },
                  ],
                  row,
                ])
                .addLink(
                  '@bahmutov/cypress-code-coverage',
                  'https://github.com/bahmutov/cypress-code-coverage',
                )
                .write()
            })
          } else {
            debug('could not find totals in %s', summaryFilename)
          }
        }
      })
    }
  }

  // IMPORTANT to return the config object
  // with the any changed environment variables
  return config
}

module.exports = registerCodeCoveragePlugin
