'use strict';

const chalk = require('chalk');
const axios = require('axios');
var fs = require('fs');
const logSymbols = require('log-symbols')
const async = require('async')
const ora = require('ora');
var currentPath = process.cwd();
const error = chalk.red.bold;
const success = chalk.green.bold;

// Detect that the posterno-components.json file is found.
/*if ( ! fs.existsSync( `${currentPath}/posterno-components.json` ) ) {
	console.log();
	console.log(error('The posterno-components.json file has not been found. Make sure you are within the Posterno plugin folder.') );
	console.log();
	process.exit(1);
}*/

// Query github api to retrieve the latest tag assigned to each component.

/**
 * Query github api and retrieve a list of tags.
 * @param {string} component the repository we're querying.
 */
function checkTag ( component ) {
    return axios.get( `https://api.github.com/repos/${component}/tags`)
    .then((response) => {
        return response;
    });
}

const componentsFile = require( `${currentPath}/posterno-components.json` )
let availableComponents = []

async.forEach(
    Object.keys( componentsFile.components ),
    function(key, callback) {

		let repositoryName = componentsFile.components[key]

		checkTag( repositoryName )
			.then( response => {
				availableComponents.push( {
					name: repositoryName,
					version: response.data[0].name
				} )
				console.log();
				console.log( logSymbols.success, success( `Found component "${repositoryName}" at version ${response.data[0].name}` ) )
				console.log();
				callback();
			})
			.catch( errordata => {
				if ( typeof(errordata.response.data.message) !== 'undefined' ) {
					console.log( error( errordata.response.data.message ) )
				} else {
					console.log( error( 'Something went wrong.' ) )
				}
				callback();
				process.exit(1);
			})
    },
    function(err) {



    }
);
// Remove all local symlinked - composer dependencies from the Posterno plugin.

// Re-run composer packages installation in preparation of release with the latest stable version of each component.
