# amdcheck

Checks unused paths and unused dependencies in AMD modules.

Reports:
- for every module with an identified problem:
  - full path to file
  - list of unused paths if any
  - list of unused dependencies if any

- global statistics:
  - number of unused paths
  - number of files with at least one unused paths
  - number of unused dependencies
  - number of files with at least one unused dependency
  - number of processed files

  ## Installation

  ```
  npm install amdcheck --save-dev
  ```
  or

  ```
  npm i -D amdcheck
  ```

  ## Usage

  ### Command

  ```
  amdcheck [options] <glob> [<glob>, [<glob>, ...]]
  ```
  ### options

  options are:

    - -h, --help
              display this message

    - -s, --stats-only
              display only stats (total unused paths, total unused dependencies,
              total processed files)

  ### Example

  ```
  amdcheck 'lib/**/*.js' 'tests/**/*.js'
  ```

  ## Configuration

  By default, amdcheck reports every unused paths, but you can specify a list of
  paths to exclude from search in either two ways: in package.json file or in
  amdcheck.json file at the same level.

  ### Configuration in `package.json`
  Add a `config.amdcheck.excludedPaths` entry in your `package.json` and simply specify an array of paths to exclude:

  ```
  {
    …
    "config": {
      "amdcheck": {
        "excludedPaths": [
          "jquery.plugin1",
          "jquery.plugin2",
          "polyfill1",
          "polyfill2",
          …
        ]
      }
    }
    …
  }
  ```

  ### Configuration in `amdcheck.json`
  Alternatively you can create a `amdcheck.json` at the root of your project with just the amdcheck conf:

  ```
  {
    "excludedPaths": [
      "jquery.plugin1",
      "jquery.plugin2",
      "polyfill1",
      "polyfill2",
      …
    ]
  }
  ```

  ### Note about configuration

  If there is a **valid JSON file** named `amdcheck.json` at the root of your project,
  any configuration from `package.json` **will be ignored**.

  ## License

  This software is licensed under the MIT license
