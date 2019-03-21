'use strict';

const chalk = require('chalk');
var fs = require('fs');
var currentPath = process.cwd();
const error = chalk.red.bold;

// Detect that the posterno-components.json file is found.
if ( ! fs.existsSync( `${currentPath}/posterno-components.json` ) ) {
	console.log();
	console.log(error('The posterno-components.json file has not been found. Make sure you are within the Posterno plugin folder.') );
	console.log();
	process.exit(1);
}

// Query github api to retrieve the latest tag assigned to each component.

// Remove all local symlinked - composer dependencies from the Posterno plugin.

// Re-run composer packages installation in preparation of release with the latest stable version of each component.
