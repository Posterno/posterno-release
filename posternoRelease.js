'use strict';

const chalk = require('chalk');
const axios = require('axios');
const fs = require('fs');
const logSymbols = require('log-symbols')
const async = require('async')
const args = require('args')
const execSync = require('child_process').execSync;
const currentPath = process.cwd();
const error = chalk.red.bold;
const success = chalk.green.bold;

// Parse options sent via terminal.
args
	.option('username', 'Optional Github username needed when API rate limits have been hit.', '')
	.option('password', 'Optional Github password needed when API rate limits have been hit.', '')

const flags = args.parse(process.argv)

// Detect that the posterno-components.json file is found.
if (!fs.existsSync(`${currentPath}/posterno-components.json`)) {
	console.log();
	console.log(error('The posterno-components.json file has not been found. Make sure you are within the Posterno plugin folder.'));
	console.log();
	process.exit(1);
}

const componentsFile = require(`${currentPath}/posterno-components.json`)
let availableComponents = []

// Query github api to retrieve the latest tag assigned to each component.
/**
 * Query github api and retrieve a list of tags.
 * @param {string} component the repository we're querying.
 */
function checkTag(component) {

	let options = {}

	if (flags.username && flags.password) {
		options = {
			auth: {
				username: flags.username,
				password: flags.password
			}
		}
	}

	return axios.get(`https://api.github.com/repos/${component}/tags`, options)
		.then((response) => {
			return response;
		});
}

/**
 * Clean up composer of all symlinked packages.
 */
function composerCleanUp() {

	let packages = ''

	Object.keys(availableComponents).forEach(key => {
		packages += availableComponents[key].name + ' '
	});

	execSync(
		`composer remove ${packages}`, {
			stdio: 'inherit'
		}
	);

}

/**
 * Install stable versions of all packages registered within Posterno.
 */
function composerInstallStablePackages() {

	let packages = ''

	Object.keys(availableComponents).forEach(key => {
		packages += availableComponents[key].name + ':' + availableComponents[key].version + ' '
	});

	execSync(
		`composer require ${packages}`, {
			stdio: 'inherit'
		}
	);

}

/**
 * Run the grunt.js task to prepare the final release package.
 */
function runGruntBuild() {

	execSync(
		`grunt build`, {
			stdio: 'inherit'
		}
	);

}

/**
 * Restore symlinked packages.
 */
function composerResetToDevMode() {

	let packages = ''

	Object.keys(availableComponents).forEach(key => {
		packages += availableComponents[key].name + ' @dev '
	});

	execSync(
		`composer require ${packages}`, {
			stdio: 'inherit'
		}
	);

}

console.log();

async.forEachOf(componentsFile.components, (value, key, callback) => {

	let repositoryName = value

	checkTag(repositoryName)
		.then(response => {
			availableComponents.push({
				name: repositoryName,
				version: response.data[0].name
			})
			console.log(logSymbols.success, success(`Found component "${repositoryName}" at version ${response.data[0].name}`))
			console.log();
			callback();
		})
		.catch(errordata => {
			console.log();
			if ( typeof (errordata.response) !== 'undefined' && typeof (errordata.response.data) !== 'undefined' && typeof (errordata.response.data.message) !== 'undefined') {
				console.log(error(errordata.response.data.message))
			} else {
				console.log(error('Something went wrong.'))
			}
			console.log();
			return callback(errordata)
		})

}, err => {

	if (err) console.error(err.message);

	async.nextTick(function() {

		console.log(logSymbols.success, success( 'Latest version of all registered components has been retrieved.' ))
		console.log()

		console.log(chalk.black.bgYellow( 'Now removing locally symlinked packages...' ));
		console.log()

		// Remove all local symlinked - composer dependencies from the Posterno plugin.
		composerCleanUp()

		console.log()
		console.log(logSymbols.success, success( 'All symlinked packages have been successfully removed.' ))

		console.log()
		console.log(chalk.black.bgYellow( 'Now installing stable packages...' ));
		console.log()

		// Re-run composer packages installation in preparation of release with the latest stable version of each component.
		composerInstallStablePackages()

		console.log()
		console.log(logSymbols.success, success( 'All Posterno packages have been successfully installed.' ))

		console.log()
		console.log(chalk.black.bgYellow( 'Now running Grunt build task...' ));
		console.log()

		runGruntBuild()

		console.log()
		console.log(logSymbols.success, success( 'Final Posterno release package has been created.' ))

		console.log()
		console.log(chalk.black.bgYellow( 'Now removing stable composer packages in preparation for dev mode reset...' ));
		console.log()

		composerCleanUp()

		console.log()
		console.log(logSymbols.success, success( 'Stable packages successfully removed.' ))

		console.log()
		console.log(chalk.black.bgYellow( 'Now resetting to dev mode...' ));
		console.log()

		composerResetToDevMode()

		console.log()
		console.log(logSymbols.success, success( 'Dev mode successfully reset. Posterno is now ready for a release on wp.org' ))
		console.log()

	});

});

