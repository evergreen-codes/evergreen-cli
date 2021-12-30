evergreen-cli
=================

A CLI tool for analyzing project dependency health.

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
* [Configuration](#configuration)
<!-- tocstop -->
# Usage

```sh-session
$ npx github:evergreen-codes/evergreen-cli
...
```

# Commands

## `npx github:evergreen-codes/evergreen-cli help [COMMAND]`

Display help for evergreen.

```
USAGE
  $ npx github:evergreen-codes/evergreen-cli help [COMMAND] [-n]

ARGUMENTS
  COMMAND  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for evergreen.
```

## `npx github:evergreen-codes/evergreen-cli report`

Generate an Evergreen dependency report.

```
USAGE
  $ npx github:evergreen-codes/evergreen-cli report

DESCRIPTION
  Generate an Evergreen dependency report.
```

## `npx github:evergreen-codes/evergreen-cli report regenerate`

Regenrate an Evergreen report from previously fetched details and updated configuration.

```
USAGE
  $ npx github:evergreen-codes/evergreen-cli report regenerate

DESCRIPTION
  Regenrate an Evergreen report from previously fetched details and updated configuration.
```

# Configuration

The configuration should be in a file called `.evergreenrc.json` in the current directory.

## Example Configuration

```typescript
{
  "approvedLicenses": [ 
    "MIT",
    "Apache",
    "BSD-3-Clause",
    "BSD-2-Clause",
    "MPL-2.0",
    "ISC",
    "PSF",
    "Public Domain",
    "LGPL v2",
    "GPL v2"
  ],
  "reports": [
    {
      "ecosystem": "cocoapods",
      "options": {
          "sourceGlob": "../ios/**/*.@(h|m|swift)",
          "projectRoot": "../ios"
      }
    },
    {
      "ecosystem": "yarn",
      "options": {
        "sourceGlob": "../web/src/frontend/**/*.@(js|jsx|ts|tsx)",
        "projectRoot": "../web/src/frontend"
      }
    },
    {
      "ecosystem": "pip",
      "options": {
        "sourceGlob": "../web/src/aplaceforrover/**/*.py",
        "projectRoot": "../web"
      }
    },
    {
      "ecosystem": "gradle",
      "options": {
        "sourceGlob": "../android/**/*.@(java|kt)",
        "projectRoot": "../android"
      }
    }
  ],
  "overrides": [
    {
      "packageName": "GoogleAppMeasurement",
      "ecosystem": "cocoapods",
      "license": "Apache 2.0"
    }
  ]
}
```

## Configuration Options

See [types](./src/types.ts) for more information.
