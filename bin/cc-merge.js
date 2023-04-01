#!/usr/bin/env node

const debug = require('debug')('code-coverage')

// finds all "coverage-final.json" files in the give folder
// and merges them into a single "cc-merged/out.json" file
// Use:
// npx cc-merge <top coverage folder>
const topCoverageFolder = process.argv[2]
if (!topCoverageFolder) {
  console.error('use: npx cc-merge <top coverage folder>')
  process.exit(1)
}

const coverageFilename = 'coverage-final.json'
debug('looking for %s files in %s', coverageFilename, topCoverageFolder)

const fs = require('fs')
const path = require('path')
const globby = require('globby')
const allFiles = globby.sync(`**/${coverageFilename}`, {
  absolute: true,
  cwd: topCoverageFolder,
})
debug('found %d coverage files', allFiles.length)
debug(allFiles.join(','))

if (!allFiles.length) {
  console.error(
    'Could not find any %s files in the folder %s',
    coverageFilename,
    topCoverageFolder,
  )
  process.exit(1)
}

const nycOutputFolder = '.nyc_output'
if (fs.existsSync(nycOutputFolder)) {
  debug('deleting the existing folder %s', nycOutputFolder)
  fs.rmSync(nycOutputFolder, { recursive: true })
}

if (!fs.existsSync(nycOutputFolder)) {
  debug('creating folder %s', nycOutputFolder)
  fs.mkdirSync(nycOutputFolder)
}
allFiles.forEach((filename, k) => {
  const outputFilename = path.join(nycOutputFolder, `c-${k + 1}.json`)
  fs.copyFileSync(filename, outputFilename)
  debug('%d: copied %s to %s', k + 1, filename, outputFilename)
})

const { getNycOptions } = require('../task-utils')

const processWorkingDirectory = process.cwd()
const nycReportOptions = getNycOptions(processWorkingDirectory)
debug('calling NYC reporter with options %o', nycReportOptions)
debug('current working directory is %s', processWorkingDirectory)
const NYC = require('nyc')
const nyc = new NYC(nycReportOptions)

nyc.report()
