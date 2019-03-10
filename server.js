'use strict';
const Composer = require('./index');
const Config = require('./config');
const GithubUpdater = require('./scripts/githubUpdateStarter');
const StatsUpdater = require('./scripts/statsUpdateStarter');
//Variables that decide what should be run in this instance
const runServer = Config.get('/run/server');
const runMappingsUpdater = Config.get('/run/githubUpdater/mappings');
const runOntologyUpdater = Config.get('/run/githubUpdater/ontology');
const runStatsUpdater = Config.get('/run/statsUpdater');
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

    if (runStatsUpdater) {
        StatsUpdater.start();
    }
});
