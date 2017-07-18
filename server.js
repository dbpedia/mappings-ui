'use strict';
const Composer = require('./index');
const Config = require('./config');
const GithubUpdater = require('./scripts/githubUpdateStarter');

//Variables that decide what should be run in this instance
const runServer = Config.get('/run/server');
const runMappingsUpdater = Config.get('/run/githubUpdater/mappings');
const runOntologyUpdater = Config.get('/run/githubUpdater/ontology');

Composer((err, server) => {

    if (err) {
        throw err;
    }

    if (runServer){
        server.start(() => {

            console.log('Started the server on port ' + server.info.port);

        });
    }

    if (runMappingsUpdater || runOntologyUpdater ) {

        GithubUpdater.start(runMappingsUpdater,runOntologyUpdater);

    }

});
