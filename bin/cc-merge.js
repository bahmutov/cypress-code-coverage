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
debug('looking for coverage-final.json files in %s', topCoverageFolder)
