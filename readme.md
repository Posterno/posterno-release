# Posterno release preparation shell


A command line tool to prepare the main core Posterno WordPress plugin folder for a public release on wp.org.

## Why

The main posterno repository does not contain the whole code of the plugin. The plugin contains components that are developed separately from the core and loaded through composer.

During development, a component is symlinked via composer through the component's local folder on your computer. However when the plugin needs to be publicly released, the release must contain the latest stable version of all components.

This command line tool, automatically removes locally symlinked components and installs the latest stable version of each component registered in Posterno. A final .zip file can then be prepare through Grunt.

## Installation

Run the command:

```
npm install @posterno/posterno-release -g
```

## How it works

The following are the steps that this utility performs on your system.

- Verifies that a posterno-components.json file is available. This is where all components are registered.
- Queries Github api to check the latest released tags for each registered package.
- Removes symlinked development Posterno composer packages.
- Installs the stable version of each package.
- Runs the Grunt.js `build` task defined into the main Posterno plugin.
- Removes stable Posterno composer packages.
- Re-installs the local symlinked packages.

## Usage

- Navigate to the main Posterno core plugin folder via your terminal.
- Run the command `posterno-prepare-release`.
- Sit back and watch a release automagically complete.

