// @ts-check
function stringToArray(prop, obj) {
  if (typeof obj[prop] === 'string') {
    obj[prop] = [obj[prop]]
  }

  return obj
}

function combineNycOptions(...options) {
  // last option wins
  const nycOptions = Object.assign({}, ...options)

  // normalize string and [string] props
  stringToArray('reporter', nycOptions)
  stringToArray('extension', nycOptions)
  stringToArray('exclude', nycOptions)

  return nycOptions
}

const defaultNycOptions = {
  'report-dir': './coverage',
  reporter: ['lcov', 'clover', 'json', 'json-summary'],
  extension: ['.js', '.cjs', '.mjs', '.ts', '.tsx', '.jsx'],
  excludeAfterRemap: false,
}

/**
 * Returns an object with placeholder properties for files we
 * do not have coverage yet. The result can go into the coverage object
 *
 * @param {string} fullPath Filename
 */
const fileCoveragePlaceholder = (fullPath) => {
  return {
    path: fullPath,
    statementMap: {},
    fnMap: {},
    branchMap: {},
    s: {},
    f: {},
    b: {},
  }
}

const isPlaceholder = (entry) => {
  // when the file has been instrumented, its entry has "hash" property
  return !('hash' in entry)
}

/**
 * Given a coverage object with potential placeholder entries
 * inserted instead of covered files, removes them. Modifies the object in place
 */
const removePlaceholders = (coverage) => {
  Object.keys(coverage).forEach((key) => {
    if (isPlaceholder(coverage[key])) {
      delete coverage[key]
    }
  })
}

/**
 * Returns true if the user disabled the plugin using the env object.
 */
function isPluginDisabled(cyEnv) {
  if (cyEnv.coverage === false) {
    return true
  }
  if (typeof cyEnv.coverage === 'object') {
    // the user explicitly disabled the plugin
    // be kind and accept both "disable" and "disabled" options
    return cyEnv.coverage.disable === true || cyEnv.coverage.disabled === true
  }

  // by default the plugin is enabled
  return false
}

module.exports = {
  combineNycOptions,
  defaultNycOptions,
  fileCoveragePlaceholder,
  removePlaceholders,
  isPluginDisabled,
}
