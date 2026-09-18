// @ts-check

const debug = require('debug')('code-coverage')
const ghCore = require('@actions/core')
const path = require('path')
const { existsSync, readFileSync } = require('fs')

/**
 * @param {number} percentage
 */
function pickCoverageEmoji(percentage) {
  if (percentage >= 95) {
    return '✅'
  }
  if (percentage >= 90) {
    return '🏆'
  }
  if (percentage >= 80) {
    return '🥇'
  }
  if (percentage >= 70) {
    return '🥈'
  }
  if (percentage >= 60) {
    return '🥉'
  }
  if (percentage >= 50) {
    return '📈'
  }
  if (percentage >= 40) {
    return '⚠️'
  }
  return '🪫'
}

function reportCodeCoverageGHA(heading = 'Code coverage') {
  if (typeof heading !== 'string') {
    debug(heading)
    throw new Error('Expected a string heading when reporting CC on GHA')
  }
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
        String(s.pct),
        `${s.covered}/${s.total}`,
        String(b.pct),
        `${b.covered}/${b.total}`,
        String(f.pct),
        `${f.covered}/${f.total}`,
        String(l.pct),
        `${l.covered}/${l.total}`,
      ]
      debug(row)

      ghCore.summary
        .addHeading(heading)
        .addTable([
          [
            { data: 'Statements %', header: true },
            { data: pickCoverageEmoji(s.pct), header: true },
            { data: 'Branches %', header: true },
            { data: pickCoverageEmoji(b.pct), header: true },
            { data: 'Functions %', header: true },
            { data: pickCoverageEmoji(f.pct), header: true },
            { data: 'Lines %', header: true },
            { data: pickCoverageEmoji(l.pct), header: true },
          ],
          row,
        ])
        .addLink(
          '@bahmutov/cypress-code-coverage',
          'https://github.com/bahmutov/cypress-code-coverage',
        )
        .write()
    } else {
      debug('could not find totals in %s', summaryFilename)
    }
  }
}

function reportCodeCoverageGHACallback() {
  // we could use the test run summary passed in "after:run" event
  return reportCodeCoverageGHA()
}

module.exports = {
  pickCoverageEmoji,
  reportCodeCoverageGHA,
  reportCodeCoverageGHACallback,
}
