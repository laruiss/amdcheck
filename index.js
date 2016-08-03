#!/usr/bin/env node
'use strict'

const exit = require('exit')
const fs = require('fs')
const amdextract = require('amdextract')

const glob = require('glob-promise')

let paths = Array.from(process.argv).slice(2)

const confAmdcheck = getConf(process.cwd())

const excludedPaths = confAmdcheck && confAmdcheck.excludedPaths
                        ? confAmdcheck.excludedPaths
                        : []

function getConf(baseDir) {

  const confAmdcheckFilePath = baseDir + '/amdcheck.json'
  const confAmdcheckFileExists = fs.existsSync(confAmdcheckFilePath)

  if (confAmdcheckFileExists) {
    try {
      const confAmdcheck = require(confAmdcheckFilePath)
      console.info(`\nUsing conf from ${confAmdcheckFilePath}`)
    } catch (e) {
      console.error(`${confAmdcheckFilePath} is not a valid JSON file!`)
    }
  }

  const pkg = require(baseDir + '/package.json')
  const confAmdcheck = pkg.config
                         ? pkg.config.amdcheck
                         : {}

  console.info('Using conf from', 'package.json')
  return confAmdcheck
}

const statsOnly = paths.some((arg) => {
  return arg === '-s' || arg === '--stats-only'
})

if (statsOnly) {
  paths = paths.slice(1)
}

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

`);
}

const globs = paths.map(path => {
  return glob(path)
});

const stats = {}

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

    const errors = []

    files.forEach(function processFile(file) {
      const content = fs.readFileSync(file)
      const result = amdextract.parse(content)

      const error = {}

      result.results.forEach(function (r) {
        const unusedPaths = r.unusedPaths.filter((path) => {
          return !excludedPaths.includes(path)
        })

        totalUnusedPaths += unusedPaths.length
        if (unusedPaths.length > 0) {
          totalFilesWithUnusedPaths++
          error.unusedPaths = unusedPaths
        }

        totalUnusedDependencies += r.unusedDependencies.length
        if (r.unusedDependencies.length > 0) {
          totalFilesWithUnusedDependencies++
          error.unusedDependencies = r.unusedDependencies
        }

        if (error.unusedDependencies || error.unusedPaths) {
          error.file = file
          errors.push(error)
        }

        totalProcessedFiles++
      });

    });

    !statsOnly && displayErrors(errors)

    console.log(`
Total unused paths: ${totalUnusedPaths} in ${totalFilesWithUnusedPaths} file${totalFilesWithUnusedPaths > 1 ? 's' : ''}.
Total unused dependencies: ${totalUnusedDependencies} in ${totalFilesWithUnusedDependencies} file${totalFilesWithUnusedDependencies > 1 ? 's' : ''}.
Total processed files: ${totalProcessedFiles}
`)

    if (totalFilesWithUnusedPaths || totalFilesWithUnusedDependencies) {
      exit(1)
    }
  })

function displayErrors(errors) {
  if (errors.length) {
    console.log('Files in error:')

    errors.forEach((error) => {
      console.log(`\n${error.file}:`)
      if (error.unusedPaths) {
        console.log('  Unused paths:', error.unusedPaths)
      }
      if (error.unusedDependencies) {
        console.log('  Unused dependencies:', error.unusedDependencies)
      }
    })
  }
}
