/// <reference types="cypress" />
// @ts-check
// helper functions that are safe to use in the browser
// from support.js file - no file system access
const debug = require('debug')('code-coverage')

/**
 * remove coverage for the spec files themselves,
 * only keep "external" application source file coverage.
 * Config has keys with absolute path names for each source file
 */
const filterSpecsFromCoverage = (totalCoverage, config = Cypress.config) => {
  /** @type {string|string[]} Cypress run-time config has test files string pattern */
  const specPattern = config('specPattern')
  const configFilename = config('configFile')

  // test files could be:
  //  wild card string "**/*.*" (default)
  //  wild card string "**/*spec.js"
  //  list of wild card strings or names ["**/*spec.js", "spec-one.js"]
  const rootFolder = config('projectRoot')
  if (typeof rootFolder === 'undefined') {
    throw new Error('Cypress projectRoot folder cannot be undefined')
  }
  const testFilePatterns = (
    Array.isArray(specPattern) ? specPattern : [specPattern]
  ).map((pattern) => {
    // we want absolute paths
    return rootFolder + '/' + pattern
  })
  debug({ specPattern, testFilePatterns, configFilename })

  const isTestFile = (filename) => {
    debug('testing filename', filename)
    const matchedPattern = testFilePatterns.some((specPattern) => {
      debug('minimatch %s against %s', filename, specPattern)
      return Cypress.minimatch(filename, specPattern)
    })
    const matchedEndOfPath = testFilePatterns.some((specPattern) =>
      filename.endsWith(specPattern),
    )
    const matchedConfig = configFilename.endsWith(filename)
    debug({ matchedPattern, matchedEndOfPath, matchedConfig })

    return matchedPattern || matchedEndOfPath || matchedConfig
  }

  const coverage = Cypress._.omitBy(totalCoverage, (fileCoverage, filename) =>
    isTestFile(filename),
  )
  // debug(Object.keys(coverage))

  return coverage
}

/**
 * Replace source-map's path by the corresponding absolute file path
 * (coverage report wouldn't work with source-map path being relative
 * or containing Webpack loaders and query parameters)
 */
function fixSourcePaths(coverage) {
  Object.values(coverage).forEach((file) => {
    const { path: absolutePath, inputSourceMap } = file
    // @ts-ignore
    const fileName = /([^\/\\]+)$/.exec(absolutePath)[1]
    if (!inputSourceMap || !fileName) return

    if (inputSourceMap.sourceRoot) inputSourceMap.sourceRoot = ''
    inputSourceMap.sources = inputSourceMap.sources.map((source) =>
      source.includes(fileName) ? absolutePath : source,
    )
  })
}

/**
 * by default we do not filter anything from the code coverage object
 * if the user gives a list of patters to filter, we filter the coverage object.
 * @param {boolean|string|string[]} exclude What to exclude (default files or specific list)
 * @param {object} coverage Each key is an absolute filepath
 */
function excludeByUser(exclude, coverage) {
  if (!exclude) {
    return coverage
  }

  debug('excludeByUser config exclude', exclude)
  debug(Object.keys(coverage))

  if (exclude === true) {
    // try excluding spec and support files
    const withoutSpecs = filterSpecsFromCoverage(coverage)
    debug('exclude specs', Object.keys(withoutSpecs))
    const filteredCoverage = filterSupportFilesFromCoverage(withoutSpecs)
    debug('exclude true filtered', Object.keys(filteredCoverage))
    return filteredCoverage
  }

  const filterOut = Cypress._.isString(exclude) ? [exclude] : exclude
  // debug({ filterOut })

  const filteredCoverage = Cypress._.omitBy(
    coverage,
    (fileCoverage, filename) => {
      return filterOut.some((pattern) => {
        if (pattern.includes('*')) {
          return Cypress.minimatch(filename, pattern)
        }
        return filename.endsWith(pattern)
      })
    },
  )
  debug('exclude masks filtered', Object.keys(filteredCoverage))
  return filteredCoverage
}

/**
 * Removes support file from the coverage object.
 * If there are more files loaded from support folder, also removes them
 */
const filterSupportFilesFromCoverage = (totalCoverage) => {
  const supportFile = Cypress.config('supportFile')

  /** @type {string} Cypress run-time config has the support folder string */
  const supportFolder = Cypress.config('supportFolder')

  const isSupportFile = (filename) => filename === supportFile
  const isInSupportFolder = (filename) => filename.startsWith(supportFolder)

  const coverage = Cypress._.omitBy(
    totalCoverage,
    (fileCoverage, filename) =>
      isSupportFile(filename) || isInSupportFolder(filename),
  )

  return coverage
}

module.exports = {
  fixSourcePaths,
  filterSpecsFromCoverage,
  excludeByUser,
}
