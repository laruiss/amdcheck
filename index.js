#!/usr/bin/env node
'use strict'

const exit = require('exit')
const fs = require('fs')
const amdextract = require('amdextract')

const glob = require('glob-promise')

const paths = Array.from(process.argv).slice(2)

if (!paths.length) {
  console.log('Error: No path given')
  printUsage()
  exit(1)
}

if (paths[0].includes('--help') || paths[0].includes('-h')) {
  printUsage()
  exit(0)
}

function printUsage() {
  console.log(`Check unused paths and unused dependencies in AMD modules.

Usage: amdcheck <glob> [<glob>, [<glob>, ...]]
       amdcheck -h | --help                      display this message

Example: amdcheck 'lib/**/*.js' 'tests/**/*.js'
`);
}

const globs = paths.map(path => {
  return glob(path)
});

let totalUnusedPaths = 0
let totalFilesWithUnusedPaths = 0
let totalUnusedDependencies = 0
let totalFilesWithUnusedDependencies = 0
let totalProcessedFiles = 0

Promise.all(globs)
  .then(fileGroups => {
    return fileGroups.reduce((acc, fileGroup) => {
        return acc.concat(fileGroup)
    })
  }, [])
  .then(files => {
    files.forEach(function processFile(file) {
      const content = fs.readFileSync(file)
      const result = amdextract.parse(content)

      result.results.forEach(function (r) {
        totalUnusedPaths += r.unusedPaths.length
        if (r.unusedPaths.length > 0) {
          totalFilesWithUnusedPaths++
        }

        totalUnusedDependencies += r.unusedDependencies.length
        if (r.unusedDependencies.length > 0) {
          totalFilesWithUnusedDependencies++
        }

        totalProcessedFiles++
      });

    });

    console.log(`
Total unused paths: ${totalUnusedPaths} in ${totalFilesWithUnusedPaths} files.
Total unused dependencies: ${totalUnusedDependencies} in ${totalFilesWithUnusedDependencies} files.
Total processed files: ${totalProcessedFiles}
`)

    if (totalFilesWithUnusedPaths || totalFilesWithUnusedDependencies) {
      exit(1)
    }
  })
